import express from 'express';
import pg from 'pg';
import {Configuration, OpenAIApi} from "openai";
import cors from "cors";
import _ from "lodash";
import Filter from "bad-words";
import {DateTime} from "luxon";
import dotenv from "dotenv";

dotenv.config();

const {Pool} = pg;

const app = express();

const pool = new Pool({
    user: process.env.DB_USER,
    host: "ec2-18-209-224-242.compute-1.amazonaws.com",
    database: "postgres",
    password: process.env.DB_PSWD,
    port: 5432
});

const configuration = new Configuration({ apiKey: process.env.OPENAI_KEY });
const openai = new OpenAIApi(configuration);

app.use(express.text({type: "*/*"}));
app.use(cors({origin: "*"}));

const filter = new Filter();

app.post('/message', async (req, res) => {
    console.log(req.body);

    const client = await pool.connect();

    try {
        const json = JSON.parse(req.body);
        const body = json.body;

        const embeddingResponse = await openai.createEmbedding({
            model: "text-embedding-ada-002",
            input: body.replace(/\n/g, ' ')
        });
        const [{ embedding }] = embeddingResponse.data.data;

        const result: {rows: {user: string, session: string, timestamp: string, similarity: number, content: string, id: number}[]} = await client.query('select * from match_messages($1, $2, $3, $4);', ["[" + embedding.toString() + "]", 0.725, 10, json.session]);
        const conversations = (await Promise.all(result.rows.filter((tag, index, array) => array.findIndex(t => t.session === tag.session) == index).map(async cv => {
            console.log(cv);
            const cr = await client.query('select * from messages where session = $1 order by index', [cv.session]);
            return cr.rows.length > 0 ? `A previous user's messages to you at ${DateTime.fromSeconds(Number.parseInt(cv.timestamp)).toFormat("MMMM dd, yyyy - hh:mm")})\n"""\n` + (cr.rows.map(row => row.content.trim()).join('\n---\n')) + `\n"""` : undefined;
        }))).filter(cv => cv !== undefined);

        const moderationResponse = await openai.createModeration({input: body.replace(/\n/g, ' ')});
        const moderation = moderationResponse.data.results[0];
        if (!(moderation.flagged || Object.values(moderation.categories).includes(true) || filter.isProfane(body))) {
            await client.query('insert into messages (content, embedding, session, index, "user", timestamp) values ($1, $2, $3, $4, $5, $6);', [body, "[" + embedding.toString() + "]", json.session, json.index, json.user, Math.floor(DateTime.now().toSeconds())]);
        } else {
            console.warn("Flagged " + JSON.stringify(moderation));
        }

        console.log(conversations.join('\n#####\n'));
        res.status(200).send(JSON.stringify({context: conversations.join('\n#####\n')}));
    } catch (e) {
        console.error(e);
        res.status(500).send(JSON.stringify(e));
    } finally {
        client.release();
    }
});

app.post('/new', async (req, res) => {
    console.log(req.body)
    const json = JSON.parse(req.body);

    const client = await pool.connect();

    try {
        const result = await client.query('select content, session, index from messages where "user" = $1 order by "timestamp" limit 20', [json.user]);
        const grouped = _.mapValues(_.groupBy(result.rows, 'session'), clist => clist.map(car => car.content));
        console.log(grouped);
        const context = Object.values(grouped).map(session => `"""\n` + session.join("\n-----\n") + `\n"""`).join("\n#####\n");
        const nameResponse = await openai.createChatCompletion({model: "gpt-3.5-turbo", messages: [{role: "user", content: `The following is a list of messages sent to you by a user. Try to identity the user's name based on the messages. Return the result in JSON as name: <#name#>. Reply with just the JSON and NOTHING ELSE. If you could not determine the name, or I failed to provide the messages, set the value of the name field in the JSON to "unknown". AGAIN, if you reply with ANYTHING that is not valid JSON, the app WILL FAIL.\n\n${context}`}], user: json.user});
        const name = nameResponse.data.choices[0].message.content;
        console.log(name);
        res.status(200).send(JSON.stringify({context: context, name: JSON.parse(name).name}));
    } catch (e) {
        console.error(e);
        res.status(500).send(JSON.stringify(e));
    } finally {
        client.release();
    }
});

app.listen(4000, () => {
    console.log(`Server app listening on port 4000!`);
});
