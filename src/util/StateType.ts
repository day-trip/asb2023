import {Dispatch, SetStateAction} from "react";

type StateType<T> = [T, Dispatch<SetStateAction<T>>];

export default StateType;