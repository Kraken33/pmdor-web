import { Counter } from "../../features/counter";
import classes from './index.module.css';

export const MainPage = () => {
    return <div className={classes.container}>
        <div className={classes.counter}>
            <Counter />
        </div>
        <div className={classes.tasks}></div>
    </div>
}