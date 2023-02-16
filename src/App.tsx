import './App.css'
import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import TextareaAutosize from "@mui/material/TextareaAutosize";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import {useEffect, useState} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {ThumbDown, ThumbUp} from "@mui/icons-material";
import whoami from "./img/images.jpg";
import axios from "axios";
import tables, {Idea} from "./backend/Tables";
import {nanoid} from "nanoid";
import useCachedState from "./hooks/UseCachedState";
import {io} from "socket.io-client";

const socket = io("ws://ec2-18-209-224-242.compute-1.amazonaws.com:5000", {autoConnect: false});

function App() {
    const [user] = useState(localStorage.user || nanoid(16));
    localStorage.user = user;

    const [voted, setVoted] = useCachedState<number[]>("voted", []);

    const [ideas, setIdeas] = useState<Idea[] | null>(null);
    const [idea, setIdea] = useState<string>("");

    const [profanity, setProfanity] = useState<string[]>([]);

    useEffect(() => {
        const x = async () => {
            if (!profanity) {
                setProfanity((await axios.get("https://raw.githubusercontent.com/LDNOOBW/List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words/master/en")).data);
            }
        }
        x().then();
        console.log(profanity);
    }, [profanity]);

    useEffect(() => {
        const x = async () => {
            if (!ideas) {
                setIdeas(await tables.ideas.query([], undefined, undefined, "votes"));
            }
        }
        x().then();
    }, [ideas]);

    useEffect(() => {
        socket.connect();

        socket.on('connect', () => {
            console.log("WHOOO!");
        });

        socket.on('votes', (data) => {
            const packet = JSON.parse(data);
            console.log(packet);
            setIdeas(ideas => ideas!.map(idea => {
                if (idea.id === packet.id) {
                    idea.votes += packet.down ? -1 : 1;
                }
                return idea;
            }));
        });
    }, []);

    const addIdea = () => {
        const x = async () => {
            const id = await tables.ideas.insert({content: idea, votes: 0, creator: user}, "id");
            setIdeas([...ideas!, {content: idea, votes: 0, creator: user, id: id}]);
        }
        x().then();
    }

    const vote = (idea: Idea, down = false) => {
        const x = async () => {
            if (!voted.includes(idea.id)) {
                setVoted([...voted, idea.id]);
                idea.votes += down ? -1 : 1;
                ideas?.forEach((i, index) => {
                    if (i.id === idea.id) {
                        ideas[index] = idea;
                    }
                });
                setIdeas(ideas);
                socket.emit("votes", JSON.stringify({id: idea.id, down}));
                await tables.ideas.update(idea.id, {votes: idea.votes});
            }
        }
        x().then();
    }

    return <>
        <AppBar position="sticky" color="transparent" elevation={0} className="dark:backdrop-brightness-75 backdrop-blur-sm border-b border-slate-200 dark:border-slate-500">
            <Toolbar>
                <p style={{ flexGrow: 1 }} className="font-bold text-xl">Evergreen ASB Election 2023</p>
                <div className="flex gap-4">
                    <p>nothing yet</p>
                </div>
            </Toolbar>
        </AppBar>
        <div className="max-w-4xl w-full mx-auto">
            <div className="flex gap-5 mb-16">
                <img src={whoami}/>
                <div className="flex flex-col justify-between">
                    <h2 className="font font-semibold text-2xl">Your 2023 president's identity will be revealed in:</h2>
                    <div className="h-fit flex mb-2 gap-2">
                        {"10:00".split('').map((char, index) => <div key={index} className="bg-slate-700 rounded-md p-4 text-xl">
                            {char}
                        </div>)}
                    </div>
                </div>
            </div>
            <h2 className="text-3xl mb-10">What <b>you</b> want</h2>
            <TextareaAutosize placeholder="What do you want? (Markdown supported)" className="w-full resize-none bg-slate-900 rounded-md mb-0" minRows={3} value={idea} onChange={e => setIdea(e.target.value)}/>
            <Button variant="contained" size="large" className="!mb-12" onClick={addIdea}>Add</Button>
            {ideas && ideas.map((idea, index) => <div key={index} className="bg-slate-700 p-5 rounded-lg shadow-sky-800 shadow-md mb-5 flex justify-between">
                <div className="flex gap-5">
                    <p>{idea.votes}</p>
                    <div className="markdown text-lg">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{idea.content}</ReactMarkdown>
                    </div>
                </div>
                <div className="flex h-fit">
                    <IconButton color="primary" onClick={() => {vote(idea, false)}}><ThumbUp/></IconButton>
                    <IconButton color="default" onClick={() => {vote(idea, true)}}><ThumbDown/></IconButton>
                </div>
            </div>)}
        </div>
    </>
}

export default App
