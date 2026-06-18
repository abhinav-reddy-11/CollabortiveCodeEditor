//     App.jsx
//    |
//    | new WebSocket("ws://localhost:3000")
//    |
//    v
// HTTP Server (3000)
//    |
//    | Upgrade Request
//    |
//    v
// WebSocket Server (wss)
//    |
//    | connection event
//    |
//    v
// wss.on("connection", (ws) => {})
    
    
    import express from "express";
    import bcrypt from "bcrypt";
    import {createServer} from "http";
    import { WebSocketServer } from "ws";
    import {pool} from "./db.js";
    import jwt from "jsonwebtoken";
    import cors from "cors";

    const JWT_SECRET = "mysecretkey";
    

    const app = express();
    app.use(cors());
    app.use(express.json());

    function authMiddleware(req, res, next){

        const authHeader = req.headers.authorization;

        if(!authHeader){
            return res.status(401).json({
                message:"no token provided"
            });
        }
       const token = authHeader.split(" ")[1];

       try{
        const decoded = jwt.verify(
            token,
            JWT_SECRET
        );
        req.user = decoded;
        next();
       }
       catch(err){
        return res.status(401).json({
            message:"Invalid Token"
        });
       }
    }

    app.post("/signup", async (req,res)=>{

        const {username, password} = req.body;

        const handlepassword = await bcrypt.hash(password, 10);

        await pool.query(
            `INSERT INTO users(username, password_hash) VALUES ($1,$2)`,
            [username, handlepassword]
        );

        res.json({
            message:"User Created"
        });
    })

    app.post("/login", async(req, res)=>{

        const{username, password} = req.body;

        const result = await pool.query(
            `SELECT * FROM users WHERE username = $1`,
            [username]
        );

        if(result.rows.length === 0){
            return res.status(404).json({
                message:"User not found"
            });
        }
        
        const user = result.rows[0];
        const passwordMatch = await bcrypt.compare(
            password,
            user.password_hash
        );

        if(!passwordMatch){
            return res.status(401).json({
                message:"invalid password"
            });
        }

        const token = jwt.sign(
            {
                userId : user.id,
                username: user.username
            },
            JWT_SECRET,
            {
                expiresIn:"7d"
            }
        );
        res.json({
            token
        });
    })

    app.get(
    "/me",
    authMiddleware,
    (req,res)=>{
        res.json({
            user: req.user
        });
    }
);

app.get(
    "/documents",
    authMiddleware,
    async (req, res) => {

        const documents = await pool.query(
            "SELECT * FROM documents WHERE owner_id = $1",
            [req.user.userId]
        );

        res.json({
            documents: documents.rows
        });
    }
);

    pool.query("SELECT NOW()")
    .then((res)=>{
        console.log("postgreSQL connected");
        console.log(res.rows[0]);
    })
    .catch((err)=>{
        console.error("database error:", err);
    })

//In a normal Express application, app.listen() is enough because Express internally creates an HTTP server and 
// starts listening for requests. However, when using Socket.IO or WebSockets, 
// we need direct access to the underlying HTTP
//  server because Socket.IO attaches itself to that server to handle WebSocket upgrade requests.
     //SERVER OBJECT
    const server = createServer(app);

 // wss is websocketserver instance it mangages websocket conn from clients,we attch this to hhtp server 
 //hhtp requests and web socket connections use the same port
 //http server routes normal requests to express and websocket upgrade requests to websocket server   
    const wss = new WebSocketServer({server});

//wss.on("connection") registers an event listener that fires whenever a new WebSocket client establishes 
// a connection with the server. The ws parameter represents that individual client connection and can be 
// used to send messages to or receive messages from that client.    

 function broadcastUserCount(roomId) {

    const room = rooms.get(roomId);

    if (!room) return;

    room.clients.forEach((client) => {
        client.send(
            JSON.stringify({
                type: "USER_COUNT",
                count: room.clients.size
            })
        );
    });
}

  const rooms = new Map();

//Each client that connects to a WebSocket server gets its own socket (connection object).
//  The server maintains a separate connection for every client, allowing it to identify which client
//  sent a message and to send messages to specific clients or all clients as needed.
    wss.on("connection", (ws) =>{
        console.log("client connected")
        
        
        ws.on("message",async (message) =>{

        // clients is a property provided by the WebSocketServer
        //the library internally maintains a collection of all connected sockets 

        console.log("received from client",message.toString());

        const data = JSON.parse(message.toString());
         switch(data.type)  {

            case "TEXT_UPDATE":{ 

            const room = rooms.get(ws.roomId)

            if(!room) break;

            room.content = data.content;

            await pool.query(
                "UPDATE documents SET content = $1 WHERE     room_id = $2",
                [data.content, ws.roomId] 
            );

            room.clients.forEach((client)=>{
                if(client !== ws){
                    client.send(message.toString())
                }
            });
        
        break;}
        

        case "JOIN_ROOM":{
           
                    const decoded = jwt.verify(
            data.token,
            JWT_SECRET
        );

        const userId = decoded.userId; 

            const result = await pool.query(
                "SELECT * FROM documents WHERE room_id = $1",
                [data.roomId]
            );

            if(result.rows.length === 0){
                await pool.query(
                    `INSERT INTO documents(room_id, content, language, owner_id) VALUES ($1,$2,$3,$4)`,
                    [data.roomId, "","javascript",userId] 
                );    
            }
            
            const doc = await pool.query(
                "SELECT * FROM documents WHERE room_id = $1",
                [data.roomId]
            );

           if(!rooms.has(data.roomId)){
                rooms.set(data.roomId, {
                    content:doc.rows[0].content,
                    language:doc.rows[0].language,
                    clients:new Set()
                });
            } 

             ws.roomId = data.roomId
            
           const room = rooms.get(data.roomId);
room.clients.add(ws);

broadcastUserCount(data.roomId);
            

            ws.send(
                JSON.stringify({
                    type:"INIT",
                    content:room.content,
                    language:room.language
                })
            )
            console.log("joined room", data.roomId)

            break;}
            case "CURSOR_MOVE": {

    const room = rooms.get(ws.roomId);

    if (!room) break;

    room.clients.forEach((client) => {

        if (client !== ws) {

            client.send(
                JSON.stringify({
                    type: "CURSOR_MOVE",
                    position: data.position
                })
            );

        }

    });

    break;
}
         }    

         
            
        })

        ws.on("close", () => {
         
            

       if(ws.roomId && rooms.has(ws.roomId)){

        const room = rooms.get(ws.roomId);
        room.clients.delete(ws);

        broadcastUserCount(ws.roomId);

        if(room.clients.size === 0){
            rooms.delete(ws.roomId);
        }

    }

    
    });
    })

    const port = process.env.PORT || 3000;

    app.get("/", (req,res) =>{
        res.send("server running");
    })

    server.listen(port,()=>{
        console.log(`listening to port ${port}`)
    });