import Query from "./Query";
import squel, {Insert, Select, Update} from "squel";
import {DateTime} from "luxon";

class Data {
    private static _endpoint: string;
    static squel: squel.PostgresSquel;
    static init() {
        this._endpoint = "http://ec2-18-209-224-242.compute-1.amazonaws.com:3000";
        this.squel = squel.useFlavour("postgres");
    }

    static _set(query: Insert | Update, values: {[key: string]: any}): Insert | Update {
        Object.keys(values).map(k => {
            const v = values[k];
            if (this._isObject(v)) {
                query = query.set(k, JSON.stringify(v));
            } else {
                query = query.set(k, v);
            }
        });
        return query;
    }

    static _where(query: Select, values: Array<string>): Select {
        values.forEach(value => {
            query = query.where(value);
        });
        return query;
    }

    static timestamp(query: Insert | Update, create = false): Insert | Update {
        const time = DateTime.now().toISO();
        if (create) {
            query = query.set("created_at", time);
        }
        return query.set("updated_at", time);
    }

    static _isObject(val: any): boolean {
        if (val === null) { return false;}
        return ( (typeof val === 'function') || (typeof val === 'object') );
    }

    static _tryParseJSONObject(jsonString: string) {
        try {
            const o = JSON.parse(jsonString);
            if (o && typeof o === "object") {
                return o;
            }
        }
        catch (e) { }
        return false;
    };

    static async _processResult(result: {[key: string]: any}) {
        let rows = result.rows;
        return {rows: rows || [], fields: result.fields || [], oid: result.oid || undefined};
    }

    static async _sql(query: Query): Promise<{rows?: Array<{[key: string]: any}>, fields?: Array<{[key: string]: string}>, oid?: string}> {
        console.log("Executing SQL command:\n" + query.toString());
        query.updateOptions({...query.options, parameterCharacter: "POOPMAN", replaceSingleQuotes: true});
        console.log(query.toString())
        const data = await fetch(this._endpoint/* + "/sql"*/, {method: "post", body: query.toString()});
        const text = await data.text();
        const json = this._tryParseJSONObject(text);
        if (json) {
            return this._processResult(json);
        }
        throw Error("Exception thrown while executing SQL command!\n" + text);
    }
}

export default Data;
