// Libs
const express = require('express');
const socketIO = require('socket.io');

// Connection data
const connection_data = {
	index: "/views/index.html",
	ip: "127.0.0.1",
	port: process.env.PORT || 6060
};

// Run express
let app = express();

app.get('/', function (req, res) {
	res.sendFile(connection_data.index, { root: __dirname })
});

app.use(express.static("public"));

const server = express().use((req, res) => res.sendFile(
	connection_data.index, {
	root: __dirname
})).listen(connection_data.port, () =>
	console.log(`Sistema iniciado, URL: ${connection_data.port}`)
);

// Chat users array
let connectedUsers = [];

const io = socketIO(server);

io.on("connection", function (socket) {

	socket.on("userLogin", function (nome, callback) {
		if (!(nome in connectedUsers)) {
			// Add user to connectedUsers array
			socket.nome = nome;
			connectedUsers[nome] = socket;
			io.sockets.emit("updateConnectedUsers", Object.keys(connectedUsers));
			// Send welcome message on user login
			let welcomeMessage = nome + " entrou no bate-papo!";
			io.sockets.emit("userUpdateMessage", { message: welcomeMessage, sender: 'Sistema', date: getCurrentDate(), type: 'welcome' });
			callback(3);
		} else {
			callback(4);
		}
	});

	socket.on("userSendMessage", function (data, callback) {
		io.sockets.emit("userUpdateMessage", { message: data.message, sender: socket.nome, date: getCurrentDate(), type: '' });
		callback();
	});

	socket.on("disconnect", function () {
		if (socket.nome) {
			// Remove user in the array list
			delete connectedUsers[socket.nome];
			io.sockets.emit("updateConnectedUsers", Object.keys(connectedUsers));
			// Send exit message (type: exit)
			let exit_message = socket.nome + " saiu do bate-papo";
			io.sockets.emit("userUpdateMessage", { message: exit_message, sender: 'Sistema', date: getCurrentDate(), type: 'exit' });
		} else {
			return
		}
	});
});

function getCurrentDate() {
	let date = new Date();
	let hour = (date.getHours() < 10 ? '0' : '') + date.getHours();
	let minutes = (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();

	return hour + ":" + minutes;
}

