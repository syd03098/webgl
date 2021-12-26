'use strict'

export function createShader (gl, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  return gl.getShaderParameter(shader, gl.COMPILE_STATUS)
    ? shader
    : undefined
}

export function createProgram (gl, vertexShader, fragmentShader) {
  const program = gl.createProgram()
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)

  return gl.getProgramParameter(program, gl.LINK_STATUS)
    ? program
    : undefined
}

export function initOpenGl2 () {
  const canvas = document.getElementById('canvas')
  const gl = canvas.getContext('webgl2')

  if (!gl) {
    console.log('Failed to get the rendering context for WebGL')
    return undefined
  }

  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.enable(gl.DEPTH_TEST)
  return gl
}

export async function loadTerrainImage () {
  return new Promise(resolve => {
    const image = new Image()

    image.addEventListener('load', () => resolve(image))
    image.src = './yorkville.jpg'
  })
}
