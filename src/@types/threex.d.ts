/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the MIT License.
 */

/* eslint max-classes-per-file: "off" */
declare namespace THREEx {
  class ArToolkitContext {
    constructor(parameters: ArToolkitContextParameters);

    baseURL: string;

    arController: any;

    init: (callback: () => void) => void;

    getProjectionMatrix: () => THREE.Matrix4;

    update: (domElement: HTMLElement) => void;
  }
  interface ArToolkitContextParameters {
    // AR backend - ['artoolkit', 'aruco', 'tango']
    trackingBackend?: 'artoolkit' | 'aruco' | 'tango';
    // debug - true if one should display artoolkit debug canvas, false otherwise
    debug?: boolean;
    // the mode of detection - ['color', 'color_and_matrix', 'mono', 'mono_and_matrix']
    detectionMode?: 'color' | 'color_and_matrix' | 'mono' | 'mono_and_matrix';
    // type of matrix code - valid iif detectionMode end with 'matrix' - [3x3, 3x3_HAMMING63, 3x3_PARITY65, 4x4, 4x4_BCH_13_9_3, 4x4_BCH_13_5_5]
    matrixCodeType?:
      | '3x3'
      | '3x3_HAMMING63'
      | '3x3_PARITY65'
      | '4x4'
      | '4x4_BCH_13_9_3'
      | '4x4_BCH_13_5_5';
    // url of the camera parameters
    cameraParametersUrl?: string;
    // tune the maximum rate of pose detection in the source image
    maxDetectionRate?: number;
    // resolution of at which we detect pose in the source image
    canvasWidth?: number;
    canvasHeight?: number;
    // the patternRatio inside the artoolkit marker - artoolkit only
    patternRatio?: number;
    // enable image smoothing or not for canvas copy - default to true
    // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/imageSmoothingEnabled
    imageSmoothingEnabled?: boolean;
  }

  class ArMarkerControls {
    constructor(
      context: ArToolkitContext,
      object3d: THREE.Object3D,
      parameters: ArMarkerControlsParameters
    );
  }
  interface ArMarkerControlsParameters {
    // size of the marker in meter
    size?: number;
    // type of marker - ['pattern', 'barcode', 'unknown' ]
    type?: 'pattern' | 'barcode' | 'unknown';
    // url of the pattern - IIF type='pattern'
    patternUrl?: string;
    // value of the barcode - IIF type='barcode'
    barcodeValue?: number;
    // change matrix mode - [modelViewMatrix, cameraTransformMatrix]
    changeMatrixMode?: 'modelViewMatrix' | 'cameraTransformMatrix';
    // minimal confidence in the marke recognition - between [0, 1] - default to 1
    minConfidence?: number;
    // turn on/off camera smoothing
    smooth?: boolean;
    // number of matrices to smooth tracking over, more = smoother but slower follow
    smoothCount?: number;
    // distance tolerance for smoothing, if smoothThreshold # of matrices are under tolerance, tracking will stay still
    smoothTolerance?: number;
    // threshold for smoothing, will keep still unless enough matrices are over tolerance
    smoothThreshold?: number;
  }

  class ArToolkitSource {
    constructor(parameters: ArToolkitSourceParameters);

    ready: boolean;

    domElement: HTMLElement;

    parameters: ArToolkitSourceParameters;

    init: (onReady?: () => void, onError?: () => void) => void;

    onResize: () => void;
  }
  interface ArToolkitSourceParameters {
    // type of source - ['webcam', 'image', 'video']
    sourceType?: 'webcam' | 'image' | 'video';
    // url of the source - valid if sourceType = image|video
    sourceUrl?: string;
    // Device id of the camera to use (optional)
    deviceId?: string;
    // resolution of at which we initialize in the source image
    sourceWidth?: number;
    sourceHeight?: number;
    // resolution displayed for the source
    displayWidth?: number;
    displayHeight?: number;
  }
}
