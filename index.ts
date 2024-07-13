import * as dotenv from 'dotenv';
import express from "express";
import http from "http";
import { Server } from "socket.io";
dotenv.config()
const app = express();
const server = http.createServer(app)
const io = new Server(server, {
    cors: {
    origin: process.env.CLIENT_URL, // Update with the URL of your Vite client
    methods: ["GET", "POST"]
  }
})
const PORT = process.env.PORT
const MAX_RUBIES = 10

import { Socket } from "socket.io";
import { DEFAULT_GAME_DATA, DEFAULT_PLAYER_DATA, IMAGE_NAMES, ImageEnum, MAP_HEIGHT, MAP_WIDTH } from "./shared/constants";
import { Player, Vec2 } from "./shared/types";

let gameData = structuredClone(DEFAULT_GAME_DATA)
let tilemap:string[] = []

let getRandomInt = (min:number, max:number) => { //max exclusive
  return Math.floor(Math.random() * (max-min) + min)
}


let addRubies = () => { 
  let rubies = gameData.rubyData
  while (Object.keys(rubies).length < MAX_RUBIES) { 
    let x = getRandomInt(1, MAP_WIDTH - 1)
    let y = getRandomInt(1, MAP_HEIGHT - 1)
    let position: Vec2 = { x: x, y: y }
    let id = JSON.stringify(position)
    if (id in rubies == false) { 
      gameData.rubyData[id] = true
    }

  }
}

for (let i = 0; i < MAP_WIDTH ; i++) { 
  for (let j = 0; j < MAP_HEIGHT; j++) { 
    if (j == 0 || j == MAP_HEIGHT - 1 || i == 0 || i == MAP_WIDTH-1) {
      tilemap.push(IMAGE_NAMES[ImageEnum.wall])
    } else {
      tilemap.push(IMAGE_NAMES[ImageEnum.floor])
    }
  }
}
io.on('connection', (socket:Socket) => {
  console.log(socket.id, 'connected')
  
  socket.emit('id', socket.id) 
  socket.emit('tilemap',tilemap)
  
  socket.on('playerData', (receivedClientData: Player) => {
    if (socket.id in gameData.playerData) {
      gameData.playerData[socket.id].position = receivedClientData.position
      gameData.playerData[socket.id].colour = receivedClientData.colour
      gameData.playerData[socket.id].name = receivedClientData.name
    } else { 
      gameData.playerData[socket.id] = structuredClone(DEFAULT_PLAYER_DATA)
    }

  })

  socket.on('collectedRubies', (collectedRubies) => { 
    for (let i = 0; i < collectedRubies.length; i++) {
      let ruby = collectedRubies[i]
      if (gameData.rubyData[ruby]) {
        gameData.playerData[socket.id].rubies += 1
        delete gameData.rubyData[ruby]
      }

    }
  })

  socket.on('disconnect', () => { 
    console.log(socket.id, 'disconnected')
    delete gameData.playerData[socket.id]
  })
})

server.listen(process.env.PORT, () => {
  console.log('listening on',process.env.PORT);
});

setInterval(() => { 
  io.emit('gameData',gameData)
}, 16.67)

setInterval(() => {
  addRubies()
  console.log(gameData.playerData)
}, 5000);