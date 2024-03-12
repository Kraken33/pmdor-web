import type { Timer } from "./timer";

export type User = {
    _id: string;
    timers: Array<Timer>;
}