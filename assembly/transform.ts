import { lerpNumber, M3 } from './utils'

export function perspectiveTransform(
	srcPtr: u32,
	dstPtr: u32,
	sW: i32,
	sH: i32,
	dW: i32,
	dH: i32,
	m: M3
): void {
	// 预分配变量，避免在循环中创建
	let vx: f64, vy: f64, vz: f64
	let tx: f64, ty: f64, tz: f64

	for (let i: i32 = 0; i < dW; ++i) {
		for (let j: i32 = 0; j < dH; ++j) {
			// 内联矩阵乘法，避免函数调用和数组创建
			vx = f64(i) / f64(dW)
			vy = f64(j) / f64(dH)
			vz = 1.0

			// 矩阵变换
			tx = m[0] * vx + m[1] * vy + m[2] * vz
			ty = m[3] * vx + m[4] * vy + m[5] * vz
			tz = m[6] * vx + m[7] * vy + m[8] * vz

			vx = (f64(sW) * tx) / tz
			vy = (f64(sH) * ty) / tz

			const x = i32(Math.floor(vx))
			const y = i32(Math.floor(vy))

			const factorX = vx - f64(x)
			const factorY = vy - f64(y)

			const dstBaseIndex = (j * dW + i) * 4

			// 内联颜色获取和插值，减少函数调用
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
