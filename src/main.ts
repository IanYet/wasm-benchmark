import { drawFromSrc } from './draw'
import './style.css'
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

main()

// function test() {
// 	// geneArrayByNew(10_000_000)
// 	// geneArrayByLiteral(10_000_000)
// 	// geneTypedArray(10_000_000)
// }

// test()
