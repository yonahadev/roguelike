let canvas = document.getElementById("canvas")
let context = canvas.getContext("2d")
context.fillStyle = "blue"
context.fillRect(50, 50, 100, 100)

let moving
let inputQueue = new Set()
let movementKeys = new Set(["w", "a", "s", "d"])

let lastTime = new Date().getTime()

document.addEventListener("keydown", (event) => { 
  if (movementKeys.has(event.key)) { 
    console.log(event.key, event.type)
    inputQueue.add(event.key)
  }

})

document.addEventListener("keyup", (event) => { 
  if (movementKeys.has(event.key)) { 
    inputQueue.delete(event.key )
  }
})

let renderFunction = (time) => { 
  console.log(inputQueue)
  window.requestAnimationFrame(renderFunction)
}


window.requestAnimationFrame(renderFunction)