import { useEffect, useState } from "react";
import { Counter } from "../../features/counter";
import classes from './index.module.css';

import type { User } from "../../types/user";


export const MainPage = () => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(()=>{
        fetch('http://localhost:3000/user').then(async (response)=>setUser(await response.json()));
    }, []);

    return <div className={classes.container}>
        <div className={classes.counter}>
            {user && <Counter user={user} />}
        </div>
        <div className={classes.tasks}></div>
    </div>
}