import { appleM3Inplace, lerpNumber, M3, v3 } from './utils'

export function perspectiveTransform(sW: u16, sH: u16, dW: u16, dH: u16, m: M3): void {
	const sPixelCount: u32 = sW * sH
	const outputPtr = sPixelCount * 4
	const v = v3(0, 0, 1)

	for (let i: u16 = 0; i < dW; ++i) {
		for (let j: u16 = 0; j < dH; ++j) {
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

			for (let k: u8 = 0; k < 4; ++k) {
				const dstIndex: u32 = (j * dW + i) * 4
				store<u8>(
					outputPtr + dstIndex + k,
					lerpNumber(
						lerpNumber(
							getColor(x, y, k, sW, sH),
							getColor(x + 1, y, k, sW, sH),
							factorX
						),
						lerpNumber(
							getColor(x, y + 1, k, sW, sH),
							getColor(x + 1, y + 1, k, sW, sH),
							factorX
						),
						factorY
					)
				)
			}
		}
	}
}

function getColor(i: f64, j: f64, k: u8, w: u32, h: u32): u8 {
	if (i >= 0 && i < w && j >= 0 && j < h) {
		return load<u8>(u32((j * w + i) * 4 + k))
	}
	return 0
}
