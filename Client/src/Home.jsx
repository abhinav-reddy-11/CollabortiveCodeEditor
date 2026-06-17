import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./styles.css";

function Home() {
    const [roomId, setRoomId] = useState("");
    const navigate = useNavigate();

    const isAuthenticated = !!localStorage.getItem("token");

    function createRoom() {
        const newRoomId = Math.random()
            .toString(36)
            .substring(2, 8);

        navigate(`/project/${newRoomId}`);
    }

    function joinRoom() {
        if (!roomId.trim()) return;

        navigate(`/project/${roomId}`);
    }

    function logout() {
        localStorage.removeItem("token");
        navigate("/");
        window.location.reload();
    }

    return (
        <div className="home-container">
            <div className="home-card">
                <h1>Collaborative Code Editor</h1>

                {isAuthenticated ? (
                    <>
                        <button onClick={logout}>
                            Logout
                        </button>

                        <br />
                        <br />

                        <button onClick={createRoom}>
                            Create Room
                        </button>

                        <br />
                        <br />

                        <div
                            style={{
                                display: "flex",
                                gap: "10px",
                                justifyContent: "center"
                            }}
                        >
                            <input
                                type="text"
                                placeholder="Enter Room ID"
                                value={roomId}
                                onChange={(e) =>
                                    setRoomId(e.target.value)
                                }
                            />

                            <button onClick={joinRoom}>
                                Join Room
                            </button>
                        </div>
                    </>
                ) : (
                    <div
                        style={{
                            display: "flex",
                            gap: "10px",
                            justifyContent: "center"
                        }}
                    >
                        <Link to="/login">
                            <button>Login</button>
                        </Link>

                        <Link to="/signup">
                            <button>Signup</button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Home;