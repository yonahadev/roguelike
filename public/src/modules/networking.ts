import { io } from "socket.io-client"
import { BUFFER_SIZE, DEFAULT_GAME_DATA } from "../../../shared/constants"
import { GameDictionary, PlayerDictionary, Projectile } from "../../../shared/types"
import { renderTime, timeSinceClientPinged } from "../main"

export let gameDataArray: GameDictionary[] = [structuredClone(DEFAULT_GAME_DATA)]
export let gameData:GameDictionary
export let interpolatedPlayerData: PlayerDictionary
export let tilemap: string[] = []
let oldPlayerData: PlayerDictionary
let newPlayerData: PlayerDictionary

const SERVER_URL = import.meta.env.VITE_SERVER_URL
export const socket = io(SERVER_URL)

export let localID: string

export let clientPingedTime = 0


let lastInterpolatedTime = 0
let timeBetweenData = 0
let interpolationCount = 10

socket.on('id', (id) => { 
  localID = id
  console.log('localID:',localID)
})

socket.on('gameData', (gameDataFromServer) => { 
  clientPingedTime = renderTime
  gameDataArray.push(gameDataFromServer)
  if (gameDataArray.length > BUFFER_SIZE+3) { 
    gameDataArray.splice(0,1)
  }  
  if (gameDataArray.length >= BUFFER_SIZE) { 
    let oldGameData = gameDataArray[gameDataArray.length-BUFFER_SIZE]
    gameData = gameDataArray[gameDataArray.length-BUFFER_SIZE+1]
    oldPlayerData = structuredClone(oldGameData.playerData)
    newPlayerData = structuredClone(gameData.playerData)
    interpolatedPlayerData = structuredClone(oldPlayerData)
    timeBetweenData = gameData.serverTime-oldGameData.serverTime
  }
})

socket.on('tilemap', (receivedTilemap) => { 
  tilemap = receivedTilemap
})

export const fireProjectile = (projectile:Projectile) => { 
  socket.emit("projectile",projectile)
}

export const interpolatePositions = (id:string) => {
  if (renderTime - lastInterpolatedTime > timeBetweenData / interpolationCount) { 
    let pos = interpolatedPlayerData[id].position
    let differenceX = newPlayerData[id].position.x - oldPlayerData[id].position.x
    let differenceY = newPlayerData[id].position.y - oldPlayerData[id].position.y
    pos.x = oldPlayerData[id].position.x + timeSinceClientPinged*differenceX/timeBetweenData
    pos.y = oldPlayerData[id].position.y + timeSinceClientPinged*differenceY/timeBetweenData
    
    let differencePheta = newPlayerData[id].orientation - oldPlayerData[id].orientation
    if (Math.abs(differencePheta) < 1) {
      interpolatedPlayerData[id].orientation = oldPlayerData[id].orientation + timeSinceClientPinged * differencePheta / timeBetweenData
    }
    lastInterpolatedTime = renderTime
  }
}