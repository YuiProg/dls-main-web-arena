import React, { useState } from "react";
import './TCREATE.css';
import { doc, setDoc, getDoc, collection } from "firebase/firestore";
import { DB } from "../firebase-config";
import { auth } from "../firebase-config";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Bracket generation functions
const generateSingleEliminationBracket = (players) => {
    const bracket = [];
    let round = 1;

    // Create the first round with all players
    for (let i = 0; i < players.length; i += 2) {
        const match = {
            round: round,
            player1: players[i],
            player2: players[i + 1] || 'BYE', // Handle odd number of players
            winner: null,
        };
        bracket.push(match);
    }

    // Generate subsequent rounds
    while (bracket.filter(match => match.round === round).length > 1) {
        round++;
        const previousRoundMatches = bracket.filter(match => match.round === round - 1);
        for (let i = 0; i < previousRoundMatches.length; i += 2) {
            const match = {
                round: round,
                player1: `Winner of Match ${previousRoundMatches[i].round}-${i + 1}`,
                player2: `Winner of Match ${previousRoundMatches[i + 1].round}-${i + 2}`,
                winner: null,
            };
            bracket.push(match);
        }
    }

    return bracket;
};

const generateDoubleEliminationBracket = (players) => {
    const winnersBracket = [];
    const losersBracket = [];
    let round = 1;

    // Create the first round of the winners' bracket
    for (let i = 0; i < players.length; i += 2) {
        const match = {
            round: round,
            player1: players[i],
            player2: players[i + 1] || 'BYE',
            winner: null,
        };
        winnersBracket.push(match);
    }

    // Generate subsequent rounds for winners' and losers' brackets
    while (winnersBracket.filter(match => match.round === round).length > 1) {
        round++;
        const previousWinnersMatches = winnersBracket.filter(match => match.round === round - 1);

        // Winners' bracket matches
        for (let i = 0; i < previousWinnersMatches.length; i += 2) {
            const match = {
                round: round,
                player1: `Winner of Match ${previousWinnersMatches[i].round}-${i + 1}`,
                player2: `Winner of Match ${previousWinnersMatches[i + 1].round}-${i + 2}`,
                winner: null,
            };
            winnersBracket.push(match);
        }

        // Losers' bracket matches (players who lost in the previous winners' bracket)
        for (let i = 0; i < previousWinnersMatches.length; i += 2) {
            if (i + 1 < previousWinnersMatches.length) {
                const match = {
                    round: round,
                    player1: `Loser of Match ${previousWinnersMatches[i].round}-${i + 1}`,
                    player2: `Loser of Match ${previousWinnersMatches[i + 1].round}-${i + 2}`,
                    winner: null,
                };
                losersBracket.push(match);
            }
        }
    }

    return { winnersBracket, losersBracket };
};

const TournamentCreation = () => {
    const [name, setName] = useState('');
    const [type, setType] = useState('');
    const [mode, setMode] = useState('');
    const [game, setGame] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Settings
    const [report, setReport] = useState('');
    const [region, setRegion] = useState('');
    const [device, setDevice] = useState('PC');
    const [checkin, setCheckin] = useState(false);
    const [screenshot, setScreenshot] = useState(false);

    // Additional Information
    const [details, setDetails] = useState('');
    const [rules, setRules] = useState('');
    const [prizes, setPrizes] = useState('');
    const [schedule, setSchedule] = useState('');
    const [contact, setContact] = useState('');
    const [poster, setPoster] = useState(null);

    // Socials
    const [discord, setDiscord] = useState("");
    const [twitch, setTwitch] = useState("");
    const [domain, setDomain] = useState("");
    const [website, setWebsite] = useState("");
    const [facebook, setFacebook] = useState("");
    const [twitter, setTwitter] = useState("");
    const [instagram, setInstagram] = useState("");
    const [youtube, setYoutube] = useState("");

    const Next = () => {
        setCurrentPage(currentPage + 1);
    }

    const date = new Date();
    const day = date.getDate(); // Fixed: getDate() instead of getDay()
    const month = date.getMonth() + 1; // Fixed: month is 0-indexed
    const year = date.getFullYear();
    const fulldate = `${day}-${month}-${year}`;

    const saveData = async () => {
        if (name.trim() === '' || type.trim() === '' || mode.trim() === '' ||
            report.trim() === '' || region.trim() === '') {
            alert('MISSING INPUTS');
            setCurrentPage(1);
            return;
        }

        const players = Array.from({ length: 32 }, (_, i) => `Player ${i + 1}`); // Example players
        let bracket;

        if (mode === 'SINGLE ELIMINATION') {
            bracket = generateSingleEliminationBracket(players);
        } else if (mode === 'DOUBLE ELIMINATION') {
            const { winnersBracket, losersBracket } = generateDoubleEliminationBracket(players);
            bracket = { winnersBracket, losersBracket };
        } else {
            alert('Please select a valid elimination mode.');
            return;
        }

        const user = doc(DB, 'users', auth.currentUser.uid);
        const userAUTH = await getDoc(user);

        // Upload poster to Firebase Storage
        let posterUrl = null;
        if (poster) {
            const storage = getStorage();
            const storageRef = ref(storage, `posters/${Date.now()}_${poster.name}`); // Added timestamp to avoid name conflicts
            await uploadBytes(storageRef, poster);
            posterUrl = await getDownloadURL(storageRef);
        }

        const data = {
            uid: auth.currentUser.uid,
            name: name,
            type: type,
            mode: mode,
            game: game,
            owner: userAUTH.data().username,
            dateCreated: fulldate,
            status: 'on-going',
            settings: {
                Platform: device,
                CheckIn: checkin,
                Region: region,
                Screenshot: screenshot,
                Reporting: report
            },
            players: {}, // You can include the players here if needed
            bracket: bracket, // Save the bracket to the database
            socials: {
                Discord: discord,
                Twitch: twitch,
                Domain: domain,
                Website: website,
                Facebook: facebook,
                Twitter: twitter,
                Instagram: instagram,
                Youtube: youtube
            },
            details: details,
            rules: rules,
            prizes: prizes,
            schedule: schedule,
            contact: contact,
            poster: posterUrl,
            ownerID: auth.currentUser.uid
        }

        try {
            // Generate a unique ID using Firebase's auto-generated IDs
            const tournamentRef = doc(collection(DB, 'tournaments'));
            const tournamentId = tournamentRef.id;
            
            // Add the tournament ID to the data
            data.tournamentId = tournamentId;
            
            // Save the tournament with the unique ID
            await setDoc(tournamentRef, data).then(() => {
                alert('Tournament added successfully!');
                window.location.reload();
            });
        } catch (error) {
            alert(`Error adding tournament: ${error.message}`);
        }
    }

    const renderBracket = (bracket, isDoubleElimination = false) => {
        const rounds = {};
        bracket.forEach(match => {
            if (!rounds[match.round]) {
                rounds[match.round] = [];
            }
            rounds[match.round].push(match);
        });

        return (
            <div className={isDoubleElimination ? "double-elimination-bracket" : "single-elimination-bracket"}>
                {Object.keys(rounds).map(round => (
                    <div key={round} className="round">
                        <div className="round-title">Round {round}</div>
                        {rounds[round].map((match, index) => (
                            <div key={index} className="match">
                                <div className="match-players">
                                    <div className="player">{match.player1}</div>
                                    <div className="player">{match.player2}</div>
                                </div>
                                <div className="match-result">
                                    <div className="winner">{match.winner || 'TBD'}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        );
    };

    const generateBracket = () => {
        const players = Array.from({ length: 32 }, (_, i) => `Player ${i + 1}`); // Example players

        if (mode === 'SINGLE ELIMINATION') {
            const bracket = generateSingleEliminationBracket(players);
            console.log('Single Elimination Bracket:', bracket);
            return renderBracket(bracket); // Render the bracket
        } else if (mode === 'DOUBLE ELIMINATION') {
            const { winnersBracket, losersBracket } = generateDoubleEliminationBracket(players);
            console.log('Winners Bracket:', winnersBracket);
            console.log('Losers Bracket:', losersBracket);
            return (
                <div>
                    <h2 className="winners-bracket">Winners Bracket</h2>
                    {renderBracket(winnersBracket, true)}
                    <h2 className="losers-bracket">Losers Bracket</h2>
                    {renderBracket(losersBracket, true)}
                </div>
            );
        } else {
            alert('Please select a valid elimination mode.');
        }
    };

    return (
        <div className="tournament">
            <div className="selection-type">
                <h1>SETUP</h1>
                <h1>CONTACT INFO</h1>
                <h1>BRACKET</h1>
            </div>
            {currentPage === 1 && (
                <>
                    <h1 style={{ color: 'white', marginBottom: 20 }}>SETUP</h1>
                    <div className="setup">
                        <p style={{ margin: 0, marginBottom: 0, fontSize: 30 }}>Name</p>
                        <input type="text" style={{ width: '98%', backgroundColor: '#1d1c1c', height: 30, fontSize: 20 }} placeholder="Tournament Name" value={name} onChange={(text) => setName(text.target.value)} required />
                        <p style={{ margin: 0, marginBottom: 0, fontSize: 30 }}>Game</p>
                        <select className="game-select-option" onChange={(e) => setGame(e.target.value)}>
                            <option>SELECT GAME</option>
                            <option>VALORANT</option>
                            <option>MOBILE LEGENDS</option>
                            <option>LEAGUE OF LEGENDS</option>
                        </select>
                        <p style={{ margin: 0, marginBottom: 0, fontSize: 30 }}>Type</p>
                        <div className="radio-input" style={{ marginTop: 15 }}>
                            <label>
                                <input type="radio" id="value-1" name="value-radio" value="1" onClick={() => setType('PRIVATE')} required />
                                <span>Private</span>
                            </label>
                            <label>
                                <input type="radio" id="value-2" name="value-radio" value="2" onClick={() => setType('PUBLIC')} required />
                                <span>Public</span>
                            </label>
                            <span className="selection"></span>
                        </div>
                    </div>
                    <div className="setup-selection">
                        <div className={mode === 'SINGLE ELIMINATION' ? 'single-elims' : 'card-selection'} onClick={() => setMode('SINGLE ELIMINATION')}>
                            <h1>SINGLE ELIMINATION</h1>
                        </div>
                        <div className={mode === 'DOUBLE ELIMINATION' ? 'double-elims' : 'card-selection'} onClick={() => setMode('DOUBLE ELIMINATION')}>
                            <h1>DOUBLE ELIMINATION</h1>
                        </div>
                    </div>
                    <div className="page-button1">
                        <button className="next-button" onClick={() => Next()}>NEXT</button>
                    </div>
                </>
            )}
            {currentPage === 2 && (
                <>
                    <div className="setup-page">
                        <h1>Game Region/Server</h1>
                        <h1>Platform</h1>
                        <select style={{ width: '70%', height: 50, borderRadius: 10 }} onChange={(e) => setRegion(e.target.value)}>
                            <option>SELECT REGION</option>
                            <option>ASIA</option>
                            <option>SEA</option>
                        </select>
                        <select style={{ height: 50, borderRadius: 10 }} onChange={(e) => setDevice(e.target.value)}>
                            <option>SELECT OPTION</option>
                            <option>PC</option>
                            <option>MOBILE</option>
                        </select>
                    </div>
                    <div className="setup-page2">
                        <h1>Check-in</h1>
                        <div className="setup-page2-1">
                            <button onClick={() => setCheckin(false)}>Disabled</button>
                            <button onClick={() => setCheckin(true)}>Enabled</button>
                        </div>
                        <h1>Match Score Reporting</h1>
                        <div className="setup-page2-1">
                            <button onClick={() => setReport('GM ONLY')}>Game Masters Only</button>
                            <button onClick={() => setReport('GM AND PL')}>Game Masters and Players</button>
                        </div>
                        <h1>Required Screenshot</h1>
                        <div className="setup-page2-1">
                            <button onClick={() => setScreenshot(false)}>Disabled</button>
                            <button onClick={() => setScreenshot(true)}>Enabled</button>
                        </div>
                        <h1>Details</h1>
                        <input placeholder="Enter tournament details" onChange={(e) => setDetails(e.target.value)} />
                        <h1>Rules</h1>
                        <input placeholder="Enter tournament rules" onChange={(e) => setRules(e.target.value)} />
                        <h1>Prizes</h1>
                        <input placeholder="Enter tournament prizes" onChange={(e) => setPrizes(e.target.value)} />
                        <h1>Schedule</h1>
                        <input type="date" placeholder="Enter tournament schedule" onChange={(e) => setSchedule(e.target.value)} />
                        <h1>Contact</h1>
                        <input placeholder="Enter contact information" onChange={(e) => setContact(e.target.value)} />
                        <h1>Upload Poster</h1>
                        <input type="file" onChange={(e) => setPoster(e.target.files[0])} />
                    </div>
                    <div className="page-button2">
                        <button className="previous-button" onClick={() => setCurrentPage(1)}>PREVIOUS</button>
                        <button className="next-button" onClick={() => Next()}>NEXT</button>
                    </div>
                </>
            )}
            {currentPage === 3 && (
                <>
                    <div className="page-2">
                        <input placeholder="Discord Invite Link" onChange={(e) => setDiscord(e.target.value)} />
                        <input placeholder="Your Twitch Username" onChange={(e) => setTwitch(e.target.value)} />
                        <input placeholder="Contact@your-domain.com" onChange={(e) => setDomain(e.target.value)} />
                        <input placeholder="https://www-your-website.com" onChange={(e) => setWebsite(e.target.value)} />
                        <input placeholder="Your Facebook Username" onChange={(e) => setFacebook(e.target.value)} />
                        <input placeholder="Your Youtube Username" onChange={(e) => setYoutube(e.target.value)} />
                        <input placeholder="Your Twitter Username" onChange={(e) => setTwitter(e.target.value)} />
                        <input placeholder="Your Instagram Username" onChange={(e) => setInstagram(e.target.value)} />
                    </div>
                    <div className="page-button2">
                        <button className="previous-button" onClick={() => setCurrentPage(2)}>PREVIOUS</button>
                        <button className="next-button" onClick={() => Next()}>NEXT</button>
                    </div>
                </>
            )}
            {currentPage === 4 && (
                <>
                    <div className="bracket-container">
                        {generateBracket()} {/* Render the bracket here */}
                    </div>
                    <div className="page-button2">
                        <button className="previous-button" onClick={() => setCurrentPage(3)}>PREVIOUS</button>
                        <button onClick={saveData} className="next-button">SUBMIT</button>
                    </div>
                </>
            )}
        </div>
    );
}

export default TournamentCreation;