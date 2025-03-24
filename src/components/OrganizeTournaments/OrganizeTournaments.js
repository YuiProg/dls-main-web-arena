import "./OrganizeTournaments.css"
import React, {useRef, useEffect} from "react";
import { Element } from "react-scroll";
import { motion, useInView, useAnimation } from "motion/react";
import { navigate, NavLink } from "react-router"

const OrganizeTournaments = () => {
    const containerref = useRef(null);
    const isinview = useInView(containerref, {once: true});
    const maincontrol = useAnimation();

    useEffect(() => {
        if (isinview) {
            maincontrol.start('visible');
        }
    }, [isinview]);

    return(
        <Element name="org_tourna">
            <div className="contain">
                <div className="org-text">
                    JOIN, CREATE, AND ORGANIZE your tournaments<br /> with ease. Get started TODAY!
                    <NavLink 
                        to='../CreateTournament'
                        className="org-contain"
                    >
                        CREATE MY TOURNAMENT
                    </NavLink>
                </div>
                
                <div className="contain-image">
                    <h1>CREATE AND MANAGE TOURNAMENTS, HASSLE FREE!</h1>
                    <div className="img-contain">
                        <motion.div 
                            ref={containerref}
                            animate={maincontrol}
                            initial='hidden'
                            variants={{
                                hidden: {opacity: 0, y: 50},
                                visible: {opacity: 1, y: 0}
                            }}
                            transition={{
                                duration: 0.5,
                                delay: 0.2
                            }}
                            className="img-1"
                        >
                            <img 
                                src={require('../images/tourna/481687516_930928352222561_2069226538248636043_n (1).jpg')} 
                                alt="Tournament" 
                                className="image-1" 
                                loading="lazy"
                            />
                            <h1>Join tournaments easily</h1>
                            <p>Find and compete in tournaments with players around the Philippines.</p>
                        </motion.div>
                        <motion.div 
                            ref={containerref}
                            animate={maincontrol}
                            initial='hidden'
                            variants={{
                                hidden: {opacity: 0, y: 50},
                                visible: {opacity: 1, y: 0}
                            }}
                            transition={{
                                duration: 0.5,
                                delay: 0.4
                            }}
                            className="img-2"
                        >
                            <img 
                                src={require('../images/tourna/481687516_930928352222561_2069226538248636043_n (1).jpg')} 
                                alt="Tournament Creation" 
                                className="image-1" 
                                loading="lazy"
                            />
                            <h1>Create your own tournament</h1>
                            <p>Set up tournaments for any game with powerful, easy-to-use tools.</p>
                        </motion.div>
                        <motion.div 
                            ref={containerref}
                            animate={maincontrol}
                            initial='hidden'
                            variants={{
                                hidden: {opacity: 0, y: 50},
                                visible: {opacity: 1, y: 0}
                            }}
                            transition={{
                                duration: 0.5,
                                delay: 0.6
                            }}
                            className="img-3"
                        >
                            <img 
                                src={require('../images/tourna/481687516_930928352222561_2069226538248636043_n (1).jpg')} 
                                alt="Tournament Organization" 
                                className="image-1" 
                                loading="lazy"
                            />
                            <h1>Organize like a pro</h1>
                            <p>Manage brackets, track scores, and streamline matches effortlessly.</p>
                        </motion.div>
                    </div>
                </div>

                <div className="contain-faq">
                    <h1>Frequently Asked Question</h1>
                    <div className="contain-text">
                        <div className="contain-text-1">
                            Can I organize a tournament?<br /><br />
                            Anyone can create a tournament on our platform for any game we support (over 40,000!). 
                            Thousands of independent tournament organizers use our platform to power their tournaments every month. 
                            Whether you're hosting a multi-week league with sophisticated brackets and match play or a 
                            one-off single elimination event for your friends, we have the tools you need.
                        </div>
                        <div className="contain-text-2">
                            Can I organize a tournament?<br /><br />
                            Anyone can create a tournament on our platform for any game we support (over 40,000!). 
                            Thousands of independent tournament organizers use our platform to power their tournaments every month. 
                            Whether you're hosting a multi-week league with sophisticated brackets and match play or a 
                            one-off single elimination event for your friends, we have the tools you need.
                        </div>
                    </div>
                </div>
            </div>
        </Element>
    );
}

export default OrganizeTournaments;