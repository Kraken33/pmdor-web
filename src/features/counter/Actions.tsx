import {FC} from 'react';
import classes from './index.module.css';
import stopIcon from './assets/images/stop.png';

type ActionsProps = {
    cancel: ()=>void;
    toggleState: ()=>void;
    stateIcon: any;
}

export const Actions: FC<ActionsProps> = ({cancel, toggleState, stateIcon}) => {
    return <div className={classes.actions}>
        <div><img src={stopIcon} alt="" onClick={cancel} /></div>
        <div><img src={stateIcon} alt="" onClick={toggleState} /></div>
    </div>
}