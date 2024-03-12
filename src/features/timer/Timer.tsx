import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Actions } from './Actions';
import { io } from 'socket.io-client';
import slice from 'lodash/fp/slice';
import classes from './assets/index.module.css';

import { TimerStatuses, Timer, TimerTypes } from '../../types/timer';
import { User } from "../../types/user";
import { TimerType } from "./TimerType";
import { TodaysTimers } from "./TodaysTimers";

const socket = io('http://localhost:3000');

export const counterDuration = {
    POMADORO: 25,
    SHORT_BREAK: 5,
    LONG_BREAK: 15,
    TEST: .5,
};

function millisToMinutesAndSeconds(millis: number) {
    var minutes = Math.floor(millis / 60000);
    var seconds = Number(((millis % 60000) / 1000).toFixed(0));
    return {
        minutes,
        seconds,
    };
}

const recreate = true;

export const TimerContainer: FC<{ user: User }> = ({ user }) => {
    const [state, setState] = useState<Timer | null>(useMemo(() => {
        if (user.timers.length && user.timers[0].status !== TimerStatuses.finished) {
            return user.timers[0];
        }
        return null;
    }, []));
    const [finishedTimers, setFinishedTimers] = useState(useMemo(() => {
        if (user.timers.length && user.timers[0].status !== TimerStatuses.finished) {
            return slice(1, user.timers.length)(user.timers);
        }
        return user.timers;
    }, []) as any);

    const [timerType, setTimerType] = useState(useMemo(() => {
        if (user.timers.length && user.timers[0].status !== TimerStatuses.finished)
            return user.timers[0].type;
        return TimerTypes.pomadoro;
    }, []));

    console.log(timerType, 'tt');

    let interval = useRef<any | null>(null);

    useEffect(() => {
        const setStatus = (state: Timer) => {
            const onTimerProcessing = (timer: Timer) => {
                const { changedAt, passed } = timer;
                const currentPassed = (Date.now() - changedAt) + passed;
                interval.current && clearInterval(interval.current);
                interval.current = setInterval(() => {
                    setState((prevState) => {
                        if (prevState)
                            return {
                                ...prevState,
                                passed: prevState.passed + 1000
                            }
                        return prevState;
                    });
                }, 1000);

                return {
                    ...state,
                    passed: currentPassed
                };
            }

            const onTimerFinish = (timer: Timer) => {
                clearInterval(interval.current);
                debugger;
                setFinishedTimers((finishedTimers: Timer[]) => ([
                    ...finishedTimers,
                    timer,
                ]));

                return null;
            }

            const onTimerPause = (timer: Timer) => {
                clearInterval(interval.current);
                return timer;
            }
            const onTimerCreate = (timer: Timer) => {
                setTimerType(timer.type);
                return timer;
            }
            const getHandlerByTimerStatus = (status: TimerStatuses) => ({
                [TimerStatuses.processing]: onTimerProcessing,
                [TimerStatuses.finished]: onTimerFinish,
                [TimerStatuses.paused]: onTimerPause,
                [TimerStatuses.created]: onTimerCreate,
            }[status])

            const { status } = state;

            setState(getHandlerByTimerStatus(status)(state));


        }

        socket.on('timer:status_changed', setStatus);
        state && setStatus(state);
    }, []);

    const cancelCounter = useCallback(() => {
        // dispatch({ type: ReducerActions.cancel, payload: { duration: counterDuration.POMADORO } });
    }, []);

    const toggleCounter = useCallback(() => {
        if (!state || state.status === TimerStatuses.created || state && state.status === TimerStatuses.paused)
            socket.emit('timer:play', { type: timerType, recreate });
        else
            socket.emit('timer:pause');
    }, [state?.status, timerType]);

    const { minutes, seconds } = state ? millisToMinutesAndSeconds(state.passed) : { minutes: 0, seconds: 0 };

    return <div className={classes.timer}>
        <TodaysTimers timers={finishedTimers} />
        <TimerType value={timerType} disabled={TimerStatuses.processing === state?.status} onChange={setTimerType} />
        <div style={{ fontSize: "4vw" }}>{minutes}:{seconds}</div>
        <Actions
            cancel={cancelCounter}
            status={state ? state.status : TimerStatuses.created}
            toggleAction={toggleCounter}
        />
    </div>
}