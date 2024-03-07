import type { TimerType } from "./timer";

export type User = {
    _id: string;
    timers: Array<TimerType>;
}