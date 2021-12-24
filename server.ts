// Create the socket.io server
import { createServer } from 'http';
import { Server } from 'socket.io';

const httpServer = createServer();
const io = new Server(httpServer);

const port = Number(process.env.PORT) || 3000;
const usernames = {} as { [key: string]: string };

// Listen for a connection
io.on('connection', (socket) => {
	console.log('New Connection: ', socket.id);
	// Listen for a 'new user' event
	socket.on('new user', (username, res) => {
		if (!res) return socket.emit('message', 'Your client is not supported.');
		if (Object.values(usernames).includes(username)) {
			res([400, 'Username already taken.']);
		} else {
			usernames[socket.id] = username;
			socket.join('global');
			socket.to('global').emit('message', `${username} has joined the chat.`);
			res([200, `You joined the chat. There's ${Object.keys(usernames).length - 1} other users online.`]);
		}
	});
	socket.on('message', (text) => {
		if (socket.rooms.has('global')) {
			socket.to('global').emit('message', `${usernames[socket.id]}> ${text}`);
		}
	});
	socket.on('disconnect', () => {
		socket.to('global').emit('message', `${usernames[socket.id]} has left the chat.`);
		delete usernames[socket.id];
	});
});
io.listen(port);