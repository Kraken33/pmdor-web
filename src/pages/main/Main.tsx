import { useEffect, useState } from "react";
import { TimerContainer } from "../../features/timer";
import classes from './index.module.css';

import type { User } from "../../types/user";


export const MainPage = () => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(()=>{
        fetch('http://localhost:3000/user').then(async (response)=>setUser(await response.json()));
    }, []);

    return <div className={classes.container}>
        <div className={classes.counter}>
            {user && <TimerContainer user={user} />}
        </div>
        <div className={classes.tasks}></div>
    </div>
}