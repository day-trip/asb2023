import Table from "./Table";

type Idea = {
    id: number,
    content: string,
    votes: number,
    creator: string
}

const ideas = new Table<Idea>("ideas");

const tables = {ideas};

export default tables;

export {
    ideas
};

export type {
    Idea
}
