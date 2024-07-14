import { io } from "socket.io-client"
import { DEFAULT_GAME_DATA } from "../../../shared/constants"
import { localPlayer } from "../main"

export let gameData = structuredClone(DEFAULT_GAME_DATA)
export let tilemap:string[] = []

const SERVER_URL = import.meta.env.VITE_SERVER_URL
export const socket = io(SERVER_URL)

export let localID: string

socket.on('id', (id) => { 
  localID = id
  console.log('localID:',localID)
})
socket.on('gameData', (gameDataFromServer) => { 
  gameData = gameDataFromServer
  let localPlayerFromServer = gameData.playerData[localID]
  localPlayer.rubies = localPlayerFromServer.rubies
})

socket.on('tilemap', (receivedTilemap) => { 
  tilemap = receivedTilemap
})
