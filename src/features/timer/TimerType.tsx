import { FC, memo, useCallback, useMemo } from 'react';
import map from 'lodash/fp/map';
import classes from './assets/timer_types_radio.module.css';
import { TimerTypes } from '../../types/timer';
import { counterDuration } from './Timer';

type Props = {
    value: TimerTypes;
    disabled: boolean;
    onChange(v: TimerTypes): void;
}

export const TimerType: FC<Props> = memo(({ value, onChange, disabled }) => {
    const options = useMemo(() => [
        {
            type: TimerTypes.pomadoro,
            duration: counterDuration.POMADORO,
        },
        {
            type: TimerTypes.shortBreak,
            duration: counterDuration.SHORT_BREAK,
        },
        {
            type: TimerTypes.longBreak,
            duration: counterDuration.LONG_BREAK,
        },
    ], []);
    const onTypeChange = useCallback((type: TimerTypes) => () => onChange(type), [onChange]);
    return <div className={classes.switch}>
        {map(({ type, duration }) => <>
            <input
                name="switch"
                type="radio"
                className={classes.switch__input}
                key={type}
                id={type}
                disabled={disabled}
                checked={value === type}
                onClick={onTypeChange(type)} />
            <label htmlFor={type} className={classes.switch__label}>{duration}</label>
        </>)(options)}
    </div>
});