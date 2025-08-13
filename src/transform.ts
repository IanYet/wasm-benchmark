import { applyM3Inplace, lerpNumber, v3, type M3 } from './utils'

export const perspectiveTransform = (
	src: Uint8ClampedArray,
	sW: number,
	sH: number,
	dW: number,
	dH: number,
	m: M3
): Uint8ClampedArray<ArrayBuffer> => {
	const dst = new Uint8ClampedArray(dW * dH * 4)
	const v = v3(0, 0, 1)

	for (let i = 0; i < dW; ++i) {
		for (let j = 0; j < dH; ++j) {
			v[0] = i / dW
			v[1] = j / dH
			v[2] = 1
			applyM3Inplace(m, v)
			v[0] = (sW * v[0]) / v[2]
			v[1] = (sH * v[1]) / v[2]
			v[2] = 1

			const x = Math.floor(v[0])
			const y = Math.floor(v[1])

			const factorX = v[0] - x
			const factorY = v[1] - y

			for (let k = 0; k < 4; ++k) {
				dst[(j * dW + i) * 4 + k] = lerpNumber(
					lerpNumber(
						getColor(x, y, k, sW, sH, src),
						getColor(x + 1, y, k, sW, sH, src),
						factorX
					),
					lerpNumber(
						getColor(x, y + 1, k, sW, sH, src),
						getColor(x + 1, y + 1, k, sW, sH, src),
						factorX
					),
					factorY
				)
			}
		}
	}

	return dst
}

function getColor(
	i: number,
	j: number,
	k: number,
	w: number,
	h: number,
	data: Uint8ClampedArray
): number {
	if (i >= 0 && i < w && j >= 0 && j < h) {
		return data[(j * w + i) * 4 + k] ?? 0
	}
	return 0
}
