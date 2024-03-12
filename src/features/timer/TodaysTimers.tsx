import { FC, memo } from 'react';
import { Timer, TimerTypes } from '../../types/timer';
import map from 'lodash/fp/map';
import classes from './assets/passed_timers.module.css';

type Props = {
    timers: Timer[];
}

export const TodaysTimers: FC<Props> = memo(({ timers }) => {
    return <div className={classes.passed_timers}>
        {map(({ changedAt, type }) =>
            <div key={changedAt} className={classes.passed_timers__item}>
                {type === TimerTypes.pomadoro ? 25 : 5}
            </div>)(timers)}
    </div>
});