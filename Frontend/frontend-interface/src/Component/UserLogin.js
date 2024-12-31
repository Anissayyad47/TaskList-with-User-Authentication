import './Css files/UserLogin.css';
import { useNavigate } from "react-router-dom";
import { useState } from 'react';
import axios from 'axios';

function UserLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:5000/Login", {
        username,
        password,
      });

      setMessage(response.data.message);
      // Store the userId after successful login
      localStorage.setItem('userId', response.data.user.userId);

      // Redirect to TaskList
      navigate("/TaskList");

    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.error || "An error occurred");
    }
  };

  if (message === "Login successful") {
    navigate("/TaskList");
  }
  
  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login</h2>
        <form className="login-form" onSubmit={handleLogin}>
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
          <button className="login-button" type="submit">
            Login
          </button>
        </form>
        <p>Don't have an account? 
          <span className="createAcc" onClick={() => navigate("/signup")}>
            Create Account
          </span>
        </p>
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}
export default UserLogin;
