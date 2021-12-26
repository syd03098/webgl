import * as util from './lib/gl-matrix/common.js'
import * as mat4 from './lib/gl-matrix/mat4.js'

const vs = `#version 300 es
    
    in vec4 a_position;
    in vec4 a_color;
    uniform mat4 u_matrix;
    
    out vec4 v_color;
    
    void main () {
        gl_Position = u_matrix * a_position;
        v_color = a_color;
    }
`

const fs = `#version 300 es
   precision highp float;
    
    in vec4 v_color;
    out vec4 outColor;
    
    void main() {
        outColor = v_color;
    }
`

const keyString = {
  38: 'Up',
  40: 'Down',
  39: 'Right',
  37: 'Left'
}

function getCubeColors () {
  return new Uint8Array([
    255, 255, 0,
    255, 255, 0,
    255, 255, 0,
    255, 255, 0,
    255, 255, 0,
    255, 255, 0,

    0, 255, 0,
    0, 255, 0,
    0, 255, 0,
    0, 255, 0,
    0, 255, 0,
    0, 255, 0,

    255, 0, 255,
    255, 0, 255,
    255, 0, 255,
    255, 0, 255,
    255, 0, 255,
    255, 0, 255,

    255, 255, 255,
    255, 255, 255,
    255, 255, 255,
    255, 255, 255,
    255, 255, 255,
    255, 255, 255,

    0, 255, 255,
    0, 255, 255,
    0, 255, 255,
    0, 255, 255,
    0, 255, 255,
    0, 255, 255,

    0, 0, 255,
    0, 0, 255,
    0, 0, 255,
    0, 0, 255,
    0, 0, 255,
    0, 0, 255
  ])
}

function getCubeArray () {
  return new Float32Array([
    -1.0, -1.0, 1.0,
    1.0, -1.0, 1.0,
    1.0, 1.0, 1.0,
    -1.0, -1.0, 1.0,
    1.0, 1.0, 1.0,
    -1.0, 1.0, 1.0,

    -1.0, -1.0, -1.0,
    -1.0, 1.0, -1.0,
    1.0, 1.0, -1.0,
    -1.0, -1.0, -1.0,
    1.0, 1.0, -1.0,
    1.0, -1.0, -1.0,

    -1.0, 1.0, -1.0,
    -1.0, 1.0, 1.0,
    1.0, 1.0, 1.0,
    -1.0, 1.0, -1.0,
    1.0, 1.0, 1.0,
    1.0, 1.0, -1.0,

    -1.0, -1.0, -1.0,
    1.0, -1.0, -1.0,
    1.0, -1.0, 1.0,
    -1.0, -1.0, -1.0,
    1.0, -1.0, 1.0,
    -1.0, -1.0, 1.0,

    1.0, -1.0, -1.0,
    1.0, 1.0, -1.0,
    1.0, 1.0, 1.0,
    1.0, -1.0, -1.0,
    1.0, 1.0, 1.0,
    1.0, -1.0, 1.0,

    -1.0, -1.0, -1.0,
    -1.0, -1.0, 1.0,
    -1.0, 1.0, 1.0,
    -1.0, -1.0, -1.0,
    -1.0, 1.0, 1.0,
    -1.0, 1.0, -1.0
  ])
}

function getCameraAxisArray () {
  const array = []
  for (let i = 0; i < 18; i++) {
    const angle = i * Math.PI * 2 / 18
    array.push(0.0, Math.sin(angle) * 10, Math.cos(angle) * 10)
  }

  return new Float32Array([...array])
}

function getCameraAxisColor () {
  return new Uint8Array([
    255, 255, 0,
    255, 255, 0,
    255, 255, 0,
    255, 255, 0,
    255, 255, 0,
    255, 255, 0,

    255, 255, 0,
    255, 255, 0,
    255, 255, 0,
    255, 255, 0,
    255, 255, 0,
    255, 255, 0,

    255, 255, 0,
    255, 255, 0,
    255, 255, 0,
    255, 255, 0,
    255, 255, 0,
    255, 255, 0
  ])
}

function getHorizontalAxisArray () {
  const array = []
  for (let i = 0; i < 18; i++) {
    const angle = i * Math.PI * 2 / 18
    array.push(Math.cos(angle) * 10, 0.0, Math.sin(angle) * 10)
  }

  return new Float32Array([...array])
}

function getHorizontalAxisColor () {
  return new Uint8Array([
    255, 255, 255,
    255, 255, 255,
    255, 255, 255,
    255, 255, 255,
    255, 255, 255,
    255, 255, 255,

    255, 255, 255,
    255, 255, 255,
    255, 255, 255,
    255, 255, 255,
    255, 255, 255,
    255, 255, 255,

    255, 255, 255,
    255, 255, 255,
    255, 255, 255,
    255, 255, 255,
    255, 255, 255,
    255, 255, 255
  ])
}

function createShader (gl, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  return gl.getShaderParameter(shader, gl.COMPILE_STATUS)
    ? shader
    : undefined
}

function createProgram (gl, vertexShader, fragmentShader) {
  const program = gl.createProgram()
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)

  return gl.getProgramParameter(program, gl.LINK_STATUS)
    ? program
    : undefined
}

function createVertexArrayObject (gl, aPositionLocation, colorLocation, positions, colors) {
  const vao = gl.createVertexArray()
  gl.bindVertexArray(vao)

  const positionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(
    gl.ARRAY_BUFFER,
    positions,
    gl.STATIC_DRAW
  )
  gl.enableVertexAttribArray(aPositionLocation)
  gl.vertexAttribPointer(aPositionLocation, 3, gl.FLOAT, false, 0, 0)

  const colorBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
  gl.bufferData(
    gl.ARRAY_BUFFER,
    colors,
    gl.STATIC_DRAW
  )
  gl.enableVertexAttribArray(colorLocation)
  gl.vertexAttribPointer(colorLocation, 3, gl.UNSIGNED_BYTE, false, 0, 0)

  return vao
}

function main () {
  const canvas = document.getElementById('canvas')
  const gl = canvas.getContext('webgl2')
  if (!gl) {
    return
  }

  const [minLatitude, maxLatitude] = [-90, 90]
  const [minLongitude, maxLongitude] = [0, 360]
  const [initialLongitude, initialLatitude] = [0, 0]
  let [scale, modelX, modelY] = [
    util.toRadian(90),
    util.toRadian(initialLatitude),
    util.toRadian(initialLongitude)
  ]

  function setUpSlider (element, value = 0, min = 0, max = 0, name = '', callback) {
    const identifier = `${name}_input`

    element.innerHTML = `
        <div class="control">
          <div style="display: flex; align-items: center;">
            <label style="min-width: 64px; text-align: left" for=${name}>${name}</label>
            <input type="range" id=${identifier} min=${min} max=${max} value=${value} step="1">
          </div>
          <output class="output">${value}</output>
        </div>
    `
    const input = document.getElementById(identifier)
    input.oninput = ({ target }) => {
      target.parentElement.nextElementSibling.value = target.value
      callback(target.value)
      drawScene()
      input.blur()
    }
  }

  setUpSlider(document.getElementById('latitude'), initialLatitude, minLatitude, maxLatitude, 'latitude', (nextValue) => {
    modelX = util.toRadian(nextValue)
    drawScene()
  })
  setUpSlider(document.getElementById('longitude'), initialLongitude, minLongitude, maxLongitude, 'longitude', (nextValue) => {
    modelY = util.toRadian(nextValue)
    drawScene()
  })

  function updateLatitude (degree = 0) {
    const element = document.getElementById('latitude_input')
    if (!element) {
      return
    }

    const nextValue = parseInt(element.value, 10) + degree
    if (nextValue < minLatitude || nextValue > maxLatitude) {
      return
    }

    element.parentElement.nextElementSibling.value = nextValue
    element.value = nextValue
    modelX = util.toRadian(nextValue)

    drawScene()
  }

  function updateLongitude (degree = 0) {
    const element = document.getElementById('longitude_input')
    if (!element) {
      return
    }

    const nextValue = parseInt(element.value, 10) + degree
    if (nextValue < minLongitude || nextValue > maxLongitude) {
      return
    }

    element.parentElement.nextElementSibling.value = nextValue
    element.value = nextValue
    modelY = util.toRadian(nextValue)

    drawScene()
  }

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vs)
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fs)
  const program = createProgram(gl, vertexShader, fragmentShader)

  const aPositionLocation = gl.getAttribLocation(program, 'a_position')
  const colorLocation = gl.getAttribLocation(program, 'a_color')
  const uMatrixLocation = gl.getUniformLocation(program, 'u_matrix')

  const cubeVao = createVertexArrayObject(
    gl,
    aPositionLocation,
    colorLocation,
    getCubeArray(),
    getCubeColors()
  )
  const cameraAxisVao = createVertexArrayObject(
    gl,
    aPositionLocation,
    colorLocation,
    getCameraAxisArray(),
    getCameraAxisColor()
  )
  const xAxisVao = createVertexArrayObject(
    gl,
    aPositionLocation,
    colorLocation,
    new Float32Array([
      0.0, 0.0, 0.0,
      10.0, 0.0, 0.0
    ]),
    new Uint8Array([
      255, 0, 0,
      255, 0, 0
    ])
  )
  const zAxisVao = createVertexArrayObject(
    gl,
    aPositionLocation,
    colorLocation,
    new Float32Array([
      0.0, 0.0, 0.0,
      0.0, 0.0, 10.0
    ]),
    new Uint8Array([
      0, 0, 255,
      0, 0, 255
    ])
  )
  const yAxisVao = createVertexArrayObject(
    gl,
    aPositionLocation,
    colorLocation,
    new Float32Array([
      0.0, 0.0, 0.0,
      0.0, 10.0, 0.0
    ]),
    new Uint8Array([
      0, 255, 0,
      0, 255, 0
    ])
  )
  const horizontalAxisVao = createVertexArrayObject(
    gl,
    aPositionLocation,
    colorLocation,
    getHorizontalAxisArray(),
    getHorizontalAxisColor()
  )

  const cameraVao = createVertexArrayObject(
    gl,
    aPositionLocation,
    colorLocation,
    new Float32Array([
      0.0, 0.0, 0.0,
      0.0, 0.0, 10.0
    ]),
    new Uint8Array([
      255, 0, 255,
      255, 0, 255
    ])
  )

  drawScene()

  function drawHandler (e) {
    const keyCode = e.keyCode
    switch (keyCode) {
      case 38: {
        updateLatitude(1)
        break
      }
      case 40: {
        updateLatitude(-1)
        break
      }
      case 37: {
        updateLongitude(1)
        break
      }
      case 39: {
        updateLongitude(-1)
        break
      }
    }
  }

  function messageHandler (e) {
    const keyCode = e.keyCode

    if (![37, 38, 39, 40].includes(keyCode)) {
      return
    }

    const newMessage = `${keyString[keyCode]} arrow is pressed`
    const $message = document.getElementById('message')
    $message.innerText = newMessage
  }

  addEventListener('keydown', drawHandler)
  addEventListener('keydown', messageHandler)
  addEventListener('keyup', function () {
    setTimeout(() => {
      const message = document.getElementById('message')
      message.innerText = null
    }, 1000)
  })

  function drawScene () {
    const [width, height] = [canvas.clientWidth, canvas.clientHeight]

    gl.clearColor(0, 0, 0, 1)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.enable(gl.DEPTH_TEST)
    gl.enable(gl.CULL_FACE)
    gl.useProgram(program)

    // left
    gl.viewport(0, 0, width / 2, height)

    let projectionMatrix = mat4.create()
    let viewMatrix = mat4.create()
    let mvpMatrix = mat4.create()

    mat4.ortho(projectionMatrix, -12, 12, -12, 12, 0, 40)
    mat4.lookAt(
      viewMatrix,
      [10, 3, 10],
      [0, 0, 0],
      [0, 1, 0]
    )
    mat4.multiply(mvpMatrix, projectionMatrix, viewMatrix)
    gl.bindVertexArray(cubeVao)
    gl.uniformMatrix4fv(uMatrixLocation, false, mvpMatrix)
    gl.drawArrays(gl.TRIANGLES, 0, 36)
    gl.bindVertexArray(null)

    gl.bindVertexArray(xAxisVao)
    gl.uniformMatrix4fv(uMatrixLocation, false, mvpMatrix)
    gl.drawArrays(gl.LINE_STRIP, 0, 2)
    gl.bindVertexArray(null)

    gl.bindVertexArray(yAxisVao)
    gl.uniformMatrix4fv(uMatrixLocation, false, mvpMatrix)
    gl.drawArrays(gl.LINE_STRIP, 0, 2)
    gl.bindVertexArray(null)

    gl.bindVertexArray(zAxisVao)
    gl.uniformMatrix4fv(uMatrixLocation, false, mvpMatrix)
    gl.drawArrays(gl.LINE_STRIP, 0, 2)
    gl.bindVertexArray(null)

    gl.bindVertexArray(horizontalAxisVao)
    gl.uniformMatrix4fv(uMatrixLocation, false, mvpMatrix)
    gl.drawArrays(gl.LINE_LOOP, 0, 18)
    gl.bindVertexArray(null)

    gl.bindVertexArray(cameraAxisVao)
    mat4.rotateY(mvpMatrix, mvpMatrix, modelY)
    gl.uniformMatrix4fv(uMatrixLocation, false, mvpMatrix)
    gl.drawArrays(gl.LINE_LOOP, 0, 18)
    gl.bindVertexArray(null)

    gl.bindVertexArray(cameraVao)
    mat4.rotateX(mvpMatrix, mvpMatrix, -modelX)
    gl.uniformMatrix4fv(uMatrixLocation, false, mvpMatrix)
    gl.drawArrays(gl.LINE_STRIP, 0, 2)
    gl.bindVertexArray(null)

    // right
    gl.viewport(width / 2, 0, width / 2, height)

    projectionMatrix = mat4.create()
    viewMatrix = mat4.create()
    mvpMatrix = mat4.create()
    mat4.perspective(projectionMatrix, scale, 1, 30, 0.1)
    mat4.translate(viewMatrix, viewMatrix, [0, 0, -4])

    const matrix = mat4.create()
    mat4.rotateX(matrix, viewMatrix, modelX)
    mat4.rotateY(matrix, matrix, -modelY)
    mat4.multiply(mvpMatrix, projectionMatrix, matrix)

    gl.bindVertexArray(cubeVao)
    gl.uniformMatrix4fv(uMatrixLocation, false, mvpMatrix)
    gl.drawArrays(
      gl.TRIANGLES,
      0,
      36
    )
    gl.bindVertexArray(null)
  }
}

main()
