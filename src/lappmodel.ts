/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the MIT License.
 */

import _, { last } from 'lodash';
import { Live2DCubismFramework as cubismdefaultparameterid } from '../CubismWebSamples/Framework/src/cubismdefaultparameterid';
import { Live2DCubismFramework as cubismmodelsettingjson } from '../CubismWebSamples/Framework/src/cubismmodelsettingjson';
import { Live2DCubismFramework as cubismbreath } from '../CubismWebSamples/Framework/src/effect/cubismbreath';
import { Live2DCubismFramework as cubismeyeblink } from '../CubismWebSamples/Framework/src/effect/cubismeyeblink';
import { Live2DCubismFramework as icubismmodelsetting } from '../CubismWebSamples/Framework/src/icubismmodelsetting';
import { Live2DCubismFramework as cubismid } from '../CubismWebSamples/Framework/src/id/cubismid';
import { Live2DCubismFramework as live2dcubismframework } from '../CubismWebSamples/Framework/src/live2dcubismframework';
import { Live2DCubismFramework as cubismmatrix44 } from '../CubismWebSamples/Framework/src/math/cubismmatrix44';
import { Live2DCubismFramework as cubismusermodel } from '../CubismWebSamples/Framework/src/model/cubismusermodel';
import { Live2DCubismFramework as acubismmotion } from '../CubismWebSamples/Framework/src/motion/acubismmotion';
import { Live2DCubismFramework as cubismmotion } from '../CubismWebSamples/Framework/src/motion/cubismmotion';
import { Live2DCubismFramework as cubismmotionqueuemanager } from '../CubismWebSamples/Framework/src/motion/cubismmotionqueuemanager';
import { Live2DCubismFramework as csmmap } from '../CubismWebSamples/Framework/src/type/csmmap';
import { Live2DCubismFramework as csmvector } from '../CubismWebSamples/Framework/src/type/csmvector';
import { Live2DCubismFramework as cubismstring } from '../CubismWebSamples/Framework/src/utils/cubismstring';
import { LAppDefine } from './lappdefine';
import LAppDelegate from './lappdelegate';
import { LAppPal } from './lapppal';
import { Live2DCubismFramework as cubismmotionmanager } from '../CubismWebSamples/Framework/src/motion/cubismmotionmanager';

import InvalidMotionQueueEntryHandleValue = cubismmotionqueuemanager.InvalidMotionQueueEntryHandleValue;
import CubismMotion = cubismmotion.CubismMotion;
import CubismString = cubismstring.CubismString;
import CubismMatrix44 = cubismmatrix44.CubismMatrix44;
import CsmMap = csmmap.csmMap;
import CsmVector = csmvector.csmVector;
import CubismBreath = cubismbreath.CubismBreath;
import BreathParameterData = cubismbreath.BreathParameterData;
import CubismEyeBlink = cubismeyeblink.CubismEyeBlink;
import ACubismMotion = acubismmotion.ACubismMotion;
import CubismFramework = live2dcubismframework.CubismFramework;
import CubismIdHandle = cubismid.CubismIdHandle;
import CubismId = cubismid.CubismId;
import CubismUserModel = cubismusermodel.CubismUserModel;
import ICubismModelSetting = icubismmodelsetting.ICubismModelSetting;
import CubismModelSettingJson = cubismmodelsettingjson.CubismModelSettingJson;
import CubismDefaultParameterId = cubismdefaultparameterid;
import CubismMotionManager = cubismmotionmanager.CubismMotionManager;
import { CubismModelMatrix } from '../CubismWebSamples/Framework/src/math/cubismmodelmatrix';
import { MOUSE } from 'three';
import lappdelegate from './lappdelegate';

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

  public updateBreath: boolean;
  public twoshot: boolean;
  modelx: number;
  modely: number;
  modelsize: number;
  dragging: boolean;
  fingers: number;
  lastFingerDist: number;
  scalingmodeFirst: boolean;
  public moveoffset: number;
  TwoFingerMode: boolean;
  modeldegree: number;
  baseAngle: number;
  firstrot: number;
  setmodeldegree: number;
  public CanvasOffsetX: number;
  public CanvasOffsetY: number;

  async setupModel(
    modelName: string,
    offset: { x?: number; y?: number }
  ): Promise<void[]> {
    this.modeldegree = 0;
    this.baseAngle = null;
    this.firstrot = 0;
    this.setmodeldegree = 0;


    // Promise functions about setup model
    const promises = [] as Promise<void>[];

    const getSessionValue = (key: string) => {
      const value = sessionStorage.getItem(key);
      if (!value) {
        LAppPal.throwError(
          `The key ${key} does not exist in the session storage or the key is empty.`
        );
      }
      return value;
    };

    // model3
    if (!this._modelSetting) {
      const base64 = getSessionValue(`${modelName}.model3.json`);
      const buffer = LAppPal.base64ToBuffer(base64);
      this._modelSetting = new CubismModelSettingJson(
        buffer,
        buffer.byteLength
      );
    }

    // CubismModel
    promises.push(
      (async () => {
        const filename = this._modelSetting.getModelFileName();
        if (!filename) {
          LAppPal.throwError('Moc3 file is not exist in session storage');
        }
        const base64 = getSessionValue(filename);
        const buffer = LAppPal.base64ToBuffer(base64);
        this.loadModel(buffer);
      })()
    );

    // Expression
    promises.push(
      (async () => {
        const count = this._modelSetting.getExpressionCount();
        _.times(count, (i) => {
          const name = this._modelSetting.getExpressionName(i);
          const filename = this._modelSetting.getExpressionFileName(i);
          const base64 = getSessionValue(filename);
          const buffer = LAppPal.base64ToBuffer(base64);
          const motion = this.loadExpression(buffer, buffer.byteLength, name);
          this._expressions.setValue(name, motion);
        });
      })()
    );

    // Physics
    promises.push(
      (async () => {
        const filename = this._modelSetting.getPhysicsFileName();
        if (!filename) {
          return;
        }
        const base64 = getSessionValue(filename);
        const buffer = LAppPal.base64ToBuffer(base64);
        this.loadPhysics(buffer, buffer.byteLength);
      })()
    );

    // Pose
    promises.push(
      (async () => {
        const filename = this._modelSetting.getPoseFileName();
        if (!filename) {
          return;
        }
        const base64 = getSessionValue(filename);
        const buffer = LAppPal.base64ToBuffer(base64);
        this.loadPose(buffer, buffer.byteLength);
      })()
    );

    // EyeBlink
    promises.push(
      (async () => {
        if (this._modelSetting.getEyeBlinkParameterCount() > 0) {
          this._eyeBlink = CubismEyeBlink.create(this._modelSetting);
        }
      })()
    );

    // Breath
    promises.push(
      (async () => {
        this._breath = CubismBreath.create();
        const breathParameters = new CsmVector<BreathParameterData>();
        {
          const param = this._idParamAngleX;
          breathParameters.pushBack(
            new BreathParameterData(param, 0, 15, 6.5345, 0.5)
          );
        }
        {
          const param = this._idParamAngleY;
          breathParameters.pushBack(
            new BreathParameterData(param, 0, 8, 3.5345, 0.5)
          );
        }
        {
          const param = this._idParamAngleZ;
          breathParameters.pushBack(
            new BreathParameterData(param, 0, 10, 5.5345, 0.5)
          );
        }
        {
          const param = this._idParamBodyAngleX;
          breathParameters.pushBack(
            new BreathParameterData(param, 0, 4, 15.5345, 0.5)
          );
        }
        {
          const param = CubismFramework.getIdManager().getId(
            CubismDefaultParameterId.ParamBreath
          );
          breathParameters.pushBack(
            new BreathParameterData(param, 0, 0.5, 3.2345, 0.5)
          );
        }
        this._breath.setParameters(breathParameters);
      })()
    );

    // UserData
    promises.push(
      (async () => {
        const filename = this._modelSetting.getUserDataFile();
        if (!filename) {
          return;
        }
        const base64 = getSessionValue(filename);
        const buffer = LAppPal.base64ToBuffer(base64);
        this.loadUserData(buffer, buffer.byteLength);
      })()
    );

    // EyeBlinkIds
    promises.push(
      (async () => {
        const count = this._modelSetting.getEyeBlinkParameterCount();
        _.times(count, (i) =>
          this._eyeBlinkIds.pushBack(
            this._modelSetting.getEyeBlinkParameterId(i)
          )
        );
      })()
    );

    // LipSyncIds
    promises.push(
      (async () => {
        const count = this._modelSetting.getLipSyncParameterCount();
        _.times(count, (i) =>
          this._lipSyncIds.pushBack(this._modelSetting.getLipSyncParameterId(i))
        );
      })()
    );

    // Layout
    promises.push(
      (async () => {
        const layout = new CsmMap<string, number>();
        this._modelSetting.getLayoutMap(layout);
        this._modelMatrix.setupFromLayout(layout);
      })()
    );

    // Motion
    promises.push(
      (async () => {
        this._model.saveParameters();

        const count = this._modelSetting.getMotionGroupCount();
        _.times(count, (i) => {
          const group = this._modelSetting.getMotionGroupName(i);
          const motionCount = this._modelSetting.getMotionCount(group);
          _.times(motionCount, (j) => {
            const filename = this._modelSetting.getMotionFileName(group, j);
            const base64 = getSessionValue(`${modelName}/${filename}`);
            const name = CubismString.getFormatedString(`${group}_${j}`);
            const buffer = LAppPal.base64ToBuffer(base64);
            const motion = this.loadMotion(buffer, buffer.byteLength, name);
            {
              const fadeTime = this._modelSetting.getMotionFadeInTimeValue(
                group,
                j
              );
              if (fadeTime > 0) {
                motion.setFadeInTime(fadeTime);
              }
            }
            {
              const fadeTime = this._modelSetting.getMotionFadeOutTimeValue(
                group,
                j
              );
              if (fadeTime > 0) {
                motion.setFadeOutTime(fadeTime);
              }
            }
            motion.setEffectIds(this._eyeBlinkIds, this._lipSyncIds);
            this._motions.setValue(name, motion);
          });
        });
      })()
    );

    addEventListener('mousedown', (e) => {
      this.dragging = true;
    });
    addEventListener('touchstart', (e) => {
      this.dragging = true;
      if (this.fingers >= 2) {
        this.firstrot = this.modeldegree;
      }
    });
    addEventListener('mouseup', (e) => {
      this.dragging = false;
      //LAppPal.printLog(`Release${e.clientX},${e.clientY}`)
    });
    addEventListener('touchend', (e) => {
      this.dragging = false;
      this.TwoFingerMode = false;
      this.scalingmodeFirst = true;
      this.baseAngle = null;
      //LAppPal.printLog(`TouchRelease${e.changedTouches[0].clientX},${e.changedTouches[0].clientY}`)
    });
    addEventListener('mousemove', (e) => {
      if (this.dragging == true) {
        this.modelx = (e.clientX / window.innerWidth) * 2 - 1;
        if (window.innerWidth / window.innerHeight < 9 / 16) {
          this.modely = ((e.clientY / (window.innerWidth / 9 * 16)) * 2 - 1) * (window.innerHeight / (window.innerWidth / 9 * 16));
        }
        else {
          this.modely = ((e.clientY / window.innerHeight) * 2 - 1);
        }
        //LAppPal.printLog(`Move${this.modelx},${this.modely}`)
      }
    });

    addEventListener('touchmove', (e) => {
      this.fingers = 0;
      for (let i = 0; i < 5; i++) {
        if (e.changedTouches[i] != undefined) {
          this.fingers++;
        } else {
          break;
        }
      }
      if (this.fingers == 2) {
        this.TwoFingerMode = true;
        this.dragging = false;

        this.modelx =
          ((e.changedTouches[0].clientX / window.innerWidth) * 2 - 1 + ((e.changedTouches[1].clientX / window.innerWidth) * 2 - 1)) / 2;
        if (window.innerWidth / window.innerHeight < 9 / 16) {
          this.modely =
            (((e.changedTouches[0].clientY / (window.innerWidth / 9 * 16)) * 2 - 1 + ((e.changedTouches[1].clientY / (window.innerWidth / 9 * 16)) * 2 - 1)) / 2) * (window.innerHeight / (window.innerWidth / 9 * 16));
        }
        else {
          (((e.changedTouches[0].clientY / window.innerHeight) * 2 - 1 + ((e.changedTouches[1].clientY / window.innerHeight) * 2 - 1)) / 2);
        }

        if (this.scalingmodeFirst == true) {
          this.scalingmodeFirst = false;
          this.lastFingerDist = Math.sqrt(
            Math.pow(
              e.changedTouches[1].clientX - e.changedTouches[0].clientX,
              2
            ) +
            Math.pow(
              e.changedTouches[1].clientY - e.changedTouches[0].clientY,
              2
            )
          );
        }
        if (
          this.modelsize +
          (Math.sqrt(
            Math.pow(
              e.changedTouches[1].clientX - e.changedTouches[0].clientX,
              2
            ) +
            Math.pow(
              e.changedTouches[1].clientY - e.changedTouches[0].clientY,
              2
            )
          ) -
            this.lastFingerDist) /
          120 <
          15 &&
          this.modelsize +
          (Math.sqrt(
            Math.pow(
              e.changedTouches[1].clientX - e.changedTouches[0].clientX,
              2
            ) +
            Math.pow(
              e.changedTouches[1].clientY - e.changedTouches[0].clientY,
              2
            )
          ) -
            this.lastFingerDist) /
          120 >
          0
        ) {
          this.modelsize +=
            (Math.sqrt(
              Math.pow(
                e.changedTouches[1].clientX - e.changedTouches[0].clientX,
                2
              ) +
              Math.pow(
                e.changedTouches[1].clientY - e.changedTouches[0].clientY,
                2
              )
            ) -
              this.lastFingerDist) /
            120;
          // LAppPal.printLog(`wheel${this.modelsize}`)
        }
        this.lastFingerDist = Math.sqrt(
          Math.pow(
            e.changedTouches[1].clientX - e.changedTouches[0].clientX,
            2
          ) +
          Math.pow(
            e.changedTouches[1].clientY - e.changedTouches[0].clientY,
            2
          )
        );

        let x1 = e.changedTouches[0].clientX;
        let y1 = e.changedTouches[0].clientY;
        const x2 = e.changedTouches[1].clientX;
        const y2 = e.changedTouches[1].clientY;
        const x3 = (x1 + x2) / 2;
        const y3 = (y1 + y2) / 2;
        x1 -= x3;
        y1 -= y3;
        if (this.baseAngle !== null) {
          const movedAngle = Math.atan2(1 - y1, 0 - x1) * (180 / Math.PI);
          let setdegree = this.firstrot + movedAngle - this.baseAngle;
          setdegree = (setdegree % 360) + 360;
          if (setdegree % 90 > 80) {
            this.modeldegree = 90 * (Math.floor(setdegree / 90) + 1);
          } else if (setdegree % 90 < 10) {
            this.modeldegree = 90 * Math.floor(setdegree / 90);
          } else {
            this.modeldegree = setdegree;
          }
        } else {
          this.firstrot = this.modeldegree;
          this.baseAngle = Math.atan2(1 - y1, 0 - x1) * (180 / Math.PI);
        }
      } else if (this.dragging == true && this.TwoFingerMode == false) {
        this.scalingmodeFirst = true;
        this.modelx = (e.changedTouches[0].clientX / window.innerWidth) * 2 - 1;
        if (window.innerWidth / window.innerHeight < 9 / 16) {
        this.modely =
          ((e.changedTouches[0].clientY / (window.innerWidth / 9 * 16)) * 2 - 1) * ((window.innerWidth / 9 * 16) / (window.innerWidth / 9 * 16));
        }
        else{
          ((e.changedTouches[0].clientY / window.innerHeight) * 2 - 1) ;
        }
        //LAppPal.printLog(`TouchMove${this.modelx},${this.modely}`)
      } else {
        this.scalingmodeFirst = true;
      }
      //LAppPal.printLog(`FingersNumber:${this.fingers}`)
    });
    addEventListener('wheel', (e) => {
      if (!e.shiftKey) {
        if (
          this.modelsize - e.deltaY / 2000 > 0 &&
          this.modelsize - e.deltaY / 2000 < window.innerHeight / 200
        )
          this.modelsize -= e.deltaY / 2000;
      } else {
        this.setmodeldegree += e.deltaY / 20;
        this.setmodeldegree = (this.setmodeldegree % 360) + 360;
        this.modeldegree = this.setmodeldegree;
      }
    });
    this._modelMatrix.setPosition(offset?.x ?? 0, offset?.y ?? 0);
    this.modelx = 0;
    this.modely = 0;
    this.fingers = 0;
    this.modelsize = 1;
    this.scalingmodeFirst = true;
    this.TwoFingerMode = false;

    return Promise.all(promises);
  }

  /**
   * Setup textures with async
   *
   * @param textures Image elements
   */
  setupTextures(textures: HTMLImageElement[]): Promise<void[]> {
    const usePremultiply = true;
    const promises = [] as Promise<void>[];
    const count = this._modelSetting.getTextureCount();

    _.times(count, (i) =>
      promises.push(
        LAppDelegate.textureManager
          .createTexture(textures[i], usePremultiply)
          .then((textureInfo) =>
            this.getRenderer().bindTexture(i, textureInfo.tex)
          )
      )
    );
    this.getRenderer().setIsPremultipliedAlpha(usePremultiply);
    return Promise.all(promises);
  }

  /**
   * Update model
   */
  update() {
    if (!this.isInitialized()) {
      return;
    }

    const deltaTimeSeconds = LAppPal.getDeltaTime();

    this._dragManager.update(deltaTimeSeconds);
    this._dragX = this._dragManager.getX();
    this._dragY = this._dragManager.getY();

    let motionUpdated = false;

    // Load previous parameters.
    this._model.loadParameters();
    if (this._motionManager.isFinished()) {
      // Start idle motion when no motion is playing.
      LAppPal.printLog('Start idle motion');
      this.startRandomMotion(
        LAppDefine.MOTION_GROUP_IDLE,
        LAppDefine.PRIORITY.IDLE
      );
    } else {
      // Update playing motion.
      motionUpdated = this._motionManager.updateMotion(
        this._model,
        deltaTimeSeconds
      );
    }

    // Save current parameters.
    this._model.saveParameters();

    // Eye blink when no main motion update.
    if (!motionUpdated) {
      this._eyeBlink?.updateParameters(this._model, deltaTimeSeconds);
    }

    // Update expression parameters.
    this._expressionManager?.updateMotion(this._model, deltaTimeSeconds);

    // Adjust face orientation by drag.
    // Value range is -30 to 30.
    this._model.addParameterValueById(this._idParamAngleX, this._dragX * 30);
    this._model.addParameterValueById(this._idParamAngleY, this._dragY * 30);
    this._model.addParameterValueById(
      this._idParamAngleZ,
      this._dragX * this._dragY * -30
    );

    // Adjust body orientation by drag.
    // Value range is -10 to 10.
    this._model.addParameterValueById(
      this._idParamBodyAngleX,
      this._dragX * 10
    );

    // Adjust eye orientation by drag.
    // Value range is -1 to 1.
    this._model.addParameterValueById(this._idParamEyeBallX, this._dragX);
    this._model.addParameterValueById(this._idParamEyeBallY, this._dragY);

    // Update breath parameters.
    if (this.updateBreath === true)
      this._breath?.updateParameters(this._model, deltaTimeSeconds);

    // Evaluate physics.
    this._physics?.evaluate(this._model, deltaTimeSeconds);

    // Setting lip sync.
    // When performing lip sync in real time, get and set the volume from the system.
    // Value range is 0 to 1.
    const value = 0;
    const count = this._lipSyncIds?.getSize() ?? 0;
    _.times(count, (i) =>
      this._model.addParameterValueById(this._lipSyncIds.at(i), value, 0.8)
    );

    // Setting pose parameters.
    this._pose?.updateParameters(this._model, deltaTimeSeconds);

    this._model.update();
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
      this._motionManager.setReservePriority(priority);
    } else if (!this._motionManager.reserveMotion(priority)) {
      LAppPal.printWarn("Can't start motion.");
      return InvalidMotionQueueEntryHandleValue;
    }

    // ex) idle_0
    const name = CubismString.getFormatedString(`${group}_${no}`);
    const autoDelete = false;
    const motion = this._motions.getValue(name);

    LAppPal.printLog(`Start motion: ${group}_${no}`);

    return this._motionManager.startMotionPriority(
      motion,
      autoDelete,
      priority
    );
  }

  /**
   * Start random motion
   * @param group Motion group name
   * @param priority Priority
   * @returns Starting motion ID number, -1 when failed
   */
  startRandomMotion(group: string, priority: number): number {
    if (!this._modelSetting.getMotionCount(group)) {
      return InvalidMotionQueueEntryHandleValue;
    }

    const no = Math.floor(
      Math.random() * this._modelSetting.getMotionCount(group)
    );

    return this.startMotion(group, no, priority);
  }

  /**
   * Set expression motion
   *
   * @param expressionId expression motion ID
   */
  setExpression(expressionId: string) {
    const motion = this._expressions.getValue(expressionId);

    LAppPal.printLog(`Expression: ${expressionId}`);

    if (motion) {
      this._expressionManager.startMotionPriority(
        motion,
        false,
        LAppDefine.PRIORITY.FORCE
      );
    } else {
      LAppPal.throwError(`Expression ${expressionId} is undefined`);
    }
  }

  /**
   * Set random expression motion
   */
  setRandomExpression() {
    if (!this._expressions.getSize()) {
      return;
    }

    const no = Math.floor(Math.random() * this._expressions.getSize());
    const key = _.times(this._expressions.getSize()).find((i) => i === no);
    this.setExpression(this._expressions._keyValues[key].first);
  }

  /**
   * Get hit box infomation
   * @param hitAreaName Hit area name
   * @return Hit box infomation object
   */
  getHitBox(hitAreaName: string): {
    left: number;
    right: number;
    top: number;
    bottom: number;
  } {
    const count = this._modelSetting.getHitAreasCount();
    const no = _.times(count).find(
      (i) => this._modelSetting.getHitAreaId(i).getString().s === hitAreaName
    );
    if (no === undefined) {
      return undefined;
    }
    const drawId = this._modelSetting.getHitAreaId(no);
    const drawIndex = this._model.getDrawableIndex(drawId);

    const vertexCount = this._model.getDrawableVertexCount(drawIndex);
    const vertices = this._model.getDrawableVertices(drawIndex);

    const hitBox = {
      left: vertices[0],
      right: vertices[0],
      top: vertices[1],
      bottom: vertices[1],
    };

    _.times(vertexCount, (i) => {
      const x = vertices[i * 2];
      const y = vertices[i * 2 + 1];
      hitBox.left = Math.min(x, hitBox.left);
      hitBox.right = Math.max(x, hitBox.right);
      hitBox.top = Math.max(y, hitBox.top);
      hitBox.bottom = Math.min(y, hitBox.bottom);
    });

    hitBox.left = this._modelMatrix.transformX(hitBox.left);
    hitBox.right = this._modelMatrix.transformX(hitBox.right);
    hitBox.top = this._modelMatrix.transformY(hitBox.top);
    hitBox.bottom = this._modelMatrix.transformY(hitBox.bottom);

    return hitBox;
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
      return;
    }

    if (lappdelegate.twoshot == true) {
      const _modelMatrix: CubismModelMatrix = new CubismModelMatrix(
        this._model.getCanvasWidth(),
        this._model.getCanvasHeight()
      );
      const _projectionMatrix: CubismMatrix44 = new CubismMatrix44();
      const _rotMatrix: CubismMatrix44 = new CubismMatrix44();
      const _offsetMatrix: CubismMatrix44 = new CubismMatrix44();
      const matrixArray2: Float32Array = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, this.moveoffset, 0, 0, 1,]);
      _offsetMatrix.setMatrix(matrixArray2);
      const matrixArray: Float32Array = new Float32Array([
        Math.cos(this.modeldegree * (Math.PI / 180)),
        -Math.sin(this.modeldegree * (Math.PI / 180)),
        0, 0,
        Math.sin(this.modeldegree * (Math.PI / 180)),
        Math.cos(this.modeldegree * (Math.PI / 180)),
        0, 0, 0, 0, 1, 0, 0, 0, 0, 1,
      ]);
      _rotMatrix.setMatrix(matrixArray);

      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;
      const aspectRatio = windowWidth / windowHeight;

      const mainCanvas = document.getElementById('main-canvas');
      const width = mainCanvas.scrollWidth;
      const height = mainCanvas.scrollHeight;

      _projectionMatrix.scale(
        1 * this.modelsize, (width / height) * this.modelsize
      );
      _projectionMatrix.translate(this.modelx, -1 * this.modely);
      _projectionMatrix.multiplyByMatrix(_rotMatrix);
      _projectionMatrix.multiplyByMatrix(_offsetMatrix);
      this.getRenderer().setMvpMatrix(_projectionMatrix);
      this.getRenderer().setRenderState(frameBuffer, viewport);
      this.getRenderer().drawModel();
    } else {
      matrix.multiplyByMatrix(this._modelMatrix);
      this.getRenderer().setMvpMatrix(matrix);
      this.getRenderer().setRenderState(frameBuffer, viewport);
      this.getRenderer().drawModel();
    }
  }

  /**
   * Release motion manager
   */
  release = () => {
    this._motionManager.release();
    this.getRenderer().release();
  };

  private _modelSetting?: ICubismModelSetting;

  private readonly _eyeBlinkIds = new CsmVector<CubismIdHandle>();

  private readonly _lipSyncIds = new CsmVector<CubismIdHandle>();

  private readonly _motions = new CsmMap<string, ACubismMotion>();

  private readonly _expressions = new CsmMap<string, ACubismMotion>();

  private readonly _idParamAngleX = CubismFramework.getIdManager().getId(
    CubismDefaultParameterId.ParamAngleX
  );

  private readonly _idParamAngleY = CubismFramework.getIdManager().getId(
    CubismDefaultParameterId.ParamAngleY
  );

  private readonly _idParamAngleZ = CubismFramework.getIdManager().getId(
    CubismDefaultParameterId.ParamAngleZ
  );

  private readonly _idParamEyeBallX = CubismFramework.getIdManager().getId(
    CubismDefaultParameterId.ParamEyeBallX
  );

  private readonly _idParamEyeBallY = CubismFramework.getIdManager().getId(
    CubismDefaultParameterId.ParamEyeBallY
  );

  private readonly _idParamBodyAngleX = CubismFramework.getIdManager().getId(
    CubismDefaultParameterId.ParamBodyAngleX
  );
}