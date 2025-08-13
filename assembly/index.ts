// The entry file of your WebAssembly module.
export { perspectiveTransform } from './transform'

export function alloc(length: u32): usize {
	return heap.alloc(length)
}

export function free(ptr: usize): void {
	heap.free(ptr)
}
