import React from "react";
import './header.css';
import { FaUser } from "react-icons/fa";
import { useState } from "react";
import Signup from "../Signin/SignIn.js";
import MainContent from "./mainContent";
import { Link } from "react-scroll";
import { NavLink } from "react-router";

const Header = (props) => {

  const [signin, setSignin] = useState(false);
  const [active, setActive] = useState(false);
  
  const SignInButton = () => {
    return(
    <div className = "SignInButton">
      <NavLink to='/Login'>
      <a href="#" onClick={() => 
        {
          setSignin(true)
          setActive(false)
        }}>Sign In</a>
      </NavLink>
      <NavLink to='/SignUp'>
      <a href="#">Sign Up</a>
      </NavLink>
    </div>
    )
  }
    return (
        <div className="app-container" style={{ fontFamily: "'Bai Jamjuree', sans-serif" }}>
      {/* Header */}
      <header className={`${props.headerclass}`}>
        <div className="nav-container">
          <nav>
            <ul className="nav-links">
              <Link to="home" smooth={true} duration={500}><li onClick={() => setSignin(false)}>Home</li></Link>
              <Link to="org_tourna" smooth={true} duration={500} offset={-50}><li>Organize Tournament</li></Link>
              <Link to="tournaments" smooth={true} duration={500} offset={-180}><li>Tournaments</li></Link>
              <Link to="Feedback" smooth={true} duration={500} offset={-50}><li>Feedback</li></Link>
              <Link to="News" smooth={true} duration={500} offset={-100}><li>News</li></Link>
              <li><a className = "sign-in" 
              onClick={() => {active ? setActive(false) : setActive(true)}}>
                <FaUser />
                </a></li>
            </ul>
          </nav>
          {active ? <SignInButton/> : null}
        </div>
      </header>

      {/* Main Content */}
      {/* di dapat sa header nakalagay main content dito sa header pero fuck it we ballin */}
      {signin ? <Signup/> : <MainContent/>} 
      
    </div>
    );
}

export default Header