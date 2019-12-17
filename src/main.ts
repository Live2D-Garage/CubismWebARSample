/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the MIT License.
 */

import LAppDelegate from './lappdelegate'

window.onload = async () => {
  const mainCanvas = document.getElementById('main-canvas') as HTMLCanvasElement

  // create the application instance
  await LAppDelegate.initialize(mainCanvas)

  LAppDelegate.run()
}

// Reload browser on orientation changed
window.onorientationchange = () => window.location.reload()

// Release application instance on exit
window.onbeforeunload = () => LAppDelegate.release()
