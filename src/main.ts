import { drawFromSrc } from './draw'
import './style.css'
// import { opArray, opTypedArray } from './test'
// import { geneArrayByNew, geneArrayByLiteral, geneTypedArray } from './test'

async function main() {
	const appEl = document.getElementById('app')!

	const srcCanvas = document.createElement('canvas')
	srcCanvas.width = 512
	srcCanvas.height = 512
	appEl.appendChild(srcCanvas)

	const srcImageData = await drawFromSrc(srcCanvas, '/texture.png')
	console.log(
		`Image Info: ${srcImageData.width}x${srcImageData.height}, ${
			srcImageData.data.length / 4
		} pixels`
	)
}

// main()

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
