const express = require("express");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = express();

    // Example: Add your custom API route or middleware here.
    server.get("/api/test", (req, res) => {
        res.json({ message: "Custom API route working!" });
    });

    // WebSocket integration
    const httpServer = require("http").createServer(server);
    const io = new Server(httpServer, {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket) => {
        console.log("New client connected");
        socket.on("joinGroup", (groupId) => {
            socket.join(groupId);
            console.log(`User joined group ${groupId}`);
        });
        socket.on("sendMessage", (message) => {
            io.to(message.groupId).emit("newMessage", message);
        });
        socket.on("disconnect", () => {
            console.log("Client disconnected");
        });
    });

    // Default handler for Next.js pages
    server.all("*", (req, res) => {
        return handle(req, res);
    });

    // Start with port 3001 to avoid conflicts with Next.js dev server
    const PORT = process.env.PORT || 3000;
    
    const startServer = (port) => {
        httpServer.listen(port, () => {
            console.log(`> Ready on http://localhost:${port}`);
        }).on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.log(`Port ${port} is already in use, trying port ${port + 1}`);
                startServer(port + 1);
            } else {
                console.error('Server error:', err);
            }
        });
    };
    
    startServer(PORT);
});
