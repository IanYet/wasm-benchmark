/**
 * Draws an image onto a canvas element. And return the ImageData.
 * @param el HTMLCanvasElement to draw on
 * @param src Image source URL
 * @returns ImageData of the drawn image
 */
export const drawFromSrc = (el: HTMLCanvasElement, src: string): Promise<ImageData> =>
	new Promise((resolve, reject) => {
		const img = new Image()
		img.crossOrigin = 'anonymous' // Handle CORS if needed
		img.onload = () => {
			const ctx = el.getContext('2d')
			if (!ctx) {
				reject(new Error('Failed to get canvas context'))
				return
			}
			el.width = img.width
			el.height = img.height
			ctx.drawImage(img, 0, 0)
			resolve(ctx.getImageData(0, 0, el.width, el.height))
		}
		img.onerror = (err) => reject(err)
		img.src = src
	})

/**
 * Draws an ImageData object onto a canvas element.
 * @param el HTMLCanvasElement to draw on
 * @param imageData ImageData object to draw
 */
export const drawFromImageData = (el: HTMLCanvasElement, imageData: ImageData): void => {
	const ctx = el.getContext('2d')
	if (!ctx) {
		throw new Error('Failed to get canvas context')
	}

	ctx.putImageData(imageData, 0, 0)
}
