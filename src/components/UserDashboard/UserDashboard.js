import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { FaHome, FaTrophy, FaNewspaper, FaSignOutAlt, FaUserFriends, FaUsers } from "react-icons/fa";
import "./UserDashboard.css";
import Footer from "../Footer/Footer.js";
import NewsDash from "./NEWS/newsD.js";
import TournamentCreation from "../CreateTournament/TournamentCreate.js";
import ProfileView from "./PROFILE/UserProfile.js";
import { auth, DB } from "../firebase-config";
import { doc, getDoc } from "firebase/firestore";
import { FaUserCircle } from 'react-icons/fa';
import './DefaultView.css';
import waitingImage from '../../assets/images/logos/waiting.png';
import UDTournaments from './TOURNAMENTS/UD-Tournaments';

// Dashboard Components
const MyTournaments = () => (
  <div className="dashboard-section">
    <h2>MY TOURNAMENTS</h2>
    <div className="content-box">
      {/* Tournament list will go here */}
    </div>
  </div>
);

const FriendRequests = () => (
  <div className="dashboard-section">
    <h2>FRIEND REQUESTS</h2>
    <div className="content-box">
      {/* Friend requests will go here */}
    </div>
  </div>
);

const WaitingTournaments = ({ count = 2 }) => (
  <div className="dashboard-section highlight-section">
    <h3>{count} TOURNAMENTS WAITING FOR YOU</h3>
    <div className="tournament-cards-container">
      <div className="tournament-card">
        <p>Dark ESAQUE</p>
      </div>
      <div className="tournament-card">
        <p>Dark ESAQUE</p>
      </div>
    </div>
  </div>
);

const UpcomingTournaments = () => (
  <div className="dashboard-section">
    <h2>UPCOMING TOURNAMENTS</h2>
    <div className="tournaments-grid-container">
      <UDTournaments isNested={true} displayMode="grid" />
    </div>
  </div>
);

const DefaultView = ({ username }) => {
  const [level, setLevel] = useState(1);
  const [experience, setExperience] = useState(0);
  const maxExperiencePerLevel = 100;

  const handleLevelUp = () => {
    if (experience >= maxExperiencePerLevel) {
      setLevel(prevLevel => prevLevel + 1);
      setExperience(0);
    }
  };

  const addExperience = (amount) => {
    const newExperience = experience + amount;
    setExperience(newExperience);
    
    if (newExperience >= maxExperiencePerLevel) {
      handleLevelUp();
    }
  };

  const WaitingTournaments = ({ count = 2 }) => (
    <div className="tournament-cards-container">
      <div className="tournament-card">
        <p>Dark ESAQUE</p>
      </div>
      <div className="tournament-card">
        <p>Dark ESAQUE</p>
      </div>
    </div>
  );

  return (
    <div className="dashboard-container">
      {/* Left Column */}
      <div className="left-column">
        <div className="profile-card">
          <div className="profile-header">
            <FaUserCircle className="profile-icon" />
            <h1>HELLO {username?.username?.toUpperCase() || 'PLAYER'}!</h1>
          </div>
          
          <div className="level-up-container">
            <div className="level-header">
              <div className="level-info">
                <span className="level-up-icon">↑</span>
                <span className="level-text">Level {level}</span>
              </div>
              <button 
                onClick={() => addExperience(20)} 
                className="xp-button"
              >
                Gain XP
              </button>
            </div>
            
            <div className="xp-bar-container">
              <div 
                className="xp-bar" 
                style={{width: `${(experience / maxExperiencePerLevel) * 100}%`}}
              ></div>
            </div>
            
            <div className="xp-text">
              {experience} / {maxExperiencePerLevel} XP
            </div>
          </div>
        </div>

        {/* Compact Friend Requests */}
        <div className="compact-friend-requests">
          <h3 className="compact-title">FRIEND REQUESTS</h3>
          <FriendRequests />
        </div>
      </div>

      {/* Right Column - Main Content */}
      <div className="right-column">
        {/* Waiting Tournaments */}
        <div className="content-section highlight-section">
          <div className="section-header">
            <img 
              src={waitingImage} 
              alt="Tournaments Waiting For You" 
              className="section-image"
            />
          </div>
          <WaitingTournaments count={2} />
        </div>

        {/* Upcoming Tournaments */}
        <div className="content-section">
          <h2 className="section-title">Find Tournaments</h2>
          <UpcomingTournaments />
        </div>
      </div>
    </div>
  );
};

// Other View Components
const FriendsView = () => (
  <div className="section-container">
    <h2>My Friends</h2>
    <div className="content-box">
      <p>Friend list will appear here</p>
    </div>
  </div>
);

const TeamsView = () => (
  <div className="section-container">
    <h2>My Teams</h2>
    <div className="content-box">
      <p>Team management will appear here</p>
    </div>
  </div>
);

const SidebarItem = ({ Icon, label, active, onClick }) => (
  <li 
    className={`sidebar-item ${active ? 'active' : ''}`}
    onClick={onClick}
  >
    <Icon className="sidebar-icon" />
    <span className="sidebar-text">{label}</span>
  </li>
);

const UserDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState('Dashboard');
  const [username, setUsername] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate("/login");
      } else {
        setUser(currentUser);
        fetchData(currentUser);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchData = async (currentUser) => {
    try {
      const docRef = doc(DB, 'users', currentUser.uid);
      const data = await getDoc(docRef);
      if (data.exists()) {
        setUsername(data.data());
      } else {
        console.log('NO USER EXISTS');
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error.message);
      alert("Failed to log out. Please try again.");
    }
  };

  const handleNavigation = (page) => {
    setActivePage(page);
  };

  if (!user) {
    return <div className="loading-screen">Loading...</div>;
  }

  const renderActivePage = () => {
    switch (activePage) {
      case 'News': return <NewsDash />;
      case 'Organize': return <TournamentCreation />;
      case 'Profile': return <ProfileView />;
      case 'Friends': return <FriendsView />;
      case 'Teams': return <TeamsView />;
      default: return <DefaultView username={username} />;
    }
  };

  return (
    <div className="dashboard-wrapper">
      <div className="tournament-container">
        <aside className="sidebar">
          <div className="logo-container">
            <img 
              src={require('../../assets/images/logos/LOGO_IGNITE_ARENA.png')} 
              alt="Ignite Arena Logo" 
              className="logo" 
            />
          </div>
          <ul className="sidebar-nav">
            <SidebarItem 
              Icon={FaHome} 
              label="Home" 
              active={activePage === 'Dashboard'} 
              onClick={() => handleNavigation('Dashboard')} 
            />
            <SidebarItem 
              Icon={FaTrophy} 
              label="Create Tournament" 
              active={activePage === 'Organize'} 
              onClick={() => handleNavigation('Organize')} 
            />
            <SidebarItem 
              Icon={FaNewspaper} 
              label="News" 
              active={activePage === 'News'} 
              onClick={() => handleNavigation('News')} 
            />
            <SidebarItem 
              Icon={FaUserFriends} 
              label="My Friends" 
              active={activePage === 'Friends'} 
              onClick={() => handleNavigation('Friends')} 
            />
            <SidebarItem 
              Icon={FaUsers} 
              label="Teams" 
              active={activePage === 'Teams'} 
              onClick={() => handleNavigation('Teams')} 
            />
          </ul>
          <div className="user-container">
            <div 
              className="user-info" 
              onClick={() => handleNavigation('Profile')}
            >
              <h1>
                {username?.username || 'Loading...'}
                <p className="dark-coins">
                  DARK COINS: <span>{username?.darkcoins || 0}</span>
                </p>
              </h1>
            </div>
            <button 
              onClick={handleLogout} 
              className="logout-btn"
            >
              <FaSignOutAlt className="sidebar-icon" /> Logout
            </button>
          </div>
        </aside>

        <main className="main-content">
          {renderActivePage()}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default UserDashboard;