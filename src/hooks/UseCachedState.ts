import {useEffect, useState} from "react";
import StateType from "../ustil/StateType";

const useCachedState = <T>(key: string, initial: T): StateType<T> => {
    const [state, setState] = useState<T>(localStorage[key] || initial);

    useEffect(() => {
        localStorage[key] = state;
    }, [state]);

    return [state, setState];
}

export default useCachedState;