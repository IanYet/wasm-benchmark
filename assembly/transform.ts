import { appleM3Inplace, lerpNumber, M3, v3 } from './utils'

export function perspectiveTransform(
	srcPtr: u32,
	dstPtr: u32,
	sW: f64,
	sH: f64,
	dW: f64,
	dH: f64,
	m: M3
): void {
	const v = v3(0, 0, 1)
	for (let i: f64 = 0; i < dW; ++i) {
		for (let j: f64 = 0; j < dH; ++j) {
			v[0] = i / dW
			v[1] = j / dH
			v[2] = 1
			appleM3Inplace(m, v)
			v[0] = (sW * v[0]) / v[2]
			v[1] = (sH * v[1]) / v[2]
			v[2] = 1
			const x = Math.floor(v[0])
			const y = Math.floor(v[1])

			const factorX = v[0] - x
			const factorY = v[1] - y

			for (let k: f64 = 0; k < 4; ++k) {
				const dstIndex = (j * dW + i) * 4
				// console.log(getColor(srcPtr, x, y, k, sW, sH).toString())
				store<u8>(
					u32(dstPtr + dstIndex + k),
					lerpNumber(
						lerpNumber(
							getColor(srcPtr, x, y, k, sW, sH),
							getColor(srcPtr, x + 1, y, k, sW, sH),
							factorX
						),
						lerpNumber(
							getColor(srcPtr, x, y + 1, k, sW, sH),
							getColor(srcPtr, x + 1, y + 1, k, sW, sH),
							factorX
						),
						factorY
					)
				)
			}
		}
	}
}

function getColor(srcPtr: u32, i: f64, j: f64, k: f64, w: f64, h: f64): u8 {
	if (i >= 0 && i < w && j >= 0 && j < h) {
		return load<u8>(u32((j * w + i) * 4 + k + srcPtr))
	}
	return 0
}
