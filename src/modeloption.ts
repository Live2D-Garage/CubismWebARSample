/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the MIT License.
 */

export interface ModelOption {
  // Model name
  name: string
  // Position offset of model to draw on the mesh
  canvasOffset?: { x?: number; y?: number }
  // Scale of mesh
  scale?: number
  // Angle offset of mesh to AR marker
  rotation?: { x?: number; y?: number; z?: number }
  // Position offset of mesh to AR marker
  position?: { x?: number; y?: number; z?: number }
  // Whether to draw mesh in front of the camera
  billboarding?: boolean
  // Information of hit judgment
  // Key: Hit area ID, Value: Motion group name
  hitInfo?: { [key: string]: string }
}
