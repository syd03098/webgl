'use strict'

import * as mat4 from './gl-matrix/mat4.js'
import { createProgram, createShader } from './utils.js'

export function renderAxes ({ gl, v, p }) {
  const aLocation = 5
  const aColorLocation = 9
  const vs = `#version 300 es
  
    layout(location=${aLocation}) in vec4 aPosition;
    layout(location=${aColorLocation}) in vec4 aColor;
    uniform mat4 MVP;
    out vec4 vColor;
    void main()
    {
        gl_Position = MVP * aPosition;
        vColor = aColor;
    }
  `

  const fs = `#version 300 es
    #ifdef GL_ES
    precision mediump float;
    #endif
    in vec4 vColor;
    out vec4 fColor;
    void main()
    {
        fColor = vColor;
    }
  `

  const mvp = mat4.create()

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vs)
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fs)
  const program = createProgram(gl, vertexShader, fragmentShader)

  const vao = gl.createVertexArray()
  gl.bindVertexArray(vao)

  const vertices = new Float32Array([
    0, 0, 0, 1, 0, 0,
    2, 0, 0, 1, 0, 0,
    0, 0, 0, 0, 1, 0,
    0, 2, 0, 0, 1, 0,
    0, 0, 0, 0, 0, 1,
    0, 0, 2, 0, 0, 1
  ])

  const vbo = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

  const SZ = vertices.BYTES_PER_ELEMENT

  gl.vertexAttribPointer(aLocation, 3, gl.FLOAT, false, SZ * 6, 0)
  gl.enableVertexAttribArray(aLocation)

  gl.vertexAttribPointer(aColorLocation, 3, gl.FLOAT, false, SZ * 6, SZ * 3)
  gl.enableVertexAttribArray(aColorLocation)

  gl.bindVertexArray(null)
  gl.bindBuffer(gl.ARRAY_BUFFER, null)

  function render () {
    gl.useProgram(program)
    gl.bindVertexArray(vao)

    mat4.copy(mvp, p)
    mat4.multiply(mvp, mvp, v)
    gl.uniformMatrix4fv(gl.getUniformLocation(program, 'MVP'), false, mvp)

    gl.drawArrays(gl.LINES, 0, 6)
    gl.bindVertexArray(null)
    gl.useProgram(null)
  }

  render()
}
