/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the MIT License.
 */

export enum CameraProjectionMethod {
  Perspective,
  Orthographic,
}

/**
 * Constants used in this application
 */
export namespace LAppDefine {
  // Frame thickness constant for AR marker
  export const PATTERN_RATIO = 0.9;

  // Web camera resolution used in AR
  export const CAMERA_RESOLUTION: { width: number; height: number } = {
    width: 640,
    height: 480,
  };

  // Delay between recognizing marker and loading model (ms)
  export const LOADING_DELAY_AFTER_RECOGNIZING_MS = 500;

  // Delay between derecognizing marker and release model (ms)
  export const RELEASE_DELAY_AFTER_DERECOGNIZING_MS = 5000;

  // Delay between loading model and start rendering model (ms)
  export const RENDERING_DELAY_AFTER_LOADING_MS = 1000;

  // Delay between re-recognizing marker and start rendering model (ms)
  export const RENDERING_DELAY_AFTER_RERECOGNIZING_MS = 100;

  // Time constant of delay filter
  export const TIME_CONSTANT_OF_DELAY_FILTER = 100;

  // Camera projection method for AR drawing
  export const AR_CAMERA_PROJECTION_MODE: CameraProjectionMethod =
    CameraProjectionMethod.Perspective;

  // Enable eye tracking
  export const IS_TRACKING_ENABLED = false;

  // Frame rate of drawing mesh on AR
  export const AR_MODEL_FRAME_RATE = 24;

  // Enable debug log
  export const DEBUG_MODE = false;

  // Display console logs on HTML
  export const CONSOLE_DISPLAY_ENABLE = false;

  // Model display setting (for debugging)
  export const MODEL_DISPLAY = true;

  // Button display setting (for debugging)
  export const UI_DISPLAY = true;

  //Change button position in Twohot Mode ("left" or "right")
  export const TWOSHOTMENU_POSITION = 'left';

  // Number of lines to display console logs on HTML
  export const CONSOLE_DISPLAY_ROWS = 20;

  // Relative path to model resource directory
  export const RELATIVE_PATH_TO_MODELS = './assets/models';

  // Motion group name of idling
  export const MOTION_GROUP_IDLE = 'Idle';

  // Motion priority lists
  export const PRIORITY = {
    NONE: 0,
    IDLE: 1,
    NORMAL: 2,
    FORCE: 3,
  };
}
