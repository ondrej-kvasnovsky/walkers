const express = require('express');
const app = express();
const http = require('http').Server(app);
const path = require('path');
const io = require('socket.io')(http);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.use('/public', express.static(path.join(__dirname, 'public')));

let game1 = {
  players: {}
}

let cols = 20;
let rows = 10;
const createMap = function () {
  let map1 = new Array(cols);
  for (let i = 0; i < cols; i++) {
    map1[i] = new Array(rows);
  }
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      map1[i][j] = isWall() ? 1 : 0;
    }
  }
  return map1;
};
const isWall = () => {
  if (Math.random() < 0.4) {
    return true;
  }
  return false;
};
let map = createMap();

io.on('connection', function (socket) {
  console.log('a user connected');
  io.emit('startGame', { map });
  socket.on('moving', function (msg) {
    game1.players[msg.id] = {};
    game1.players[msg.id].i = msg.i;
    game1.players[msg.id].j = msg.j;
    console.log('message', game1);
    io.emit('moving', game1);
  });
  socket.on('disconnect', function (msg) {
    console.log('user disconnected', msg);
    delete game1.players[msg.id]
  });
});

http.listen(3000, function () {
  console.log('Listening on localhost:3000');
});