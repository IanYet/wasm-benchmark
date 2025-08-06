import { applyM3Inplace, lerpNumber, v3, type M3 } from './utils'

export const perspectiveTransform = (
	src: Uint8ClampedArray,
	width: number,
	height: number,
	m: M3
): Uint8ClampedArray => {
	const dst = new Uint8ClampedArray(src.length)
	const v = v3(0, 0, 1)

	for (let i = 0; i < width; ++i) {
		for (let j = 0; j < height; ++j) {
			v[0] = i / width
			v[1] = j / height
			v[2] = 1
			applyM3Inplace(m, v)
			v[0] = (width * v[0]) / v[2]
			v[1] = (height * v[1]) / v[2]
			v[2] = 1

			const x = Math.floor(v[0])
			const y = Math.floor(v[1])

			if (x < 0 || y < 0 || x > width - 1 || y > height - 1) {
				dst[(j * width + i) * 4] = 0
				dst[(j * width + i) * 4 + 1] = 0
				dst[(j * width + i) * 4 + 2] = 0
				dst[(j * width + i) * 4 + 3] = 0
			} else {
				const factorX = v[0] - x
				const factorY = v[1] - y

				for (let k = 0; k < 4; ++k) {
					dst[(j * width + i) * 4 + k] = lerpNumber(
						lerpNumber(
							src[(y * width + x) * 4 + k],
							src[(y * width + x + 1) * 4 + k],
							factorX
						),
						lerpNumber(
							src[((y + 1) * width + x) * 4 + k],
							src[((y + 1) * width + x + 1) * 4 + k],
							factorX
						),
						factorY
					)
				}
			}
		}
	}

	return dst
}
