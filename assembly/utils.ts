type V2 = f64[]
type V3 = f64[]
type RGBA = u8[]
type M3 = f64[]

const v2 = (x: f64, y: f64): V2 => [x, y]
const v2Inplace = (v: V2, x: f64, y: f64): V2 => {
	v[0] = x
	v[1] = y
	return v
}
const v3 = (x: f64, y: f64, z: f64): V3 => [x, y, z]
const v3Inplace = (v: V3, x: f64, y: f64, z: f64): V3 => {
	v[0] = x
	v[1] = y
	v[2] = z
	return v
}
const m3 = (
	a11: f64,
	a12: f64,
	a13: f64,
	a21: f64,
	a22: f64,
	a23: f64,
	a31: f64,
	a32: f64,
	a33: f64
): M3 => [a11, a12, a13, a21, a22, a23, a31, a32, a33]
const m3Inplace = (
	m: M3,
	a11: f64,
	a12: f64,
	a13: f64,
	a21: f64,
	a22: f64,
	a23: f64,
	a31: f64,
	a32: f64,
	a33: f64
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
const colorInplace = (c: RGBA, r: u8, g: u8, b: u8, a: u8): RGBA => {
	c[0] = r
	c[1] = g
	c[2] = b
	c[3] = a
	return c
}
const appleM3Inplace = (m: M3, v: V3): V3 => {
	const x = m[0] * v[0] + m[1] * v[1] + m[2] * v[2]
	const y = m[3] * v[0] + m[4] * v[1] + m[5] * v[2]
	const z = m[6] * v[0] + m[7] * v[1] + m[8] * v[2]
	return v3Inplace(v, x, y, z)
}
const lerp = (a: RGBA, b: RGBA, t: f64): RGBA => {
	return [
		(a[0] + (b[0] - a[0]) * t) as u8,
		(a[1] + (b[1] - a[1]) * t) as u8,
		(a[2] + (b[2] - a[2]) * t) as u8,
		(a[3] + (b[3] - a[3]) * t) as u8,
	]
}
const lerpInplace = (a: RGBA, b: RGBA, t: f64): RGBA => {
	return colorInplace(
		a,
		(a[0] + (b[0] - a[0]) * t) as u8,
		(a[1] + (b[1] - a[1]) * t) as u8,
		(a[2] + (b[2] - a[2]) * t) as u8,
		(a[3] + (b[3] - a[3]) * t) as u8
	)
}
const lerpNumber = (a: u8, b: u8, t: f64): u8 => {
	return (a + (b - a) * t) as u8
}

export {
	V2,
	V3,
	RGBA,
	M3,
	v2,
	v2Inplace,
	v3,
	v3Inplace,
	m3,
	m3Inplace,
	colorInplace,
	appleM3Inplace,
	lerp,
	lerpInplace,
	lerpNumber,
}
