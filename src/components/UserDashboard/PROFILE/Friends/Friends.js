import React, { useEffect, useState } from "react";
import { getDoc, doc, onSnapshot, collection, query, arrayUnion, setDoc } from "firebase/firestore";
import { auth } from "../../../firebase-config";
import './Friends.css';
import { DB } from "../../../firebase-config";

const Friends = () => {

    const [page, setPage] = useState(0);
    const [user_friends_main, setUserFriends] = useState([]);
    const [all_users, setAllUsers] = useState([]);
    const [friends_search, setFriendsSearch] = useState('');
    const [user, setUser] = useState([]);
    const [next, setNext] = useState(0);

    useEffect(() => { //real time friends fetch
        const userDocRef = doc(DB, 'users', auth.currentUser.uid);
        const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
                const user_friends = docSnapshot.data().friends;
                setUser([docSnapshot.data()]);
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
    const AddFriend = async (data) => {

        try {
            const fetch_user = (await getDoc(doc(DB, 'users', auth.currentUser.uid))).data();
            const selected_user_data = (await getDoc(doc(DB, 'users', data.id))).data();

            //check if already sent a friend request to said user.

            if (data.friendRQ.some(data => data.id === auth.currentUser.uid)) {
                alert('Friend Request already sent');
                return;
            }

            await setDoc(doc(DB, 'users', data.id), {
                ...selected_user_data,
                friendRQ: arrayUnion(fetch_user)
            }, { merge: true }).then(() => {
                console.log('friend request sent');
            });
        } catch (error) {
            console.log(error.message);
        }
    }

    const Unfriend = async (selected_user_data) => { //TBD

        try {

            const current_user_data = (await getDoc(doc(DB, 'users', auth.currentUser.uid))).data();
            const selected_data = (await getDoc(doc(DB, 'users', selected_user_data.id))).data();
            console.log(selected_data.friends.filter(data => data.id !== current_user_data.id));

            await setDoc(doc(DB, 'users', auth.currentUser.uid), {
                ...current_user_data,
                friends: current_user_data.friends.filter(data => data.id !== selected_user_data.id)
            }).then(async () => {
                await setDoc(doc(DB, 'users', selected_user_data.id), {
                    ...selected_data,
                    friends: selected_data.friends.filter(data => data.id !== current_user_data.id)
                }).then(() => {
                    alert('user unfriended');
                })
            });
        } catch (error) {
            console.log(error.message);
        }
    }

    const excludeFriends = all_users.filter(data => data.id != auth.currentUser.uid);

    const DisplayAllUsers = excludeFriends.slice(next).map((data, index) => {
        if (index < 3) {
            return <div className="friends-main-container">
                <div style={{ width: 'inherit', height: 'inherit', position: 'absolute', zIndex: 5 }} />
                {data.coverPicture ? <img src={data.coverPicture} style={{ width: 'inherit', height: 'inherit', position: 'absolute', objectFit: 'cover', left: 0, borderRadius: 10 }} alt="header-profile" /> :
                    <img src={require('../../../images/grey.jpg')} style={{ width: 'inherit', height: 'inherit', position: 'absolute', objectFit: 'cover', left: 0, borderRadius: 10 }} alt="header-profile" />}

                <div>
                    {data.profilePicture ? <img src={data.profilePicture} alt="Profile" style={{ border: '1px solid white', borderRadius: '50%', width: 120, height: 120, position: 'relative', marginTop: 50, objectFit: 'cover' }} /> :
                        <img src={require('../../../images/icons8-person-96.png')} alt="Profile" style={{ border: '1px solid white', borderRadius: '50%', width: 120, height: 120, position: 'relative', marginTop: 50, objectFit: 'cover' }} />}
                </div>
                <div style={{ position: 'relative' }}>
                    <h1>{data.username}</h1>
                    <div style=
                        {
                            {
                                position: 'relative',
                                zIndex: 50,
                            }
                        }>
                        {user.some(i => i.friendRQ.some(j => j.id === data.id)) ? (
                            <button
                                style={{
                                    border: 'none',
                                    backgroundColor: 'green',
                                    width: 200,
                                    height: 30,
                                    borderRadius: 10,
                                    color: 'white',
                                    cursor: 'pointer',
                                    marginTop: 15,
                                }}
                                onClick={() => AcceptRequest(data)}>
                                ACCEPT FRIEND REQUEST
                            </button>
                        ) : user.some(i => i.friends.some(j => j.id === data.id)) ? (
                            <p style={{ margin: 0 }}>ALREADY FRIENDS</p>
                        ) : data.friendRQ.some(req => req.id === auth.currentUser.uid) ? (
                            <p style={{ margin: 0 }}>REQUEST SENT</p>
                        ) : (
                            <button
                                style={{
                                    border: 'none',
                                    backgroundColor: 'red',
                                    width: 100,
                                    height: 30,
                                    borderRadius: 10,
                                    color: 'white',
                                    cursor: 'pointer',
                                    marginTop: 15,
                                }}
                                onClick={() => AddFriend(data)}>
                                ADD FRIEND
                            </button>
                        )}
                    </div>
                </div>
            </div>
        }
    }
    );
    const filterFriends = excludeFriends.filter(data => data.username === friends_search || data.id === friends_search || String(data.username).toLowerCase() === friends_search);
    const DisplaySearchedUsers = filterFriends.map((data, index) => {
        if (index < 2) {
            return <div className="friends-main-container">
                <div style={{ width: 'inherit', height: 'inherit', position: 'absolute', zIndex: 5 }} />
                {data.coverPicture ? <img src={data.coverPicture} style={{ width: 'inherit', height: 'inherit', position: 'absolute', objectFit: 'cover', left: 0, borderRadius: 10 }} alt="header-profile" /> :
                    <img src={require('../../../images/grey.jpg')} style={{ width: 'inherit', height: 'inherit', position: 'absolute', objectFit: 'cover', left: 0, borderRadius: 10 }} alt="header-profile" />}
                <div>
                    {data.profilePicture ? <img src={data.profilePicture} alt="Profile" style={{ border: '1px solid white', borderRadius: '50%', width: 120, height: 120, position: 'relative', marginTop: 50, objectFit: 'cover' }} /> :
                        <img src={require('../../../images/icons8-person-96.png')} alt="Profile" style={{ border: '1px solid white', borderRadius: '50%', width: 120, height: 120, position: 'relative', marginTop: 50, objectFit: 'cover' }} />}
                </div>
                <div style={{ position: 'relative' }}>
                    <h1>{data.username}</h1>
                    <div style=
                        {
                            {
                                position: 'relative',
                                zIndex: 50,
                            }
                        }>
                        {user.some(i => i.friendRQ.some(j => j.id === data.id)) ? (
                            <button
                                style={{
                                    border: 'none',
                                    backgroundColor: 'green',
                                    width: 200,
                                    height: 30,
                                    borderRadius: 10,
                                    color: 'white',
                                    cursor: 'pointer',
                                    marginTop: 15,
                                }}
                                onClick={() => AcceptRequest(data)}>
                                ACCEPT FRIEND REQUEST
                            </button>
                        ) : user.some(i => i.friends.some(j => j.id === data.id)) ? (
                            <p style={{ margin: 0 }}>ALREADY FRIENDS</p>
                        ) : data.friendRQ.some(req => req.id === auth.currentUser.uid) ? (
                            <p style={{ margin: 0 }}>REQUEST SENT</p>
                        ) : (
                            <button
                                style={{
                                    border: 'none',
                                    backgroundColor: 'red',
                                    width: 100,
                                    height: 30,
                                    borderRadius: 10,
                                    color: 'white',
                                    cursor: 'pointer',
                                    marginTop: 15,
                                }}
                                onClick={() => AddFriend(data)}>
                                ADD FRIEND
                            </button>
                        )}
                    </div>
                </div>
            </div>
        }
    });
    const DisplayUserFriends = user_friends_main.slice(next).map((data, index) => {
        if (index < 3) {
            return <div className="friends-main-container">
                <div style={{ width: 'inherit', height: 'inherit', position: 'absolute', zIndex: 5 }} />
                {data.coverPicture ? <img src={data.coverPicture} style={{ width: 'inherit', height: 'inherit', position: 'absolute', objectFit: 'cover', left: 0, borderRadius: 10 }} alt="header-profile" /> :
                    <img src={require('../../../images/grey.jpg')} style={{ width: 'inherit', height: 'inherit', position: 'absolute', objectFit: 'cover', left: 0, borderRadius: 10 }} alt="header-profile" />}
                <div>
                    {data.profilePicture ? <img src={data.profilePicture} alt="Profile" style={{ border: '1px solid white', borderRadius: '50%', width: 120, height: 120, position: 'relative', marginTop: 50, objectFit: 'cover' }} /> :
                        <img src={require('../../../images/icons8-person-96.png')} alt="Profile" style={{ border: '1px solid white', borderRadius: '50%', width: 120, height: 120, position: 'relative', marginTop: 50, objectFit: 'cover' }} />}
                </div>
                <div style={{ position: 'relative' }}>
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
                            } onClick={() => Unfriend(data)}>UNFRIEND</button>
                    </div>
                </div>
            </div>
        }
    });

    //for friendRequest bullshit
    let friendRequests = [];
    const DisplayFriendRequests = user.map(data => data.friendRQ);

    for (let i = 0; i < DisplayFriendRequests.length; i++) {
        friendRequests = DisplayFriendRequests[i];
    }
    //accept friend request goes here

    const AcceptRequest = async (data) => {
        try {
            const fetch_main_user = (await getDoc(doc(DB, 'users', auth.currentUser.uid))).data();
            const fetch_selected_user = (await getDoc(doc(DB, 'users', data.id))).data();

            await setDoc(doc(DB, 'users', auth.currentUser.uid), {
                ...fetch_main_user,
                friends: arrayUnion(fetch_selected_user),
                friendRQ: fetch_main_user.friendRQ.filter(s => s.id != data.id)
            }, { merge: true })
                .then(async () => {
                    await setDoc(doc(DB, 'users', fetch_selected_user.id), {
                        ...fetch_selected_user,
                        friends: arrayUnion(fetch_main_user)
                    }, { merge: true }).then(() => {
                        alert('REQUEST ACCEPTED');
                    });
                });
        } catch (error) {
            console.log(error.message);
        }
    }

    const DeclineRequest = async (selected_data) => {

        try {
            const current_user_data = (await getDoc(doc(DB, 'users', auth.currentUser.uid))).data();
            const selected_user_data = (await getDoc(doc(DB, 'users', selected_data.id))).data();

            await setDoc(doc(DB, 'users', auth.currentUser.uid), {
                ...current_user_data,
                friendRQ: selected_user_data.friendRQ.filter(data => data.id != selected_user_data.id)
            }).then(() => {
                alert('request declined');
            });

        } catch (error) {
            console.log(error.message);
        }

    }

    const DisplayFriendRQS = friendRequests.slice(next).map((data, index) => {
        if (index < 3) {
            return <div className="friends-main-container">
                <div style={{ width: 'inherit', height: 'inherit', position: 'absolute', zIndex: 5 }} />
                <img src={require('../../../images/grey.jpg')} style={{ width: 'inherit', height: 'inherit', position: 'absolute', objectFit: 'cover', left: 0, borderRadius: 10 }} alt="header-profile" />
                <div>
                    <img src={require('../../../images/icons8-person-96.png')} alt="Profile" style={{ border: '1px solid white', borderRadius: '50%', width: 120, height: 120, position: 'relative', marginTop: 50 }} />
                </div>
                <div style={{ position: 'relative' }}>
                    <h1>{data.username}</h1>
                    <div style=
                        {
                            {
                                position: 'relative',
                                zIndex: 50,
                            }
                        }>
                        <button style={{
                            width: 100,
                            height: 30,
                            borderRadius: 10,
                            border: 'none',
                            backgroundColor: 'green',
                            color: 'white',
                            cursor: 'pointer',
                            marginTop: 15,
                        }} onClick={() => AcceptRequest(data)}>ACCEPT</button>
                        <button style={{
                            width: 100,
                            height: 30,
                            borderRadius: 10,
                            border: 'none',
                            backgroundColor: 'red',
                            color: 'white',
                            cursor: 'pointer',
                            marginTop: 15,
                            marginLeft: 10
                        }} onClick={() => DeclineRequest(data)}>DECLINE</button>
                    </div>
                </div>
            </div>
        }
    });


    return (
        <div className="friends-main">

            <div className="friends-selection">
                <h1 onClick={() => setPage(0)}>FRIENDS</h1>
                <h1 onClick={() => setPage(1)}>FIND FRIENDS</h1>
                <h1 onClick={() => setPage(2)}>FRIEND REQUESTS</h1>
            </div>

            <div className="friends-content-container">
                {page === 0 ?
                    <>
                        <div style={{ marginTop: '20px', textAlign: 'center' }}>
                            {page === 0 && DisplayUserFriends.length > 0 ? <button style=
                                {
                                    {
                                        width: 100,
                                        height: 30,
                                        border: 'none',
                                        backgroundColor: 'grey',
                                        color: 'white',
                                        cursor: 'pointer',
                                        borderRadius: 10,
                                        fontWeight: 'bold'
                                    }
                                } onClick={() => setNext(next + 3)}>NEXT</button>
                                : page === 0 ? <button style=
                                    {
                                        {
                                            width: 100,
                                            height: 30,
                                            border: 'none',
                                            backgroundColor: 'grey',
                                            color: 'white',
                                            cursor: 'pointer',
                                            borderRadius: 10,
                                            fontWeight: 'bold'
                                        }
                                    } onClick={() => setNext(0)}>BACK</button> : null}
                        </div>
                        {DisplayUserFriends}
                    </>
                    : page === 1 ?
                        <div>
                            <input type="text" onChange={(text) => setFriendsSearch(text.target.value)} placeholder="Search for friends - Or enter ID" style={{ width: '99%', height: 30, borderRadius: 10, border: 'none', padding: 10, marginBottom: 10 }} />
                            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                                {page === 1 && DisplayAllUsers.length > 0 ? <button style=
                                    {
                                        {
                                            width: 100,
                                            height: 30,
                                            border: 'none',
                                            backgroundColor: 'grey',
                                            color: 'white',
                                            cursor: 'pointer',
                                            borderRadius: 10,
                                            fontWeight: 'bold'
                                        }
                                    } onClick={() => setNext(next + 3)}>NEXT</button>
                                    : page === 1 ? <button style=
                                        {
                                            {
                                                width: 100,
                                                height: 30,
                                                border: 'none',
                                                backgroundColor: 'grey',
                                                color: 'white',
                                                cursor: 'pointer',
                                                borderRadius: 10,
                                                fontWeight: 'bold'
                                            }
                                        } onClick={() => setNext(0)}>BACK</button> : null}
                            </div>
                            {friends_search === '' ? DisplayAllUsers : DisplaySearchedUsers}
                        </div> 
                        :
                        <>
                            <div style={{ marginTop: '20px', textAlign: 'center', marginTop: 0 }}>
                                {page === 2 && DisplayFriendRQS.length > 0 ? <button style=
                                    {
                                        {
                                            width: 100,
                                            height: 30,
                                            border: 'none',
                                            backgroundColor: 'grey',
                                            color: 'white',
                                            cursor: 'pointer',
                                            borderRadius: 10,
                                            fontWeight: 'bold'
                                        }
                                    } onClick={() => setNext(next + 3)}>NEXT</button>
                                    : page === 2 ? <button style=
                                        {
                                            {
                                                width: 100,
                                                height: 30,
                                                border: 'none',
                                                backgroundColor: 'grey',
                                                color: 'white',
                                                cursor: 'pointer',
                                                borderRadius: 10,
                                                fontWeight: 'bold'
                                            }
                                        } onClick={() => setNext(0)}>BACK</button> || null : null}
                            </div>
                            {DisplayFriendRQS}
                        </>}
            </div>
        </div>
    );
}

export default Friends;