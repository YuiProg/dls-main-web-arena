import React, { useState } from "react";
import './ProfileView.css';
import { doc, getDoc, setDoc, arrayUnion } from "firebase/firestore";
import { DB } from "../../firebase-config";


const DisplayUser = (data) => {

    const USER_DATA = [data.user];
    const [isFriend, setIsFriend] = useState('');
    const [requested, setRequested] = useState('');
    const [sent, setSent] = useState('');
    
    // console.log(CURRENT_USER.map(data => data.friends));
    
    const RequestFriend = async (datas) => {

        try {
            const getSelectedData = (await getDoc(doc(DB, 'users', datas))).data();

            const check = getSelectedData.friendRQ.some(datas => datas.id === data.currentUser.id);
            console.log(check);
            if (check) {
                setIsFriend(check);
                setSent('already sent a request');
                return;
            } else {
                await setDoc(doc(DB, 'users', datas), {
                    ...getSelectedData,
                    friendRQ: arrayUnion(data.currentUser)
                },{merge:true} ).then(() => {
                    console.log('success');
                });
            }
        } catch (error) {
            console.log(error.message);
        }
    }

    const isfollowing = async () => {
        const getSelectedData = (await getDoc(doc(DB, 'users', data.user.id))).data();

        const check = getSelectedData.friends.some(datas => datas.id === data.currentUser.id);
        const checkFR = data.currentUser.friendRQ.some(datas => datas.id === getSelectedData.id);
        setRequested(checkFR);
        setIsFriend(check);
    }

    isfollowing();
    console.log(requested);

    const unFollow = async (datas) => {
        try {
            //selected user ang data
            //yung datas ay ang id nung user na naka show sa card
            const getCurrentFriends = await getDoc(doc(DB, 'users', data.currentUser.id));
            const userFriends = getCurrentFriends.data().friends;

            const filteredActiveUserFriends = userFriends.filter(selected => selected.id !== data.user.id);

            const selectedUserData = await getDoc(doc(DB, 'users', data.user.id));
            const selectedUserFriends = selectedUserData.data();

            const s_u_filter = selectedUserFriends.friends.filter(selected => selected.id !== data.currentUser.id);

            const test = (await getDoc(doc(DB, 'users', data.user.id))).data();

            await setDoc(doc(DB, 'users', data.currentUser.id), {
                ...data.currentUser,
                friends: filteredActiveUserFriends
            }).then(async () => {
                await setDoc(doc(DB, 'users', data.user.id), {
                    ...test, //may bug to hindi nabubura yung friend request (solution just get the data again at the db using getdoc)
                    friends: s_u_filter
                }).then(() => {
                    console.log('success');
                    
                });
            });



        } catch (error) {
            console.log('ERROR AT USER PROFILE DISPLAY UNFOLLOW' + error.message);
        }
    }

    return(
        <>
        {data.visible ? 
                <div className="user-card" onClick={(e) => e.stopPropagation()}>
                    <div className="user-header">
                        <img alt="" src={require('../../images/qiyana.jpeg')} style={{width: '100%', height: 'inherit', display: 'flex', objectFit: 'cover'}}/>
                    </div>
                    <div className="header-profile">
                        
                    </div>
                    <div style={{margin: 0}}>
                        <h1>
                            {data.user.username}
                        </h1>
                        <h3>WINS</h3>
                        <p>{data.user.wins}</p>
                        <h3>LOSSES</h3>
                        <p>{data.user.losses}</p>
                    </div>
                    <div style={{textAlign: 'center'}}>
                        {/* LAGYAN NG ACCEPT FOLLOW BUTTON PAG TRUE */}
                        <p style={{marginRight: 10}}>{sent}</p>
                        {sent === '' ? <div>
                            {isFriend ? (
                        <button id="PD-btns" onClick={
                            () => {
                                unFollow(data.user.id);
                            }
                        }>
                            UNFOLLOW
                        </button>
                        ) : isFriend === '' ? (<p>Loading...</p>)
                        : requested ? (
                            <p>{String(data.user.username).toUpperCase()} SENT A FRIEND REQUEST</p>
                        ) : (
                            <button id="PD-btns" onClick={() => RequestFriend(data.user.id)}>FOLLOW</button>
                        )}
                        </div> : null}
                        
                    </div>
                </div> : null}
        </>
    );
}


export default DisplayUser