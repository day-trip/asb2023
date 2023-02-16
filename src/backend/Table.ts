import Data from "./Data";
import {Insert, Select} from "squel";

class Table<M extends {[key: string]: any}> {
    private readonly _timestamps: boolean;
    private readonly table: string;

    constructor(name: string, timestamps: boolean = false) {
        this.table = name;
        this._timestamps = timestamps;
    }

    async insert<K extends keyof M>(model: Partial<M>, returning?: K): Promise<any | undefined> {
        let query: Insert = Data._set(Data.squel.insert().into(this.table), model) as Insert;

        if (this._timestamps) {
            query = Data.timestamp(query, true) as Insert;
        }

        if (returning) {
            // @ts-ignore
            query = query.returning(returning);
        }

        const result = await Data._sql(query);

        if (returning) {
            return result.rows![0][returning as string];
        }
    }

    async update(id: number | string, model: Partial<M>) {
        let query = Data._set(Data.squel.update().table(this.table).where("id = " + id), model);

        if (this._timestamps) {
            query = Data.timestamp(query);
        }

        await Data._sql(query);
    }

    async delete(id: number | string) {
        await Data._sql(Data.squel.delete().from(this.table).where("id = " + id));
    }

    async query<K extends keyof M, L extends number | undefined, O extends keyof M>(statements: string[], limit?: L, fields?: K[], order?: O, page?: number): Promise<L extends 1 ? Pick<M, K> : Pick<M, K>[]> {
        let query: Select = Data.squel.select().from(this.table);

        if (limit) {
            query = query.limit(limit);
            if (page) {
                query = query.offset(page * limit);
            }
        }

        query = Data._where(query, statements);

        if (fields) {
            query = query.fields(fields as string[]);
        }

        if (order) {
            query = query.order(order.toString(), false);
        }

        const result = await Data._sql(query);

        if (limit === 1 && result.rows!.length > 0) {
            return result.rows![0] as L extends 1 ? Pick<M, K> : Pick<M, K>[];
        }

        return result.rows! as L extends 1 ? Pick<M, K> : Pick<M, K>[];
    }

    async get<K extends keyof M>(id: string | number, fields?: K[]): Promise<Pick<M, K> | null> {
        let query: Select = Data.squel.select().from(this.table).limit(1);

        query = query.where("id = " + id);

        if (fields) {
            query = query.fields(fields as string[]);
        }

        const result = await Data._sql(query);

        if (result.rows!.length === 1) {
            return result.rows![0] as Pick<M, K>;
        }

        return null;
    }
}

export default Table;
