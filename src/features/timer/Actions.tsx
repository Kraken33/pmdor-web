import { FC, memo } from 'react';
import classes from './assets/index.module.css';

import { TimerStatuses } from '../../types/timer';

type ActionsProps = {
    cancel(): void;
    toggleAction(): void;
    status: TimerStatuses;
}

export const Actions: FC<ActionsProps> = memo(({ cancel, toggleAction, status }) => {
    let showCancelButton = status === TimerStatuses.created,
        toggleButtonLabel = TimerStatuses.processing === status ? 'Pause' : 'Play';

    return <div className={classes.actions}>
        {showCancelButton && <div onClick={cancel} style={{ marginRight: 20 }}>Cancel</div>}
        <div onClick={toggleAction}>{toggleButtonLabel}</div>
    </div>
});