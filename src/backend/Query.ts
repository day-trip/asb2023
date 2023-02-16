import {Select, Insert, Update, Delete} from "squel";

type Query = Select | Insert | Update | Delete;

export default Query;
