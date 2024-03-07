import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Circle } from './Circle';
import { Actions } from './Actions';
import { io } from 'socket.io-client';
import slice from 'lodash/fp/slice';
import classes from './index.module.css';

import { TimerStatuses, TimerType, TimerTypes } from '../../types/timer';
import { User } from "../../types/user";

const socket = io('http://localhost:3000');

const counterDuration = {
    POMADORO: 25,
    SHORT_BREAK: 5,
    LONG_BREAK: 15,
    TEST: .5,
}

function millisToMinutesAndSeconds(millis: number) {
    var minutes = Math.floor(millis / 60000);
    var seconds = Number(((millis % 60000) / 1000).toFixed(0));
    return {
        minutes,
        seconds,
    };
}

const getDurationByType = (type: TimerTypes) => ({
    [TimerTypes.pomadoro]: counterDuration.POMADORO,
    [TimerTypes.shortBreak]: counterDuration.SHORT_BREAK,
    [TimerTypes.longBreak]: counterDuration.LONG_BREAK,
    [TimerTypes.test]: counterDuration.TEST
}[type] * 60_000)

const setCircleTransformProperties = ({ yAsix }: { yAsix: number }) => {
    document.getElementById("circle")?.style.setProperty('--trans-start', `translate(-50%, -${yAsix}%) rotate(0deg)`);
    document.getElementById("circle")?.style.setProperty('--trans-end', `translate(-50%, -${yAsix}%) rotate(360deg)`);
}

export const Counter: FC<{ user: User }> = ({ user }) => {
    const [state, setState] = useState<TimerType | null>(useMemo(() => {
        if (user.timers[0].status !== TimerStatuses.finished) {
            return user.timers[0];
        }
        return null;
    }, []));
    const [finishedTimers, setFinishedTimers] = useState(useMemo(() => {
        if (user.timers[0].status !== TimerStatuses.finished) {
            return slice(1, user.timers.length)(user.timers);
        }
        return user.timers;
    }, []) as any);

    let interval = useRef<any | null>(null);

    useEffect(() => {
        const setStatus = (state: TimerType) => {
            const MAX_TRANSITION_RISE = 50;
            const onTimerProcessing = (timer: TimerType) => {
                const { changedAt, passed, type } = timer;
                const currentPassed = (Date.now() - changedAt) + passed;
                const step = 1000 / getDurationByType(type) * MAX_TRANSITION_RISE;
                let translateOnPercent = MAX_TRANSITION_RISE + (step * currentPassed / 1000);
                setCircleTransformProperties({ yAsix: translateOnPercent });
                interval.current && clearInterval(interval.current);
                interval.current = setInterval(() => {
                    translateOnPercent += step;
                    setCircleTransformProperties({ yAsix: translateOnPercent });
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

            const onTimerFinish = (timer: TimerType) => {
                clearInterval(interval.current);
                setCircleTransformProperties({ yAsix: 50 });
                setFinishedTimers((finishedTimers: TimerType[]) => ([
                    ...finishedTimers,
                    timer,
                ]));

                return timer;
            }

            const onTimerPause = (timer: TimerType) => {
                clearInterval(interval.current);
                return timer;
            }
            const onTimerCreate = (timer: TimerType) => {
                setCircleTransformProperties({ yAsix: 50 });
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
            socket.emit('timer:play');
        else
            socket.emit('timer:pause');
    }, [state?.status]);

    const { minutes, seconds } = state ? millisToMinutesAndSeconds(state.passed) : { minutes: 0, seconds: 0 };

    return <div>
        <div className={classes.amount}>
            {useMemo(
                () => finishedTimers.map(
                    ({ type, changedAt }: any) => type === TimerTypes.pomadoro
                        ? <div key={changedAt} className={classes.pomadoro} />
                        : <div key={changedAt} className={classes.break} />), [finishedTimers])}
        </div>
        <Circle minutes={minutes} seconds={seconds} />
        <Actions
            cancel={cancelCounter}
            status={state ? state.status : TimerStatuses.created}
            toggleAction={toggleCounter}
        />
    </div>
}