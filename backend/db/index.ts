import {Client} from "pg";
import express from "express";
import cors from "cors";

const app = express();

app.use(express.text({type: "*/*"}));
app.use(cors({origin: "*"}));

app.post('/', (req, res) => {
    (async () => {
        const client = new Client({
            user: "postgres",
            host: "ec2-18-209-224-242.compute-1.amazonaws.com",
            database: "postgres",
            password: "JaiAvi10:14",
            port: 5432
        });

        let r: string;

        try {
            await client.connect();
            r = JSON.stringify(await client.query(req.body));
            await client.end();
        } catch (e) {
            r = "Error:" + JSON.stringify(e);
            console.error(e);
        }

        res.status(200);
        res.send(r);
    })().then();
});

app.listen(3000, () => {
    console.log("WE'RE UP'N RUNNIN'!");
});
