'use strict'

import * as mat4 from './gl-matrix/mat4.js'
import { createProgram, createShader } from './utils.js'

function initVertexBuffers (gl, aPosition, aNormalPosition) {
  const vertices = new Float32Array([
    0.2, 0.5, 0.1, -0.2, 0.5, 0.1, -0.2, 0.0, 0.1, 0.2, 0.0, 0.1, // v0-v1-v2-v3 front
    0.2, 0.5, 0.1, 0.2, 0.0, 0.1, 0.2, 0.0, -0.1, 0.2, 0.5, -0.1, // v0-v3-v4-v5 right
    0.2, 0.5, 0.1, 0.2, 0.5, -0.1, -0.2, 0.5, -0.1, -0.2, 0.5, 0.1, // v0-v5-v6-v1 up
    -0.2, 0.5, 0.1, -0.2, 0.5, -0.1, -0.2, 0.0, -0.1, -0.2, 0.0, 0.1, // v1-v6-v7-v2 left
    -0.2, 0.0, -0.1, 0.2, 0.0, -0.1, 0.2, 0.0, 0.1, -0.2, 0.0, 0.1, // v7-v4-v3-v2 down
    0.2, 0.0, -0.1, -0.2, 0.0, -0.1, -0.2, 0.5, -0.1, 0.2, 0.5, -0.1 // v4-v7-v6-v5 back
  ])

  const normals = new Float32Array([
    0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, // v0-v1-v2-v3 front
    1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, // v0-v3-v4-v5 right
    0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, // v0-v5-v6-v1 up
    -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, // v1-v6-v7-v2 left
    0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, // v7-v4-v3-v2 down
    0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0 // v4-v7-v6-v5 back
  ])

  const indices = new Uint8Array([
    0, 1, 2, 0, 2, 3, // front
    4, 5, 6, 4, 6, 7, // right
    8, 9, 10, 8, 10, 11, // up
    12, 13, 14, 12, 14, 15, // left
    16, 17, 18, 16, 18, 19, // down
    20, 21, 22, 20, 22, 23 // back
  ])

  const vao = gl.createVertexArray()
  gl.bindVertexArray(vao)

  const verticesBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
  gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(aPosition)

  const normalBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW)
  gl.vertexAttribPointer(aNormalPosition, 3, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(aNormalPosition)

  gl.bindBuffer(gl.ARRAY_BUFFER, null)

  const indexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)
  gl.bindVertexArray(null)

  return { vao, n: indices.length }
}

function initRotorVertexBuffers (gl, aPosition) {
  const rotors = new Float32Array([
    0.0, 0.0, 0.1, -0.5, 0.05, 0.1, -0.5, -0.05, 0.1,
    0.0, 0.0, 0.1, -0.05, -0.5, 0.1, 0.05, -0.5, 0.1,
    0.0, 0.0, 0.1, 0.5, -0.05, 0.1, 0.5, 0.05, 0.1,
    0.0, 0.0, 0.1, 0.05, 0.5, 0.1, -0.05, 0.5, 0.1
  ])

  const rotorsVao = gl.createVertexArray()
  gl.bindVertexArray(rotorsVao)

  const rotorsBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, rotorsBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, rotors, gl.STATIC_DRAW)
  gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(aPosition)

  gl.bindVertexArray(null)

  return rotorsVao
}

export function renderHelicopter ({ gl, v, p, m, rotorMatrix }) {
  const aPositionLocation = 0
  const aNormalLocation = 4

  const vs = `#version 300 es
    layout(location=${aPositionLocation}) in vec4 aPosition;
    layout(location=${aNormalLocation}) in vec4 aNormal;
    
    uniform mat4 mvp;
    uniform mat4 uNormal;
    
    out vec4 vColor;
    
    void main() {
      gl_Position = mvp * aPosition;
    }
  `

  const fs = `#version 300 es
    precision highp float;
    
    out vec4 fColor;
    
    void main() {
        fColor = vec4(1, 1, 1, 1);
    }
  `

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vs)
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fs)
  const program = createProgram(gl, vertexShader, fragmentShader)

  const { vao, n } = initVertexBuffers(gl, aPositionLocation, aNormalLocation)
  const rotorsVao = initRotorVertexBuffers(gl, aPositionLocation)

  const mvpMatrixLocation = gl.getUniformLocation(program, 'mvp')

  const modelMatrix = mat4.create()
  const mvpMatrix = mat4.create()

  function drawBody (modelMatrix) {
    gl.bindVertexArray(vao)

    mat4.multiply(mvpMatrix, v, modelMatrix)
    mat4.multiply(mvpMatrix, p, mvpMatrix)
    gl.uniformMatrix4fv(mvpMatrixLocation, false, mvpMatrix)

    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0)
    gl.bindVertexArray(null)
  }

  function drawRotors (modelMatrix) {
    gl.bindVertexArray(rotorsVao)

    mat4.multiply(mvpMatrix, v, modelMatrix)
    mat4.multiply(mvpMatrix, mvpMatrix, rotorMatrix)
    mat4.multiply(mvpMatrix, p, mvpMatrix)
    gl.uniformMatrix4fv(mvpMatrixLocation, false, mvpMatrix)

    gl.drawArrays(gl.TRIANGLES, 0, 12)
    gl.bindVertexArray(null)
  }

  function render () {
    gl.useProgram(program)

    // front
    mat4.copy(modelMatrix, m)
    drawBody(modelMatrix)

    // tail
    mat4.copy(modelMatrix, m)
    mat4.translate(modelMatrix, modelMatrix, [0.0, 0.5, 0.0])
    mat4.scale(modelMatrix, modelMatrix, [0.3, 0.8, 0.3])
    drawBody(modelMatrix)

    // rotor
    mat4.copy(modelMatrix, m)
    mat4.translate(modelMatrix, modelMatrix, [0.0, 0.25, 0.0])
    drawRotors(modelMatrix)

    // clean program
    gl.useProgram(null)
  }

  render()
}
