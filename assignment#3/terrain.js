'use strict'

import * as mat4 from './gl-matrix/mat4.js'
import { createProgram, createShader } from './utils.js'

function initTerrainVao (gl, aPositionLocation, depth) {
  const vao = gl.createVertexArray()
  gl.bindVertexArray(vao)

  const gridPoints = []
  const gridIndices = []

  for (let y = 0; y <= depth; y++) {
    for (let x = 0; x <= depth; x++) {
      gridPoints.push(x * (1 / depth), y * (1 / depth))
    }
  }

  const positionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(gridPoints), gl.STATIC_DRAW)

  // d = 20
  // [0, 1, 22] , [1, 2, 23], [2, 3, 24] ... [19, 20, 41]
  // [21, 22, 43] ...
  for (let y = 0; y < depth; y++) {
    const padding = y * (depth + 1)
    for (let x = 0; x < depth; x++) {
      gridIndices.push(
        padding + x,
        padding + x + 1,
        padding + x + 1 + depth + 1
      )
    }
  }

  // d = 20
  // [0, 22, 21], [1, 23, 22], ... [19, 41, 40]
  // [21, 43, 42] ...
  for (let y = 0; y < depth; y++) {
    const padding = y * (depth + 1)
    for (let x = 0; x < depth; x++) {
      gridIndices.push(
        padding + x,
        padding + x + (depth + 1),
        padding + x + (depth)
      )
    }
  }

  const indexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(gridIndices), gl.STATIC_DRAW)

  gl.vertexAttribPointer(aPositionLocation, 2, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(aPositionLocation)

  gl.bindVertexArray(null)
  gl.bindBuffer(gl.ARRAY_BUFFER, null)

  return { vao, n: gridIndices.length }
}

export function renderTerrain ({ gl, v, p, img }) {
  const aPositionLocation = 7

  const vs = `#version 300 es
      
      layout(location=${aPositionLocation}) in vec2 aTexCoord;
      
      uniform mat4 mvp;
      uniform sampler2D uSampler;
      
      void main() {

        float l = 4.0;
        float s = 1.5;
        
        float heightmap_color = texture(uSampler, aTexCoord).r;
        float height = heightmap_color * s - 0.8;
        
        float x = float(aTexCoord.s * l - l / 2.0);
        float y = float(aTexCoord.t * l - l / 2.0);
        vec3 v = vec3(x, y, height);
        
        gl_Position = mvp * vec4(v, 1.0);
      }
  `

  const fs = `#version 300 es
    #ifdef GL_ES
    precision highp float;
    #endif
    
    out vec4 fColor;
    
    void main() {
      fColor = vec4(0.5, 0.5, 0.5, 1);
    }
  `

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vs)
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fs)
  const program = createProgram(gl, vertexShader, fragmentShader)

  const { vao, n } = initTerrainVao(gl, aPositionLocation, 128)

  const texture = gl.createTexture()
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, texture)

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    1,
    1,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    new Uint8Array([0, 0, 0, 255])
  )
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)

  const mvpMatrix = mat4.create()

  function render () {
    gl.useProgram(program)
    gl.bindVertexArray(vao)

    mat4.multiply(mvpMatrix, p, v)
    gl.uniformMatrix4fv(gl.getUniformLocation(program, 'mvp'), false, mvpMatrix)
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0)

    gl.bindVertexArray(null)
    gl.useProgram(null)
  }

  render()
}
