const path = require("path")

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io")
const io = new Server(server)

app.use(express.static(path.join(__dirname,'client')))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname,'client','index.html'))
});

io.on('connection', (socket) => {
  console.log(socket, ' user connected')
  socket.emit('id',socket.id)
  socket.on('playerPosition', (position) => { 
    console.log(socket.id, position)
    socket.broadcast.emit('playerPosition', {id:socket.id,vector2:position})
})
})



server.listen(3000, () => {
  console.log('listening on localhost:3000');
});