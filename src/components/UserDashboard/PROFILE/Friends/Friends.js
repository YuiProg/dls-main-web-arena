import React, {useEffect, useState} from "react";
import { getDoc, doc, onSnapshot, collection, query } from "firebase/firestore";
import { auth } from "../../../firebase-config";
import './Friends.css';
import { DB } from "../../../firebase-config";

const Friends = () => {

    const [page, setPage] = useState(0);
    const [user_friends_main , setUserFriends] = useState([]);
    const [all_users, setAllUsers] = useState([]);

    useEffect(() => { //real time friends fetch
        const userDocRef = doc(DB, 'users', auth.currentUser.uid);
        const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
                const user_friends = docSnapshot.data().friends;
                setUserFriends(user_friends);
            } else {
                console.log("error fetching");
            }
        }, (error) => {
            console.log(error.message);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetch_all_users = collection(DB, 'users');
        const unsubscribe = onSnapshot(fetch_all_users, (querySnapshot) => {
            const users = [];
            querySnapshot.forEach((doc) => {
                const user = doc.data();
                user.id = doc.id;
                users.push(user);
            });
            setAllUsers(users);
        }, (error) => {
            console.log(error.message);
        });
        return () => unsubscribe();

    }, []);

    const DisplayAllUsers = all_users.map((data, index)=> 
        {
            if (index < 2) {
                return <div className="friends-main-container">
                <div style={{width: 'inherit', height: 'inherit', position: 'absolute', zIndex: 5}}/>
                <img src={require('../../../images/qiyana.jpeg')} style={{width: 'inherit', height: 'inherit', position: 'absolute', objectFit: 'cover', left: 0, borderRadius: 10}} alt="header-profile"/>
                <div>
                    <img src={require('../../../images/icons8-person-96.png')} alt="Profile" style={{border: '1px solid white', borderRadius: '50%', width: 120, height: 120, position: 'relative', marginTop: 50}}/>
                </div>
                <div style={{position: 'relative'}}>
                    <h1>{data.username}</h1>
                    <div style=
                    {
                        {
                            position: 'relative',
                            zIndex: 50,
                        }
                    }>
                        <button style=
                        {
                            {
                                border: 'none',
                                backgroundColor: 'red',
                                width: 100,
                                height: 30, 
                                borderRadius: 10,
                                color: 'white',
                                cursor: 'pointer',
                            }
                        }>ADD FRIEND</button>
                    </div>
                </div>
            </div>
            }
        }
    );

    const DisplayUserFriends = user_friends_main.map(data => 
        <div className="friends-main-container">
            <div style={{width: 'inherit', height: 'inherit', position: 'absolute', zIndex: 5}}/>
            <img src={require('../../../images/qiyana.jpeg')} style={{width: 'inherit', height: 'inherit', position: 'absolute', objectFit: 'cover', left: 0, borderRadius: 10}} alt="header-profile"/>
            <div>
                <img src={require('../../../images/icons8-person-96.png')} alt="Profile" style={{border: '1px solid white', borderRadius: '50%', width: 120, height: 120, position: 'relative', marginTop: 50}}/>
            </div>
            <div style={{position: 'relative'}}>
                <h1>{data.username}</h1>
                <div style=
                {
                    {
                        position: 'relative',
                        zIndex: 50,
                    }
                }>
                    <button style=
                    {
                        {
                            border: 'none',
                            backgroundColor: 'red',
                            width: 100,
                            height: 30, 
                            borderRadius: 10,
                            color: 'white',
                            cursor: 'pointer',
                        }
                    }>UNFRIEND</button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="friends-main">
            <div className="friends-selection">
                <h1 onClick={() => setPage(0)}>FRIENDS</h1>
                <h1 onClick={() => setPage(1)}>FIND FRIENDS</h1>
                <h1>FRIEND REQUESTS</h1>
            </div>
            <div className="friends-content-container">
                {page === 0 ? DisplayUserFriends : page === 1 ? 
                <div>
                    <input type="text" placeholder="Search for friends - Or enter ID" style={{width: '99%', height: 30, borderRadius: 10, border: 'none', padding: 10, marginBottom: 10}}/>
                    {DisplayAllUsers}
                </div> : null}
            </div>
        </div>
    );
}

export default Friends;