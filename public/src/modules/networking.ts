import { io } from "socket.io-client"
import { DEFAULT_GAME_DATA, TICK_MS } from "../../../shared/constants"
import { GameDictionary, Player, PlayerDictionary } from "../../../shared/types"
import { renderTime } from "../main"

export let gameData: GameDictionary[] = [structuredClone(DEFAULT_GAME_DATA)]
export let interpolatedPlayerData: PlayerDictionary
export let tilemap: string[] = []
let oldData: PlayerDictionary
let newData: PlayerDictionary

const SERVER_URL = import.meta.env.VITE_SERVER_URL
export const socket = io(SERVER_URL)

export let localID: string



let clientLastUpdateTime = 0
let lastInterpolatedTime = 0

let interpolationCount = 50

socket.on('id', (id) => { 
  localID = id
  console.log('localID:',localID)
})
socket.on('gameData', (gameDataFromServer) => { 
  clientLastUpdateTime = renderTime
  gameData.push(gameDataFromServer)
  if (gameData.length > 5) { 
    gameData.splice(0,1)
  }  
  if (gameData.length >= 2) { 
    oldData = structuredClone(gameData[gameData.length-2].playerData)
    newData = structuredClone(gameData[gameData.length-1].playerData)
    interpolatedPlayerData = structuredClone(oldData)
  }

})

socket.on('tilemap', (receivedTilemap) => { 
  tilemap = receivedTilemap
})

export const interpolatePositions = (time: number) => {
  let timeSinceUpdate = time - clientLastUpdateTime
  if (time-lastInterpolatedTime > TICK_MS / interpolationCount) { 
    Object.keys(interpolatedPlayerData).forEach((id) => { 
      if (id != localID) { 
        let pos = interpolatedPlayerData[id].position
        let differenceX = newData[id].position.x - oldData[id].position.x
        let differenceY = newData[id].position.y - oldData[id].position.y
        pos.x = oldData[id].position.x + timeSinceUpdate*differenceX/TICK_MS
        pos.y = oldData[id].position.y + timeSinceUpdate*differenceY/TICK_MS
        console.log(timeSinceUpdate)
        lastInterpolatedTime = time
      }

      
  })
  }
}