import chalk from 'chalk';

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
			res([200, `You joined the chat. There's ${Object.keys(usernames).length - 1} other user${Object.keys(usernames).length - 1 !== 1 ? 's' : ''} online.`]);
		}
	});
	socket.on('message', (text) => {
		if (socket.rooms.has('global')) {
			if (text.startsWith('/')) {
				const [command, ...args] = text.slice(1).split(' ');
				switch (command) {
				case 'nick':
					if (args.length > 0) {
						const newUsername = args.join(' ');
						if (Object.values(usernames).includes(newUsername)) {
							socket.emit('message', `${chalk.yellow(newUsername)} is already taken.`);
						} else {
							const oldUsername = usernames[socket.id];
							usernames[socket.id] = newUsername;
							socket.emit('message', `You are now known as ${newUsername}.`);
							socket.to('global').emit('message', `${chalk.yellow(oldUsername)} changed their name to ${chalk.green(newUsername)}.`);
						}
					} else {
						socket.emit('message', 'You must specify a new username.');
					}
					break;
				case 'tell':
					if (args.length > 1) {
						const [target, ...message] = args;
						for (const [id, username] of Object.entries(usernames)) {
							if (username === target) {
								io.to(socket.id).emit('message', chalk.green(`You whisper to ${target}: `) + message.join(' '));
								io.to(id).emit('message', `${chalk.green(usernames[socket.id] + ' whispers to you:')} ${message.join(' ')}`);
								break;
							}
						}
					}
				}
			} else {
				socket.to('global').emit('message', `${usernames[socket.id]}> ${text}`);
			}
		}
	});
	socket.on('disconnect', () => {
		socket.to('global').emit('message', `${usernames[socket.id]} has left the chat.`);
		delete usernames[socket.id];
	});
});
io.listen(port);