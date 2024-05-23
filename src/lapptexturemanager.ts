/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the MIT License.
 */

import LAppDelegate from './lappdelegate';

/**
 * Import and manage textures
 */
export default class LAppTextureManager {
  /**
   * Release all textures
   */
  release = () =>
    this._textures.forEach((texture) =>
      LAppDelegate.gl.deleteBuffer(texture.tex)
    );

  /**
   * Create texture with async
   * @param img Image elements
   * @param usePremultiply Enable premult processing
   * @returns Texture infomation
   */
  async createTexture(
    img: HTMLImageElement,
    usePremultiply: boolean
  ): Promise<TextureInfo> {
    const { gl } = LAppDelegate;

    // Create texture object.
    const tex = gl.createTexture();
    // Select texture.
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MIN_FILTER,
      gl.LINEAR_MIPMAP_LINEAR
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    // Do Premult process.
    if (usePremultiply) {
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
    }
    // Write pixel to texture.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    // Create mipmap.
    gl.generateMipmap(gl.TEXTURE_2D);
    // Bind texture.
    gl.bindTexture(gl.TEXTURE_2D, null);

    const textureInfo: TextureInfo = {
      tex,
      img,
      usePremultiply,
      width: img.width,
      height: img.height,
    };

    this._textures.push(textureInfo);

    return textureInfo;
  }

  releaseTextures = () =>
    this._textures.forEach((texture) => {
      texture.img.remove();
      LAppDelegate.gl.deleteTexture(texture.img);
    });

  private _textures = [] as TextureInfo[];
}

/**
 * Texure image infomation
 */
export interface TextureInfo {
  img: HTMLImageElement;
  tex: WebGLTexture;
  width: number;
  height: number;
  usePremultiply: boolean;
}
