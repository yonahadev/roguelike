import { characterData } from "../../../shared/constants"
import { Projectile } from "../../../shared/types"
import { localPlayer, timeSinceClientPinged } from "../main"
import { canvas } from "./drawing"
import { fireProjectile, gameData, localID } from "./networking"


export let inputQueue = new Set()
const movementKeys = new Set(["w", "a", "s", "d"])
let form: HTMLFormElement | null = document.getElementById("nameForm") as HTMLFormElement
export let canMove = false

export let clientProjectiles:Projectile[] = []

form.addEventListener('submit', (event) => {
  if (canvas) { 
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
      localPlayer.character = colour
    }
    if (name) { 
      localPlayer.name = name
    }
  }
  
})

export const resizeCanvas = () => { 
  if (canvas) { 
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
}

window.addEventListener('resize',resizeCanvas, false)

document.addEventListener("keydown", (event) => { 
  if (canMove) { 
    if (movementKeys.has(event.key)) { 
      inputQueue.add(event.key)
    }
  }
})

document.addEventListener("keyup", (event) => { 
  if (canvas) { 
    if (movementKeys.has(event.key)) { 
      inputQueue.delete(event.key)
    }
  }
})

document.addEventListener('mousedown', () => { 
  if (canMove) { 

    if (gameData.serverTime - localPlayer.attackLastFired > 1000) { 
      let characterProperties = characterData['fireCharacter']
      let projectileTemplate = characterProperties.projectile
      let projectile = structuredClone(projectileTemplate)
      projectile.timeProjected = gameData.serverTime+timeSinceClientPinged
      projectile.position = localPlayer.position
      projectile.orientation = localPlayer.orientation
      projectile.owner = localID
      localPlayer.attackLastFired = gameData.serverTime
      fireProjectile(projectile)
      clientProjectiles.push(projectile)
    }
  }
}) 

document.addEventListener("mousemove", (event) => { 
  if (canvas && canMove) { 
    let centerX = canvas.width/2
    let centerY = canvas.height/2
    let differenceX = centerX - event.clientX
    let differenceY = centerY - event.clientY
    let mouseAngle = Math.atan(-differenceX / differenceY)
    if (differenceY < 0) { 
      mouseAngle += Math.PI
    }
    localPlayer.orientation = mouseAngle
  }
})

window.onblur = () => { 
  inputQueue.clear()
}

document.addEventListener('focus', () => {
  inputQueue.clear()
})