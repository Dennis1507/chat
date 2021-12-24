// LOADING environmental variables
import * as dotenv from 'dotenv';
dotenv.config();

// IMPORTING 'socket.io-client' module
import { io } from 'socket.io-client';

// Creating client at the server
const socket = io(process.env.ADDRESS ? `${process.env.ADDRESS}:3000` : 'http://localhost:3000', { forceNew: true });
console.log('Connecting...');

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
				if (res[0] === 400) {
					newUser();
				} else if (res[0] !== 200) {
					rl.close();
				} else {
					process.stdout.write('> ');
					rl.prompt();
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