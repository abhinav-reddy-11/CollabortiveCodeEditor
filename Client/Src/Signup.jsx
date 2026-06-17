import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles.css";

function Signup() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    async function handleSignup() {
        await fetch("http://localhost:3000/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                password
            })
        });

        navigate("/login");
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>Signup</h1>

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

                <button onClick={handleSignup}>
                    Signup
                </button>
            </div>
        </div>
    );
}

export default Signup;