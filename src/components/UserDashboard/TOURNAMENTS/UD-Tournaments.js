import React, { useEffect, useState } from "react";
import { Element } from "react-scroll";
import { DB } from "../../firebase-config";
import { collection, getDocs } from "firebase/firestore";
import './ud-tourna.css';

const UDTournaments = () => {
    const [gameSET, setGame] = useState('N/A');
    const [tournaments, setTournaments] = useState([]);
    const [selectedTournamentId, setSelectedTournamentId] = useState(null);
    const [selectedTab, setSelectedTab] = useState('overview');
    const [detailsTab, setDetailsTab] = useState('details');
    const [isLoading, setIsLoading] = useState(true);
    
    // Registration panel states
    const [joinStep, setJoinStep] = useState(1);
    const [showCreateAccount, setShowCreateAccount] = useState(false);

    const fetchData = async () => {
        setIsLoading(true);
        const tournas = collection(DB, 'tournaments');
        try {
            const data = await getDocs(tournas);
            const dataItems = data.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            console.log("Fetched tournaments:", dataItems);
            setTournaments(dataItems);
            setIsLoading(false);
        } catch (error) {
            console.error("Error fetching tournaments:", error.message);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const renderTournamentCard = (tournament) => {
        return (
            <div 
                key={tournament.id} 
                className="tournament-card"
                onClick={() => {
                    setSelectedTournamentId(tournament.id);
                    setSelectedTab('overview');
                }}
            >
                <div className="tournament-banner">
                    <img 
                        src={tournament.poster || require('../../images/GIFS/222056.gif')} 
                        alt={tournament.name} 
                    />
                </div>
                <div className="tournament-title">
                    {tournament.name || 'Unnamed Tournament'}
                </div>
                <div className="tournament-info">
                    <div className="tournament-date">
                        <span className="icon">📅</span>
                        <span>{tournament.dateCreated || 'N/A'}</span>
                        <span className="time">{tournament.time || '7:00 AM PST'}</span>
                    </div>
                    <div className="tournament-location">
                        <span>{tournament.location || 'Online'}</span>
                    </div>
                    <div className="tournament-organizer">
                        <img 
                            src={tournament.ownerLogo || require('../../images/GIFS/222056.gif')} 
                            alt={tournament.owner || 'Organizer'} 
                            className="organizer-logo"
                        />
                        <span>{tournament.owner || 'Unknown Organizer'}</span>
                    </div>
                </div>
            </div>
        );
    };

    const renderTournamentDetails = (tournamentId) => {
        const tournament = tournaments.find(t => t.id === tournamentId);
        
        if (!tournament) {
            return (
                <div className="tournament-details-panel">
                    <div className="details-header">
                        <h1>Tournament Not Found</h1>
                        <button className="close-btn" onClick={() => setSelectedTournamentId(null)}>✕</button>
                    </div>
                    <p>Could not find tournament with ID: {tournamentId}</p>
                </div>
            );
        }

        return (
            <div className="tournament-details-panel">
                <div className="tournament-header">
                    <div className="tournament-logo">
                        <div className="tournament-org-info">
                            <span className="org-name">Tournament Organizer: {tournament.owner || "ESPORTS ORGANIZATION"}</span>
                        </div>
                        <div className="back-container">
                            <button 
                                className="back-btn" 
                                onClick={() => setSelectedTournamentId(null)}
                            >
                                Back to Tournaments
                            </button>
                        </div>
                    </div>
                    <div className="tournament-title-container">
                        <h1 className="tournament-title-large">Tournament Name:     {tournament.name || "THE NATIONAL GRAND FINALS"}</h1>
                    </div>
                </div>
                
                {/* Main Tabs Navigation */}
                <div className="main-tabs">
                    <button
                        className={selectedTab === 'overview' ? 'active' : ''}
                        onClick={() => setSelectedTab('overview')}
                    >
                        OVERVIEW
                    </button>
                    <button
                        className={selectedTab === 'participants' ? 'active' : ''}
                        onClick={() => setSelectedTab('participants')}
                    >
                        PARTICIPANTS
                    </button>
                    <button
                        className={selectedTab === 'brackets' ? 'active' : ''}
                        onClick={() => setSelectedTab('brackets')}
                    >
                        BRACKETS
                    </button>
                    <button
                        className={selectedTab === 'media' ? 'active' : ''}
                        onClick={() => setSelectedTab('media')}
                    >
                        MEDIA
                    </button>
                    <button
                        className={selectedTab === 'stats' ? 'active' : ''}
                        onClick={() => setSelectedTab('stats')}
                    >
                        STATS
                    </button>
                    <button
                        className={selectedTab === 'announcements' ? 'active' : ''}
                        onClick={() => setSelectedTab('announcements')}
                    >
                        ANNOUNCEMENTS
                    </button>
                    <button
                        className={selectedTab === 'contact' ? 'active' : ''}
                        onClick={() => setSelectedTab('contact')}
                    >
                        CONTACT
                    </button>
                </div>
                
                {/* Tournament Banner */}
                <div className="tournament-banner-large">
                    <img 
                        src={tournament.poster} 
                        alt="Tournament Banner" 
                    />
                </div>
                
                {/* Two Column Layout for Content and Registration */}
                <div className="tournament-content-container">
                    {/* Tournament Content */}
                    <div className="tournament-content">
                        {/* Details Tabs */}
                        <div className="details-tabs">
                            <button 
                                className={detailsTab === 'details' ? 'active' : ''}
                                onClick={() => setDetailsTab('details')}
                            >
                                DETAILS
                            </button>
                            <button
                                className={detailsTab === 'rules' ? 'active' : ''}
                                onClick={() => setDetailsTab('rules')}
                            >
                                RULES
                            </button>
                            <button
                                className={detailsTab === 'prizes' ? 'active' : ''}
                                onClick={() => setDetailsTab('prizes')}
                            >
                                PRIZES
                            </button>
                            <button
                                className={detailsTab === 'schedule' ? 'active' : ''}
                                onClick={() => setDetailsTab('schedule')}
                            >
                                SCHEDULE
                            </button>
                            <button
                                className={detailsTab === 'contact' ? 'active' : ''}
                                onClick={() => setDetailsTab('contact')}
                            >
                                CONTACT
                            </button>
                        </div>
                        
                        {/* Details Content */}
                        <div className="details-content">
                            {detailsTab === 'details' && (
                                <div className="details-section">
                                    <h3>{tournament.game || "MOBILE LEGENDS, LEAGUE OF LEGENDS, AND VALORANT"}</h3>
                                    
                                    <div className="detail-item">
                                        <div className="detail-label">DATE AND TIME</div>
                                        <div className="detail-value">{tournament.dateCreated || "SUNDAY MARCH 2, 2025"}</div>
                                    </div>
                                    
                                    <div className="detail-item">
                                        <div className="detail-label">PRIZES</div>
                                        <div className="detail-value">{tournament.prizes || "$15"}</div>
                                    </div>
                                    
                                    <div className="detail-item">
                                        <div className="detail-label">COMPETITION FORMAT</div>
                                        <div className="detail-value">{tournament.mode || "TOURNAMENT DRAFT"}</div>
                                    </div>
                                </div>
                            )}
                            
                            {detailsTab === 'rules' && (
                                <div className="rules-section">
                                    <h3>Tournament Rules</h3>
                                    <p>{tournament.rules || "Tournament rules will be displayed here."}</p>
                                </div>
                            )}
                            
                            {detailsTab === 'prizes' && (
                                <div className="prizes-section">
                                    <h3>Prize Distribution</h3>
                                    <p>{tournament.prizes || "Prize information will be displayed here."}</p>
                                </div>
                            )}
                            
                            {detailsTab === 'schedule' && (
                                <div className="schedule-section">
                                    <h3>Tournament Schedule</h3>
                                    <p>{tournament.schedule || "Tournament schedule will be displayed here."}</p>
                                </div>
                            )}
                            
                            {detailsTab === 'contact' && (
                                <div className="contact-section">
                                    <h3>Contact Information</h3>
                                    <p>{tournament.contact || "Contact information will be displayed here."}</p>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Registration Panel */}
                    <div className="registration-panel">
                        <div className="registration-step">
                            <div className="step-number">1.</div>
                            <div className="step-content">
                                <div className="step-title">JOIN</div>
                                {joinStep === 1 && (
                                    <div className="step-actions">
                                        {!showCreateAccount ? (
                                            <>
                                                <button 
                                                    className="create-account-btn"
                                                    onClick={() => setShowCreateAccount(true)}
                                                >
                                                    CREATE ACCOUNT
                                                </button>
                                                <div className="login-link">
                                                    <a href="#login">Login</a>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="create-account-form">
                                                <button 
                                                    className="create-account-confirm"
                                                    onClick={() => {
                                                        setShowCreateAccount(false);
                                                        setJoinStep(2);
                                                    }}
                                                >
                                                    Create Account
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className={`registration-step ${joinStep >= 2 ? 'active' : 'inactive'}`}>
                            <div className="step-number">2.</div>
                            <div className="step-content">
                                <div className="step-title">REGISTER TEAM</div>
                                {joinStep === 2 && (
                                    <div className="step-actions">
                                        <button 
                                            className="register-team-btn"
                                            onClick={() => setJoinStep(3)}
                                        >
                                            REGISTER
                                        </button>
                                        <div className="or-separator">OR</div>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className={`registration-step ${joinStep >= 3 ? 'active' : 'inactive'}`}>
                            <div className="step-number">3.</div>
                            <div className="step-content">
                                <div className="step-title">REGISTRATION FIELDS</div>
                                {joinStep === 3 && (
                                    <div className="registration-fields">
                                        {/* Registration fields would go here */}
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className={`registration-step ${joinStep >= 4 ? 'active' : 'inactive'}`}>
                            <div className="step-number">4.</div>
                            <div className="step-content">
                                <div className="step-title">JOIN TOURNAMENT</div>
                                {joinStep === 4 && (
                                    <div className="join-options">
                                        <button className="auto-join-btn">
                                            Auto Join
                                        </button>
                                        <div className="join-message">
                                            Once enough players register
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Filter tournaments based on selected game
    const filteredTournaments = gameSET === 'N/A' 
        ? tournaments 
        : tournaments.filter((tournament) => tournament.game === gameSET);

    return (
        <Element name="tournaments">
            <div className="tournaments-page">
                <h1 className="heading">TOURNAMENTS</h1>
                
                {/* Game Filter Options */}
                <div className="games-container">
                    <div 
                        className={`games-choice ${gameSET === 'VALORANT' ? 'active' : ''}`} 
                        onClick={() => setGame(gameSET === 'VALORANT' ? 'N/A' : 'VALORANT')}
                    >
                        <img src={require('../../images/GIFS/valorant-logo.jpg')} alt="VALORANT" />
                    </div>
                    
                    <div 
                        className={`games-choice ${gameSET === 'LEAGUE OF LEGENDS' ? 'active' : ''}`} 
                        onClick={() => setGame(gameSET === 'LEAGUE OF LEGENDS' ? 'N/A' : 'LEAGUE OF LEGENDS')}
                    >
                        <img src={require('../../images/GIFS/lol-logo.jpg')} alt="LEAGUE OF LEGENDS" />
                    </div>
                    
                    <div 
                        className={`games-choice ${gameSET === 'MOBILE LEGENDS' ? 'active' : ''}`} 
                        onClick={() => setGame(gameSET === 'MOBILE LEGENDS' ? 'N/A' : 'MOBILE LEGENDS')}
                    >
                        <img src={require('../../images/GIFS/mlbb-logo.jpg')} alt="MOBILE LEGENDS" />
                    </div>
                </div>

                {/* Tournament Grid */}
                <div className="tournament-grid">
                    {isLoading ? (
                        <h1 className="loading-text">LOADING. . .</h1>
                    ) : filteredTournaments.length === 0 ? (
                        <h1 className="no-tournaments">No tournaments found for this game.</h1>
                    ) : (
                        filteredTournaments.map(renderTournamentCard)
                    )}
                </div>

                {/* Load More Button - Only shown if there are more than 6 tournaments */}
                {filteredTournaments.length > 6 && (
                    <div className="load-more-container">
                        <button className="load-more-btn">Load more</button>
                    </div>
                )}

                {/* Selected Tournament Details */}
                {selectedTournamentId && renderTournamentDetails(selectedTournamentId)}
            </div>
        </Element>
    );
};

export default UDTournaments;