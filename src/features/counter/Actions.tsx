import {FC} from 'react';
import classes from './index.module.css';
import stopIcon from './assets/images/stop.png';
import pauseIcon from './assets/images/pause.png';
import playIcon from './assets/images/play.png';

import { TimerStatuses } from '../../types/timer';

type ActionsProps = {
    cancel: ()=>void;
    toggleAction: ()=>void;
    status: TimerStatuses;
}

export const Actions: FC<ActionsProps> = ({cancel, toggleAction, status}) => {
    let cancelIcon = status === TimerStatuses.created ? null : stopIcon;
    let toggleIcon = status === TimerStatuses.processing ? pauseIcon : playIcon;
    
    return <div className={classes.actions}>
        {cancelIcon && <div><img src={cancelIcon} alt="" onClick={cancel} /></div>}
        <div><img src={toggleIcon} alt="" onClick={toggleAction} /></div>
    </div>
}