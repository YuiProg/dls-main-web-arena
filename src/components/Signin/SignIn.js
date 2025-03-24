import React, { useState, useEffect } from "react";
import { auth, googleProvider, facebookProvider, DB } from "../firebase-config";
import { createUserWithEmailAndPassword, signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { NavLink, useNavigate } from "react-router";
import './Signin.css';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [C_PASSWORD, setC_PASSWORD] = useState(null);
  const [accountUser, setACCUSER] = useState('');

  // Redirect logged-in users to the dashboard
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/dashboard");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (formData.password === C_PASSWORD) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const userID = userCredential.user;

        await setDoc(doc(DB, 'users', userID.uid), {
          id: userID.uid,
          email: formData.email,
          username: `${formData.firstName} ${formData.lastName}`,
          darkcoins: 0,
          wins: 0,
          losses: 0,
          tournaments: 0,
          friends: [],
          friendRQ: [],
          team: []
        }).then(() => {
          alert('USER CREATED');
          navigate('/Login');
        });

      } catch (error) {
        alert(error.message);
      }
    } else {
      alert('PASSWORD DOES NOT MATCH!');
      setC_PASSWORD("");
      setFormData({ firstName: "", lastName: "", email: "", password: "" });
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const userGOGL = await signInWithPopup(auth, googleProvider);
      const user = userGOGL.user;

      const accounts = doc(DB, 'users', user.uid);

      const accs = await getDoc(accounts);

      if (accs.exists()) {
        return;
      } else {
        await setDoc(doc(DB, 'users', user.uid), {
          email: user.email,
          username: user.displayName,
          darkcoins: 0,
          wins: 0,
          losses: 0,
          tournaments: 0,
          friends: [],
          friendRQ: [],
          team: []
        }).then(() => {
          alert('SIGNED UP WITH GOOGLE!');
          navigate('/dashboard');
        });
      }

    } catch (error) {
      alert(error.message);
    }
  };

  const handleFacebookSignup = async () => {
    try {
      await signInWithPopup(auth, facebookProvider);
      alert("Signed up with Facebook!");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <>
      <div className="signup">
        <img src={require("../images/unnamed.jpg")} style={{
          position: 'absolute',
          zIndex: -5,
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center'
        }} />
        <NavLink to='../HomePage' style={{
          position: 'absolute',
          top: '20px',
          right: '80px',
          color: 'white',
          textDecoration: 'none',
          fontSize: '16px',
          fontWeight: 'bold'
        }}>
          Home
        </NavLink>
        <div className="signup-container">
          <h2>CREATE NEW ACCOUNT</h2>
          <form onSubmit={handleSignup}>
            <div className="input-group">
              <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required />
              <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required />
            </div>
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
            <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
            <input type="password" placeholder="Confirm Password" value={C_PASSWORD} onChange={(e) => setC_PASSWORD(e.target.value)} required />
            <div className="social-buttons">
              <button type="button" className="facebook-btn" onClick={handleFacebookSignup}>
                <FaFacebook size={24} color="white" />
              </button>
              <button type="button" className="google-btn" onClick={handleGoogleSignup}>
                <FcGoogle size={24} />
              </button>
            </div>
            <button type="submit" className="create-account-btn">CREATE ACCOUNT</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Signup;
