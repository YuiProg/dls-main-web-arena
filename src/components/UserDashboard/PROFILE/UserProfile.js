import React, { useEffect, useState } from "react";
import './ProfileView.css';
import { doc, getDoc, collection, getDocs, setDoc, arrayUnion, updateDoc } from "firebase/firestore";
import { auth, DB } from "../../firebase-config";
import { motion } from "framer-motion";
import { FaSearch, FaCamera } from "react-icons/fa";
import DisplayUser from "./UserProfileDisplay";
import Teams from "./Teams/Teams";
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import SocialLinks from "./SocialLinks";
import Friends from "./Friends/Friends";

const ProfileView = () => {
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
  const [searched, setSearched] = useState('');
  const [searchedUSER, setSearchedUSER] = useState('');
  const [selectedTournament, setSelectedTournament] = useState(null);

  const storage = getStorage();

  const fetchUserData = async () => {
    const user = auth.currentUser.uid;
    const data = doc(DB, 'users', user);
    const userData = await getDoc(data);
    if (userData.exists()) {
      setUser(userData.data());
    } else {
      console.log('User not found');
    }
  };

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
  };

  const fetchData = async () => {
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

  useEffect(() => {
      fetchData();
      fetchUserData();
      fetchAllUsers();
  }, []);

  const deletePreviousImage = async (imageUrl) => {
    if (!imageUrl) return;
    try {
      const urlPath = decodeURIComponent(imageUrl.split('/o/')[1].split('?')[0]);
      const imageRef = ref(storage, urlPath);
      await deleteObject(imageRef);
    } catch (error) {
      console.error('Error deleting previous image:', error);
    }
  };

  const handleImageUpload = async (e, imageType) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    setUploadProgress(0);
    
    const userId = auth.currentUser.uid;
    const timestamp = new Date().getTime();
    const filePath = `users/${userId}/${imageType}_${timestamp}`;
    const storageRef = ref(storage, filePath);
    
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Upload error:", error);
        setUploading(false);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          const userRef = doc(DB, 'users', userId);
          const userData = await getDoc(userRef);
          
          if (userData.exists()) {
            const updatedFields = {};
            if (imageType === 'profile') {
              if (userData.data().profilePicture) {
                await deletePreviousImage(userData.data().profilePicture);
              }
              updatedFields.profilePicture = downloadURL;
            } else if (imageType === 'cover') {
              if (userData.data().coverPicture) {
                await deletePreviousImage(userData.data().coverPicture);
              }
              updatedFields.coverPicture = downloadURL;
            }
            
            await updateDoc(userRef, updatedFields);
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

  const ProfileHeader = () => {
    return (
      <div className="header-image">
        <div className="cover-image-container" style={{
          backgroundImage: users.coverPicture ? `url(${users.coverPicture})` : 'none'
        }}>
          <label className="cover-picture">
            <FaCamera style={{ width: 60, height: 60, opacity: 0.7, color: '#fff' }}/>
            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'cover')}/>
          </label>
        </div>
        
        <div className="profile-picture-container">
          <label className="profile-picture">
            <div className="profile-image" style={{
              backgroundImage: users.profilePicture ? `url(${users.profilePicture})` : 'none'
            }}>
              {!users.profilePicture && (
                <img 
                  src={require('../../images/icons8-person-96.png')} 
                  alt="Default Profile"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}
            </div>
            <div className="camera-overlay">
              <FaCamera style={{ color: "white", width: 60, height: 60, zIndex: 5 }}/>
            </div>
            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'profile')}/>
          </label>
        </div>
        
        {uploading && (
          <div className="upload-progress-container">
            <div className="upload-progress-bar" style={{ width: `${uploadProgress}%` }}></div>
            <span className="upload-progress-text">{uploadProgress.toFixed(0)}%</span>
          </div>
        )}
      </div>
    );
  };

  const RenderTournaments = () => {
    const filtered = tournaments.filter(t => t.uid === users.id);
    const NameFiltered = filtered.filter(i => i.name === DISPLAYTOURNAMENTS || i.owner === DISPLAYTOURNAMENTS || i.tournamentId === DISPLAYTOURNAMENTS);
    
    const DataFiltered = NameFiltered.map((items, index) => (
      <motion.tr 
        key={index} 
        initial={{opacity: 0, y: 75}} 
        animate={{opacity: 1, y: 0}} 
        transition={{delay: `.${index}`, duration: .5}}
        onClick={() => setSelectedTournament(items)}
        className="clickable-row"
      >
        <td style={{fontWeight: 'bold', fontSize: 'large'}}>{items.name}</td>
        <td>{items.game}</td>
        <td>{items.mode}</td>
        <td>{items.dateCreated}</td>
        <td>{items.status}</td>
      </motion.tr>
    ));

    const tableData = filtered.map((items,index) => (
      <motion.tr 
        key={index} 
        initial={{opacity: 0, y: 75}} 
        animate={{opacity: 1, y: 0}} 
        transition={{delay: `.${index}`, duration: .5}}
        onClick={() => setSelectedTournament(items)}
        className="clickable-row"
      >
        <td style={{fontWeight: 'bold', fontSize: 'large'}}>{items.name}</td>
        <td>{items.game}</td>
        <td>{items.mode}</td>
        <td>{items.dateCreated}</td>
        <td>{items.status}</td>
      </motion.tr>
    ));

    return (
      <div className="Tournaments-container">
        <motion.h1 initial={{opacity: 0, y: 75}} animate={{opacity: 1, y: 0}} transition={{delay: .3, duration: .5}}>
          TOURNAMENTS
        </motion.h1>
        <motion.div 
          initial={{opacity: 0, y: 75}} 
          animate={{opacity: 1, y: 0}} 
          transition={{delay: .5, duration: .5}} 
          className="search-tournament"
        >
          <input 
            type="text" 
            placeholder="Enter Tournament Name" 
            onChange={(e) => setSearched(e.target.value)}
            style={{ width: '50%', marginBottom: 20 }}
          />
          <FaSearch 
            color="white" 
            style={{marginLeft: 20, cursor: 'pointer'}} 
            onClick={() => SETDISPLAY(searched)}
          />
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

        {/* Tournament Details Modal */}
        {selectedTournament && (
          <div className="tournament-modal" onClick={() => setSelectedTournament(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <button className="close-modal" onClick={() => setSelectedTournament(null)}>
                ✕
              </button>
              
              <h1>TOURNAMENT NAME: {selectedTournament.name}</h1>
              
              <div className="modal-tabs">
                <button className="active">OVERVIEW</button>
                <button>PARTICIPANTS</button>
                <button>BRACKETS</button>
                <button>MEDIA</button>
                <button>ANNOUNCEMENTS</button>
                <button>CONTACT</button>
              </div>
              
              <div className="tournament-info">
                <div className="info-section">
                  <h2>{selectedTournament.game}</h2>
                  
                  <div className="detail-group">
                    <h3>DETAILS</h3>
                    <div className="detail-item">
                      <span>Date and Time:</span>
                      <span>{selectedTournament.dateCreated}</span>
                    </div>
                    <div className="detail-item">
                      <span>Prizes:</span>
                      <span>{selectedTournament.prizes || "Not specified"}</span>
                    </div>
                    <div className="detail-item">
                      <span>Format:</span>
                      <span>{selectedTournament.mode}</span>
                    </div>
                  </div>
                </div>
                
                <div className="join-section">
                  <h3>JOIN TOURNAMENT</h3>
                  <div className="join-steps">
                    <div className="step">
                      <div className="step-number">1</div>
                      <div className="step-content">
                        <div className="step-title">CREATE ACCOUNT</div>
                        <button className="step-button">Sign Up</button>
                      </div>
                    </div>
                    <div className="step">
                      <div className="step-number">2</div>
                      <div className="step-content">
                        <div className="step-title">REGISTER TEAM</div>
                        <button className="step-button">Register</button>
                      </div>
                    </div>
                    <div className="step">
                      <div className="step-number">3</div>
                      <div className="step-content">
                        <div className="step-title">JOIN TOURNAMENT</div>
                        <button className="step-button">Join Now</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  
  const RenderDisplay = () => {
    return (
      <div className="profileview">
        {displayUser && (
          <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="dp-container" onClick={() => setDisplayUser(false)}>
            <DisplayUser user={userSelected} visible={displayUser} currentUser={users}/>
          </motion.div>
        )}
        
        <ProfileHeader />
        
        <div className="user-infos">
          <h1>{users.username}</h1>
          <p>ID: {auth.currentUser.uid}</p>
        </div>
        
        <div className="more-info">
          <ul>
            <li onClick={() => setPage(1)}>TOURNAMENTS</li>
            <li onClick={() => { setPage(2); setFPP(0); }}>FRIENDS</li>
            <li onClick={() => setPage(3)}>TEAMS</li>
            <li onClick={() => setPage(4)}>LINKS</li>
          </ul>
        </div>
        
        <div className="Main-Content-Profile">
          {page === 1 ? <RenderTournaments/> : 
           page === 2 ? <Friends/> : 
           page === 3 ? <Teams/> : 
           page === 4 ? <SocialLinks user={users} /> : null}
        </div>
      </div>
    );
  };


  return (
    <>
      {users === '' ? (
        <div className="loading-screen">
          <h1>LOADING . . .</h1>
        </div>
      ) : (
        <RenderDisplay/>
      )}
    </>
  );
};

export default ProfileView;