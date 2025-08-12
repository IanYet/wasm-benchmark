/**
 * Chapter 1: create arrays benchmark
 * result: literal > new >>> typed array(**almost 50x slower**)
 */

/**
 *
 * @param count
 */
export const geneArrayByNew = (count: number): void => {
	console.time(`geneArrayByNew ${count} times`)
	//@ts-ignore
	let arr: number[]
	for (let i = 0; i < count; i++) {
		arr = new Array(1, 2, 3, 4)
	}
	console.timeEnd(`geneArrayByNew ${count} times`)
}

/**
 *
 * @param count
 */
export const geneArrayByLiteral = (count: number): void => {
	console.time(`geneArrayByLiteral ${count} times`)
	//@ts-ignore
	let arr: number[]
	for (let i = 0; i < count; i++) {
		arr = [1, 2, 3, 4]
	}
	console.timeEnd(`geneArrayByLiteral ${count} times`)
}

/**
 *
 * @param count
 */
export const geneTypedArray = (count: number): void => {
	console.time(`geneTypedArray ${count} times`)
	let arr: Uint32Array
	for (let i = 0; i < count; i++) {
		arr = new Uint32Array(4)
		arr[0] = 1
		arr[1] = 2
		arr[2] = 3
		arr[3] = 4
		// arr = new Uint32Array([1, 2, 3, 4])  is much more slower(2x)
	}
	console.timeEnd(`geneTypedArray ${count} times`)
}

/**
 * Chapter 2: array operation (read & write) benchmark
 * result: typed array > normal array(**1.2x slower**),
 */

/**
 * Magically, max count is limited less than 2^26 in chromeV138 mba m2 24g. As reference, one 4K image(4096x4096) contains about 2^24 pixels, which needs 2^26 elements(1 pixel == 4 element for rgba).
 * @param count
 */
export const opArray = (count: number): void => {
	const arr = new Array(count).fill(1)
	console.time('opArray')
	for (let i = 1; i < count; i++) {
		arr[i] = arr[i - 1] + 1
	}
	console.timeEnd('opArray')
	console.log(arr[count - 1])
}

/**
 *
 * @param count
 */
export const opTypedArray = (count: number): void => {
	const arr = new Uint32Array(count).fill(1)
	console.time('opTypedArray')
	for (let i = 1; i < count; i++) {
		arr[i] = arr[i - 1] + 1
	}
	console.timeEnd('opTypedArray')
	console.log(arr[count - 1])
}
