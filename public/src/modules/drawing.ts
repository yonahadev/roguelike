export let canvas: HTMLCanvasElement | null = document.getElementById("canvas") as HTMLCanvasElement
canvas.style.visibility = 'hidden'
export let context: CanvasRenderingContext2D | null = null
if (canvas) { 
  context = canvas.getContext("2d")
}

import { IMAGE_NAMES } from "../../../shared/constants"
import { Player } from "../../../shared/types"
import { SCALE } from "../main"

type imageDictionary = {
  [key:string]:HTMLImageElement
}
export let images:imageDictionary = {}

for (let i = 0; i < IMAGE_NAMES.length; i++) { 
  let imageName = IMAGE_NAMES[i]
  let image = new Image()
  let fullPath = `/${imageName}.png`
  image.src = fullPath
  console.log(imageName)
  images[imageName] = image
}

export const getImage = (imageEnumNumber: number) => { 
  return images[IMAGE_NAMES[imageEnumNumber]]
}

export const drawImage = (image: HTMLImageElement, x: number, y: number, width: number, height: number) => {
  if (image.complete && context) { 
    context.drawImage(image,x,y,SCALE*width,SCALE*height)
  }
}

export const drawText = (text:string, x:number, y:number) => { 
  if (context) { 
    context.font = `bold ${Math.floor(25*SCALE/100)}px arial`
    context.fillText(String(text), x, y)
  }

}

export const getTextDimensions = (text: string) => { 
  if (context) { 
    let metrics = context.measureText(text)
    return {x:metrics.width,y:metrics.fontBoundingBoxAscent}
  }
}
export const drawPlayerWithNameTag = (player: Player, x: number, y: number) => {
  if (context) {
    context.save();
    context.translate(x + SCALE / 2, y + SCALE / 2); //gpt-saviour top left is the origin so move it to where the player is centered
    context.rotate(player.orientation);
    drawImage(images[player.character], -SCALE / 2, -SCALE / 2, 1, 1);
    context.restore();
    let textDimensions = getTextDimensions(player.name);
    if (textDimensions) {
      let width = textDimensions.x;
      let verticalOffset = -5;
      context.fillStyle = 'black';
      drawText(player.name, x - width / 2 + SCALE / 2, y + verticalOffset);
    }
  }
}