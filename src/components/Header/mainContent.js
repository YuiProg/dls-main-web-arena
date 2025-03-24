import React from "react";
import './maincontent.css';
import { Element } from "react-scroll";
import { FaArrowCircleRight } from "react-icons/fa";
import { NavLink } from "react-router";

const MainContent = () => {
    return (
        <Element name="home" className="element">
            <div className="main-content">
                <div className="content-text">
                    <h1>CREATE, ORGANIZE, AND JOIN TOURNAMENTS</h1>
                    <p>Join us and ignite the gamer within you!</p>
                    <NavLink to='/SignUp' style={{textDecoration: 'none'}}>
                        <button className="content-box">
                            <FaArrowCircleRight
                                style={{
                                    marginRight: '10px',
                                    color: 'black',
                                    width: '20px',
                                    height: '20px'
                                }}
                            />
                            JOIN US NOW!
                        </button>
                    </NavLink>
                </div>
            </div>
        </Element>
    );
}

export default MainContent;