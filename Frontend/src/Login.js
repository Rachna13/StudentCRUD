import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === "admin@gmail.com" && password === "1234") {
      navigate("/students");
    } else {
      alert("Invalid Credentials");
    }
  };

  return (
    <div style={{
      backgroundImage: "url('/download.jpeg')",
      backgroundSize: "cover",
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }}>
      <form 
        onSubmit={handleLogin} 
        style={{ background: "rgba(255,255,255,0.9)", padding: "30px", borderRadius: "10px" }}
      >
        <h2>Login</h2>
        <input type="email" placeholder="Email" className="form-control mb-2"
          value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" className="form-control mb-2"
          value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit" className="btn btn-primary w-100">Login</button>
      </form>
    </div>
  );
}
