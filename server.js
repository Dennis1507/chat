// Created a socket.io server
const io = require("socket.io")();
// This should be a free port on our server.
const PORT = process.env.PORT || 3000;
// Created a empty user object, This will store names of our users.
const users = {};
// Listening for a connection event (This event fires when a client is connected to your server)
io.on("connection", (socket) => {
	console.log("New Connection: " + socket.id);
	// If user emitted a `new user` event, This callback will be called with his name.
    socket.on('new user', (name) => {
        // Storing his name
        users[socket.id] = name;
        // Emitting an event to all users except that user.
        socket.broadcast.emit("message", `${name} joined the chat.`)
    });
    // Listening for a `message` event.
    socket.on('message', (text) => {
        // Emitting an event to all users except that user.
        socket.broadcast.emit("message", `${users[socket.id]}> ${text}`);
    });
});
// Starting up server on PORT
io.listen(PORT);