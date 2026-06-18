import React,{ useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles.css";

function Login() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

   async function handleLogin() {
    const response = await fetch(
        "https://collabortivecodeeditor.onrender.com/login",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                password
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        alert(data.message);
        return;
    }

    localStorage.setItem(
        "token",
        data.token
    );

    navigate("/");
}
    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>Login</h1>

                <input
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button onClick={handleLogin}>
                    Login
                </button>
            </div>
        </div>
    );
}

export default Login;