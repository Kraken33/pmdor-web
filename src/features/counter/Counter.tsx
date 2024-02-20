import { useCallback, useEffect, useReducer, useRef } from "react";
import { Circle } from './Circle';
import { Actions } from './Actions';
import classes from './index.module.css';
import pauseIcon from './assets/images/pause.png';
import playIcon from './assets/images/play.png';

enum CounterStatuses {
    paused,
    processing,
    created,
}

enum CounterTypes {
    pomadoro,
    shortBreak,
    longBreak,
}

type State = {
    type: CounterTypes;
    duration: number;
    statusChangedAt: number;
    passed: number;
    status: CounterStatuses;
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

enum ReducerActions {
    pause,
    resume,
    play,
    cancel,
    toggle,
    increase,
}

type Payload = Record<string, any>;

const reducer = (state: State, { type, payload }: { type: ReducerActions; payload?: Payload }) => {
    const pause = (state: State) => {
        if (state.status === CounterStatuses.processing) {
            return {
                ...state,
                status: CounterStatuses.paused,
                statusChangedAt: Date.now(),
            }
        }

        return state;
    }

    const resume = (state: State) => {
        if (state.status === CounterStatuses.paused) {
            return {
                ...state,
                status: CounterStatuses.processing,
                statusChangedAt: Date.now(),
            }
        }

        return state;
    }

    const play = (state: State, payload?: Payload) => {
        if (state.status === CounterStatuses.created && payload) {
            return {
                type: payload.type,
                duration: minutes2Miliseconds(payload.duration),
                status: CounterStatuses.processing,
                passed: 0,
                statusChangedAt: Date.now(),
            }
        }

        return state;
    }

    const cancel = (state: State, payload?: Payload) => {
        if (state.status === CounterStatuses.processing || state.status === CounterStatuses.paused && payload?.duration) {
            return {
                type: CounterTypes.pomadoro,
                duration: minutes2Miliseconds((payload as Payload).duration),
                status: CounterStatuses.created,
                passed: 0,
                statusChangedAt: Date.now(),
            }
        }

        return state;
    }

    const toggle = (state: State) => {
        if (state.status === CounterStatuses.created) {
            return play(state, {duration: 25});
        } else if (state.status === CounterStatuses.paused) {
            return resume(state);
        } else if (state.status === CounterStatuses.processing) {
            return pause(state);
        }

        return state;
    }

    const increase = (state: State) => {
        return {
            ...state,
            passed: state.passed + 1000
        }
    }

    const actions = {
        [ReducerActions.pause]: pause,
        [ReducerActions.play]: play,
        [ReducerActions.resume]: resume,
        [ReducerActions.cancel]: cancel,
        [ReducerActions.toggle]: toggle,
        [ReducerActions.increase]: increase
    }
    return actions[type](state, payload);
}

export const Counter = () => {
    const [state, dispatch] = useReducer(reducer, {
        type: CounterTypes.pomadoro,
        duration: minutes2Miliseconds(25),
        status: CounterStatuses.created,
        passed: 0,
        statusChangedAt: Date.now(),
    });

    let interval = useRef<number | null>(null);

    useEffect(() => {
        const setCircleTransformProperties = ({ yAsix }: { yAsix: number }) => {
            document.getElementById("circle")?.style.setProperty('--trans-start', `translate(-50%, -${yAsix}%) rotate(0deg)`);
            document.getElementById("circle")?.style.setProperty('--trans-end', `translate(-50%, -${yAsix}%) rotate(360deg)`);
        }
        if (state.status === CounterStatuses.processing) {
            const step =  1000 / state.duration * 50;
            let i = 50;
            interval.current = setInterval(() => {
                i += step;
                setCircleTransformProperties({yAsix: i});
                dispatch({ type: ReducerActions.increase });
            }, 1000);
        } else if(state.status === CounterStatuses.paused) {
            clearInterval(interval.current as any);
        } else if(state.status === CounterStatuses.created) {
            clearInterval(interval.current as any);
            setCircleTransformProperties({yAsix: 50});
        }
    }, [state.status]);

    const cancelCounter = useCallback(() => {
        dispatch({ type: ReducerActions.cancel, payload: { duration: 25 } });
    }, []);

    const toggleCounter = useCallback(() => {
        dispatch({ type: ReducerActions.toggle });
    }, []);

    const { minutes, seconds } = millisToMinutesAndSeconds(state.passed);

    return <div>
        <Circle minutes={minutes} seconds={seconds} />
        <Actions
            cancel={cancelCounter}
            toggleState={toggleCounter}
            stateIcon={state.status === CounterStatuses.processing ? pauseIcon : playIcon}
        />
    </div>
}