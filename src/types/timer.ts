export enum TimerStatuses {
    paused,
    processing,
    created,
    finished,
}

export enum TimerTypes {
    pomadoro,
    shortBreak,
    longBreak,
    test,
}

export type TimerType = {
    type: TimerTypes;
    changedAt: number;
    createdAt: number;
    passed: number;
    status: TimerStatuses;
}