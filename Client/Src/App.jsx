import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { useNavigate } from "react-router-dom";
import "./styles.css";

function App() {
    const navigate = useNavigate();

    const { roomId } = useParams();

    const wsRef = useRef(null);

    const [content, setContent] = useState("");
    const [usersOnline, setUsersOnline] = useState(0);
    const [language, setLanguage] = useState("javascript");

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
            return;
        }

        const ws = new WebSocket("ws://localhost:3000");

        wsRef.current = ws;

        ws.onopen = () => {
            console.log("connected");

            const token = localStorage.getItem("token");

            ws.send(
                JSON.stringify({
                    type: "JOIN_ROOM",
                    roomId,
                    token
                })
            );
        };

        ws.onmessage = (event) => {
            console.log("received", event.data);

            const data = JSON.parse(event.data);

            switch (data.type) {
                case "INIT":
                    setContent(data.content);
                    break;
            }

            if (data.type === "TEXT_UPDATE") {
                setContent(data.content);
            }

            if (data.type === "USER_COUNT") {
                setUsersOnline(data.count);
            }
        };

        return () => {
            ws.close();
        };
    }, []);

    function updateContent(newContent) {
        setContent(newContent);

        if (
            wsRef.current &&
            wsRef.current.readyState === WebSocket.OPEN
        ) {
            wsRef.current.send(
                JSON.stringify({
                    type: "TEXT_UPDATE",
                    content: newContent
                })
            );
        }
    }

    return (
        <div>
            <div className="editor-header">
                <h3>Room: {roomId}</h3>

                <div className="editor-controls">
                    <span>{usersOnline} Online</span>

                    <select
                        value={language}
                        onChange={(e) =>
                            setLanguage(e.target.value)
                        }
                    >
                        <option value="javascript">
                            JavaScript
                        </option>

                        <option value="python">
                            Python
                        </option>

                        <option value="java">
                            Java
                        </option>

                        <option value="cpp">
                            C++
                        </option>
                    </select>
                </div>
            </div>

            <Editor
                height="90vh"
                language={language}
                theme="vs-dark"
                value={content}
                onChange={(value) =>
                    updateContent(value || "")
                }
            />
        </div>
    );
}

export default App;