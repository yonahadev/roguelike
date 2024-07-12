export type Vec2 = {
  x: number
  y: number
}

export type Player = {
  name: string
  position: Vec2
  colour: string
}

export type PlayerDictionary = {
  [key:string]:Player
}

export type GameDictionary = {
  playerData: PlayerDictionary,
  rubyData: Vec2[]
}