const path = require("path")
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io")
const io = new Server(server)
const PORT = process.env.PORT

//format of playerData[player][position] etc
let playerData = {}

app.use(express.static(path.join(__dirname,'client')))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname,'client','index.html'))
});

io.on('connection', (socket) => {
  console.log(socket.id, 'connected')
  
  socket.emit('id', socket.id) 
  
  socket.on('playerPosition', (position) => { 
    console.log(position)
    if (playerData[socket.id]) { 
      playerData[socket.id]["position"] = position
    } else {
      playerData[socket.id] = {}
      playerData[socket.id]["position"] = position
    }
  })
  
  socket.on('disconnect', () => { 
    console.log(socket.id, 'disconnected')
  })
})

server.listen(PORT, () => {
  console.log('listening on',PORT);
});

setInterval(() => { 
  io.emit('playerData',playerData)
}, 20)

setInterval(() => {
  console.log(playerData)
}, 1000);