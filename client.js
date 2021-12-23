// IMPORTING `socket.io-client` module
const io = require('socket.io-client');
// Creating client at the server, you need to pass url of your server where you hosted it.
const socket = io("http://localhost:3000");
// IMPORTING readline module to read from console.
const readline = require('readline');
// Creating an interface to get input from our console.
const rl = readline.createInterface({
  input: process.stdin,
});
// Getting users name.
console.log("What is your name?");
rl.question("What is your name?", (text) => {
    // Sending users name to server
    socket.emit('new user', text.trim());
    console.log("You joined the chat");
    process.stdout.write("> ");
});
// Listening for event `message` from our server (This will fire when server sends `message` event)
socket.on("message", (text) => {
    // Erasing Last line
    process.stdout.write("\r\x1b[K")
    console.log(text);
    process.stdout.write("> ");
});
// Prompting user to enter message.
rl.prompt();
// Fires when we input text from user.
rl.on('line', (text) => {
    // Sending message to our server.
    socket.emit('message', text.trim());
    process.stdout.write("> ");
    rl.prompt();
});