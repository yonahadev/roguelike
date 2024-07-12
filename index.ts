import * as dotenv from 'dotenv';
import express from "express";
import http from "http";
import { Server } from "socket.io";
dotenv.config()
const app = express();
const server = http.createServer(app)
const io = new Server(server, {
    cors: {
    origin: "http://localhost:5173", // Update with the URL of your Vite client
    methods: ["GET", "POST"]
  }
})
const PORT = process.env.PORT

import { Socket } from "socket.io";
import { MAP_HEIGHT, MAP_WIDTH } from "./shared/constants";
import { GameDictionary, Player, PlayerDictionary, Vec2 } from "./shared/types";

let gameData: GameDictionary = {
  playerData: {},
  rubyData: []
}
let tilemap:string[] = []
let tileMapImages = ["wall.png", "floor.png"]

let getRandomInt = (min:number, max:number) => { //max exclusive
  return Math.floor(Math.random() * (max-min) + min)
}

for (let i = 0; i < 10; i++) { 
  let x = getRandomInt(1, MAP_WIDTH - 1)
  let y = getRandomInt(1, MAP_HEIGHT - 1)
  let position: Vec2 = { x: x, y: y }
  gameData.rubyData.push(position)
}

for (let i = 0; i < MAP_WIDTH ; i++) { 
  for (let j = 0; j < MAP_HEIGHT; j++) { 
    if (j == 0 || j == MAP_HEIGHT - 1 || i == 0 || i == MAP_WIDTH-1) {
      tilemap.push(tileMapImages[0])
    } else {
      tilemap.push(tileMapImages[1])
    }
  }
}
io.on('connection', (socket:Socket) => {
  console.log(socket.id, 'connected')
  
  socket.emit('id', socket.id) 
  socket.emit('tilemap',tilemap)
  
  socket.on('playerData',(receivedClientData:Player) => {
    gameData["playerData"][socket.id] = receivedClientData
  })

  socket.on('disconnect', () => { 
    console.log(socket.id, 'disconnected')
    delete gameData["playerData"][socket.id]
  })
})

server.listen(process.env.PORT, () => {
  console.log('listening on',process.env.PORT);
});

setInterval(() => { 
  io.emit('gameData',gameData)
}, 16.67)

setInterval(() => {
  console.log(gameData)
}, 3000);