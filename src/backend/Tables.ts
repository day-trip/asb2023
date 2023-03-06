import Table from "./Table";

type Idea = {
    id: number,
    content: string,
    votes: number,
    creator: string,
    timestamp: number
}

type Guess = {
    id: number,
    content: string,
    votes: number,
    creator: string,
    timestamp: number
}

const ideas = new Table<Idea>("ideas");
const guesses = new Table<Guess>("guesses");

const tables = {
    ideas,
    guesses
};

export default tables;

export {
    ideas,
    guesses
};

export type {
    Idea,
    Guess
}
