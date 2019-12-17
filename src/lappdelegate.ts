/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the MIT License.
 */

import * as THREE from 'three'
import toml from 'toml'
import {
  Live2DCubismFramework as live2dcubismframework,
  Option,
  LogLevel
} from '../CubismWebSamples/Framework/live2dcubismframework'
import FPSMonitor from './fpsmonitor'
import LAppARSprite from './lapparsprite'
import { LAppDefine, CameraProjectionMethod } from './lappdefine'
import { LAppPal } from './lapppal'
import LAppTextureManager from './lapptexturemanager'
import { ModelOption } from './modeloption'

import CubismFramework = live2dcubismframework.CubismFramework

/**
 * Manage Cubism SDK and application
 */
class LAppDelegate {
  /**
   * Initialize what is needed for application
   */
  async initialize(canvas: HTMLCanvasElement) {
    this._gl = canvas.getContext('webgl')

    if (!this._gl) {
      LAppPal.throwError(
        'Unable to initialize WebGL. It iss not supported by your browser.'
      )
    }

    LAppDelegate._initializeCubism()

    const options: ModelOption[] = await fetch(
      `${LAppDefine.RELATIVE_PATH_TO_MODELS}/models.toml`
    )
      .then(res => res.text())
      .then(text => toml.parse(text).models)
    options.forEach(option => this._arSprites.push(new LAppARSprite(option)))

    this._initializeThreeJS(canvas)
    this.initializeArJS()

    this._setupFPSDisplay()
    LAppDelegate._setupConsoleDisplay()
    this._setupMatrixDisplay()
    this._setupClickCallback(canvas)
  }

  /**
   * Perform necessary post-processing
   */
  release() {
    this._textureManager.release()
    this._renderer.dispose()
    this._arSprites.forEach(sprite => sprite.release(this._scene))
    this._scene.dispose()
    CubismFramework.dispose()
  }

  /**
   * Run main loop
   */
  run() {
    // メインループ
    const loop = () => {
      this.update()

      this._fpsMon?.tick()

      // ループのために再帰呼び出し
      requestAnimationFrame(loop)
    }
    loop()
  }

  get textureManager() {
    return this._textureManager
  }

  get gl() {
    return this._gl
  }

  /**
   * Update parameter and render
   */
  update() {
    LAppPal.updateTime()

    // Update AR marker.
    this._arToolkitContext.update(this._arToolkitSource.domElement)

    // Update model status.
    this._arSprites.forEach(sprite => sprite.onUpdate())

    // Render
    this._renderer.render(this._scene, this._camera)

    if (this._printViewMatrix) {
      this._printViewMatrix()
    }
  }

  private _setupFPSDisplay() {
    if (!LAppDefine.DEBUG_MODE) {
      return
    }

    const fpsDisplay = document.createElement('p')
    fpsDisplay.id = 'fps-text'
    document.getElementById('debug-info').appendChild(fpsDisplay)

    this._fpsMon = new FPSMonitor((cur: number, avg: number, dev: number) => {
      const text = `FPS: Cur=${cur.toFixed(2)} Avg=${avg.toFixed(
        2
      )}±${dev.toFixed(2)}`
      fpsDisplay.innerText = text
    })
  }

  /**
   * Setup for displaying console log
   */
  private static _setupConsoleDisplay() {
    if (!LAppDefine.CONSOLE_DISPLAY_ENABLE) {
      return
    }
    const consoleDisplay = document.createElement('ul')
    consoleDisplay.id = 'console-text'
    document.getElementById('debug-info').appendChild(consoleDisplay)

    const addLog = (element: HTMLLIElement) => {
      consoleDisplay.appendChild(element)
      if (consoleDisplay.children.length > LAppDefine.CONSOLE_DISPLAY_ROWS) {
        consoleDisplay.removeChild(consoleDisplay.children[0])
      }
    }
    /* eslint-disable no-console */
    console.log = (message: string) => {
      const element = document.createElement('li')
      element.innerText = message
      addLog(element)
    }
    console.warn = (message: string) => {
      const element = document.createElement('li')
      element.innerText = message
      element.classList.add('warn')
      addLog(element)
    }
    console.error = (message: string) => {
      const element = document.createElement('li')
      element.innerText = message
      element.classList.add('error')
      addLog(element)
    }
    /* eslint-enable no-console */
  }

  /**
   * Setup for displaying mesh matrix
   */
  private _setupMatrixDisplay() {
    if (!LAppDefine.DEBUG_MODE) {
      return
    }
    const matrixDisplay = document.createElement('p')
    matrixDisplay.id = 'matrix-text'
    document.getElementById('debug-info').appendChild(matrixDisplay)

    this._printViewMatrix = () => {
      matrixDisplay.innerText = this._arSprites
        .map(sprite => {
          if (sprite.isVisible()) {
            const modelName = sprite.getModelName()
            const matrixWorld = sprite.getObject3D().matrixWorld.elements
            return `
              model: ${modelName}
              [${matrixWorld.slice(0, 4).map(v => v.toFixed(3))}]
              [${matrixWorld.slice(4, 8).map(v => v.toFixed(3))}]
              [${matrixWorld.slice(8, 12).map(v => v.toFixed(3))}]
              [${matrixWorld.slice(12, 16).map(v => v.toFixed(3))}]
              `
          }
          return ''
        })
        .join('')
    }
  }

  /**
   * Setup for click or touch callback
   * @param canvas HTML canvs element
   */
  private _setupClickCallback(canvas: HTMLCanvasElement) {
    const supportTouch = canvas.ontouchend

    /**
     * Calculate logical coordinates on the target HTML element from client coordinates
     * @param x X coordinate of the client coordinates.
     * @param y Y coordinate of the client coordinates.
     * @param target Logical coordinates (-1 to 1).
     */
    const posOnElement = (x: number, y: number, target: Element) => {
      const rect = target.getBoundingClientRect()

      const posX = ((x - rect.left) / rect.width) * 2 - 1
      const posY = -(((y - rect.top) / rect.height) * 2 - 1)

      return new THREE.Vector2(posX, posY)
    }

    if (supportTouch) {
      const getFirstTouch = (e: TouchEvent) => e.changedTouches[0]
      // Bind callback about touch.
      canvas.ontouchstart = _ => this._onTouchesBegan()
      canvas.ontouchmove = e => {
        const t = getFirstTouch(e)
        const pos = posOnElement(t.clientX, t.clientY, e.target as Element)
        this._onTouchesMoved(pos.x, pos.y)
      }
      canvas.ontouchend = (e: TouchEvent) => {
        const t = getFirstTouch(e)
        const pos = posOnElement(t.clientX, t.clientY, e.target as Element)
        this._onTouchesEnded(pos.x, pos.y)
      }
      canvas.ontouchcancel = (e: TouchEvent) => {
        const t = getFirstTouch(e)
        const pos = posOnElement(t.clientX, t.clientY, e.target as Element)
        this._onTouchesEnded(pos.x, pos.y)
      }
    } else {
      // Bind callback about mouse click.
      canvas.onmousedown = _ => this._onTouchesBegan()
      canvas.onmousemove = e => {
        const pos = posOnElement(e.clientX, e.clientY, e.target as Element)
        this._onTouchesMoved(pos.x, pos.y)
      }
      canvas.onmouseup = e => {
        const pos = posOnElement(e.clientX, e.clientY, e.target as Element)
        this._onTouchesEnded(pos.x, pos.y)
      }
    }
  }

  /**
   * Initialize scene to draw with Three.js
   * @param canvas Render target canvas.
   */
  private _initializeThreeJS(canvas: HTMLCanvasElement) {
    this._renderer = new THREE.WebGLRenderer({
      canvas,
      preserveDrawingBuffer: true
    })
    this._renderer.setSize(canvas.width, canvas.height)
  }

  /**
   * Initialize AR.js
   */
  initializeArJS() {
    // Initialize toolkit source
    const landScape = Math.abs(window.orientation as number) === 90
    this._arToolkitSource = new THREEx.ArToolkitSource({
      sourceType: 'webcam',
      sourceWidth: landScape
        ? LAppDefine.CAMERA_RESOLUTION.height
        : LAppDefine.CAMERA_RESOLUTION.width,
      sourceHeight: landScape
        ? LAppDefine.CAMERA_RESOLUTION.width
        : LAppDefine.CAMERA_RESOLUTION.height
    })
    this._arToolkitSource.init(() => this._onResize())

    // Initialize toolkit context
    this._arToolkitContext = new THREEx.ArToolkitContext({
      debug: LAppDefine.DEBUG_MODE,
      cameraParametersUrl: './assets/data/camera_para.dat',
      detectionMode: 'mono',
      imageSmoothingEnabled: true,
      maxDetectionRate: LAppDefine.AR_MODEL_FRAME_RATE,
      patternRatio: LAppDefine.PATTERN_RATIO
    })
    this._arToolkitContext.init(() => {
      this._camera.projectionMatrix.copy(
        this._arToolkitContext.getProjectionMatrix()
      )
    })

    // Create as many sprites as models.
    this._arSprites.forEach(sprite => {
      const markerRoot = new THREE.Group()
      markerRoot.add(sprite.getObject3D())
      this._scene.add(markerRoot)

      const modelName = sprite.getModelName()
      const patternName = `${modelName}.patt`
      const markerParameter: THREEx.ArMarkerControlsParameters = {
        size: 1,
        type: 'pattern',
        patternUrl: `${LAppDefine.RELATIVE_PATH_TO_MODELS}/${modelName}/${patternName}`,
        changeMatrixMode: 'modelViewMatrix'
      }
      const marker = new THREEx.ArMarkerControls(
        this._arToolkitContext,
        markerRoot,
        markerParameter
      )

      this._arMarkerSet.set(marker, sprite)

      // Store model resource files to session storage.
      sprite.cacheAssets(modelName)
    })
  }

  /**
   * Initialize Cubism SDK
   */
  private static _initializeCubism() {
    /* eslint-disable no-console */
    // setup cubism
    const cubismOption = new Option()
    cubismOption.logFunction = (text: string) => console.log(text)
    /* eslint-enable no-console */
    cubismOption.loggingLevel = LAppDefine.DEBUG_MODE
      ? LogLevel.LogLevel_Verbose
      : LogLevel.LogLevel_Off
    CubismFramework.startUp(cubismOption)
    // initialize cubism
    CubismFramework.initialize()

    LAppPal.updateTime()
  }

  /**
   * Called on window resized.
   */
  private _onResize() {
    const screenWidth = window.innerWidth
    const screenHeight = window.innerHeight

    const arSourceNode = this._arToolkitSource.domElement
    arSourceNode.style.width = `${screenWidth}px`
    arSourceNode.style.height = `${screenHeight}px`

    if (this._arToolkitContext.arController) {
      const arCanvasNode = this._arToolkitContext.arController.canvas

      arCanvasNode.style.width = `${screenWidth}px`
      arCanvasNode.style.height = `${screenHeight}px`
    }

    this._renderer.setPixelRatio(window.devicePixelRatio)
    this._renderer.setSize(screenWidth, screenHeight)

    if (this._camera instanceof THREE.PerspectiveCamera) {
      this._camera.aspect = screenWidth / screenHeight
      this._camera.updateProjectionMatrix()
    } else if (this._camera instanceof THREE.OrthographicCamera) {
      if (screenWidth > screenHeight) {
        this._camera.left = -1
        this._camera.right = 1
        this._camera.top = screenHeight / screenWidth
        this._camera.bottom = -(screenHeight / screenWidth)
      } else {
        this._camera.left = -(screenWidth / screenHeight)
        this._camera.right = screenWidth / screenHeight
        this._camera.top = 1
        this._camera.bottom = -1
      }
      this._camera.updateProjectionMatrix()
    }
  }

  private _onTouchesBegan() {
    this._captured = true
  }

  private _onTouchesMoved(posX: number, posY: number) {
    if (this._captured && LAppDefine.IS_TRACKING_ENABLED) {
      // Position of each sprite on the screen and the relative vector of the pointer
      // are used as parameters for eye tracking.
      this._arSprites.forEach(sprite => {
        const mesh = sprite.getObject3D()

        const meshPos = mesh.localToWorld(mesh.position.clone())
        meshPos.applyMatrix4(this._camera.projectionMatrix)

        const x = posX - meshPos.x
        const y = posY - meshPos.y

        sprite.updateTrackingStatus(x, y)
      })
    }
  }

  private _onTouchesEnded(posX: number, posY: number) {
    if (this._captured) {
      this._captured = false

      // Use the Raycaster to make a hit test for the first collided sprite.
      const posOnScreen = new THREE.Vector2(posX, posY)
      const raycaster = new THREE.Raycaster()
      raycaster.setFromCamera(posOnScreen, this._camera)
      const hitResults = raycaster.intersectObjects(this._scene.children, true)

      this._arSprites.forEach(sprite => {
        sprite.onHitTest(hitResults)
        // Undo eye stacking status.
        sprite.updateTrackingStatus(0, 0)
      })
    }
  }

  private _gl?: WebGLRenderingContext

  private readonly _arSprites = [] as LAppARSprite[]

  private readonly _camera =
    LAppDefine.AR_CAMERA_PROJECTION_MODE === CameraProjectionMethod.Perspective
      ? new THREE.PerspectiveCamera(45, 1, 1, 1000)
      : new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 1000)

  private readonly _scene = new THREE.Scene()

  private _renderer?: THREE.WebGLRenderer

  private _arToolkitSource?: THREEx.ArToolkitSource

  private _arToolkitContext?: THREEx.ArToolkitContext

  private readonly _arMarkerSet = new Map<
    THREEx.ArMarkerControls,
    LAppARSprite
  >()

  private _captured: boolean

  private readonly _textureManager = new LAppTextureManager()

  private _fpsMon?: FPSMonitor

  private _printViewMatrix?: () => void
}

// Create singleton instance.
export default new LAppDelegate()
