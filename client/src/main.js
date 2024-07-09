let canvas = document.getElementById("canvas")
let context = canvas.getContext("2d")
let inputQueue = new Set()
let movementKeys = new Set(["w", "a", "s", "d"])
let localPosition = new vector2(0, 0)
const PLAYER_SPEED = 20
let socket = io()
let lastSendTime = new Date().getTime()
let lastUpdateTime = new Date().getTime()
let playerData = {}
let localID

let resizeCanvas = () => {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}

let drawPlayer = (x,y) => { 
  context.fillRect(x, y, 100, 100)
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

let handleMovement = () => { 
  let input1 = [...inputQueue][0]
  let input2 = [...inputQueue][1]
  const diagonalSpeed = PLAYER_SPEED/Math.sqrt(2)
  switch (true) { 
    case (input1 == "w" && input2 == undefined):
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

let renderFunction = (time) => { 
  window.requestAnimationFrame(renderFunction)
  context.clearRect(0, 0, canvas.width, canvas.height)
  drawPlayer(localPosition.x, localPosition.y)
  Object.entries(playerData).forEach(([playerID, data]) => {  
    if (playerID != localID && playerID && data) { 
      let position = data["position"]
      if (position) { 
        drawPlayer(position.x,position.y)
      }
    }
  })

  let currentTime = new Date().getTime()
  let timeSinceUpdate = currentTime - lastUpdateTime
  let timeSinceSend = currentTime - lastSendTime
  if (timeSinceSend > 16) { 
    console.log("sent data to server",time)
    lastSendTime = currentTime
    socket.emit('playerPosition',localPosition)
  }
  if (timeSinceUpdate > 20) { 
    lastUpdateTime = currentTime
    handleMovement()
  }

}

resizeCanvas()
window.requestAnimationFrame(renderFunction)