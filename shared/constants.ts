import { GameDictionary, Player } from "./types"

export const MAP_WIDTH = 20
export const MAP_HEIGHT = 20

export const DEFAULT_GAME_DATA:GameDictionary = {
  playerData: {},
  rubyData: {}
}

export const DEFAULT_PLAYER_DATA: Player = {
  name: "unnamed player",
  position: {x:5,y:5},
  colour: "black",
  rubies: 0
}

export const IMAGE_NAMES = ['floor', 'wall', 'ruby', "baseEnemy", "electricCharacter", "fireCharacter", "iceCharacter"]

export enum ImageIndices { 
  floor = IMAGE_NAMES[0],
  wall,
  ruby,
  baseEnemy,
  electricCharacter,
  fireCharacter,
  iceCharacter,
}