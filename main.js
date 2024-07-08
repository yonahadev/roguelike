let canvas = document.getElementById("canvas")
let context = canvas.getContext("2d")
context.fillStyle = "blue"


let moving
let inputQueue = new Set()
let movementKeys = new Set(["w", "a", "s", "d"])

let position = [0,0]

let lastTime = new Date().getTime()

document.addEventListener("keydown", (event) => { 
  if (movementKeys.has(event.key)) { 
    inputQueue.add(event.key)
  }
})

document.addEventListener("keyup", (event) => { 
  if (movementKeys.has(event.key)) { 
    inputQueue.delete(event.key )
  }
})

let handleMovement = () => { 
  let input1 = [...inputQueue][0]
  let input2 = [...inputQueue][1]
  switch (true) { 
    case (input1 == "w" && input2 == undefined):
      position[1] -= Math.sqrt(2)
      break
    case (input1 == "a" && input2 == undefined):
      position[0] -= Math.sqrt(2)
      break
    case (input1 == "s" && input2 == undefined):
      position[1] += Math.sqrt(2)
      break
    case (input1 == "d" && input2 == undefined):
      position[0] += Math.sqrt(2)
      break
    case (input1 == "w" && input2 == "d" || input2 == "w" && input1 == "d"):
      position[1] -= 1
      position[0] += 1
      break
    case (input1 == "w" && input2 == "a" || input2 == "w" && input1 == "a"):
      position[1] -= 1
      position[0] -= 1
      break
    case (input1 == "s" && input2 == "a" || input2 == "s" && input1 == "a"):
      position[1] += 1
      position[0] -= 1
      break
    case (input1 == "s" && input2 == "d" || input2 == "s" && input1 == "d"):
      position[1] += 1
      position[0] += 1
      break
  }
}


let renderFunction = (time) => { 
  window.requestAnimationFrame(renderFunction)
  context.clearRect(0, 0, 400, 400)
  handleMovement()
  context.fillRect(position[0],position[1], 100, 100)
}


window.requestAnimationFrame(renderFunction)