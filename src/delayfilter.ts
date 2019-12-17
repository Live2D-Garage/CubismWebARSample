/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the MIT License.
 */

import * as THREE from 'three'
import _ from 'lodash'
import { LAppDefine } from './lappdefine'

/**
 * Filter to suppress camera shake
 */
export default class DelayFilter {
  constructor(m: THREE.Matrix4) {
    this._lastU = m.clone()
    this._lastY = m.clone()
  }

  process(curU: THREE.Matrix4) {
    const curTime = Date.now()
    const deltaTime = curTime - this._lastTime

    _.times(16, i => {
      const d = this._D.elements[i] * deltaTime
      const y = this._lastY.elements[i]
      const u0 = this._lastU.elements[i]
      const u1 = curU.elements[i]

      this._lastY.elements[i] = y + d
      this._D.elements[i] = (u1 - u0) / LAppDefine.TIME_CONSTANT_OF_DELAY_FILTER
    })

    this._lastU = this._lastY.clone()
    this._lastTime = curTime

    return this._lastY.clone()
  }

  private _lastU: THREE.Matrix4

  private readonly _lastY: THREE.Matrix4

  private _lastTime = Date.now()

  private readonly _D = new THREE.Matrix4()
}
