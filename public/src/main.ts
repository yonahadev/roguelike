import { io } from 'socket.io-client';
import { DEFAULT_GAME_DATA, DEFAULT_PLAYER_DATA, MAP_HEIGHT, MAP_WIDTH } from "../../shared/constants";
import { Vec2 } from "../../shared/types";
import './index.css';

const PLAYER_SPEED = 0.1
const SCALE = 100

let canvas: HTMLCanvasElement | null = document.getElementById("canvas") as HTMLCanvasElement
canvas.style.visibility = 'hidden'
let context: CanvasRenderingContext2D | null = null
if (canvas) { 
  context = canvas.getContext("2d")
}

let form:HTMLFormElement|null = document.getElementById("nameForm") as HTMLFormElement
let inputQueue = new Set()
let movementKeys = new Set(["w", "a", "s", "d"])


const SERVER_URL = import.meta.env.VITE_SERVER_URL

console.log(import.meta.env.BASE_URL)

let socket = io(SERVER_URL)
let lastSendTime = new Date().getTime()
let lastUpdateTime = new Date().getTime()
let gameData = structuredClone(DEFAULT_GAME_DATA)
let localID: string
let localPlayer = structuredClone(DEFAULT_PLAYER_DATA)
let collectedRubies: string[] = []

let canMove = false

let tilemap:string[] = []

const imageFilenames = ['floor.png', 'wall.png','ruby.png']
let collideableTiles = new Set(['wall.png'])

type imageDictionary = {
  [key:string]:HTMLImageElement
}
let images:imageDictionary = {}

for (let i = 0; i < imageFilenames.length; i++) { 
  let fileName = imageFilenames[i]
  let image = new Image()
  image.src = '../public/'+fileName
  images[fileName] = image
}

form.addEventListener('submit', (event) => {
  event.preventDefault()
  form.style.visibility = 'hidden'
  canvas.style.visibility = 'visible'
  let nameInput = document.getElementById("nameInput") as HTMLInputElement
  let name = nameInput.value
  let colour = null
  canMove = true
  let colourRadioButtons = document.getElementsByName("colour")
  for (let i = 0; i < colourRadioButtons.length; i++) { 
    let radioElement = colourRadioButtons[i] as HTMLInputElement
    if (radioElement.checked) { 
      colour = radioElement.value
    }
  }
  if (colour) { 
    localPlayer.colour = colour
  }
  if (name) { 
    localPlayer.name = name
  }

})

let resizeCanvas = () => {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}



let drawPlayer = (x: number, y: number) => { 
  if (context) { 
    context.fillRect(x, y, SCALE, SCALE)
  }
  
}

let drawImage = (image:HTMLImageElement,x:number,y:number,width:number,height:number) => {
  if (image.complete && context) { 
    context.drawImage(image,x,y,SCALE*width,SCALE*height)
  }
}

let drawText = (text:string, x:number, y:number) => { 
  if (context) { 
    context.font = `bold ${Math.floor(25*SCALE/100)}px arial`
    context.fillText(String(text), x, y)
  }

}

let getTextDimensions = (text: string) => { 
  if (context) { 
    let metrics = context.measureText(text)
    return {x:metrics.width,y:metrics.fontBoundingBoxAscent}
  }
}

let drawPlayerWithNameTag = (nameTag: string, x: number, y: number, colour: string) => { 
  if (context) {
    context.fillStyle = colour
    drawPlayer(x, y)
    let textDimensions = getTextDimensions(nameTag)
    if (textDimensions) {
      let width = textDimensions.x
      let verticalOffset = -5
      context.fillStyle = 'black'
      drawText(nameTag,x-width/2+SCALE/2,y+verticalOffset)
    }
  }

}
  
window.addEventListener('resize', resizeCanvas, false)

document.addEventListener("keydown", (event) => { 
  if (movementKeys.has(event.key)) { 
    inputQueue.add(event.key)
  }
})

window.onblur = () => { 
  inputQueue.clear()
}

document.addEventListener('focus', () => {
  inputQueue.clear()
})

document.addEventListener("keyup", (event) => { 
  if (movementKeys.has(event.key)) { 
    inputQueue.delete(event.key)
  }
})

let getTileAtPosition = (x:number,y:number) => { 
  return tilemap[y*MAP_WIDTH+x]
}


let checkCollisions = (position1:Vec2,dimensions1:Vec2,position2:Vec2,dimensions2:Vec2) => {
  return (position1.x < position2.x + dimensions2.x && 
          position1.x + dimensions1.x > position2.x &&
          position1.y < position2.y + dimensions2.y && 
          position1.y + dimensions1.y > position2.y
  )
}

let checkPlayerCollisions = () => { 
  let pos = localPlayer.position
  let topLeft = getTileAtPosition(Math.floor(pos.x), Math.floor(pos.y))
  let topRight = getTileAtPosition(Math.floor(pos.x) + 1, Math.floor(pos.y))
  let bottomLeft = getTileAtPosition(Math.floor(pos.x), Math.floor(pos.y)+1)
  let bottomRight = getTileAtPosition(Math.floor(pos.x) + 1, Math.floor(pos.y) + 1)
  return collideableTiles.has(topLeft) || collideableTiles.has(topRight) || collideableTiles.has(bottomLeft) || collideableTiles.has(bottomRight)
}

let handleRubyCollection = () => { 
  Object.keys(gameData.rubyData).forEach((key:string) => { 
    let position = JSON.parse(key)
    let collision = checkCollisions(localPlayer.position, { x: 1, y: 1 }, position, { x: 1, y: 1 })

    if (collision) { 
      delete gameData.rubyData[key]
      collectedRubies.push(key)
    }
  })
}


let handleMovement = () => { 
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
  if (checkPlayerCollisions()) { 
    if (amountToMove.x < 0) {
      localPlayer.position.x -= amountToMove.x
      localPlayer.position.x = Math.floor(localPlayer.position.x)
    } else { 
      localPlayer.position.x -= amountToMove.x
      localPlayer.position.x = Math.floor(localPlayer.position.x)+0.999
    }
  }
  localPlayer.position.y += amountToMove.y
  if (checkPlayerCollisions()) {
    if (amountToMove.y < 0) {
      localPlayer.position.y -= amountToMove.y
      localPlayer.position.y = Math.floor(localPlayer.position.y)
    } else { 
      localPlayer.position.y -= amountToMove.y
      localPlayer.position.y = Math.floor(localPlayer.position.y)+0.999
    }
  }
}

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



let renderFunction = () => {
  if (context) {
    let playerData = gameData.playerData

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

 
    
    

    drawPlayerWithNameTag(localPlayer.name, offsetX, offsetY, localPlayer.colour)

    let rubyString = `rubies: ${localPlayer.rubies}`
    let rubyTextDimensions = getTextDimensions(rubyString)
    if (rubyTextDimensions) {
      let height = rubyTextDimensions.y
      let width = rubyTextDimensions.x
      drawText(rubyString, canvas.width - width - 50, height + 50)
      drawImage(images['ruby.png'], canvas.width - width - SCALE - 10, height + 10, 0.5, 0.5)
    }

    Object.entries(playerData).forEach(([playerID, playerData]) => {
      if (playerID != localID && playerID && playerData) {
        if (playerData) {
          drawPlayerWithNameTag(playerData.name, playerData.position.x * SCALE + cameraOffsetX, playerData.position.y * SCALE + cameraOffsetY, playerData.colour)
        }
      }
    })

    let players = Object.keys(gameData.playerData)
    let height = 0
    for (let i = 0; i < players.length; i++) {
      let player = gameData.playerData[players[i]]
      let text = `${player.name} rubies: ${player.rubies}`
      let dimensions = getTextDimensions(text)
      if (dimensions) { 
        drawText(text, 0, height+50)
        height += dimensions.y
      } 
    }

    Object.keys(gameData.rubyData).forEach((key:string) => { 
      let position = JSON.parse(key)
      drawImage(images['ruby.png'], position.x*SCALE+Math.floor(cameraOffsetX),position.y*SCALE+Math.floor(cameraOffsetY), 1, 1)
    })

    let currentTime = new Date().getTime()
    let timeSinceUpdate = currentTime - lastUpdateTime
    let timeSinceSend = currentTime - lastSendTime
    if (timeSinceSend > 16.67) { 
      lastSendTime = currentTime
      socket.emit('playerData', localPlayer)
      if (collectedRubies.length > 0) { 
        socket.emit('collectedRubies', collectedRubies)
        collectedRubies = []
      }

    }
    if (timeSinceUpdate > 16.67) {
      lastUpdateTime = currentTime
      if (canMove) { 
        handleMovement()
        handleRubyCollection()
      }

    }
  }
}

resizeCanvas()
window.requestAnimationFrame(renderFunction)
