'use strict'

import * as mat4 from './gl-matrix/mat4.js'
import { initOpenGl2, loadTerrainImage } from './utils.js'
import { renderHelicopter } from './chopper.js'
import { renderTerrain } from './terrain.js'
import { renderAxes } from './axes.js'
import { toRadian } from './gl-matrix/common.js'

function main (img) {
  const gl = initOpenGl2()

  let [azimuth, elevation, fov] = [45, 30, 50]
  const [v, p, m, rotorMatrix] = [mat4.create(), mat4.create(), mat4.create(), mat4.create()]

  function fixFirstPoint () {
    mat4.rotateZ(m, m, toRadian(60))
    mat4.translate(m, m, [0, 1, 1.5])
  }

  function render () {
    mat4.perspective(p, toRadian(fov), 1, 1, 100)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    mat4.fromTranslation(v, [0, 0, -6])
    mat4.rotate(v, v, toRadian(elevation), [1, 0, 0])
    mat4.rotate(v, v, -toRadian(azimuth), [0, 1, 0])
    mat4.rotate(v, v, -toRadian(90), [0, 1, 0])
    mat4.rotate(v, v, -toRadian(90), [1, 0, 0])

    renderAxes({ gl, v, p })
    renderTerrain({ gl, v, p, img })

    mat4.rotateZ(rotorMatrix, rotorMatrix, toRadian(12 % 360))
    renderHelicopter({ gl, v, p, m, rotorMatrix })

    requestAnimationFrame(render)
  }

  fixFirstPoint()
  render()
  addEventListener('keydown', function (e) {
    switch (e.key) {
      case 'ArrowUp': {
        if (e.getModifierState('Shift')) {
          elevation += 5
        } else {
          mat4.translate(m, m, [0, -0.1, 0])
        }
        break
      }
      case 'ArrowDown': {
        if (e.getModifierState('Shift')) {
          elevation -= 5
        } else {
          mat4.translate(m, m, [0, 0.1, 0])
        }
        break
      }
      case 'ArrowLeft': {
        if (e.getModifierState('Shift')) {
          azimuth += 5
        } else {
          mat4.rotateZ(m, m, toRadian(3))
        }
        break
      }
      case 'ArrowRight': {
        if (e.getModifierState('Shift')) {
          azimuth -= 5
        } else {
          mat4.rotateZ(m, m, toRadian(-3))
        }
        break
      }
      case 'a':
      case 'A': {
        mat4.translate(m, m, [0, 0, 0.1])
        break
      }
      case 'z':
      case 'Z': {
        mat4.translate(m, m, [0, 0, -0.1])
        break
      }
      case '=':
      case '+': {
        fov = Math.max(fov - 5, 5)
        break
      }
      case '-':
      case '_': {
        fov = Math.min(fov + 5, 120)
        break
      }
      default:
        break
    }
  })
}

loadTerrainImage()
  .then((img) => {
    main(img)
  })
  .catch((err) => console.log(err))
