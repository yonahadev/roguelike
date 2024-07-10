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
let tilemap = []
let tileMapImages = ["wall.png","floor.png"]


let getRandomInt = (min, max) => { 
  return Math.floor(Math.random() * (max-min) + min)
}

for (let i = 0; i < 10; i++) { 
  for (let j = 0; j < 10; j++) { 
    let int = getRandomInt(0, tileMapImages.length)
    tilemap.push(tileMapImages[int])
  }
}

let updatePlayerData = (id, dataKey, dataValue) => { 
    if (playerData[id]) { 
      playerData[id][dataKey] = dataValue
    } else {
      playerData[id] = {}
      playerData[id][dataKey] = dataValue
    }
}

app.use(express.static(path.join(__dirname,'client')))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname,'client','index.html'))
});

io.on('connection', (socket) => {
  console.log(socket.id, 'connected')
  
  socket.emit('id', socket.id) 
  socket.emit('tilemap',tilemap)
  
  socket.on('playerPosition', (position) => { 
    updatePlayerData(socket.id,"position",position)
  })
  
  socket.on('startInfo', ({name,colour}) => { 
    updatePlayerData(socket.id, "name", name)
    updatePlayerData(socket.id, "colour", colour)
  })

  socket.on('disconnect', () => { 
    console.log(socket.id, 'disconnected')
    delete playerData[socket.id]
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
}, 3000);