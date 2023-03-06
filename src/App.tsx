import './App.css'
import AppBar from "@mui/material/AppBar";
import TextareaAutosize from "@mui/material/TextareaAutosize";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import {useEffect, useRef, useState} from "react";
import Add from "@mui/icons-material/Add";
import ThumbUp from "@mui/icons-material/ThumbUp";
import ThumbDown from "@mui/icons-material/ThumbDown";
import tables, {Guess, Idea} from "./backend/Tables";
import {nanoid} from "nanoid";
import useCachedState from "./hooks/UseCachedState";
import {io} from "socket.io-client";

import ems from "./img/ems.png";
import incognito from "./img/incognito.png";
import ballot from "./img/ballot.png";

import Filter from "bad-words";

import "@fontsource/roboto/latin.css"

import seedrand from "seedrandom"
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import Sort from "@mui/icons-material/Sort";
import {Delete, Send} from "@mui/icons-material";
import ChatGPT from "./ai/ChatGPT";
import {yieldStream} from "yield-stream";

const socket = io("ws://ec2-18-209-224-242.compute-1.amazonaws.com:5000", {autoConnect: false});

const processIdea = (i: string): [number, number][] => {
    const filter = new Filter({placeHolder: "⨕"});
    const clean = filter.isProfane(i) ? filter.clean(i) : i;
    let match;
    const re = /⨕+/g;
    const indexes: [number, number][] = [];
    while ((match = re.exec(clean)) != null) {
        indexes.push([match.index, match.index + match[0].length]);
    }
    return indexes;
}

const pad = (time: number) => {
    return time.toString().length === 1 ? "0" + time : "" + time;
}

const App = () => {
    const [user] = useState(localStorage.user || nanoid(16));
    localStorage.user = user;

    const [session] = useState(sessionStorage.session || nanoid(16));
    sessionStorage.session = session;

    const [voted, setVoted] = useCachedState<{[key: number]: string}>("voted", {});
    const [votedg, setVotedg] = useCachedState<{[key: number]: string}>("votedg", {});

    const [ideas, setIdeas] = useState<Idea[] | null>(null);
    const [idea, setIdea] = useState<string>("");

    const [guesses, setGuesses] = useState<Guess[] | null>(null);
    const [guess, setGuess] = useState<string>("");

    const [messages, setMessages] = useState<any[]>([]);
    const [message, setMessage] = useState<string>("");


    const [page, setPage] = useState(0);

    const [sort, setSort] = useState(true);
    const sortref = useRef(sort);

    const [reveal, setReveal] = useState("∞∞:∞∞:∞∞:∞∞");

    const isAdmin = localStorage.admin && localStorage.admin.toLowerCase() === "doi doi uwu";

    /*useEffect(() => {
        const c = setInterval(() => {
            const delta = new Date(Date.parse("30 Mar 2023 00:00:00 GMT") - Date.now());
            setReveal(pad(Math.floor(delta.getTime() / (3600000 * 24))) + ":" + pad(delta.getUTCHours()) + ":" + pad(delta.getUTCMinutes()) + ":" + pad(delta.getUTCSeconds()))
        }, 1000);

        return () => {
            clearInterval(c);
        }
    }, []);*/

    useEffect(() => {
        const x = async () => {
            setIdeas(await tables.ideas.query([], undefined, undefined, sort ? "timestamp" : "votes"));
            setGuesses(await tables.guesses.query([], undefined, undefined, sort ? "timestamp" : "votes"));
            sortref.current = sort;
        }
        x().then();
    }, [sort]);

    useEffect(() => {
        socket.connect();

        socket.on('connect', () => {
            console.log("Socket connected.");
        });

        socket.on('disconnect', () => {
            console.log("Socket disconnected.");
        });

        socket.on('votes', (packet) => {
            console.log(packet);
            if (packet.user !== user) {
                setIdeas(ideas => ideas!.map(idea => {
                    if (idea.id === packet.id) {
                        console.log("INCR-ING!");
                        idea.votes += packet.incr;
                    }
                    return idea;
                }).sort((idea, other) => sort ? idea.timestamp - other.timestamp : idea.votes - other.votes));
            }
        });
        socket.on('new', (data) => {
            const {u, ...packet} = data;
            if (user !== u) {
                setIdeas(ideas => [...ideas!, packet as Idea]);
            }
        });

        socket.on('votesg', (packet) => {
            if (packet.user !== user) {
                setGuesses(guesses => guesses!.map(guess => {
                    if (guess.id === packet.id) {
                        console.log("INCR-ING!");
                        guess.votes += packet.incr;
                    }
                    return guess;
                }).sort((idea, other) => sort ? idea.timestamp - other.timestamp : idea.votes - other.votes));
            }
        });
        socket.on('newg', (data) => {
            const {u, ...packet} = data;
            if (user !== u) {
                setGuesses(guesses => [...guesses!, packet as Guess]);
            }
        });

        return () => {
            socket.disconnect();
        }
    }, [user]);

    const addIdea = () => {
        const x = async () => {
            const id = await tables.ideas.insert({content: idea, votes: 0, creator: user, timestamp: Date.now()}, "id");
            socket.emit("new", {content: idea, votes: 0, creator: user, id: id, user, timestamp: Date.now()});
            setIdeas([...ideas!, {content: idea, votes: 0, creator: user, id: id, timestamp: Date.now()}].sort((idea, other) => sort ? idea.timestamp - other.timestamp : idea.votes - other.votes));
            setIdea("");
        }
        x().then();
    }

    const addGuess = () => {
        const x = async () => {
            const id = await tables.guesses.insert({content: guess, votes: 0, creator: user, timestamp: Date.now()}, "id");
            socket.emit("newg", {content: guess, votes: 0, creator: user, id: id, user, timestamp: Date.now()});
            setGuesses([...guesses!, {content: guess, votes: 0, creator: user, id: id, timestamp: Date.now()}].sort((idea, other) => sort ? idea.timestamp - other.timestamp : idea.votes - other.votes));
            setGuess("");
        }
        x().then();
    }

    const addMessage = () => {
        const x = async () => {
            if (new Filter().isProfane(message)) {
                setMessages([...messages, {role: "bozo", content: "At Evergreen Middle School, we strive to promote an inclusive and respectful environment, including by the words we use. Can you please say that again without the swear words?"}]);
                return;
            }
            const msg = {role: "user", content: message};
            setMessages([...messages, msg, {role: "assistant", content: ""}]);
            const stream = await ChatGPT.send([...messages], message, user, session);
            const decoder = new TextDecoder();
            let i = 0;
            for await (const chunk of yieldStream(stream)) {
                i++;
                const token = JSON.parse(decoder.decode(chunk as Uint8Array));
                if (token.content) {
                    setMessages(msgs1 => {
                        const msgs = [...msgs1];
                        msgs[msgs.length - 1].content += token.content;
                        return msgs;
                    })
                }
            }
            setMessage("");
        }
        x().then();
    }

    const vote = (idea: Idea, direction: string) => {
        const x = async () => {
            const v = {...voted};
            if (voted[idea.id] === direction) {
                delete v[idea.id];
            } else {
                v[idea.id] = direction;
            }
            setVoted(v);

            let incr;
            if (voted[idea.id] === undefined) {
                console.log("A")
                incr = direction === "up" ? 1 : -1;
            } else if(voted[idea.id] === direction) {
                console.log("B")
                incr = direction === "up" ? -1 : 1;
            } else {
                console.log("C")
                incr = direction === "up" ? 2 : -2;
            }
            idea.votes += incr;

            setIdeas(ideas!.map(i => i.id === idea.id ? idea : i).sort((idea, other) => sort ? idea.timestamp - other.timestamp : idea.votes - other.votes));
            socket.emit("votes", {id: idea.id, incr, user});
            await tables.ideas.update(idea.id, {votes: idea.votes});
        }
        x().then();
    }

    const voteg = (guess: Guess, direction: string) => {
        const x = async () => {
            const v = {...votedg};
            if (votedg[guess.id] === direction) {
                delete v[guess.id];
            } else {
                v[guess.id] = direction;
            }
            setVotedg(v);

            let incr;
            if (votedg[guess.id] === undefined) {
                console.log("A")
                incr = direction === "up" ? 1 : -1;
            } else if(votedg[guess.id] === direction) {
                console.log("B")
                incr = direction === "up" ? -1 : 1;
            } else {
                console.log("C")
                incr = direction === "up" ? 2 : -2;
            }
            guess.votes += incr;

            setGuesses(guesses!.map(i => i.id === guess.id ? guess : i).sort((idea, other) => sort ? idea.timestamp - other.timestamp : idea.votes - other.votes));
            socket.emit("votesg", {id: guess.id, incr, user});
            await tables.guesses.update(guess.id, {votes: guess.votes});
        }
        x().then();
    }

    const del = (idea: Idea) => {
        if (isAdmin) {
            tables.ideas.delete(idea.id);
        }
    }

    const delg = (guess: Guess) => {
        if (isAdmin) {
            tables.guesses.delete(guess.id);
        }
    }

    return <>
        <AppBar position="sticky" color="transparent" elevation={0} className={`dark:backdrop-brightness-75 backdrop-blur-sm border-b border-slate-200 dark:border-slate-500`}>
            <Toolbar className="w-full max-w-4xl mx-auto" disableGutters={true}>
                <img src={ems} alt="Evergreen Middle School" className="w-8 h-8 mr-2"/>
                <p style={{ flexGrow: 1 }} className="font-bold text-xl">EMS - ASB 2023</p>
                <div className="flex gap-4">
                    <img src={page === 0 ? incognito : ballot} alt="Incognito" className={`${page === 0 ? "w-10 h-10" : "w-12 h-12"} cursor-pointer animate-pulse`} onClick={() => setPage(page === 0 ? 2 : 0)}/>
                </div>
            </Toolbar>
        </AppBar>
        <div className="max-w-4xl w-full mx-auto">
            <div className="bg-slate-700 rounded-lg mb-10 mt-10 p-5">
                {page === 0 && <>
                    <h1 className="text-5xl font-semibold mb-8 text-orange-300">Let's make EMS fun!</h1>
                    <p className="text-2xl max-w-3xl mb-6">I'm running for president, and I want <u>your</u> ideas to make Evergreen an even more fun place! Tell me what you want below!! You can also upvote or downvote the ideas so far.</p>
                </>}
                {page === 1 && <>
                    <h2 className="text-5xl font-semibold mb-6 text-orange-300">Guess who I am?!!</h2>
                    <Stack direction="row" alignItems="center" className="gap-4">
                        <p className="text-2xl max-w-3xl">I will reveal who I am in:</p>
                        <div className="h-fit flex flex-wrap text-white bg-slate-900 w-fit rounded-lg">
                            {reveal.split('').map((char, index) => <div key={index} className={`${char === ":" ? "flex items-center px-1.5" : "py-2 px-1"} rounded-md text-2xl font-bold`}>
                                {char}
                            </div>)}
                        </div>
                    </Stack>
                </>}
                {page === 2 && <>
                    <h1 className="text-5xl font-semibold mb-4 text-orange-300">Talk to Hannah, my campaign manager!</h1>
                    {/*<p className="text-2xl max-w-3xl mb-6"></p>*/}
                </>}
            </div>
            <Stack direction="row" className="mb-3">
                {page === 0 && <>
                    <TextareaAutosize placeholder="What do you want? (markdown supported)" className="w-full resize-none bg-slate-900 rounded-tl-md rounded-bl-md focus:ring-orange-500 focus:border-orange-500 text-xl placeholder-orange-200 placeholder-opacity-50 focus:placeholder-opacity-25" minRows={3} value={idea} onChange={e => setIdea(e.target.value)}/>
                    <button className="bg-orange-500 rounded-tr-md rounded-br-md min-w-[4rem] transition-opacity hover:opacity-75 disabled:opacity-50" onClick={addIdea} disabled={!/.{15,100}/m.test(idea)}><Add/></button>
                </>}
                {page === 1 && <>
                    <input className="w-full bg-slate-900 border-b border-t border-l border-slate-600 rounded-tl-md rounded-bl-md focus:ring-none focus:border-none focus:outline-orange-500 text-xl p-3 placeholder-orange-200 placeholder-opacity-50 focus:placeholder-opacity-25" placeholder="Who am I?" value={guess} onChange={e => setGuess(e.target.value)}/>
                    <button className="bg-orange-500 rounded-tr-md rounded-br-md transition-opacity hover:opacity-75 disabled:opacity-50 p-3" onClick={addGuess} disabled={!/.{2,30}/m.test(guess)}><Add/></button>
                </>}
                {page === 2 && <>
                    <TextareaAutosize placeholder="Say something" className="w-full resize-none bg-slate-900 rounded-tl-md rounded-bl-md focus:ring-orange-500 focus:border-orange-500 text-xl placeholder-orange-200 placeholder-opacity-50 focus:placeholder-opacity-25" minRows={2} value={message} onChange={e => setMessage(e.target.value)}/>
                    <button className="bg-orange-500 rounded-tr-md rounded-br-md min-w-[4rem] transition-opacity hover:opacity-75 disabled:opacity-50" onClick={addMessage}><Send/></button>
                </>}
            </Stack>
            {page < 2 && <Stack direction="row" alignItems="center" className="mb-5">
                <p className="text-orange-300 mr-2"><Sort/> Sort by</p>
                <p>Votes</p>
                <Switch color="primary" checked={sort} onChange={e => {setSort(e.target.checked)}}/>
                <p>Recent</p>
            </Stack>}
            {page === 0 && ideas && ideas.map((idea, index) => <Stack direction="row" justifyContent="space-between" key={index} className="bg-slate-700 p-5 rounded-lg shadow-slate-600 mb-5">
                <Stack direction="row" className="gap-5">
                    <Stack direction="column" alignItems="center" className="text-slate-400">
                        <p className="font-bold">{idea.votes}</p>
                        <p>Votes</p>
                    </Stack>
                    <IdeaR idea={idea}/>
                </Stack>
                <Stack direction="row" className="h-fit">
                    <IconButton color={voted[idea.id] === "up" ? "secondary" : "primary"} onClick={() => {vote(idea, "up")}}><ThumbUp/></IconButton>
                    <IconButton color={voted[idea.id] === "down" ? "secondary" : "primary"} onClick={() => {vote(idea, "down")}}><ThumbDown/></IconButton>
                    {isAdmin && <IconButton color="warning" onClick={() => {del(idea)}}><Delete/></IconButton>}
                </Stack>
            </Stack>)}
            {page === 1 && guesses && guesses.map((guess, index) => <Stack direction="row" justifyContent="space-between" alignItems="center" key={index} className="bg-slate-700 p-4 py-3 rounded-lg shadow-slate-600 mb-4">
                <Stack direction="row" className="gap-5">
                    <Stack direction="column" alignItems="center" className="text-slate-400">
                        <p className="font-bold">{guess.votes} votes</p>
                    </Stack>
                    <IdeaR idea={guess}/>
                </Stack>
                <Stack direction="row" className="h-fit">
                    <IconButton color={votedg[guess.id] === "up" ? "secondary" : "primary"} onClick={() => {voteg(guess, "up")}}><ThumbUp/></IconButton>
                    <IconButton color={votedg[guess.id] === "down" ? "secondary" : "primary"} onClick={() => {voteg(guess, "down")}}><ThumbDown/></IconButton>
                    {isAdmin && <IconButton color="warning" onClick={() => {delg(guess)}}><Delete/></IconButton>}
                </Stack>
            </Stack>)}
            {page === 2 && [...messages].reverse().map((message, index) => <div className="bg-slate-700 p-4 py-3 rounded-lg shadow-slate-600 mb-4" key={index}>
                <p className={`text-xl ${message.role === "assistant" && "text-orange-200"}`}>{message.content}</p>
            </div>)}
        </div>
    </>
}

const randomChars = (len: number, chars: string, seed: string) => {
    const rand = seedrand.alea(seed);
    const c = chars.split('');
    const a: string[] = [];
    let l = "~";
    for (let i = 0; i < len; i++) {
        while (true) {
            const t = c[Math.floor(rand.quick() * c.length)];
            if (t !== l) {
                a.push(t);
                l = t;
                break;
            }
        }
    }
    return a.join('');
}
const IdeaR = ({idea}: {idea: Idea}) => {
    const proc = processIdea(idea.content);
    let content = idea.content;

    proc.forEach(pp => {
        content = content.substring(0, pp[0]) + randomChars(pp[1] - pp[0], "@#$%*", idea.id + "") + content.substring(pp[1]);
    });

    return <ReactMarkdown remarkPlugins={[remarkBreaks, remarkGfm]} className="markdown">{content}</ReactMarkdown>;
}

export default App
