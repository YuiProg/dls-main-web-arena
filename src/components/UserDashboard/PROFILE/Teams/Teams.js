import React, { useEffect, useState } from "react";
import './Teams.css';
import { doc, getDoc, setDoc, collection, getDocs, query, where, onSnapshot, arrayUnion } from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { auth, DB } from "../../../firebase-config";
import { FaSearch } from "react-icons/fa";


const Teams = () => {

    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasTeam, setTeam] = useState(false);
    const [teams, setTeams] = useState([]);
    const [players, setPlayers] = useState([]);
    let name = '';
    let description = '';
    let header = null;


    useEffect(() => { // check kung may nakasaling team ba si user TBD sa office
        const checkTeam = async () => {

            try {
                let players = [];
                const fetch_teams = await collection(DB, 'teams');
                const fetch_docs = await getDocs(fetch_teams);
                const data = fetch_docs.docs.map(data => data.data().players);

                for(let i = 0; i < data.length; i++) {
                    players = data[i];
                    setTeam(players.some(data => data.id === auth.currentUser.uid));
                }
                
            } catch (error) {
                console.log(error.message);
            }
        }
        checkTeam();
      }, []);
    

      useEffect(() => {
        const fetchDatas = () => {
          try {
            const teamsCollection = collection(DB, 'teams');
            const unsubscribe = onSnapshot(teamsCollection, (querySnapshot) => {
              const teamsData = querySnapshot.docs.map((doc) => doc.data());
              console.log(teamsData);
              setTeams(teamsData);
              setLoading(false);
            });
    

            return () => unsubscribe();
          } catch (error) {
            console.error('Error fetching all teams:', error.message);
            setLoading(false);
          }
        };
    
        fetchDatas();
      }, []);

    const submit = async (e) => {
        e.preventDefault();

        const date = new Date();

        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();

        try {
            if (header && name.trim() !== '' && description.trim() !== '') {
                setLoading(true);
                let url = null;
                const storage = getStorage();
                const headerRef = ref(storage, `header/${Date.now()}_${header.name}`);
                const user = auth.currentUser.uid;
                await uploadBytes(headerRef, header).then(async () => {
                    url = await getDownloadURL(headerRef);
                    await setDoc(doc(DB, 'teams', auth.currentUser.uid), {
                        owner: user,
                        Name: name,
                        Desc: description,
                        Header: url,
                        Date: `${month}-${day}-${year}`,
                        players: []
                    }).then(async () => {
                        const teamData = await getDoc(doc(DB, 'teams', auth.currentUser.uid));
                        const activeUser = await getDoc(doc(DB,'users', auth.currentUser.uid));
                        await setDoc(doc(DB, 'teams', auth.currentUser.uid), {
                            ...teamData.data(),
                            players: [activeUser.data()]
                        }).then(() => {
                            alert('team created');
                            setLoading(false);
                            setTeam(true);
                        });
                    });
                });
                
            } else {
                alert('NO INPUT');
            }
        } catch (error) { 
            console.log(error.message);
        }
    }

    const JoinTeam = async (id) => {
        try {
            const fetch_current_user = (await getDoc(doc(DB, 'users', auth.currentUser.uid))).data();
            
            const fetch_selected_team = (await getDoc(doc(DB, 'teams', id.owner))).data();
        
            await setDoc(doc(DB, 'users', auth.currentUser.uid), {
                ...fetch_current_user,
                teams: [fetch_selected_team]
            }).then(async () => {
                await setDoc(doc(DB, 'teams', id.owner), {
                    ...fetch_selected_team,
                    players: arrayUnion(fetch_current_user)
                }, {merge: true}).then(() => {
                    alert('team joined');
                });
            });
        } catch (error) {
            console.log(error.message);
        }
    }

    const SearchTeams = () => {
        const teaminfo = teams.map((data, index) => 
            {
                if (index < 2) {
                    return <div key={index}>
                    <div className="team-container">
                        <div style={{width: 'inherit', height: 'inherit', backgroundColor: 'rgba(0, 0, 0, 0.644)', position: 'absolute', borderRadius: 10}}/>
                        <div style={{position: 'absolute'}}>
                            <h1 style={{marginLeft: 25}}>{data.Name}</h1>
                            <p>PLAYERS: {data.players.length}/6</p>
                            {data.players.length < 6 ? <p>STATUS: <span style={{fontWeight: 'bold'}}>OPEN</span></p> : <p>STATUS: <span style={{fontWeight: 'bold'}}>CLOSED</span></p>}
                            <p>DATE CREATED: {data.Date}</p>
                            <p>ID: {data.owner}</p>
                            <button style={{zIndex: 999, marginLeft: 30, width: 100, height: 30, border:'none', backgroundColor: 'green', borderRadius:10, color: 'white', cursor: 'pointer'}} onClick={() => JoinTeam(data)}>JOIN TEAM</button>
                        </div>
                            <img src={data.Header} style={{width: 'inherit', height: 'inherit', objectFit: 'cover', borderRadius: 10}}/>
                        </div>
                    </div>
                }
            }
        );

        return (
            <div>
                <h1>SEARCH FOR TEAMS</h1>
                <input type="text" placeholder="Enter Team Name" style={{width: 600}}/>
                <FaSearch style={{marginLeft: 10, cursor: 'pointer'}}/>
                <div>
                    {teaminfo}
                </div>
            </div>
        );
    }

    


    const CreateATeam = () => {
        return (
            <div className="team-create">
                <div style=
                {
                    {
                        width: '93%',
                        height: '70vh',
                        backgroundColor: 'black',
                        borderRadius: 50,
                        color: 'white'
                    }
                }>
                    <h1 style={{textAlign: 'center'}}>CREATE A TEAM</h1>
                    <form style={{margin: 50}} onSubmit={submit}>
                        <h2>Team Name</h2>
                        <input type='text' onChange={(e) => {
                            name = e.target.value;
                        }} placeholder="Team Name" required/>
                        <h2>Description</h2>
                        <input type='text' placeholder="Description" onChange={(e) => {
                            description = e.target.value;
                        }} required/>
                        <h2>TEAM BANNER</h2>
                        <input type='file' style={{width: '95%'}} onChange={(e) => header = e.target.files[0]}/><br></br>
                        <div style=
                        {
                            {
                                display: "flex",
                                alignItems: 'center',
                                justifyContent: 'center'
                            }
                        }>
                            {loading ? <p style=
                            {
                                {
                                    marginTop: 50,
                                    cursor: 'progress'
                                }
                            }>LOADING...</p> : <button type="submit" style=
                            {
                                {
                                    textAlign: 'center', 
                                    marginTop: 50, 
                                    width: 200, 
                                    height: 60, 
                                    borderRadius: 50,
                                    cursor: 'pointer',
                                    backgroundColor: 'grey',
                                    color: 'white',
                                    fontSize: 25
                                }
                            }>SUBMIT</button>}
                        </div>
                    </form>
                </div>
            </div>
        );
    }
    
    return (
        <div className="Teams">
            {hasTeam ? (<h1>HAS A TEAM</h1>) : 
            (page === 1 ? <div style=
                    {
                        {
                            textAlign: 'center',
                            color: 'grey',
                            fontSize: 10
                        }
                    }>
                        <h1>You haven’t joined any team yet. Find or create a team to get started!</h1><br></br>
                        <button id="team-btn" onClick={() => setPage(2)}>JOIN A TEAM</button>
                        <h1>OR</h1>
                        <button id="team-btn" onClick={() => setPage(3)}>CREATE A TEAM</button>
                    </div> : page === 3 ? <CreateATeam/> : page === 2 ? <SearchTeams/> : null)}
        </div>
    );
}

export default Teams