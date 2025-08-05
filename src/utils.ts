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

export const v2Inplace = (v: V2, x: number, y: number): V2 => {
	v[0] = x
	v[1] = y
	return v
}

export const v3 = (x: number, y: number, z: number): V3 => [x, y, z]

export const v3Inplace = (v: V3, x: number, y: number, z: number): V3 => {
	v[0] = x
	v[1] = y
	v[2] = z
	return v
}

export const m2 = (a11: number, a12: number, a21: number, a22: number): M2 => [a11, a12, a21, a22]

export const m2Inplace = (m: M2, a11: number, a12: number, a21: number, a22: number): M2 => {
	m[0] = a11
	m[1] = a12
	m[2] = a21
	m[3] = a22
	return m
}

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

export const m3Inplace = (
	m: M3,
	a11: number,
	a12: number,
	a13: number,
	a21: number,
	a22: number,
	a23: number,
	a31: number,
	a32: number,
	a33: number
): M3 => {
	m[0] = a11
	m[1] = a12
	m[2] = a13
	m[3] = a21
	m[4] = a22
	m[5] = a23
	m[6] = a31
	m[7] = a32
	m[8] = a33
	return m
}

export const applyM2 = (m: M2, v: V2): V2 => {
	const x = m[0] * v[0] + m[1] * v[1]
	const y = m[2] * v[0] + m[3] * v[1]
	return v2(x, y)
}

export const applyM2Inplace = (m: M2, v: V2): V2 => {
	const x = m[0] * v[0] + m[1] * v[1]
	const y = m[2] * v[0] + m[3] * v[1]
	return v2Inplace(v, x, y)
}

export const applyM3 = (m: M3, v: V3): V3 => {
	const x = m[0] * v[0] + m[1] * v[1] + m[2] * v[2]
	const y = m[3] * v[0] + m[4] * v[1] + m[5] * v[2]
	const z = m[6] * v[0] + m[7] * v[1] + m[8] * v[2]
	return v3(x, y, z)
}

export const applyM3Inplace = (m: M3, v: V3): V3 => {
	const x = m[0] * v[0] + m[1] * v[1] + m[2] * v[2]
	const y = m[3] * v[0] + m[4] * v[1] + m[5] * v[2]
	const z = m[6] * v[0] + m[7] * v[1] + m[8] * v[2]
	return v3Inplace(v, x, y, z)
}
