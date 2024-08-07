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
import { DEFAULT_GAME_DATA, DEFAULT_PLAYER_DATA, IMAGE_NAMES, ImageEnum, MAP_HEIGHT, MAP_WIDTH, TICK_MS } from "./shared/constants";
import { Player, Projectile, Vec2 } from "./shared/types";
import { getRandomInt } from './shared/utils';

let gameData = structuredClone(DEFAULT_GAME_DATA)
let tilemap:string[] = []


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
  
  socket.on('projectile', (projectile: Projectile) => { 
    gameData.projectileData.push(projectile)
  })

  socket.on('playerData', (receivedClientData: Player) => {
    if (socket.id in gameData.playerData) {
      gameData.playerData[socket.id].position = receivedClientData.position
      gameData.playerData[socket.id].character = receivedClientData.character
      gameData.playerData[socket.id].name = receivedClientData.name
      gameData.playerData[socket.id].orientation = receivedClientData.orientation
      gameData.playerData[socket.id].attackLastFired = receivedClientData.attackLastFired
    } else { 
      gameData.playerData[socket.id] = structuredClone(DEFAULT_PLAYER_DATA)
    }

  })

  // socket.on('collectedRubies', (collectedRubies) => { 
  //   for (let i = 0; i < collectedRubies.length; i++) {
  //     let ruby = collectedRubies[i]
  //     if (gameData.rubyData[ruby]) {
  //       gameData.playerData[socket.id].rubies += 1
  //       delete gameData.rubyData[ruby]
  //     }

  //   }
  // })

  socket.on('disconnect', () => { 
    console.log(socket.id, 'disconnected')
    delete gameData.playerData[socket.id]
  })
})

server.listen(PORT, () => {
  console.log('listening on',PORT);
});

setInterval(() => { 
  gameData.serverTime += TICK_MS
  io.emit('gameData',gameData)
}, TICK_MS)

setInterval(() => {
  let projectiles = gameData.projectileData
  for (let i = 0; i < projectiles.length; i++) { 
    let projectile = projectiles[i]
    if (gameData.serverTime - projectile.timeProjected > projectile.lifetime) { 
      projectiles.splice(i,1)
    }
  }
  console.log(projectiles)
}, 1000);