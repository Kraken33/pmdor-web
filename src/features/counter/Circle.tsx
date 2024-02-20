import { FC } from 'react';
import classes from './index.module.css';

type Circle = {
    minutes: number;
    seconds: number;
}

export const Circle: FC<Circle> = ({ minutes, seconds }) => {
    return <div id="circle" className={classes.circle}>
        <div className={classes.timer}><div className={classes.timerDigits}><span>{minutes}</span><span style={{ fontSize: 50 }}>:{(seconds < 10 ? '0' : '') + seconds}</span></div></div>
        <div className={classes.wave}>
            <div className={classes.waveBefore}></div>
            <div className={classes.waveAfter}></div>
        </div>
    </div>
}