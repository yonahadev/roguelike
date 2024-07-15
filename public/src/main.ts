import { DEFAULT_PLAYER_DATA, MAP_HEIGHT, MAP_WIDTH } from "../../shared/constants";
import './index.css';
import { canvas, context, drawImage, drawPlayerWithNameTag, getImage, images } from "./modules/drawing";
import { calculateProjectilePosition, handleMovement } from "./modules/gameplay";
import { canMove, clientProjectiles, resizeCanvas } from "./modules/input";
import { clientPingedTime, gameData, gameDataArray, interpolatedPlayerData, interpolatePositions, localID, socket, tilemap } from "./modules/networking";

export const PLAYER_SPEED = 0.1
export const SCALE = 100

let lastSendTime = new Date().getTime()
let lastUpdateTime = new Date().getTime()
export let localPlayer = structuredClone(DEFAULT_PLAYER_DATA)

export let renderTime = 0
export let timeSinceClientPinged = 0

// export let projectiles: Projectile[] = []
// let collectedRubies: string[] = []

let renderFunction = (time: number) => {
  renderTime = time
  timeSinceClientPinged = renderTime-clientPingedTime
  if (context && canvas) {
    window.requestAnimationFrame(renderFunction)
    context.clearRect(0, 0, canvas.width, canvas.height)
    let offsetX = (canvas.width - SCALE) / 2
    let offsetY = (canvas.height - SCALE) / 2
    let cameraOffsetX = (-localPlayer.position.x * SCALE + offsetX)
    let cameraOffsetY = (-localPlayer.position.y * SCALE + offsetY)
    if (tilemap.length > 0) {
      for (let i = 0; i < MAP_WIDTH * MAP_HEIGHT; i++) {
        let column = Math.floor(i / MAP_WIDTH)
        let row = i % MAP_HEIGHT
        context.imageSmoothingEnabled = false
        let image = images[tilemap[i]]
        let x = column * SCALE + Math.floor(cameraOffsetX)
        let y = row * SCALE + Math.floor(cameraOffsetY)
        drawImage(image, x, y, 1, 1)
      }
    }
    drawPlayerWithNameTag(localPlayer, offsetX, offsetY)

    // let rubyString = `rubies: ${localPlayer.rubies}`
    // let rubyTextDimensions = getTextDimensions(rubyString)
    // if (rubyTextDimensions) {
    //   let height = rubyTextDimensions.y
    //   let width = rubyTextDimensions.x
    //   drawText(rubyString, canvas.width - width - 50, height + 50)
    //   drawImage(getImage(ImageEnum.ruby), canvas.width - width - SCALE - 10, height + 10, 0.5, 0.5)
    // }

    if (gameDataArray.length >= 2) {
      Object.entries(interpolatedPlayerData).forEach(([playerID, interpolatedPlayerData]) => {
        if (playerID != localID && playerID && interpolatedPlayerData) {
          if (interpolatedPlayerData) {
            interpolatePositions(playerID)
            drawPlayerWithNameTag(interpolatedPlayerData, interpolatedPlayerData.position.x * SCALE + cameraOffsetX, interpolatedPlayerData.position.y * SCALE + cameraOffsetY)
          }
        }
      })
    }
    for (let i = 0; i < gameData.projectileData.length; i++) {
      let projectile = gameData.projectileData[i]
      if (projectile.owner != localID) { 
        let position = calculateProjectilePosition(projectile)
        let ownerPosition = interpolatedPlayerData[projectile.owner].position
        drawImage(getImage(projectile.image), (position.x + ownerPosition.x) * SCALE + cameraOffsetX, (position.y + ownerPosition.y) * SCALE + cameraOffsetY, 1, 1)
        console.log("Projectile from:",projectile.owner)
      }
    }
    for (let i = 0; i < clientProjectiles.length; i++ ) { 
      let projectile = clientProjectiles[i]
      let position = calculateProjectilePosition(projectile)
      drawImage(getImage(projectile.image), position.x * SCALE + offsetX, position.y * SCALE + offsetY, 1, 1)
      if (gameData.serverTime - projectile.timeProjected > projectile.lifetime) { 
        clientProjectiles.splice(i,1)
      }
      console.log(position.x,position.y)
    }
    // let players = Object.keys(gameData.playerData)
    // let height = 0
    // for (let i = 0; i < players.length; i++) {
    //   let player = gameData.playerData[players[i]]
    //   let text = `${player.name} rubies: ${player.rubies}`
    //   let dimensions = getTextDimensions(text)
    //   if (dimensions) { 
    //     drawText(text, 0, height+50)
    //     height += dimensions.y
    //   } 
    // }
    // Object.keys(gameData.rubyData).forEach((key:string) => { 
    //   let position = JSON.parse(key)
    //   drawImage(getImage(ImageEnum.ruby), position.x*SCALE+Math.floor(cameraOffsetX),position.y*SCALE+Math.floor(cameraOffsetY), 1, 1)
    // })

    let currentTime = new Date().getTime()
    let timeSinceUpdate = currentTime - lastUpdateTime
    let timeSinceSend = currentTime - lastSendTime
    if (timeSinceSend > 16.67) { 
      lastSendTime = currentTime
      socket.emit('playerData', localPlayer)
      // if (collectedRubies.length > 0) { 
      //   socket.emit('collectedRubies', collectedRubies)
      //   collectedRubies = []
      // }

    }
    if (timeSinceUpdate > 16.67) {
      lastUpdateTime = currentTime
      if (canMove) { 
        handleMovement()
        // handleRubyCollection()
      }

    }
  }
}

resizeCanvas()
window.requestAnimationFrame(renderFunction)
