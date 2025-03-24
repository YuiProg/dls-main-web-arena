import React from "react";
import './header.css';
import { FaUser } from "react-icons/fa";
import { useState, useEffect } from "react";
import Signup from "../Signin/SignIn.js";
import MainContent from "./mainContent";
import { Link } from "react-scroll";
import { NavLink } from "react-router";

const Header = (props) => {
  const [signin, setSignin] = useState(false);
  const [active, setActive] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Close menu when window is resized to desktop size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280) {
        setMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  
  const SignInButton = () => {
    return(
      <div className="SignInButton">
        <NavLink to='/Login'>
          <a href="#" onClick={() => {
            setSignin(true);
            setActive(false);
            setMenuOpen(false);
          }}>Sign In</a>
        </NavLink>
        <NavLink to='/SignUp'>
          <a href="#">Sign Up</a>
        </NavLink>
      </div>
    );
  };

  return (
    <div className="app-container" style={{ fontFamily: "'Bai Jamjuree', sans-serif" }}>
      <header className={`${props.headerclass}`}>
        <div className="nav-container">
          <nav className="main-nav">
            <ul className={`nav-links ${menuOpen ? 'active' : ''}`}>
              <Link to="home" smooth={true} duration={500}>
                <li onClick={() => {
                  setSignin(false);
                  setMenuOpen(false);
                }}>Home</li>
              </Link>
              <Link to="org_tourna" smooth={true} duration={500} offset={-50}>
                <li onClick={() => setMenuOpen(false)}>Organize Tournament</li>
              </Link>
              <Link to="tournaments" smooth={true} duration={500} offset={-180}>
                <li onClick={() => setMenuOpen(false)}>Tournaments</li>
              </Link>
              <Link to="Feedback" smooth={true} duration={500} offset={-50}>
                <li onClick={() => setMenuOpen(false)}>Feedback</li>
              </Link>
              <Link to="News" smooth={true} duration={500} offset={-100}>
                <li onClick={() => setMenuOpen(false)}>News</li>
              </Link>
              <li>
                <a className="sign-in" 
                   onClick={() => {
                     setActive(!active);
                     setMenuOpen(false);
                   }}>
                  <FaUser />
                </a>
              </li>
            </ul>
          </nav>
          
          <button className={`hamburger ${menuOpen ? 'active' : ''}`} onClick={toggleMenu}>
            <span></span>
            <span></span>
            <span></span>
          </button>
          
          {active ? <SignInButton/> : null}
        </div>
      </header>

      {signin ? <Signup/> : <MainContent/>}
    </div>
  );
};

export default Header;