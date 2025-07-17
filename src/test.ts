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
