import {useEffect, useState} from "react";
import StateType from "../util/StateType";

const useCachedState = <T>(key: string, initial: T): StateType<T> => {
    const [state, setState] = useState<T>(localStorage[key] ? JSON.parse(localStorage[key]) : initial);

    useEffect(() => {
        localStorage[key] = JSON.stringify(state);
    }, [state, key]);

    return [state, setState];
}

export default useCachedState;