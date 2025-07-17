/**
 * Vector2
 */
export type V2 = Uint32Array & { length: 2 }
/**
 * Vector3
 */
export type V3 = Uint32Array & { length: 3 }
/**
 * Matrix2x2
 */
export type M2 = Uint32Array & { length: 4 }
/**
 * Matrix3x3
 */
export type M3 = Uint32Array & { length: 9 }

export const v2 = (x: number, y: number): V2 => new Uint32Array([x, y]) as V2

export const v3 = (x: number, y: number, z: number): V3 => new Uint32Array([x, y, z]) as V3

export const m2 = (a11: number, a12: number, a21: number, a22: number): M2 =>
	new Uint32Array([a11, a12, a21, a22]) as M2

export const m3 = (
	a11: number,
	a12: number,
	a13: number,
	a21: number,
	a22: number,
	a23: number,
	a31: number,
	a32: number,
	a33: number
): M3 => new Uint32Array([a11, a12, a13, a21, a22, a23, a31, a32, a33]) as M3
