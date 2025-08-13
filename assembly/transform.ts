export function perspectiveTransform(
	srcPtr: u32,
	dstPtr: u32,
	sW: i32,
	sH: i32,
	dW: i32,
	dH: i32,
	m: f64[]
): void {
	for (let i: i32 = 0; i < dW; ++i) {
		for (let j: i32 = 0; j < dH; ++j) {
			const vx = f64(i) / f64(dW)
			const vy = f64(j) / f64(dH)
			const vz = 1.0

			const tx = m[0] * vx + m[1] * vy + m[2] * vz
			const ty = m[3] * vx + m[4] * vy + m[5] * vz
			const tz = m[6] * vx + m[7] * vy + m[8] * vz

			const finalVx = (f64(sW) * tx) / tz
			const finalVy = (f64(sH) * ty) / tz

			const x = i32(Math.floor(finalVx))
			const y = i32(Math.floor(finalVy))

			const factorX = finalVx - f64(x)
			const factorY = finalVy - f64(y)

			const dstBaseIndex = (j * dW + i) * 4

			for (let k: i32 = 0; k < 4; ++k) {
				const c00 = getColorInline(srcPtr, x, y, k, sW, sH)
				const c10 = getColorInline(srcPtr, x + 1, y, k, sW, sH)
				const c01 = getColorInline(srcPtr, x, y + 1, k, sW, sH)
				const c11 = getColorInline(srcPtr, x + 1, y + 1, k, sW, sH)

				const top = c00 + (c10 - c00) * factorX
				const bottom = c01 + (c11 - c01) * factorX
				const result = top + (bottom - top) * factorY

				store<u8>(dstPtr + dstBaseIndex + k, u8(result))
			}
		}
	}
}

function getColorInline(srcPtr: u32, i: i32, j: i32, k: i32, w: i32, h: i32): f64 {
	if (i >= 0 && i < w && j >= 0 && j < h) {
		return f64(load<u8>(srcPtr + (j * w + i) * 4 + k))
	}
	return 0.0
}
