/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the MIT License.
 */

import { LAppDefine } from './lappdefine'

/**
 * Utility functions
 */
export module LAppPal {
  /* eslint-disable no-console */
  /**
   * Print log message
   * @param message message
   */
  export const printLog = (message: string) => {
    if (LAppDefine.DEBUG_MODE) {
      console.log(`[APP] ${message}`)
    }
  }
  /**
   * Print warning message
   * @param message message
   */
  export const printWarn = (message: string) => {
    if (LAppDefine.DEBUG_MODE) {
      console.warn(`[APP] ${message}`)
    }
  }
  /**
   * Throw error
   * @param message message
   */
  export const throwError = (message: string) => {
    throw new Error(`[APP] ${message}`)
  }
  /* eslint-enable no-console */

  /**
   * Get difference time from previous frame
   * @returns Delta time
   */
  export const getDeltaTime = () => deltaTime

  /**
   * Update time
   */
  export const updateTime = () => {
    currentFrame = Date.now()
    deltaTime = (currentFrame - lastFrame) / 1000
    lastFrame = currentFrame
  }

  /**
   * Convert array buffer to base64 string
   * @param buffer array buffer
   * @returns base64
   */
  export const bufferToBase64 = (buffer: ArrayBuffer) =>
    Array.from(new Uint8Array(buffer), e => String.fromCharCode(e)).join('')

  /**
   * Convert base64 string to array buffer
   * @param base64 base64 string
   * @returns array buffer
   */
  export const base64ToBuffer = (base64: string) =>
    Uint8Array.from([...base64].map(ch => ch.charCodeAt(0))).buffer

  let currentFrame = 0
  let lastFrame = 0
  let deltaTime = 0
}
