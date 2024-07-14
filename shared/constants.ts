import { CharacterDictionary, GameDictionary, Player } from "./types"

export const MAP_WIDTH = 20
export const MAP_HEIGHT = 20

export const TICK_RATE = 10
export const TICK_MS = 1000/TICK_RATE

export const DEFAULT_GAME_DATA:GameDictionary = {
  playerData: {},
  rubyData: {},
  serverTime: 0
}

export const DEFAULT_PLAYER_DATA: Player = {
  name: "unnamed player",
  position: {x:5,y:5},
  character: "electricCharacter",
  orientation:0,
  rubies: 0,
  attackLastFired: 0
}

export const IMAGE_NAMES = ['floor', 'wall', 'ruby', "baseEnemy", "electricCharacter", "fireCharacter", "iceCharacter","fireball"]

export enum ImageEnum { 
  floor,
  wall,
  ruby,
  baseEnemy,
  electricCharacter,
  fireCharacter,
  iceCharacter,
  fireball,
}

export const collideableTiles = new Set([IMAGE_NAMES[ImageEnum.wall]])

export const characterData: CharacterDictionary = { 
  fireCharacter: { 
    attackCooldown: 1000,
    hp: 10,
    projectile: {
      lifetime: 300,
      position: { x: 0, y: 0 },
      velocity: 2,
      timeProjected: 0,
      orientation: 0,
    }
  }
}