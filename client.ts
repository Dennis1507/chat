// LOADING environmental variables
import * as dotenv from 'dotenv';
dotenv.config();

// IMPORTING 'socket.io-client' module
import { io } from 'socket.io-client';

// Creating client at the server
console.log('Connecting...');
const socket = io(process.env.ADDRESS || 'http://localhost:3000', { forceNew: true });

// IMPORTING readline module to read from console.
import * as readline from 'readline';

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

socket.on('connect', () => {
	console.log('Connected.');
	function newUser() {
		rl.question('Enter your name: ', (username) => {
			socket.emit('new user', username, (res: Array<unknown>) => {
				console.log(res[1]);
				if (res[0] === 200) {
					process.stdout.write('\n> ');
					rl.prompt();
				} else if (res[0] === 400) {
					newUser();
				} else {
					console.log('Something went wrong. Check for updates on the GitHub repo:');
					console.log('https://github.com/Dennis1507/chat/releases');
				}
			});
		});
	}
	newUser();
});

socket.on('message', (text) => {
	// Erasing last line
	process.stdout.clearLine(0);
	process.stdout.cursorTo(0);
	console.log(text);
	process.stdout.write('> ');
	rl.prompt(true);
});

rl.on('line', (text) => {
	socket.emit('message', text.trim());
	process.stdout.write('> ');
	rl.prompt();
});