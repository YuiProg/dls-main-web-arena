import React, { useEffect, useState } from "react";
import '../PROFILE/ProfileView.css';
import { doc, getDoc, collection, getDocs, setDoc, arrayUnion, updateDoc } from "firebase/firestore";
import { auth, DB } from "../../firebase-config";
import { motion } from "motion/react";
import { FaSearch } from "react-icons/fa";
import DisplayUser from "./UserProfileDisplay";
import Teams from "./Teams/Teams";
import { FaCamera } from "react-icons/fa";
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";

const ProfileView = () => {
    //gawin tong optimized use onsnapshot instead of getdocs
    const [users, setUser] = useState('');
    const [tournaments, setTournaments] = useState([]); 
    const [DISPLAYTOURNAMENTS, SETDISPLAY] = useState('');
    const [page, setPage] = useState(1);
    const [USERSEARCHED, setSearchedUser] = useState('');
    const [allUsers, setAllUsers] = useState([]);
    const [FRIENDS_PAGE, setFPP] = useState(0);
    const [userSelected, setSelectedUser] = useState('');
    const [displayUser, setDisplayUser] = useState(false);
    const [friends, setFriends] = useState();
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    var searched = '';
    var searchedUSER = '';

    // Firebase storage reference
    const storage = getStorage();

    const fetchUserData = async () => {
        const user = auth.currentUser.uid;
        const data = doc(DB, 'users', user);
        const userData = await getDoc(data);
        
        if (userData.exists()) {
            setUser(userData.data());
            return;
        } else {
            console.log('user not found');
        }
    }
    
    const fetchAllUsers = async () => {
        try {
            const users = [{}];
            const data = collection(DB, 'users');
            const fetch = await getDocs(data);
            fetch.docs.map((data, index) => {
                users.push(data.data());
            });
            users.shift();
            setAllUsers(users);
            setFriends(users.friendsRQ);
        } catch (error) {
            console.log(error.message);
        }
    }

    const fetchData = async () => { //eto yung pang fetch ng data sa firebase
        const tournas = collection(DB, 'tournaments');
            try {
                const data = await getDocs(tournas);
                const dataItems = data.docs.map(doc => ({
                    name: doc.id,
                    ...doc.data() 
                }));
                setTournaments(dataItems);
            } catch (error) {
                console.error(error.message);
            }
    };

    useEffect(() => { //load mga data isang beses lang
        if (!displayUser && page === 2) {
            fetchData();
            fetchUserData();
            fetchAllUsers();
        }
    }, [users, displayUser, page]);

    const deletePreviousImage = async (imageUrl) => {
        if (!imageUrl) return;
        
        try {
            // Extract the storage path from the URL
            // Firebase Storage URLs typically look like:
            // https://firebasestorage.googleapis.com/v0/b/[PROJECT_ID].appspot.com/o/[FILE_PATH]?alt=media&token=[TOKEN]
            const urlPath = decodeURIComponent(imageUrl.split('/o/')[1].split('?')[0]);
            console.log(urlPath)
            const imageRef = ref(storage, urlPath);
            
            await deleteObject(imageRef);
            console.log('Previous image deleted successfully');
        } catch (error) {
            console.error('Error deleting previous image:', error);
        }
    };

    // Handle file upload for profile and cover pictures
    const handleImageUpload = async (e, imageType) => {
        const file = e.target.files[0];
        if (!file) return;
        
        setUploading(true);
        setUploadProgress(0);
        
        // Create a unique file path in Firebase Storage
        const userId = auth.currentUser.uid;
        const timestamp = new Date().getTime();
        const filePath = `users/${userId}/${imageType}_${timestamp}`;
        const storageRef = ref(storage, filePath);
        
        // Create upload task
        const uploadTask = uploadBytesResumable(storageRef, file);
        
        // Listen for upload progress
        uploadTask.on('state_changed', 
            (snapshot) => {
                // Track upload progress
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress);
            },
            (error) => {
                // Handle upload errors
                console.error("Upload error:", error);
                setUploading(false);
            },
            async () => {
                // Upload completed, get download URL
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    
                    // Update user document with the image URL
                    const userRef = doc(DB, 'users', userId);
                    const userData = await getDoc(userRef);
                    
                    if (userData.exists()) {
                        const updatedFields = {};
                        
                        if (imageType === 'profile') {
                            // Delete the previous profile picture if it exists
                            if (userData.data().profilePicture) {
                                await deletePreviousImage(userData.data().profilePicture);
                            }
                            updatedFields.profilePicture = downloadURL;
                        } else if (imageType === 'cover') {
                            // Delete the previous cover picture if it exists
                            if (userData.data().coverPicture) {
                                await deletePreviousImage(userData.data().coverPicture);
                            }
                            updatedFields.coverPicture = downloadURL;
                        }
                        
                        await updateDoc(userRef, updatedFields);
                        
                        // Update local user state to reflect changes
                        setUser(prevUser => ({
                            ...prevUser,
                            ...updatedFields
                        }));
                    }
                    
                    setUploading(false);
                } catch (error) {
                    console.error("Error getting download URL:", error);
                    setUploading(false);
                }
            }
        );
    };

    // Component for rendering user profile and cover images
    const ProfileHeader = () => {
        return (
            <div className="header-image">
                <div 
                    className="cover-image-container" 
                    style={{
                        backgroundImage: users.coverPicture ? `url(${users.coverPicture})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        width: '100%',
                        height: '100%'
                    }}
                >
                    <label className="cover-picture">
                        <FaCamera 
                            style={{
                                width: 60,
                                height: 60,
                                opacity: 0.7,
                                color: '#fff'
                            }}
                        />
                        <input 
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'cover')}
                        />
                    </label>
                </div>
                
                <div className="profile-picture-container">
                    <label className="profile-picture">
                        {/* Background image for the profile picture */}
                        <div className="profile-image" style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            backgroundImage: users.profilePicture ? `url(${users.profilePicture})` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            position: 'absolute',
                            top: 0,
                            left: 0
                        }}>
                            {/* Show default image if no profile picture */}
                            {!users.profilePicture && (
                                <img 
                                    src={require('../../images/icons8-person-96.png')} 
                                    alt="Default Profile"
                                    style={{ 
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                />
                            )}
                        </div>
                        
                        {/* Camera icon overlay */}
                        <div className="camera-overlay">
                            <FaCamera 
                                style={{
                                    color: "white",
                                    width: 60,
                                    height: 60,
                                    zIndex: 5
                                }}
                            />
                        </div>
                        
                        <input 
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'profile')}
                        />
                    </label>
                </div>
                
                {uploading && (
                    <div className="upload-progress-container">
                        <div 
                            className="upload-progress-bar" 
                            style={{ width: `${uploadProgress}%` }}
                        ></div>
                        <span className="upload-progress-text">{uploadProgress.toFixed(0)}%</span>
                    </div>
                )}
            </div>
        );
    };


    const RenderTournaments = () => {

        const filtered = tournaments.filter(t => t.uid === users.id); //filters (ps. diko alam kung pede shortcutin to using if else eh sa iba ko nalang try)
        const NameFiltered = filtered.filter(i => i.name === DISPLAYTOURNAMENTS 
                                            || i.owner === DISPLAYTOURNAMENTS 
                                            || i.tournamentId === DISPLAYTOURNAMENTS);
        console.log(NameFiltered);
        const DataFiltered = NameFiltered.map((items, index) => 
            <motion.tr 
            initial={{opacity: 0, y: 75}}
            animate={{opacity: 1, y: 0}}
            transition={{delay: `.${index}`, duration: .5}}>
                <td style={{fontWeight: 'bold', fontSize: 'large'}}>{items.name}</td>
                <td>{items.game}</td>
                <td>{items.mode}</td>
                <td>{items.dateCreated}</td>
                <td>{items.status}</td>
            </motion.tr>
        );


        const tableData = filtered.map((items,index) =>  //ETO MAG LALAGAY ITEMS SA TABLE TROPA
            <motion.tr 
            initial={{opacity: 0, y: 75}}
            animate={{opacity: 1, y: 0}}
            transition={{delay: `.${index}`, duration: .5}}>
                <td style={{fontWeight: 'bold', fontSize: 'large'}}>{items.name}</td>
                <td>{items.game}</td>
                <td>{items.mode}</td>
                <td>{items.dateCreated}</td>
                <td>{items.status}</td>
            </motion.tr>
        );

        return (
            <div className="Tournaments-container">
                <motion.h1 
                initial={{opacity: 0, y: 75}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: .3, duration: .5}}
                style=
                {
                    {
                        marginTop: 0,
                        padding: 0,
                        color: 'white'
                    }
                }>
                    TOURNAMENTS
                </motion.h1>
                <motion.div 
                initial={{opacity: 0, y: 75}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: .5, duration: .5}}
                className="seach-tournament">
                    <input type="text" 
                    style=
                    {
                        {
                            width: '50%',
                            marginBottom: 20
                        }
                    } placeholder="Enter Tournament Name" onChange={(text) => 
                    {
                        searched = text.target.value;
                    }}/>
                    <FaSearch color="white" style={{marginLeft: 20, cursor: 'pointer'}} className="search" onClick={() => SETDISPLAY(searched)}/>
                </motion.div>
                <table className="blueTable">
                <thead>
                <tr>
                <th>Name</th>
                <th>Game</th>
                <th>Mode</th>
                <th>Date</th>
                <th>Status</th>
                </tr>
                </thead>
                <tbody>
                {DISPLAYTOURNAMENTS === '' ? tableData : DataFiltered}
                </tbody>
                </table>
            </div>
        );
    }

        
    const RenderFriends = () => {

    const friendFilter = allUsers.filter(friends => friends.id !== users.id);

    const RequestFriend = async (id) => { //add friend function
        let requests = [];
        const request = doc(DB, 'users', id);
        const fetch = await getDoc(request);
        const user = fetch.data().friendRQ; //get requests
        requests = Array.isArray(user) ? user : [];

        const checkDuplicate = requests.some(data => data.id === users.id);
        const check_friend = users.friends.some(data => data.id === fetch.data().id)

        //pero yung some chinecheck niya each element kung may kaparehas ba
        if (checkDuplicate || check_friend) {
            alert('REQUEST ALREADY SENT');
            return;
        } else {
            try {
                requests.push(users);
                // requests.shift();
                console.log(requests);
                await setDoc(doc(DB, 'users', id), { //push requests to DB
                    ...fetch.data(),    
                    friendRQ: requests
                }).then(() => {
                    alert('Request Sent.');
                });
    
            } catch (error) {
                console.log('Error in line 163 UserProfile.js (fetch error)' + error.message);
            }
        }
    }
    const FindFriends = friendFilter.map((data, index) => 
        <div
        key={index} 
        onClick={() => 
            {
                // RequestFriend(data.id);
                displayUser ? setDisplayUser(false) : setDisplayUser(true);
                setSelectedUser(data);
            }}
        className="friend-card" style={{marginBottom: 50}}>
            <p style={{margin: 0, padding: 0, fontWeight: 'bold'}}>{data.username}</p>        
            <img src={require('../../images/icons8-person-96.png')}/>
        </div>
    );

    const searchFriends = allUsers.filter((data) => data.username === USERSEARCHED || data.id === USERSEARCHED);

    const DisplaySearched = searchFriends.map((data,index) => 
        <div
        key={index} 
        onClick={() => 
            {
                RequestFriend(data.id);
            }}
        className="friend-card" style={{marginBottom: 50}}>
            <p style={{margin: 0, padding: 0, fontWeight: 'bold'}}>{data.username}</p>        
            <img src={require('../../images/icons8-person-96.png')}/>
        </div>
    );

    
    const AcceptFriend = async (user) => { //this some data engineering shi tho
        let newList = [];
        let friendRequestList = [];
        const currentFriends = Array.isArray(users.friends) ? users.friends : [];
        const userRequests = users.friendRQ;
        newList = currentFriends;
        friendRequestList = userRequests;
        
        try {
            const fetch = await getDoc(doc(DB, 'users', user));
            const DATA = await getDoc(doc(DB, 'users', users.id));
            const selectedUser = fetch.data();

            const checker = newList.some(data => data.id === user);

            if (checker) { //CHECK KUNG NAG EEXIST NA NGA BA YUNG I AADD SA DB
                alert('request already sent');
                return;
            }

            newList.push(selectedUser); 
            //FETCH MUNA NATEN MGA NAG EEXIST NA FRIENDS NA THEN UPDATE THE DB
            //CHECK IF NAG EEXIST NA ANG SELECTED PERSON SA DB

            const filtered = friendRequestList.filter(data => data.id !== user);

            await setDoc(doc(DB,'users',users.id), { //ADD THE UPDATED ARRAY DITO
                ...DATA.data(),
                friends: newList,
                friendRQ: filtered
            }).then(async () => {            
                await setDoc(doc(DB, 'users', selectedUser.id), {
                    friends: arrayUnion(users) // nag ai nako dito kakahilo to eh
                }, { merge: true });
            });
        } catch (error) {
            console.log('ERROR FETCHING AT LINE 236 USERPROFILE.JS ' + error.message);
        } finally {             
            fetchData(); //reload data
            fetchAllUsers();
            fetchUserData();
        }
    }

    const MainFriends = users.friends.map((data,index) => 
        <div
        key={index} 
        className="friend-card" style={{marginBottom: 50}} onClick=
        {
            () => 
            {
                displayUser ? setDisplayUser(false) : setDisplayUser(true);
                setSelectedUser(data);
            }
        }>
            <p style={{margin: 0, padding: 0, fontWeight: 'bold'}}>{data.username}</p>        
            <img src={require('../../images/icons8-person-96.png')}/>
        </div>
    );

    const FriendRequests = users.friendRQ.map((data, index) => 
        <div
        key={index} 
        className="friend-card" style={{marginBottom: 50}}>
            <p style={{margin: 0, padding: 0, fontWeight: 'bold'}}>{data.username}</p>        
            <img src={require('../../images/icons8-person-96.png')}/>
            <button id="btn" value={data.id} className="js-btn" onClick={(user) => AcceptFriend(user.target.value)}>ACCEPT</button>
            <button id="btn" className="js-btn">DECLINE</button>
        </div>
    );


        return (
            <div className='friends-tab'>
                <h1 className="friend-selection"
                onClick={() => setFPP(0)}>
                    FRIENDS {`(${Object.keys(users.friends).length})`}
                </h1>
                <h1 className="friend-selection"
                onClick={() => setFPP(1)}>
                    FIND FRIENDS
                </h1>
                <h1 className="friend-selection"
                onClick={() => setFPP(2)}>
                    {Object.keys(users.friendRQ).length === 0 
                    ? 'FRIEND REQUEST (none)' : 
                    `FRIEND REQUESTS (${Object.keys(users.friendRQ).length})`}
                </h1>
                {FRIENDS_PAGE === 1 ? <div>
                <input type="text" 
                    style=
                    {
                        {
                            width: '50%',
                            marginBottom: 20
                        }
                    } placeholder="Enter ID or Name" onChange={(text) => 
                    {
                        searchedUSER = text.target.value;
                    }}/>
                    <FaSearch color="white" style={{marginLeft: 20, cursor: 'pointer'}} className="search" onClick={() => setSearchedUser(searchedUSER)}/>
                </div> : null}
                <div className="friends-grid">
                {USERSEARCHED === '' 
                ? (FRIENDS_PAGE === 1 ? FindFriends : FRIENDS_PAGE === 2 ? FriendRequests : MainFriends) 
                : DisplaySearched}

                </div>
            </div>
        );
    }
    
    const RenderDisplay = () => {
        return (
            <div className="profileview">
                {displayUser ? 
                <motion.div
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                className="dp-container" onClick={() => setDisplayUser(false)}>
                    <DisplayUser user={userSelected} visible={displayUser} currentUser={users}/>
                </motion.div>
                : null}
                
                <ProfileHeader />
                
                <div className="user-infos">
                    <h1 style={{margin: 0, paddingTop: 30}}>{users.username}</h1>
                    <p style={{margin: 0, color: 'grey', marginBottom: 20}}>ID: {auth.currentUser.uid}</p>
                </div>
                <div className="more-info">
                    <ul>
                        <li onClick={() => setPage(1)}>TOURNAMENTS</li>
                        <li onClick={() => 
                            {
                                setPage(2);
                                setFPP(0);
                            }
                        }>FRIENDS</li>
                        <li onClick={() => setPage(3)}>TEAMS</li>
                        <li onClick={() => setPage(4)}>LINKS</li>
                    </ul>
                </div>
                <div className="Main-Content-Profile">
                    {page === 1 ? <RenderTournaments/> : page === 2 ? <RenderFriends/> : page === 3 ? <Teams/> : null}
                </div>
            </div>
        );
    }

    if (users === '') {
        fetchData();
        fetchUserData();
        fetchAllUsers();
    }

    return (
        <>
        {users === '' ? 
        <div style=
        {
            {
                width: '100%',
                height: '100vh',
                backgroundColor: 'black',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: ' white'
            }
        }>
            <h1>LOADING . . .</h1>
            
        </div> : <RenderDisplay/>}
        </>
    );
}
export default ProfileView