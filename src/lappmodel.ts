/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the MIT License.
 */

import _ from 'lodash'
import { Live2DCubismFramework as cubismdefaultparameterid } from '../CubismWebSamples/Framework/cubismdefaultparameterid'
import { Live2DCubismFramework as cubismmodelsettingjson } from '../CubismWebSamples/Framework/cubismmodelsettingjson'
import { Live2DCubismFramework as cubismbreath } from '../CubismWebSamples/Framework/effect/cubismbreath'
import { Live2DCubismFramework as cubismeyeblink } from '../CubismWebSamples/Framework/effect/cubismeyeblink'
import { Live2DCubismFramework as icubismmodelsetting } from '../CubismWebSamples/Framework/icubismmodelsetting'
import { Live2DCubismFramework as cubismid } from '../CubismWebSamples/Framework/id/cubismid'
import { Live2DCubismFramework as live2dcubismframework } from '../CubismWebSamples/Framework/live2dcubismframework'
import { Live2DCubismFramework as cubismmatrix44 } from '../CubismWebSamples/Framework/math/cubismmatrix44'
import { Live2DCubismFramework as cubismusermodel } from '../CubismWebSamples/Framework/model/cubismusermodel'
import { Live2DCubismFramework as acubismmotion } from '../CubismWebSamples/Framework/motion/acubismmotion'
import { Live2DCubismFramework as cubismmotion } from '../CubismWebSamples/Framework/motion/cubismmotion'
import { Live2DCubismFramework as cubismmotionqueuemanager } from '../CubismWebSamples/Framework/motion/cubismmotionqueuemanager'
import { Live2DCubismFramework as csmmap } from '../CubismWebSamples/Framework/type/csmmap'
import { Live2DCubismFramework as csmvector } from '../CubismWebSamples/Framework/type/csmvector'
import { Live2DCubismFramework as cubismstring } from '../CubismWebSamples/Framework/utils/cubismstring'
import { LAppDefine } from './lappdefine'
import LAppDelegate from './lappdelegate'
import { LAppPal } from './lapppal'
import { Live2DCubismFramework as cubismmotionmanager } from '../CubismWebSamples/Framework/motion/cubismmotionmanager'

import InvalidMotionQueueEntryHandleValue = cubismmotionqueuemanager.InvalidMotionQueueEntryHandleValue
import CubismMotion = cubismmotion.CubismMotion
import CubismString = cubismstring.CubismString
import CubismMatrix44 = cubismmatrix44.CubismMatrix44
import CsmMap = csmmap.csmMap
import CsmVector = csmvector.csmVector
import CubismBreath = cubismbreath.CubismBreath
import BreathParameterData = cubismbreath.BreathParameterData
import CubismEyeBlink = cubismeyeblink.CubismEyeBlink
import ACubismMotion = acubismmotion.ACubismMotion
import CubismFramework = live2dcubismframework.CubismFramework
import CubismIdHandle = cubismid.CubismIdHandle
import CubismId = cubismid.CubismId
import CubismUserModel = cubismusermodel.CubismUserModel
import ICubismModelSetting = icubismmodelsetting.ICubismModelSetting
import CubismModelSettingJson = cubismmodelsettingjson.CubismModelSettingJson
import CubismDefaultParameterId = cubismdefaultparameterid
import CubismMotionManager = cubismmotionmanager.CubismMotionManager

/**
 * Implementation class of CubismUserModel
 * Create model and function components, update, call rendering.
 */
export default class LAppModel extends CubismUserModel {
  /**
   * Create model from model3.json with async
   * Create components such as model, motion, physics and so on.
   * model3.json value must be stored in session storage.
   * @param modelName Model name
   * @param offset Model position offset
   * @returns Promise of setup functions
   */
  async setupModel(
    modelName: string,
    offset: { x?: number; y?: number }
  ): Promise<void[]> {
    // Promise functions about setup model
    const promises = [] as Promise<void>[]

    const getSessionValue = (key: string) => {
      const value = sessionStorage.getItem(key)
      if (!value) {
        LAppPal.throwError(
          `The key ${key} does not exist in the session storage or the key is empty.`
        )
      }
      return value
    }

    // model3
    if (!this._modelSetting) {
      const base64 = getSessionValue(`${modelName}.model3.json`)
      const buffer = LAppPal.base64ToBuffer(base64)
      this._modelSetting = new CubismModelSettingJson(buffer, buffer.byteLength)
    }

    // CubismModel
    promises.push(
      (async () => {
        const filename = this._modelSetting.getModelFileName()
        if (!filename) {
          LAppPal.throwError('Moc3 file is not exist in session storage')
        }
        const base64 = getSessionValue(filename)
        const buffer = LAppPal.base64ToBuffer(base64)
        this.loadModel(buffer)
      })()
    )

    // Expression
    promises.push(
      (async () => {
        const count = this._modelSetting.getExpressionCount()
        _.times(count, i => {
          const name = this._modelSetting.getExpressionName(i)
          const filename = this._modelSetting.getExpressionFileName(i)
          const base64 = getSessionValue(filename)
          const buffer = LAppPal.base64ToBuffer(base64)
          const motion = this.loadExpression(buffer, buffer.byteLength, name)
          this._expressions.setValue(name, motion)
        })
      })()
    )

    // Physics
    promises.push(
      (async () => {
        const filename = this._modelSetting.getPhysicsFileName()
        if (!filename) {
          return
        }
        const base64 = getSessionValue(filename)
        const buffer = LAppPal.base64ToBuffer(base64)
        this.loadPhysics(buffer, buffer.byteLength)
      })()
    )

    // Pose
    promises.push(
      (async () => {
        const filename = this._modelSetting.getPoseFileName()
        if (!filename) {
          return
        }
        const base64 = getSessionValue(filename)
        const buffer = LAppPal.base64ToBuffer(base64)
        this.loadPose(buffer, buffer.byteLength)
      })()
    )

    // EyeBlink
    promises.push(
      (async () => {
        if (this._modelSetting.getEyeBlinkParameterCount() > 0) {
          this._eyeBlink = CubismEyeBlink.create(this._modelSetting)
        }
      })()
    )

    // Breath
    promises.push(
      (async () => {
        this._breath = CubismBreath.create()
        const breathParameters = new CsmVector<BreathParameterData>()
        {
          const param = this._idParamAngleX
          breathParameters.pushBack(
            new BreathParameterData(param, 0, 15, 6.5345, 0.5)
          )
        }
        {
          const param = this._idParamAngleY
          breathParameters.pushBack(
            new BreathParameterData(param, 0, 8, 3.5345, 0.5)
          )
        }
        {
          const param = this._idParamAngleZ
          breathParameters.pushBack(
            new BreathParameterData(param, 0, 10, 5.5345, 0.5)
          )
        }
        {
          const param = this._idParamBodyAngleX
          breathParameters.pushBack(
            new BreathParameterData(param, 0, 4, 15.5345, 0.5)
          )
        }
        {
          const param = CubismFramework.getIdManager().getId(
            CubismDefaultParameterId.ParamBreath
          )
          breathParameters.pushBack(
            new BreathParameterData(param, 0, 0.5, 3.2345, 0.5)
          )
        }
        this._breath.setParameters(breathParameters)
      })()
    )

    // UserData
    promises.push(
      (async () => {
        const filename = this._modelSetting.getUserDataFile()
        if (!filename) {
          return
        }
        const base64 = getSessionValue(filename)
        const buffer = LAppPal.base64ToBuffer(base64)
        this.loadUserData(buffer, buffer.byteLength)
      })()
    )

    // EyeBlinkIds
    promises.push(
      (async () => {
        const count = this._modelSetting.getEyeBlinkParameterCount()
        _.times(count, i =>
          this._eyeBlinkIds.pushBack(
            this._modelSetting.getEyeBlinkParameterId(i)
          )
        )
      })()
    )

    // LipSyncIds
    promises.push(
      (async () => {
        const count = this._modelSetting.getLipSyncParameterCount()
        _.times(count, i =>
          this._lipSyncIds.pushBack(this._modelSetting.getLipSyncParameterId(i))
        )
      })()
    )

    // Layout
    promises.push(
      (async () => {
        const layout = new CsmMap<string, number>()
        this._modelSetting.getLayoutMap(layout)
        this._modelMatrix.setupFromLayout(layout)
      })()
    )

    // Motion
    promises.push(
      (async () => {
        this._model.saveParameters()

        const count = this._modelSetting.getMotionGroupCount()
        _.times(count, i => {
          const group = this._modelSetting.getMotionGroupName(i)
          const motionCount = this._modelSetting.getMotionCount(group)
          _.times(motionCount, j => {
            const filename = this._modelSetting.getMotionFileName(group, j)
            const base64 = getSessionValue(`${modelName}/${filename}`)
            const name = CubismString.getFormatedString(`${group}_${j}`)
            const buffer = LAppPal.base64ToBuffer(base64)
            const motion = this.loadMotion(
              buffer,
              buffer.byteLength,
              name
            ) as CubismMotion
            {
              const fadeTime = this._modelSetting.getMotionFadeInTimeValue(
                group,
                j
              )
              if (fadeTime > 0) {
                motion.setFadeInTime(fadeTime)
              }
            }
            {
              const fadeTime = this._modelSetting.getMotionFadeOutTimeValue(
                group,
                j
              )
              if (fadeTime > 0) {
                motion.setFadeOutTime(fadeTime)
              }
            }
            motion.setEffectIds(this._eyeBlinkIds, this._lipSyncIds)
            this._motions.setValue(name, motion)
          })
        })
      })()
    )

    this._modelMatrix.setPosition(offset?.x ?? 0, offset?.y ?? 0)

    return Promise.all(promises)
  }

  /**
   * Setup textures with async
   *
   * @param textures Image elements
   */
  setupTextures(textures: HTMLImageElement[]): Promise<void[]> {
    const usePremultiply = true
    const promises = [] as Promise<void>[]
    const count = this._modelSetting.getTextureCount()

    _.times(count, i =>
      promises.push(
        LAppDelegate.textureManager
          .createTexture(textures[i], usePremultiply)
          .then(textureInfo =>
            this.getRenderer().bindTexture(i, textureInfo.tex)
          )
      )
    )
    this.getRenderer().setIsPremultipliedAlpha(usePremultiply)
    return Promise.all(promises)
  }

  /**
   * Update model
   */
  update() {
    if (!this.isInitialized()) {
      return
    }

    const deltaTimeSeconds = LAppPal.getDeltaTime()

    this._dragManager.update(deltaTimeSeconds)
    this._dragX = this._dragManager.getX()
    this._dragY = this._dragManager.getY()

    let motionUpdated = false

    // Load previous parameters.
    this._model.loadParameters()
    if (this._motionManager.isFinished()) {
      // Start idle motion when no motion is playing.
      LAppPal.printLog('Start idle motion')
      this.startRandomMotion(
        LAppDefine.MOTION_GROUP_IDLE,
        LAppDefine.PRIORITY.IDLE
      )
    } else {
      // Update playing motion.
      motionUpdated = this._motionManager.updateMotion(
        this._model,
        deltaTimeSeconds
      )
    }

    // Save current parameters.
    this._model.saveParameters()

    // Eye blink when no main motion update.
    if (!motionUpdated) {
      this._eyeBlink?.updateParameters(this._model, deltaTimeSeconds)
    }

    // Update expression parameters.
    this._expressionManager?.updateMotion(this._model, deltaTimeSeconds)

    // Adjust face orientation by drag.
    // Value range is -30 to 30.
    this._model.addParameterValueById(this._idParamAngleX, this._dragX * 30)
    this._model.addParameterValueById(this._idParamAngleY, this._dragY * 30)
    this._model.addParameterValueById(
      this._idParamAngleZ,
      this._dragX * this._dragY * -30
    )

    // Adjust body orientation by drag.
    // Value range is -10 to 10.
    this._model.addParameterValueById(this._idParamBodyAngleX, this._dragX * 10)

    // Adjust eye orientation by drag.
    // Value range is -1 to 1.
    this._model.addParameterValueById(this._idParamEyeBallX, this._dragX)
    this._model.addParameterValueById(this._idParamEyeBallY, this._dragY)

    // Update breath parameters.
    this._breath?.updateParameters(this._model, deltaTimeSeconds)

    // Evaluate physics.
    this._physics?.evaluate(this._model, deltaTimeSeconds)

    // Setting lip sync.
    // When performing lip sync in real time, get and set the volume from the system.
    // Value range is 0 to 1.
    const value = 0
    const count = this._lipSyncIds?.getSize() ?? 0
    _.times(count, i =>
      this._model.addParameterValueById(this._lipSyncIds.at(i), value, 0.8)
    )

    // Setting pose parameters.
    this._pose?.updateParameters(this._model, deltaTimeSeconds)

    this._model.update()
  }

  /**
   * Start specify motion
   * @param group Motion group name
   * @param no Number within group
   * @param priority Priority
   * @returns Starting motion ID number, -1 when failed
   */
  startMotion(group: string, no: number, priority: number): number {
    if (priority === LAppDefine.PRIORITY.FORCE) {
      this._motionManager.setReservePriority(priority)
    } else if (!this._motionManager.reserveMotion(priority)) {
      LAppPal.printWarn("Can't start motion.")
      return InvalidMotionQueueEntryHandleValue
    }

    // ex) idle_0
    const name = CubismString.getFormatedString(`${group}_${no}`)
    const autoDelete = false
    const motion = this._motions.getValue(name)

    LAppPal.printLog(`Start motion: ${group}_${no}`)

    return this._motionManager.startMotionPriority(motion, autoDelete, priority)
  }

  /**
   * Start random motion
   * @param group Motion group name
   * @param priority Priority
   * @returns Starting motion ID number, -1 when failed
   */
  startRandomMotion(group: string, priority: number): number {
    if (!this._modelSetting.getMotionCount(group)) {
      return InvalidMotionQueueEntryHandleValue
    }

    const no = Math.floor(
      Math.random() * this._modelSetting.getMotionCount(group)
    )

    return this.startMotion(group, no, priority)
  }

  /**
   * Set expression motion
   *
   * @param expressionId expression motion ID
   */
  setExpression(expressionId: string) {
    const motion = this._expressions.getValue(expressionId)

    LAppPal.printLog(`Expression: ${expressionId}`)

    if (motion) {
      this._expressionManager.startMotionPriority(
        motion,
        false,
        LAppDefine.PRIORITY.FORCE
      )
    } else {
      LAppPal.throwError(`Expression ${expressionId} is undefined`)
    }
  }

  /**
   * Set random expression motion
   */
  setRandomExpression() {
    if (!this._expressions.getSize()) {
      return
    }

    const no = Math.floor(Math.random() * this._expressions.getSize())
    const key = _.times(this._expressions.getSize()).find(i => i === no)
    this.setExpression(this._expressions._keyValues[key].first)
  }

  /**
   * Get hit box infomation
   * @param hitAreaName Hit area name
   * @return Hit box infomation object
   */
  getHitBox(
    hitAreaName: string
  ): {
    left: number
    right: number
    top: number
    bottom: number
  } {
    const count = this._modelSetting.getHitAreasCount()
    const no = _.times(count).find(
      i => this._modelSetting.getHitAreaId(i).getString().s === hitAreaName
    )
    if (no === undefined) {
      return undefined
    }
    const drawId = this._modelSetting.getHitAreaId(no)
    const drawIndex = this._model.getDrawableIndex(drawId)

    const vertexCount = this._model.getDrawableVertexCount(drawIndex)
    const vertices = this._model.getDrawableVertices(drawIndex)

    const hitBox = {
      left: vertices[0],
      right: vertices[0],
      top: vertices[1],
      bottom: vertices[1]
    }

    _.times(vertexCount, i => {
      const x = vertices[i * 2]
      const y = vertices[i * 2 + 1]
      hitBox.left = Math.min(x, hitBox.left)
      hitBox.right = Math.max(x, hitBox.right)
      hitBox.top = Math.max(y, hitBox.top)
      hitBox.bottom = Math.min(y, hitBox.bottom)
    })

    hitBox.left = this._modelMatrix.transformX(hitBox.left)
    hitBox.right = this._modelMatrix.transformX(hitBox.right)
    hitBox.top = this._modelMatrix.transformY(hitBox.top)
    hitBox.bottom = this._modelMatrix.transformY(hitBox.bottom)

    return hitBox
  }

  /**
   * Draw model
   * @param matrix Projection matrix
   * @param viewport Viewport matrix
   * @param frameBuffer
   */
  draw(
    matrix: CubismMatrix44,
    viewport: number[],
    frameBuffer?: WebGLFramebuffer
  ) {
    if (!this.isInitialized()) {
      return
    }

    matrix.multiplyByMatrix(this._modelMatrix)
    this.getRenderer().setMvpMatrix(matrix)
    this.getRenderer().setRenderState(frameBuffer, viewport)
    this.getRenderer().drawModel()
  }

  /**
   * Release motion manager
   */
  release = () => {
    this._motionManager.release()
    this.getRenderer().release()
  }

  private _modelSetting?: ICubismModelSetting

  private readonly _eyeBlinkIds = new CsmVector<CubismIdHandle>()

  private readonly _lipSyncIds = new CsmVector<CubismIdHandle>()

  private readonly _motions = new CsmMap<string, ACubismMotion>()

  private readonly _expressions = new CsmMap<string, ACubismMotion>()

  private readonly _idParamAngleX = CubismFramework.getIdManager().getId(
    CubismDefaultParameterId.ParamAngleX
  )

  private readonly _idParamAngleY = CubismFramework.getIdManager().getId(
    CubismDefaultParameterId.ParamAngleY
  )

  private readonly _idParamAngleZ = CubismFramework.getIdManager().getId(
    CubismDefaultParameterId.ParamAngleZ
  )

  private readonly _idParamEyeBallX = CubismFramework.getIdManager().getId(
    CubismDefaultParameterId.ParamEyeBallX
  )

  private readonly _idParamEyeBallY = CubismFramework.getIdManager().getId(
    CubismDefaultParameterId.ParamEyeBallY
  )

  private readonly _idParamBodyAngleX = CubismFramework.getIdManager().getId(
    CubismDefaultParameterId.ParamBodyAngleX
  )
}
