export type Vec2 = {
  x: number
  y: number
}

export type Player = {
  name: string
  position: Vec2
  orientation: number
  character: string
  rubies: number
  attackLastFired: number
}

export type Projectile = {
  velocity: number
  position: Vec2
  lifetime: number
  timeProjected: number
  orientation: number
  owner: string
  image: number
}

export type Character = {
  attackCooldown: number
  hp: number
  projectile: Projectile
}


export type CharacterDictionary = {
  [key:string]:Character
}

export type PlayerDictionary = {
  [key:string]:Player
}

export type RubyDictionary = {
  [key:string]:boolean
}

export type GameDictionary = {
  playerData: PlayerDictionary,
  rubyData: RubyDictionary,
  projectileData: Projectile[]
  serverTime: number
}