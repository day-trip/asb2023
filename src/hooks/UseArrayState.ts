import {Dispatch, SetStateAction} from "react";

const useArrayState = <T>([state, setState]: [T[], Dispatch<SetStateAction<T[]>>]): T[] => {
    return new Proxy(state, {
        set(target: T[], p: string | symbol, newValue: T): boolean {
            if (typeof p === "number") {
                console.log("goem")
                console.log(p);
                console.log(newValue)
                const temp = [...target];
                temp[p] = newValue;
                console.log(target)
                console.log(temp)
                setState(temp);
                return true;
            }
            return Reflect.set(...arguments);
        }
    })
}

export default useArrayState;