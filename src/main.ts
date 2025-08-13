import { drawFromImageData, drawFromSrc } from './draw'
import './style.css'
import { perspectiveTransform } from './transform'
import { inverseM3, sleep, type M3 } from './utils'
import { instantiate as asInstantiate } from '../build/release.js'
import asWasmUrl from '../build/release.wasm?url'

const [width, height] = [512, 512]
const [dWidth, dHeight] = [width * 2, height * 2]
const dstList = ['js-dst', 'as-dst', 'as-simd-dst']

async function main() {
	const appEl = document.getElementById('app')!

	const srcCanvas = document.createElement('canvas')
	srcCanvas.width = width
	srcCanvas.height = height
	appEl.appendChild(srcCanvas)

	const srcImageData = await drawFromSrc(srcCanvas, '/texture.png')
	console.log(
		`Image Info: ${srcImageData.width}x${srcImageData.height}, ${
			srcImageData.data.length / 4
		} pixels`
	)

	const dstCavList = dstList.map((id) => {
		const dstCanvas = document.createElement('canvas')
		dstCanvas.width = dWidth
		dstCanvas.height = dHeight
		dstCanvas.id = id
		appEl.appendChild(dstCanvas)
		return dstCanvas
	})

	const perspectiveMatrix: M3 = [0.4, 0, 0.2, -0.2, 0.6, 0.2, -0.4, 0, 1]
	const inverseMatrix = inverseM3(perspectiveMatrix)

	js(srcImageData, inverseMatrix, dstCavList[0])

	await sleep(1000)

	const asModule = await initAs()
	as(asModule, srcImageData, inverseMatrix, dstCavList[1])

	await sleep(1000)
	asSIMD(asModule, srcImageData, inverseMatrix, dstCavList[2])
}

function js(srcImageData: ImageData, inverseMatrix: M3, dstCanvas: HTMLCanvasElement) {
	console.time('js perspectiveTransform')
	const dstArrayBuffer = perspectiveTransform(
		srcImageData.data,
		width,
		height,
		dWidth,
		dHeight,
		inverseMatrix
	)
	console.timeEnd('js perspectiveTransform')

	const dstImageData = new ImageData(dstArrayBuffer, dWidth, dHeight)
	drawFromImageData(dstCanvas, dstImageData)
}

async function initAs() {
	const response = await fetch(asWasmUrl)
	const wasmModule = await WebAssembly.compileStreaming(response)
	const asModule = await asInstantiate(wasmModule, {
		env: {
			memory: new WebAssembly.Memory({ initial: 512, maximum: 512 }),
		},
	})

	return asModule
}

function as(
	asModule: Awaited<ReturnType<typeof asInstantiate>>,
	srcImageData: ImageData,
	inverseMatrix: M3,
	dstCanvas: HTMLCanvasElement
) {
	const { memory, alloc, perspectiveTransform } = asModule
	const srcPtr = alloc(width * height * 4)
	const dstPtr = alloc(dWidth * dHeight * 4)

	const wasmData = new Uint8ClampedArray(memory.buffer)
	wasmData.set(srcImageData.data, srcPtr)

	console.time('as perspectiveTransform')
	perspectiveTransform(srcPtr, dstPtr, width, height, dWidth, dHeight, inverseMatrix)
	console.timeEnd('as perspectiveTransform')

	const dstArrayBuffer = new Uint8ClampedArray(memory.buffer, dstPtr, dWidth * dHeight * 4)
	const dstImageData = new ImageData(dstArrayBuffer, dWidth, dHeight)
	drawFromImageData(dstCanvas, dstImageData)
}

function asSIMD(
	asModule: Awaited<ReturnType<typeof asInstantiate>>,
	srcImageData: ImageData,
	inverseMatrix: M3,
	dstCanvas: HTMLCanvasElement
) {
	const { memory, alloc, perspectiveTransformSIMD } = asModule
	const srcPtr = alloc(width * height * 4)
	const dstPtr = alloc(dWidth * dHeight * 4)

	const wasmData = new Uint8ClampedArray(memory.buffer)
	wasmData.set(srcImageData.data, srcPtr)

	console.time('as SIMD perspectiveTransform')
	perspectiveTransformSIMD(srcPtr, dstPtr, width, height, dWidth, dHeight, inverseMatrix)
	console.timeEnd('as SIMD perspectiveTransform')

	const dstArrayBuffer = new Uint8ClampedArray(memory.buffer, dstPtr, dWidth * dHeight * 4)
	const dstImageData = new ImageData(dstArrayBuffer, dWidth, dHeight)
	drawFromImageData(dstCanvas, dstImageData)
}
main()
