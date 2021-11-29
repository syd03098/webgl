'use strict'

function main () {
  const vs = `#version 300 es

    in vec4 a_position;
    uniform mat4 u_matrix;
    
    out vec3 v_normal;
    
    void main () {
       gl_Position = u_matrix * a_position;
       v_normal = normalize(a_position.xyz);
    }
`

  const fs = `#version 300 es
    precision highp float;
    
    in vec3 v_normal;
    uniform samplerCube u_texture;
    out vec4 outColor;
    
    void main() {
        outColor = texture(u_texture, normalize(v_normal));
    }
`

  const keyString = {
    38: 'Up',
    40: 'Down',
    39: 'Right',
    37: 'Left'
  }

  const canvas = document.getElementById('canvas')
  const gl = canvas.getContext('webgl2')
  if (!gl) {
    return
  }

  const program = webglUtils.createProgramFromSources(gl, [vs, fs])
  const aPositionLocation = gl.getAttribLocation(program, 'a_position')
  const uMatrixLocation = gl.getUniformLocation(program, 'u_matrix')
  const uTextureLocation = gl.getUniformLocation(program, 'u_texture')

  // ...
  // bindBuffer 또는 vertexAttribPointer 호출
  // VAO에 "녹음"됩니다.
  // ...
  const vao = gl.createVertexArray()
  gl.bindVertexArray(vao)

  const positionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(
    gl.ARRAY_BUFFER,
    getCubeArray(),
    gl.STATIC_DRAW
  )
  gl.enableVertexAttribArray(aPositionLocation)
  gl.vertexAttribPointer(
    aPositionLocation,
    3,
    gl.FLOAT,
    false,
    0,
    0
  )

  const texture = gl.createTexture()
  gl.activeTexture(gl.TEXTURE0 + 0)
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture)

  const context = document.createElement('canvas').getContext('2d')
  context.canvas.width = 128
  context.canvas.height = 128

  const blocks = [
    {
      target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, backgroundColor: '#fcba03'
    },
    {
      target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, backgroundColor: '#eb4034'
    },
    {
      target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, backgroundColor: '#4287f5'
    },
    {
      target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, backgroundColor: '#32a852'
    },
    {
      target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, backgroundColor: '#a832a4'
    },
    {
      target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, backgroundColor: '#0366fc'
    }
  ]

  blocks.forEach(({ target, backgroundColor }) => {
    const { width, height } = context.canvas

    context.fillStyle = backgroundColor
    context.fillRect(0, 0, width, height)
    gl.texImage2D(target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, context.canvas)
  })
  gl.generateMipmap(gl.TEXTURE_CUBE_MAP)
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)

  function degToRad (degree) {
    return degree * Math.PI / 180
  }

  function radToDeg (rad) {
    return rad * (180 / Math.PI)
  }

  let [scale, modelX, modelY] = [
    degToRad(120),
    // latitude
    degToRad(25),
    // longitude
    degToRad(45)
  ]

  drawScene()

  function drawHandler (e) {
    const keyCode = e.keyCode
    switch (keyCode) {
      case 38: {
        const nextDeg = radToDeg(modelX) + 1
        modelX = degToRad(nextDeg)
        drawScene()
        break
      }
      case 40: {
        const nextDeg = radToDeg(modelX) - 1
        modelX = degToRad(nextDeg)
        drawScene()
        break
      }
      case 39: {
        const nextDeg = radToDeg(modelY) - 1
        modelY = degToRad(nextDeg)
        drawScene()
        break
      }
      case 37: {
        const nextDeg = radToDeg(modelY) + 1
        modelY = degToRad(nextDeg)
        drawScene()
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
    webglUtils.resizeCanvasToDisplaySize(gl.canvas)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.enable(gl.CULL_FACE)
    gl.enable(gl.DEPTH_TEST)

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.useProgram(program)
    gl.bindVertexArray(vao)

    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight
    const projectionMatrix = m4.perspective(scale, aspect, 1, 2000)
    const cameraPosition = [0, 0, 3]
    const up = [0, 1, 0]
    const target = [0, 0, 0]

    const cameraMatrix = m4.lookAt(cameraPosition, target, up)
    const viewMatrix = m4.inverse(cameraMatrix)
    const viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix)

    let matrix = m4.xRotate(viewProjectionMatrix, modelX)
    matrix = m4.yRotate(matrix, modelY)

    gl.uniformMatrix4fv(uMatrixLocation, false, matrix)
    gl.uniform1i(uTextureLocation, 0)
    gl.drawArrays(
      gl.TRIANGLES,
      0,
      36
    )
  }
}

function getCubeArray () {
  return new Float32Array([
    -0.5, -0.5, -0.5,
    -0.5, 0.5, -0.5,
    0.5, -0.5, -0.5,
    -0.5, 0.5, -0.5,
    0.5, 0.5, -0.5,
    0.5, -0.5, -0.5,

    -0.5, -0.5, 0.5,
    0.5, -0.5, 0.5,
    -0.5, 0.5, 0.5,
    -0.5, 0.5, 0.5,
    0.5, -0.5, 0.5,
    0.5, 0.5, 0.5,

    -0.5, 0.5, -0.5,
    -0.5, 0.5, 0.5,
    0.5, 0.5, -0.5,
    -0.5, 0.5, 0.5,
    0.5, 0.5, 0.5,
    0.5, 0.5, -0.5,

    -0.5, -0.5, -0.5,
    0.5, -0.5, -0.5,
    -0.5, -0.5, 0.5,
    -0.5, -0.5, 0.5,
    0.5, -0.5, -0.5,
    0.5, -0.5, 0.5,

    -0.5, -0.5, -0.5,
    -0.5, -0.5, 0.5,
    -0.5, 0.5, -0.5,
    -0.5, -0.5, 0.5,
    -0.5, 0.5, 0.5,
    -0.5, 0.5, -0.5,

    0.5, -0.5, -0.5,
    0.5, 0.5, -0.5,
    0.5, -0.5, 0.5,
    0.5, -0.5, 0.5,
    0.5, 0.5, -0.5,
    0.5, 0.5, 0.5
  ])
}

main()
