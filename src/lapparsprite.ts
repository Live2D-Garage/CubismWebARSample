/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the MIT License.
 */

import _ from 'lodash'
import * as THREE from 'three'
import { Live2DCubismFramework as cubismmodelsettingjson } from '../CubismWebSamples/Framework/cubismmodelsettingjson'
import { Live2DCubismFramework as cubismMatrix44 } from '../CubismWebSamples/Framework/math/cubismmatrix44'
import DelayFilter from './delayfilter'
import { LAppDefine } from './lappdefine'
import LAppDelegate from './lappdelegate'
import LAppModel from './lappmodel'
import { LAppPal } from './lapppal'
import { ModelOption } from './modeloption'

import CubismMatrix44 = cubismMatrix44.CubismMatrix44
import CubismModelSettingJson = cubismmodelsettingjson.CubismModelSettingJson

enum ARMarkerEvent {
  Detect = 'Detect',
  Lost = 'Lost'
}

enum ARSpriteState {
  Hidden = 'Hidden',
  Showing = 'Showing',
  Shown = 'Shown',
  Hiding = 'Hiding',
  NotInitialized = 'NotInitialize'
}

interface HitArea {
  mesh: THREE.Mesh
  action: () => void
}

/**
 * Sprite for drawing model displayed in the AR space
 */
export default class LAppARSprite {
  constructor(private _modelOption: ModelOption) {
    // Generate transparent mesh and let the model draw when drawing.
    this._initializeMesh()

    const createHitAreaMesh = (meshColor: number) => {
      const geometry = new THREE.PlaneGeometry(1, 1)
      const material = new THREE.MeshBasicMaterial({
        transparent: true,
        color: meshColor,
        opacity: LAppDefine.DEBUG_MODE ? 0.2 : 0
      })
      material.side = THREE.DoubleSide
      return new THREE.Mesh(geometry, material)
    }

    Object.keys(this._modelOption.hitInfo).forEach(key => {
      const hitArea = createHitAreaMesh(0x00ff00)
      hitArea.visible = false
      this._hitAreas.set(key, {
        mesh: hitArea,
        action: () => {
          this._model.startRandomMotion(
            this._modelOption.hitInfo[key],
            LAppDefine.PRIORITY.NORMAL
          )
        }
      })
      this._mesh.add(hitArea)
    })

    this._state = ARSpriteState.Hidden
    this._lastUpdatedTime = Date.now()
  }

  /**
   * Release resources
   */
  release(scene: THREE.Scene) {
    this._model?.release()
    scene.remove(this._mesh)
    const { material, geometry } = this._mesh
    material instanceof THREE.Material && material.dispose()
    material instanceof Array && material.map(m => m.dispose())
    geometry instanceof THREE.Geometry && geometry.dispose()
  }

  /**
   * Store model resource files to session storage.
   */
  async cacheAssets(modelName: string) {
    const dir = `${LAppDefine.RELATIVE_PATH_TO_MODELS}/${modelName}`

    /**
     * Convert the fetched file into base64 text and save it in session storage.
     * @param fileName File name to fetch
     */
    const fetchFileAndCacheToLocal = async (
      fileName: string,
      keyName?: string
    ) => {
      if (!fileName) {
        return
      }
      if (!sessionStorage.getItem(fileName)) {
        LAppPal.printLog(`Cache file: ${fileName}`)
        const res = await fetch(`${dir}/${fileName}`)
        const base64 = LAppPal.bufferToBase64(await res.arrayBuffer())
        sessionStorage.setItem(keyName ?? fileName, base64)
      }
    }

    const modelSetting = await (async () => {
      const model3 = `${modelName}.model3.json`
      await fetchFileAndCacheToLocal(model3)
      const base64 = sessionStorage.getItem(model3)
      const buffer = LAppPal.base64ToBuffer(base64)
      return new CubismModelSettingJson(buffer, buffer.byteLength)
    })()
    const promises = [] as Promise<void>[]

    // moc3
    {
      const filename = modelSetting.getModelFileName()
      promises.push(fetchFileAndCacheToLocal(filename))
    }

    // exp3
    {
      const count = modelSetting.getExpressionCount()
      _.times(count, i => {
        const filename = modelSetting.getExpressionFileName(i)
        promises.push(fetchFileAndCacheToLocal(filename))
      })
    }
    // physics3
    {
      const filename = modelSetting.getPhysicsFileName()
      promises.push(fetchFileAndCacheToLocal(filename))
    }
    // pose3
    {
      const filename = modelSetting.getPoseFileName()
      promises.push(fetchFileAndCacheToLocal(filename))
    }
    // userdata
    {
      const filename = modelSetting.getUserDataFile()
      promises.push(fetchFileAndCacheToLocal(filename))
    }
    // motion3
    {
      const count = modelSetting.getMotionGroupCount()
      _.times(count, i => {
        const group = modelSetting.getMotionGroupName(i)
        const motionCount = modelSetting.getMotionCount(group)
        _.times(motionCount, j => {
          const filename = modelSetting.getMotionFileName(group, j)
          promises.push(
            fetchFileAndCacheToLocal(
              filename,
              `${this._modelOption.name}/${filename}`
            )
          )
        })
      })
    }

    // texture
    {
      const count = modelSetting.getTextureCount()
      this._imgs = []
      _.times(count, i => {
        const filename = modelSetting.getTextureFileName(i)
        const img = new Image()
        img.src = `${dir}/${filename}`
        this._imgs.push(img)
      })
    }

    await Promise.all(promises)
    this._resourceCached = true
  }

  /**
   * Setup model and
   */
  private async showModel() {
    if (!this._resourceCached) {
      return
    }

    LAppPal.printLog(`Load model: ${this._modelOption.name}`)

    this._model = new LAppModel()

    // Use the setTimeout method to execute the process with a delay.
    setTimeout(async () => {
      // Create model.
      const { x, y } = this._modelOption?.canvasOffset ?? {}
      await this._model.setupModel(this._modelOption.name, { x, y })
      // Create renderer and textures.
      const { gl } = LAppDelegate
      this._model.createRenderer()
      this._model.getRenderer().startUp(gl)
      await this._model.setupTextures(this._imgs)
      LAppPal.printLog(`Finish setup ${this._modelOption.name}`)

      this._model.setInitialized(true)
    }, 100)
  }

  /**
   * Create mesh managed by AR marker.
   */
  private _initializeMesh() {
    const geometry = new THREE.PlaneGeometry(1, 1)
    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      color: 0x0000ff,
      opacity: LAppDefine.DEBUG_MODE ? 0.2 : 0
    })
    this._mesh = new THREE.Mesh(geometry, material)
    const scale = this._modelOption?.scale ?? 1
    this._mesh.scale.set(scale, scale, 1)
    if (this._modelOption.rotation) {
      const { x, y, z } = this._modelOption.rotation ?? {}
      this._mesh.rotation.set(
        (x ?? 0 / 180) * Math.PI,
        (y ?? 0 / 180) * Math.PI,
        (z ?? 0 / 180) * Math.PI
      )
    }
    if (this._modelOption.position) {
      const { x, y, z } = this._modelOption.position ?? {}
      this._mesh.position.set(x ?? 0, y ?? 0, z ?? 0)
    }
    this._mesh.position.y += 0.5 * (this._modelOption.billboarding ? 1 : scale)
    this._mesh.onBeforeRender = (
      renderer: THREE.WebGLRenderer,
      _scene: THREE.Scene,
      camera: THREE.Camera
    ) => {
      renderer.state.reset()

      if (!this.isVisible() || !this._model?.isInitialized()) {
        return
      }

      if (!this._renderingStartTime) {
        this._renderingStartTime = Date.now()
      }

      const elapsed = Date.now() - this._renderingStartTime
      if (elapsed >= this._renderingStartDelay) {
        // Reduce camera shake through delay filter.
        let { matrixWorld } = this._mesh

        if (!this._delayFilter) {
          this._delayFilter = new DelayFilter(matrixWorld)
        }
        matrixWorld = this._delayFilter.process(matrixWorld)
        this._mesh.matrixWorld.copy(matrixWorld)

        if (this._modelOption.billboarding) {
          // Bill boarding process.
          const position = this._mesh.position.clone()
          position.applyMatrix4(this._mesh.matrixWorld)

          this._mesh.matrixWorld.identity()
          this._mesh.matrixWorld.setPosition(position)
          this._mesh.matrixWorld.scale(this._mesh.scale)
        }

        // Reflect world space coordinate updates to child objects.
        this._hitAreas.forEach(value => value.mesh.updateMatrixWorld())

        this.renderModel(renderer, camera)
      }
    }
  }

  /**
   * Hide model and release resouces.
   */
  private hideModel() {
    if (this._model) {
      LAppPal.printLog(`Release model: ${this._modelOption.name}`)
      this._model.release()
      this._model = undefined
    }
  }

  /**
   * Get model visible status
   */
  isVisible = () => this._model && this._model.isInitialized()

  /**
   * Get model name
   */
  getModelName = () => this._modelOption.name

  /**
   * Get object managed by AR marker
   */
  getObject3D = () => this._mesh

  /**
   * Draw model
   * @param renderer WebGL renderer
   * @param camera Three.js camera
   */
  private renderModel(renderer: THREE.WebGLRenderer, camera: THREE.Camera) {
    if (this._model) {
      const viewMatrix = this._mesh.matrixWorld.clone()

      const cameraMatrix = camera.projectionMatrix.clone()
      cameraMatrix.multiply(viewMatrix)

      const projection = new CubismMatrix44()
      projection.setMatrix(new Float32Array(cameraMatrix.elements))

      // Three.jsの内部でピクセル比を考慮したサイズが設定されている
      const viewport = new THREE.Vector4()
      renderer.getCurrentViewport(viewport)

      const { gl } = LAppDelegate

      gl.enable(gl.DEPTH_TEST)
      gl.depthFunc(gl.LEQUAL)
      gl.enable(gl.BLEND)
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_COLOR)
      this._model.draw(projection, viewport.toArray())
    }

    renderer.state.reset()
  }

  /**
   * Update hit judgment status
   */
  private updateHitAreas() {
    this._hitAreas.forEach((value, key) => {
      const hitBox = this._model.getHitBox(key)
      if (hitBox) {
        value.mesh.visible = true

        const hitBoxW = hitBox.right - hitBox.left
        const hitBoxH = hitBox.top - hitBox.bottom
        value.mesh.position.x = hitBox.left + hitBoxW / 2
        value.mesh.position.y = hitBox.bottom + hitBoxH / 2
        value.mesh.scale.x = hitBoxW
        value.mesh.scale.y = hitBoxH
      } else {
        value.mesh.visible = false
      }
    })
  }

  /**
   * State transition execution
   * @param nextState Destination status.
   * @param action Action on transition.
   */
  private fireTransition(nextState: ARSpriteState, action?: () => void) {
    LAppPal.printLog(
      `Transition state: (${this._modelOption.name}) ${this._state} -> ${nextState}`
    )

    if (action) {
      action()
    }
    this._state = nextState
    this._lastUpdatedTime = Date.now()
  }

  /**
   * Update model display state
   * @param event State change event of AR marker.
   */
  private doUpdate(event: ARMarkerEvent) {
    switch (this._state) {
      case ARSpriteState.Hidden:
        if (event === ARMarkerEvent.Detect) {
          this.fireTransition(ARSpriteState.Showing)
          this.doUpdate(event)
        }
        break
      case ARSpriteState.Showing:
        if (event === ARMarkerEvent.Detect) {
          const elapsed = Date.now() - this._lastUpdatedTime
          if (elapsed >= LAppDefine.LOADING_DELAY_AFTER_RECOGNIZING_MS) {
            this.fireTransition(ARSpriteState.Shown, () => {
              this.showModel()
              this._renderingStartDelay =
                LAppDefine.RENDERING_DELAY_AFTER_LOADING_MS
              this._renderingStartTime = undefined
              this._delayFilter = undefined
            })
          }
        } else if (event === ARMarkerEvent.Lost) {
          this.fireTransition(ARSpriteState.Hidden)
        }
        break
      case ARSpriteState.Shown:
        if (event === ARMarkerEvent.Lost) {
          this.fireTransition(ARSpriteState.Hiding)
          this.doUpdate(event)
        }
        break
      case ARSpriteState.Hiding:
        if (event === ARMarkerEvent.Detect) {
          this.fireTransition(ARSpriteState.Shown, () => {
            this._renderingStartDelay =
              LAppDefine.RENDERING_DELAY_AFTER_RERECOGNIZING_MS
            this._renderingStartTime = undefined
            this._delayFilter = undefined
          })
        } else if (event === ARMarkerEvent.Lost) {
          const elapsed = Date.now() - this._lastUpdatedTime
          if (elapsed >= LAppDefine.RELEASE_DELAY_AFTER_DERECOGNIZING_MS) {
            this.fireTransition(ARSpriteState.Hidden, () => {
              this.hideModel()
            })
          }
        }
        break
      default:
        break
    }
  }

  /**
   * 描画前に呼び出される。
   */
  onUpdate() {
    // マーカーを認識しているときのみ、モデルを読み込むようにする。
    let { visible } = this._mesh
    this._mesh.traverseAncestors(parent => {
      visible = parent.visible && visible
    })

    const event = visible ? ARMarkerEvent.Detect : ARMarkerEvent.Lost
    this.doUpdate(event)

    if (this.isVisible()) {
      this._model.update()
      this.updateHitAreas()
    }
  }

  /**
   * モデルの視線追従の状態を更新する。
   * @param x 視線先のX値（-1.0..1.0)
   * @param y 緯線先のY値（-1.0..1.0)
   */
  updateTrackingStatus(x: number, y: number) {
    if (this._model) {
      this._model.setDragging(x, y)
    }
  }

  /**
   * 当たり判定処理時に呼び出される。
   * @param hitResults レイキャスト法での検出結果
   */
  onHitTest(hitResults: THREE.Intersection[]) {
    if (this.isVisible()) {
      hitResults.forEach(hitResult => {
        this._hitAreas.forEach((value, key) => {
          if (hitResult.object === value.mesh) {
            LAppPal.printLog(`Hit area: ${key}`)
            if (value.action) {
              value.action()
            }
          }
        })
      })
    }
  }

  private _model?: LAppModel

  private _imgs = [] as HTMLImageElement[]

  private _resourceCached = false

  private _state = ARSpriteState.NotInitialized

  private _lastUpdatedTime = Date.now()

  private _mesh?: THREE.Mesh

  private readonly _hitAreas = new Map<string, HitArea>()

  private _delayFilter?: DelayFilter

  private _renderingStartDelay = 0

  private _renderingStartTime? = 0
}
