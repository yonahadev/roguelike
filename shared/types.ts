export type Vec2 = {
  x: number
  y: number
}

export type Player = {
  name: string
  position: Vec2
  character: string
  rubies: number
}

export type PlayerDictionary = {
  [key:string]:Player
}

export type RubyDictionary = {
  [key:string]:boolean
}

export type GameDictionary = {
  playerData: PlayerDictionary,
  rubyData: RubyDictionary
}