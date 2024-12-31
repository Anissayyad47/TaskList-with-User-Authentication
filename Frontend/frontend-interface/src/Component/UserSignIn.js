import { useState } from "react";
import "./Css files/UserSignIn.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function UserSignIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/sign-up", {
        username,
        password,
      });

      setMessage(response.data.message);
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.error || "An error occurred");
    }
  };
  if(message==="User registered successfully"){
    navigate("/TaskList")
  }

  return (
    <div className="sign-container">
      <div className="sign-box">
        <h2>Sign Up</h2>
        <form className="sign-form" onSubmit={handleSignUp}>
          <input 
            type="text" 
            placeholder="Enter Username" 
            className="input-field" 
            required 
            onChange={(e) => setUsername(e.target.value)} 
          />
          <input 
            type="password" 
            placeholder="Enter Password" 
            className="input-field" 
            onChange={(e) => setPassword(e.target.value)} 
          />
            <input 
            type="password" 
            placeholder="Conform Password" 
            className="input-field" 
            onChange={(e) => setPassword(e.target.value)} 
          />
          <button className="sign-button" type="submit">
            Sign In
          </button>
        </form>
        <p>Already have account? 
          <span className="loginAcc" onClick={() => navigate("/")}>
            Login
          </span>
        </p>
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}

export default UserSignIn;
