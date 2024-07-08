let canvas = document.getElementById("canvas")
let context = canvas.getContext("2d")

if (context) {
  context.fillStyle = "blue"
} else { 
  console.warn("CANVAS CONTEXT NOT FOUND");
}

let inputQueue = new Set()
let movementKeys = new Set(["w", "a", "s", "d"])
let position = new vector2(0, 0)
const playerSpeed = 2
let socket = io()
let lastSendTime = new Date().getTime()
let playerPositions = {}
let localID

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
  const diagonalSpeed = playerSpeed/Math.sqrt(2)
  switch (true) { 
    case (input1 == "w" && input2 == undefined):
      position.move(0,-playerSpeed)
      break
    case (input1 == "a" && input2 == undefined):
      position.move(-playerSpeed,0)
      break
    case (input1 == "s" && input2 == undefined):
      position.move(0,playerSpeed)
      break
    case (input1 == "d" && input2 == undefined):
      position.move(playerSpeed,0)
      break
    case (input1 == "w" && input2 == "d" || input2 == "w" && input1 == "d"):
      position.move(diagonalSpeed,-diagonalSpeed)
      break
    case (input1 == "w" && input2 == "a" || input2 == "w" && input1 == "a"):
      position.move(-diagonalSpeed,-diagonalSpeed)
      break
    case (input1 == "s" && input2 == "a" || input2 == "s" && input1 == "a"):
      position.move(-diagonalSpeed,diagonalSpeed)
      break
    case (input1 == "s" && input2 == "d" || input2 == "s" && input1 == "d"):
      position.move(diagonalSpeed,diagonalSpeed)
      break
  }
  if (localID) { 
    playerPositions[localID] = position
  }
}

socket.on('id', (id) => { 
  localID = id
  console.log(localID)
})

socket.on('playerPosition', ({id,vector2}) => { 
  playerPositions[id] = vector2
})


let renderFunction = (time) => { 
  if (context) { 
    window.requestAnimationFrame(renderFunction)
    context.clearRect(0, 0, 400, 400)
    handleMovement()
    Object.entries(playerPositions).forEach(([key, value]) => { 
      context.fillRect(value.x, value.y, 100, 100)
    })
    let currentTime = new Date().getTime()
    let timeSinceSend = currentTime - lastSendTime
    if (timeSinceSend > 0.02) { 
      timeSinceSend = currentTime
      socket.emit('playerPosition',position)
    }
  }
}


window.requestAnimationFrame(renderFunction)