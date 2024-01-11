/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the MIT License.
 */

const MAX_SAMPLES = 100;

/**
 * Class related to frame rate monitoring
 */
export default class FPSMonitor {
  constructor(
    private _callback: (
      current: number,
      average: number,
      deviation: number
    ) => void
  ) {}

  /**
   * Measure FPS every seconds
   */
  tick() {
    this._count += 1;

    const curTime = Date.now();
    // Elapsed time (sec)
    const elapsed = (curTime - this._lastTime) / 1000;

    if (elapsed < 1) {
      return;
    }

    this._current = this._count / elapsed;

    if (!this._samples) {
      // First process.
      this._average = this._current;
      this._variance2 = this._average / 2;
    } else {
      const diff2 = (this._current - this._average) ** 2;
      if (diff2 <= this._variance2) {
        this._average =
          (this._average * (this._samples - 1) + this._current) / this._samples;
      }
      this._variance2 =
        (this._variance2 * (this._samples - 1) + diff2) / this._samples;
    }

    this._samples = Math.min(this._samples + 1, MAX_SAMPLES);
    this._count = 0;
    this._lastTime = curTime;

    this._callback(this._current, this._average, Math.sqrt(this._variance2));
  }

  private _samples = 0;

  private _count = 0;

  private _current = 0;

  private _average = 0;

  private _variance2 = 0;

  private _lastTime = Date.now();
}
