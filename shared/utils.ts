import { MAP_WIDTH } from "./constants"
import { Vec2 } from "./types"

export const getTileAtPosition = (array: string[],x:number,y:number) => { 
  return array[y*MAP_WIDTH+x]
}

export const getRandomInt = (min: number, max: number) => { //max exclusive
  return Math.floor(Math.random() * (max - min) + min)
}