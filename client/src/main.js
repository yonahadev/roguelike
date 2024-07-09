let canvas = document.getElementById("canvas")
let context = canvas.getContext("2d")
let form = document.getElementById("nameForm")
let inputQueue = new Set()
let movementKeys = new Set(["w", "a", "s", "d"])
let localPosition = new vector2(0, 0)
const PLAYER_SPEED = 20
let socket = io()
let lastSendTime = new Date().getTime()
let lastUpdateTime = new Date().getTime()
let playerData = {}
let localID
let playerWidth = 100
let playerHeight = 100
let canMove = false
let localName
let localColour
let tilemap

form.addEventListener('submit', (event) => {
  event.preventDefault()
  form.style.visibility = 'hidden'
  let name = document.getElementById("nameInput").value
  localName = name
  canMove = true
  let colourRadioButtons = document.getElementsByName("colour")
  for (let i = 0; i < colourRadioButtons.length; i++) { 
    let radioElement = colourRadioButtons[i]
    if (radioElement.checked) { 
      localColour = radioElement.value
    }
  }
  socket.emit('startInfo', {name:localName,colour:localColour})
})

let resizeCanvas = () => {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}

let drawPlayer = (x,y) => { 
  context.fillRect(x, y, playerWidth, playerHeight)
}

let drawText = (text, x, y) => { 
  context.font = 'bold 25px arial'
  context.fillText(String(text),x,y)
}

let getTextDimensions = (text) => { 
  let metrics = context.measureText(text)
  return {x:metrics.width,y:metrics.fontBoundingBoxAscent}
}

let drawPlayerWithNameTag = (nameTag, x, y, colour) => { 
  context.fillStyle = colour
  drawPlayer(x, y)
  let width = getTextDimensions(nameTag).x
  let verticalOffset = -5
  context.fillStyle = 'black'
  drawText(nameTag,x-width/2+playerWidth/2,y+verticalOffset)
}
  
window.addEventListener('resize', resizeCanvas, false)

document.addEventListener("keydown", (event) => { 
  if (movementKeys.has(event.key)) { 
    inputQueue.add(event.key)
  }
})

document.addEventListener("keyup", (event) => { 
  if (movementKeys.has(event.key)) { 
    inputQueue.delete(event.key)
  }
})

let checkCollisions = (position1,dimensions1,position2,dimensions2) => {
  return (position1.x < position2.x + dimensions2.x && 
          position1.x + dimensions1.x > position2.x &&
          position1.y < position2.y + dimensions2.y && 
          position1.y + position1.y > position2.y
  )
}

let handleMovement = () => { 
  let input1 = [...inputQueue][0]
  let input2 = [...inputQueue][1]
  const diagonalSpeed = PLAYER_SPEED/Math.sqrt(2)
  switch (true) { 
    case (input1 == "w" && input2 == undefined):
      // let isColliding = checkCollisions(localPosition, new vector2(playerWidth, playerHeight), new vector2(0, -1000), new vector2(canvas.width, 1000))
      // console.log(isColliding)
      // isColliding == false ? localPosition.move(0, -PLAYER_SPEED) : null
      localPosition.move(0,-PLAYER_SPEED)
      break
    case (input1 == "a" && input2 == undefined):
      localPosition.move(-PLAYER_SPEED,0)
      break
    case (input1 == "s" && input2 == undefined):
      localPosition.move(0,PLAYER_SPEED)
      break
    case (input1 == "d" && input2 == undefined):
      localPosition.move(PLAYER_SPEED,0)
      break
    case (input1 == "w" && input2 == "d" || input2 == "w" && input1 == "d"):
      localPosition.move(diagonalSpeed,-diagonalSpeed)
      break
    case (input1 == "w" && input2 == "a" || input2 == "w" && input1 == "a"):
      localPosition.move(-diagonalSpeed,-diagonalSpeed)
      break
    case (input1 == "s" && input2 == "a" || input2 == "s" && input1 == "a"):
      localPosition.move(-diagonalSpeed,diagonalSpeed)
      break
    case (input1 == "s" && input2 == "d" || input2 == "s" && input1 == "d"):
      localPosition.move(diagonalSpeed,diagonalSpeed)
      break
  }
}

socket.on('id', (id) => { 
  localID = id
  console.log('localID:',localID)
})
socket.on('playerData', (playerDataFromServer) => { 
  playerData = playerDataFromServer
})

socket.on('tilemap', (receivedTilemap) => { 
  tilemap = receivedTilemap
  console.log(tilemap)
})



let renderFunction = (time) => { 
  window.requestAnimationFrame(renderFunction)
  context.clearRect(0, 0, canvas.width, canvas.height)
  let offsetX = (canvas.width-playerWidth)/2
  let offsetY = (canvas.height - playerHeight) / 2
  if (tilemap) { 
    let width = Math.sqrt(tilemap.length)
    for (let i = 0; i < tilemap.length; i++) {
      let column = Math.floor(i/width)
      let row = i%width

      context.fillStyle = tilemap[i]
      context.fillRect(column * 100 - localPosition.x + offsetX, row*100- localPosition.y + offsetY, 101, playerHeight)
      context.fillStyle = 'black'
    }
  }

  if (localName) { 
    drawPlayerWithNameTag(localName,offsetX,offsetY,localColour)
  }

  let string = "Players: "+String(Object.keys(playerData).length)
  let height = getTextDimensions(string).y
  drawText(string,0,height)
  Object.entries(playerData).forEach(([playerID, data]) => {  
    if (playerID != localID && playerID && data) { 
      let position = data["position"]
      let name = data["name"]
      let colour = data["colour"]
      if (position) { 
        drawPlayerWithNameTag(name,position.x-localPosition.x+offsetX,position.y-localPosition.y+offsetY,colour)
      }
    }
  })


  let currentTime = new Date().getTime()
  let timeSinceUpdate = currentTime - lastUpdateTime
  let timeSinceSend = currentTime - lastSendTime
  if (timeSinceSend > 16) { 
    lastSendTime = currentTime
    socket.emit('playerPosition',localPosition)
  }
  if (timeSinceUpdate > 20) { 
    lastUpdateTime = currentTime
    if (canMove) { 
      handleMovement()
    }

  }

}

resizeCanvas()
window.requestAnimationFrame(renderFunction)