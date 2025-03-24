import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { FaHome, FaTrophy, FaNewspaper, FaSignOutAlt } from "react-icons/fa";
import "./UserDashboard.css";
import Footer from "../Footer/Footer.js";
import OrganizeTournaments from "../OrganizeTournaments/OrganizeTournaments.js";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import UDTournament from "./TOURNAMENTS/UD-Tournaments.js";
import { auth, DB } from "../firebase-config";
import { doc, getDoc } from "firebase/firestore";
import NewsDash from "./NEWS/newsD.js";
import TournamentCreation from "../CreateTournament/TournamentCreate.js";
import ProfileView from "./PROFILE/UserProfile.js";

const SidebarItem = ({ Icon, label }) => (
  <li className="sidebar-item">
    <Icon className="sidebar-icon" />
    <span className="sidebar-text">{label}</span>
  </li>
);

const UserDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [pages, setPage] = useState({Tournaments: true, News: false, Organize: false, Profile: false});
  const [username, setUsername] = useState('N/A');

  const currentUser = auth.currentUser;
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate("/login");
      } else {
        setUser(currentUser);
        fetchdata(currentUser);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchdata = async (currentUser) => { //pang get ng username sa naka logged in na user
    try {
      const docref = doc(DB, 'users', currentUser.uid);
      const data = await getDoc(docref);
      if (data.exists()) {
        setUsername(data.data());
      } else {
        console.log('NO USER EXISTS');
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }
  

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login"); 
    } catch (error) {
      console.error("Logout error:", error.message);
      alert("Failed to log out. Try again.");
    }
  };
  if (!user) {
    return null;
  }

  return (
    <div className="tournament-container">
      <aside className="sidebar">
        <div className="logo-container">
          <img src={require('../../assets/images/logos/LOGO_IGNITE_ARENA.png')} alt="Ignite Arena Logo" className="logo" />
        </div>
        <ul >
          <a onClick={() => {
            setPage({...pages, Tournaments: true, News: false, Organize: false, Profile: false});
          }}>
            <SidebarItem Icon={FaHome} label="Home" />
          </a>
          <a onClick={() => {
            setPage({...pages, Tournaments: false, News: false, Organize: true, Profile: false});
          }}>
            <SidebarItem Icon={FaTrophy} label="Organize" />
          </a>
          <a onClick={() => {
            setPage({...pages, Tournaments: false, News: true, Organize: false,  Profile: false});
          }}>
            <SidebarItem Icon={FaNewspaper} label="News" />
          </a>
          <a onClick={() => {
            setPage({...pages, Tournaments: false, News: true, Organize: false, Profile: false});
          }}>
            <SidebarItem Icon={FaTrophy} label="My Tournaments" />
          </a>

          
        </ul>
        <div className="user-container">
        </div>
        <div className="info-container">
        <div className="user-info" onClick={() => {
          setPage({...pages, Tournaments: false, News: false, Organize: false,  Profile: true});
        }}>
        <h1 style={{padding: 10, backgroundColor: '#28303f'}}>
        {!username.username ? 'Loading...' : username.username}
        <p style={{margin: 0, fontSize: 12}}>DARK COINS: <span style={{color: 'yellow'}}>{username.darkcoins}</span></p>
        </h1>
        </div>
        <button onClick={handleLogout} className="logout-btn" style={{marginBottom: 30, textAlign: 'center', width: '100%'}}>
          <FaSignOutAlt className="sidebar-icon" /> Logout
        </button>

        </div>
      </aside>

      <main className="main-content" style=
      {
        {
          padding: 0
        }
      }>
        {pages.Tournaments ? <UDTournament/> : 
        pages.News ? <NewsDash/> : 
        pages.Organize ? <TournamentCreation/>: 
        pages.Profile ? <ProfileView/> : null}
      </main>
    </div>
  );
};

export default UserDashboard;
