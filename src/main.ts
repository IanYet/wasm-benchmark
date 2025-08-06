import { drawFromImageData, drawFromSrc } from './draw'
import './style.css'
import { perspectiveTransform } from './transform'
import { inverseM3, type M3 } from './utils'
// import { opArray, opTypedArray } from './test'
// import { geneArrayByNew, geneArrayByLiteral, geneTypedArray } from './test'

const [width, height] = [512, 512]

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

	const dstCanvas = document.createElement('canvas')
	dstCanvas.width = width
	dstCanvas.height = height
	appEl.appendChild(dstCanvas)

	const perspectiveMatrix: M3 = [0.4, 0, 0.2, -0.2, 0.6, 0.2, -0.4, 0, 1]
	// const perspectiveMatrix: M3 = [0.5, 0, 0.5, 0, 0.5, 0.5, 0, 0, 1]

	const inverseMatrix = inverseM3(perspectiveMatrix)
	console.log(inverseMatrix)

	console.time('perspectiveTransform')
	const dstArrayBuffer = perspectiveTransform(srcImageData.data, width, height, inverseMatrix)
	console.timeEnd('perspectiveTransform')

	const dstImageData = new ImageData(dstArrayBuffer, width, height)
	drawFromImageData(dstCanvas, dstImageData)
}

main()

function test() {
	// geneArrayByNew(10_000_000)
	// geneArrayByLiteral(10_000_000)
	// geneTypedArray(10_000_000)
	// opArray(60_000_000)
	// opTypedArray(60_000_000)
	// opArray(10_000_000)
	// opTypedArray(10_000_000)
}

test()
