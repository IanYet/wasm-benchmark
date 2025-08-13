import { M3 } from './utils'

export function perspectiveTransformSIMD(
	srcPtr: u32,
	dstPtr: u32,
	sW: i32,
	sH: i32,
	dW: i32,
	dH: i32,
	m: M3
): void {
	for (let j: i32 = 0; j < dH; ++j) {
		processRowSIMD(srcPtr, dstPtr, j, sW, sH, dW, dH, m)
	}
}

function processRowSIMD(
	srcPtr: u32,
	dstPtr: u32,
	j: i32,
	sW: i32,
	sH: i32,
	dW: i32,
	dH: i32,
	m: M3
): void {
	const vy = f64(j) / f64(dH)

	const m1vy = m[1] * vy
	const m4vy = m[4] * vy
	const m7vy = m[7] * vy

	const m2_m1vy = m[2] + m1vy // m[2] + m[1] * vy
	const m5_m4vy = m[5] + m4vy // m[5] + m[4] * vy
	const m8_m7vy = m[8] + m7vy // m[8] + m[7] * vy

	const simdWidth = 4
	const maxSIMDI = (dW / simdWidth) * simdWidth

	for (let i: i32 = 0; i < maxSIMDI; i += simdWidth) {
		const i0 = f32(i)
		const i1 = f32(i + 1)
		const i2 = f32(i + 2)
		const i3 = f32(i + 3)

		const iVec = f32x4(i0, i1, i2, i3)
		const dWVec = f32x4.splat(f32(dW))
		const sWVec = f32x4.splat(f32(sW))
		const sHVec = f32x4.splat(f32(sH))

		const vxVec = f32x4.div(iVec, dWVec)

		const m0Vec = f32x4.splat(f32(m[0]))
		const m2_m1vyVec = f32x4.splat(f32(m2_m1vy))
		const txVec = f32x4.add(f32x4.mul(m0Vec, vxVec), m2_m1vyVec)

		const m3Vec = f32x4.splat(f32(m[3]))
		const m5_m4vyVec = f32x4.splat(f32(m5_m4vy))
		const tyVec = f32x4.add(f32x4.mul(m3Vec, vxVec), m5_m4vyVec)

		const m6Vec = f32x4.splat(f32(m[6]))
		const m8_m7vyVec = f32x4.splat(f32(m8_m7vy))
		const tzVec = f32x4.add(f32x4.mul(m6Vec, vxVec), m8_m7vyVec)

		const finalVxVec = f32x4.div(f32x4.mul(sWVec, txVec), tzVec)
		const finalVyVec = f32x4.div(f32x4.mul(sHVec, tyVec), tzVec)

		const finalVx0 = f64(f32x4.extract_lane(finalVxVec, 0))
		const finalVy0 = f64(f32x4.extract_lane(finalVyVec, 0))
		interpolatePixelOptimized(srcPtr, dstPtr, i, j, finalVx0, finalVy0, sW, sH, dW)

		const finalVx1 = f64(f32x4.extract_lane(finalVxVec, 1))
		const finalVy1 = f64(f32x4.extract_lane(finalVyVec, 1))
		interpolatePixelOptimized(srcPtr, dstPtr, i + 1, j, finalVx1, finalVy1, sW, sH, dW)

		const finalVx2 = f64(f32x4.extract_lane(finalVxVec, 2))
		const finalVy2 = f64(f32x4.extract_lane(finalVyVec, 2))
		interpolatePixelOptimized(srcPtr, dstPtr, i + 2, j, finalVx2, finalVy2, sW, sH, dW)

		const finalVx3 = f64(f32x4.extract_lane(finalVxVec, 3))
		const finalVy3 = f64(f32x4.extract_lane(finalVyVec, 3))
		interpolatePixelOptimized(srcPtr, dstPtr, i + 3, j, finalVx3, finalVy3, sW, sH, dW)
	}

	for (let i: i32 = maxSIMDI; i < dW; ++i) {
		const vx = f64(i) / f64(dW)

		const tx = m[0] * vx + m2_m1vy
		const ty = m[3] * vx + m5_m4vy
		const tz = m[6] * vx + m8_m7vy

		const finalVx = (f64(sW) * tx) / tz
		const finalVy = (f64(sH) * ty) / tz

		interpolatePixelOptimized(srcPtr, dstPtr, i, j, finalVx, finalVy, sW, sH, dW)
	}
}

function interpolatePixelOptimized(
	srcPtr: u32,
	dstPtr: u32,
	i: i32,
	j: i32,
	vx: f64,
	vy: f64,
	sW: i32,
	sH: i32,
	dW: i32
): void {
	const x = i32(Math.floor(vx))
	const y = i32(Math.floor(vy))

	const factorX = vx - f64(x)
	const factorY = vy - f64(y)

	const dstIndex = (j * dW + i) * 4

	if (x >= 0 && x + 1 < sW && y >= 0 && y + 1 < sH) {
		const srcIndex00 = (y * sW + x) * 4
		const srcIndex10 = (y * sW + x + 1) * 4
		const srcIndex01 = ((y + 1) * sW + x) * 4
		const srcIndex11 = ((y + 1) * sW + x + 1) * 4

		const pixel00 = load<u32>(srcPtr + srcIndex00)
		const pixel10 = load<u32>(srcPtr + srcIndex10)
		const pixel01 = load<u32>(srcPtr + srcIndex01)
		const pixel11 = load<u32>(srcPtr + srcIndex11)

		const c00 = f32x4(
			f32(pixel00 & 0xff),
			f32((pixel00 >> 8) & 0xff),
			f32((pixel00 >> 16) & 0xff),
			f32((pixel00 >> 24) & 0xff)
		)

		const c10 = f32x4(
			f32(pixel10 & 0xff),
			f32((pixel10 >> 8) & 0xff),
			f32((pixel10 >> 16) & 0xff),
			f32((pixel10 >> 24) & 0xff)
		)

		const c01 = f32x4(
			f32(pixel01 & 0xff),
			f32((pixel01 >> 8) & 0xff),
			f32((pixel01 >> 16) & 0xff),
			f32((pixel01 >> 24) & 0xff)
		)

		const c11 = f32x4(
			f32(pixel11 & 0xff),
			f32((pixel11 >> 8) & 0xff),
			f32((pixel11 >> 16) & 0xff),
			f32((pixel11 >> 24) & 0xff)
		)

		const factorXVec = f32x4.splat(f32(factorX))
		const factorYVec = f32x4.splat(f32(factorY))

		const top = f32x4.add(c00, f32x4.mul(f32x4.sub(c10, c00), factorXVec))
		const bottom = f32x4.add(c01, f32x4.mul(f32x4.sub(c11, c01), factorXVec))

		const result = f32x4.add(top, f32x4.mul(f32x4.sub(bottom, top), factorYVec))

		store<u8>(dstPtr + dstIndex, u8(f32x4.extract_lane(result, 0)))
		store<u8>(dstPtr + dstIndex + 1, u8(f32x4.extract_lane(result, 1)))
		store<u8>(dstPtr + dstIndex + 2, u8(f32x4.extract_lane(result, 2)))
		store<u8>(dstPtr + dstIndex + 3, u8(f32x4.extract_lane(result, 3)))
	} else {
		for (let k: i32 = 0; k < 4; ++k) {
			const c00 = getColorSafe(srcPtr, x, y, k, sW, sH)
			const c10 = getColorSafe(srcPtr, x + 1, y, k, sW, sH)
			const c01 = getColorSafe(srcPtr, x, y + 1, k, sW, sH)
			const c11 = getColorSafe(srcPtr, x + 1, y + 1, k, sW, sH)

			const top = c00 + (c10 - c00) * factorX
			const bottom = c01 + (c11 - c01) * factorX
			const result = top + (bottom - top) * factorY

			store<u8>(dstPtr + dstIndex + k, u8(result))
		}
	}
}

function getColorSafe(srcPtr: u32, i: i32, j: i32, k: i32, w: i32, h: i32): f64 {
	if (i >= 0 && i < w && j >= 0 && j < h) {
		return f64(load<u8>(srcPtr + (j * w + i) * 4 + k))
	}
	return 0.0
}
