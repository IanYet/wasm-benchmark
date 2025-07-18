/**
 * Vector2
 */
export type V2 = [number, number]
/**
 * Vector3
 */
export type V3 = [number, number, number]
/**
 * Matrix2x2
 */
export type M2 = [number, number, number, number]
/**
 * Matrix3x3
 */
export type M3 = [number, number, number, number, number, number, number, number, number]

export const v2 = (x: number, y: number): V2 => [x, y]

export const v3 = (x: number, y: number, z: number): V3 => [x, y, z]

export const m2 = (a11: number, a12: number, a21: number, a22: number): M2 => [a11, a12, a21, a22]

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
): M3 => [a11, a12, a13, a21, a22, a23, a31, a32, a33]

export const applyM2 = (m: M2, v: V2): V2 => {
	const x = m[0] * v[0] + m[1] * v[1]
	const y = m[2] * v[0] + m[3] * v[1]
	return v2(x, y)
}
