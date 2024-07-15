import { collideableTiles } from "../../../shared/constants"
import { Projectile, Vec2 } from "../../../shared/types"
import { getTileAtPosition } from "../../../shared/utils"
import { localPlayer, PLAYER_SPEED, timeSinceClientPinged } from "../main"
import { inputQueue } from "./input"
import { gameData, tilemap } from "./networking"

export const checkCollisions = (position1:Vec2,dimensions1:Vec2,position2:Vec2,dimensions2:Vec2) => {
  return (position1.x < position2.x + dimensions2.x && 
          position1.x + dimensions1.x > position2.x &&
          position1.y < position2.y + dimensions2.y && 
          position1.y + dimensions1.y > position2.y
  )
}

export const checkTileCollision = (pos:Vec2) => { 
  let topLeft = getTileAtPosition(tilemap,Math.floor(pos.x), Math.floor(pos.y))
  let topRight = getTileAtPosition(tilemap,Math.floor(pos.x) + 1, Math.floor(pos.y))
  let bottomLeft = getTileAtPosition(tilemap,Math.floor(pos.x), Math.floor(pos.y)+1)
  let bottomRight = getTileAtPosition(tilemap,Math.floor(pos.x) + 1, Math.floor(pos.y) + 1)
  return collideableTiles.has(topLeft) || collideableTiles.has(topRight) || collideableTiles.has(bottomLeft) || collideableTiles.has(bottomRight)
}

export const calculateProjectilePosition = (projectile: Projectile) => {
  let velocity = projectile.velocity
  let time = gameData.serverTime + timeSinceClientPinged - projectile.timeProjected
  let pheta = projectile.orientation
  let x = velocity * time * Math.sin(pheta)
  let y = -velocity * time * Math.cos(pheta)
  return {x:x,y:y}
}
// let handleRubyCollection = () => { 
//   Object.keys(gameData.rubyData).forEach((key:string) => { 
//     let position = JSON.parse(key)
//     let collision = checkCollisions(localPlayer.position, { x: 1, y: 1 }, position, { x: 1, y: 1 })

//     if (collision) { 
//       delete gameData.rubyData[key]
//       collectedRubies.push(key)
//     }
//   })
// }
export const handleMovement = () => { 
  let input1 = [...inputQueue][0]
  let input2 = [...inputQueue][1]
  const diagonalSpeed = PLAYER_SPEED / Math.sqrt(2)
  let amountToMove: Vec2 = {x:0,y:0}
  switch (true) { 
    case (input1 == "w" && input2 == undefined):
      amountToMove.y -= PLAYER_SPEED
      break
    case (input1 == "a" && input2 == undefined):
      amountToMove.x -= PLAYER_SPEED
      break
    case (input1 == "s" && input2 == undefined):
      amountToMove.y += PLAYER_SPEED
      break
    case (input1 == "d" && input2 == undefined):
      amountToMove.x += PLAYER_SPEED
      break
    case (input1 == "w" && input2 == "d" || input2 == "w" && input1 == "d"):
      amountToMove.x += diagonalSpeed
      amountToMove.y -= diagonalSpeed
      break
    case (input1 == "w" && input2 == "a" || input2 == "w" && input1 == "a"):
      amountToMove.x -= diagonalSpeed
      amountToMove.y -= diagonalSpeed
      break
    case (input1 == "s" && input2 == "a" || input2 == "s" && input1 == "a"):
      amountToMove.x -= diagonalSpeed
      amountToMove.y += diagonalSpeed
      break
    case (input1 == "s" && input2 == "d" || input2 == "s" && input1 == "d"):
      amountToMove.x += diagonalSpeed
      amountToMove.y += diagonalSpeed
      break
  }
  localPlayer.position.x += amountToMove.x
  if (checkTileCollision(localPlayer.position)) { 
    if (amountToMove.x < 0) {
      localPlayer.position.x -= amountToMove.x
      localPlayer.position.x = Math.floor(localPlayer.position.x)
    } else { 
      localPlayer.position.x -= amountToMove.x
      localPlayer.position.x = Math.floor(localPlayer.position.x)+0.999
    }
  }
  localPlayer.position.y += amountToMove.y
  if (checkTileCollision(localPlayer.position)) {
    if (amountToMove.y < 0) {
      localPlayer.position.y -= amountToMove.y
      localPlayer.position.y = Math.floor(localPlayer.position.y)
    } else { 
      localPlayer.position.y -= amountToMove.y
      localPlayer.position.y = Math.floor(localPlayer.position.y)+0.999
    }
  }
}