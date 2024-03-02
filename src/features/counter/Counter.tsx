import { useCallback, useEffect, useRef, useState } from "react";
import { Circle } from './Circle';
import { Actions } from './Actions';
import {io} from 'socket.io-client';
import classes from './index.module.css';

const socket = io('http://localhost:3000');

const counterDuration = {
    POMADORO: 25,
    SHORT_BREAK: 5,
    LONG_BREAK: 15,
}

export enum TimerStatuses {
    paused,
    processing,
    created,
    finished,
}

enum TimerTypes {
    pomadoro,
    shortBreak,
    longBreak,
}

type TimerType = {
    type: TimerTypes;
    changedAt: number;
    createdAt: number;
    passed: number;
    status: TimerStatuses;
}

const minutes2Miliseconds = (minutes: number) => {
    return minutes * 60_000;
}

function millisToMinutesAndSeconds(millis: number) {
    var minutes = Math.floor(millis / 60000);
    var seconds = Number(((millis % 60000) / 1000).toFixed(0));
    return {
        minutes,
        seconds,
    };
}

export const Counter = () => {
    const [state, setState] = useState<TimerType | null>(null);
    const [finishedTimers, setFinishedTimers] = useState([] as any);

    let interval = useRef<any | null>(null);

    useEffect(()=>{
        const setCircleTransformProperties = ({ yAsix }: { yAsix: number }) => {
            document.getElementById("circle")?.style.setProperty('--trans-start', `translate(-50%, -${yAsix}%) rotate(0deg)`);
            document.getElementById("circle")?.style.setProperty('--trans-end', `translate(-50%, -${yAsix}%) rotate(360deg)`);
        }
        const setStatus = (state: TimerType)=>{
            const {passed, changedAt} = state;
            console.log(state, 's');
            if (state.status === TimerStatuses.processing) {
                // debugger;
                const currentPassed = (Date.now() - changedAt) + passed;
                const step = 1000 /  minutes2Miliseconds(state.type === TimerTypes.pomadoro ? 25 : 5) * 50;
                let i = 50 + (step * currentPassed / 1000);
                interval.current && clearInterval(interval.current);
                interval.current = setInterval(() => {
                    i += step;
                    setCircleTransformProperties({ yAsix: i });
                    setState((prevState)=>{
                        if(prevState)
                            return {
                                ...prevState,
                                passed: prevState.passed + 1000
                            }
                        return prevState;
                    });
                }, 1000);

                return setState({
                    ...state,
                    passed: currentPassed
                });
            } else if (state.status === TimerStatuses.paused) {
                clearInterval(interval.current as any);
            } else if (state.status === TimerStatuses.finished) {
                clearInterval(interval.current as any);
                setCircleTransformProperties({ yAsix: 50 });
                setFinishedTimers([
                    ...finishedTimers,
                    {
                        type: state.type,
                        finishedAt: state.changedAt,
                    }
                ]);
            } else if(state.status === TimerStatuses.created) {
                console.log('created');
                setCircleTransformProperties({yAsix: 50});
            }

            setState(state);


        }

        socket.on('timer:status_changed', setStatus);
        socket.on('timer:get_current', (state: TimerType | null)=>{
            console.log(state, 'state');
            if(state)
                setStatus(state);
        });
    }, []);

    const cancelCounter = useCallback(() => {
        // dispatch({ type: ReducerActions.cancel, payload: { duration: counterDuration.POMADORO } });
    }, []);

    const toggleCounter = useCallback(() => {
        if(!state || state.status === TimerStatuses.created || state && state.status === TimerStatuses.paused)
            socket.emit('timer:play');
        else
            socket.emit('timer:pause');
    }, [state?.status]);

    const { minutes, seconds } = state ? millisToMinutesAndSeconds(state.passed) : {minutes: 0, seconds: 0};

    return <div>
        <div className={classes.amount}>
            {finishedTimers.map(({ type, statusChangedAt }: any) => type === TimerTypes.pomadoro ? <div key={statusChangedAt} className={classes.pomadoro} /> : <div key={statusChangedAt} className={classes.break} />)}
        </div>
        <Circle minutes={minutes} seconds={seconds} />
        <Actions
            cancel={cancelCounter}
            status={state ? state.status : TimerStatuses.created}
            toggleAction={toggleCounter}
        />
    </div>
}