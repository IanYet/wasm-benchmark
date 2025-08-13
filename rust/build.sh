#!/bin/bash

# 构建 WASM
cargo build --target wasm32-unknown-unknown --release

# 生成 JavaScript 绑定和类型声明
wasm-bindgen \
    --target web \
    --typescript \
    --out-dir pkg \
    target/wasm32-unknown-unknown/release/wasm_benchmark_rust.wasm

# 可选：优化 WASM 文件
# wasm-opt -Os -o pkg/rust_perspective_bg.wasm pkg/rust_perspective_bg.wasm

echo "Build complete! Files generated in pkg/ directory"