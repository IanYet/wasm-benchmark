use wasm_bindgen::prelude::*;

#[cfg(target_arch = "wasm32")]
use std::arch::wasm32::*;

#[wasm_bindgen]
pub fn perspective_transform(
    src_ptr: *const u8,
    dst_ptr: *mut u8,
    s_w: i32,
    s_h: i32,
    d_w: i32,
    d_h: i32,
    m0: f64,
    m1: f64,
    m2: f64,
    m3: f64,
    m4: f64,
    m5: f64,
    m6: f64,
    m7: f64,
    m8: f64,
) {
    let m = [m0, m1, m2, m3, m4, m5, m6, m7, m8];

    for i in 0..d_w {
        for j in 0..d_h {
            let vx = i as f64 / d_w as f64;
            let vy = j as f64 / d_h as f64;
            let vz = 1.0;

            let tx = m[0] * vx + m[1] * vy + m[2] * vz;
            let ty = m[3] * vx + m[4] * vy + m[5] * vz;
            let tz = m[6] * vx + m[7] * vy + m[8] * vz;

            let final_vx = (s_w as f64 * tx) / tz;
            let final_vy = (s_h as f64 * ty) / tz;

            let x = final_vx.floor() as i32;
            let y = final_vy.floor() as i32;

            let factor_x = final_vx - x as f64;
            let factor_y = final_vy - y as f64;

            let dst_base_index = ((j * d_w + i) * 4) as isize;

            for k in 0..4 {
                let c00 = get_color_inline(src_ptr, x, y, k, s_w, s_h);
                let c10 = get_color_inline(src_ptr, x + 1, y, k, s_w, s_h);
                let c01 = get_color_inline(src_ptr, x, y + 1, k, s_w, s_h);
                let c11 = get_color_inline(src_ptr, x + 1, y + 1, k, s_w, s_h);

                let top = c00 + (c10 - c00) * factor_x;
                let bottom = c01 + (c11 - c01) * factor_x;
                let result = top + (bottom - top) * factor_y;

                unsafe {
                    *dst_ptr.offset(dst_base_index + k as isize) = result as u8;
                }
            }
        }
    }
}

fn get_color_inline(src_ptr: *const u8, i: i32, j: i32, k: i32, w: i32, h: i32) -> f64 {
    if i >= 0 && i < w && j >= 0 && j < h {
        unsafe { *src_ptr.offset(((j * w + i) * 4 + k) as isize) as f64 }
    } else {
        0.0
    }
}

#[wasm_bindgen]
#[cfg(target_arch = "wasm32")]
#[target_feature(enable = "simd128")]
pub fn perspective_transform_simd(
    src_ptr: *const u8,
    dst_ptr: *mut u8,
    s_w: i32,
    s_h: i32,
    d_w: i32,
    d_h: i32,
    m0: f64,
    m1: f64,
    m2: f64,
    m3: f64,
    m4: f64,
    m5: f64,
    m6: f64,
    m7: f64,
    m8: f64,
) {
    let m = [
        m0 as f32, m1 as f32, m2 as f32, m3 as f32, m4 as f32, m5 as f32, m6 as f32, m7 as f32,
        m8 as f32,
    ];

    for j in 0..d_h {
        process_row_simd(src_ptr, dst_ptr, j, s_w, s_h, d_w, d_h, &m);
    }
}

#[cfg(target_arch = "wasm32")]
#[target_feature(enable = "simd128")]
fn process_row_simd(
    src_ptr: *const u8,
    dst_ptr: *mut u8,
    j: i32,
    s_w: i32,
    s_h: i32,
    d_w: i32,
    d_h: i32,
    m: &[f32; 9],
) {
    let vy = (j as f32) / (d_h as f32);

    // 预计算常量
    let m1vy = m[1] * vy;
    let m4vy = m[4] * vy;
    let m7vy = m[7] * vy;

    let m2_m1vy = m[2] + m1vy;
    let m5_m4vy = m[5] + m4vy;
    let m8_m7vy = m[8] + m7vy;

    const SIMD_WIDTH: i32 = 4;
    let max_simd_i = (d_w / SIMD_WIDTH) * SIMD_WIDTH;

    // 向量化处理4个像素
    for i in (0..max_simd_i).step_by(SIMD_WIDTH as usize) {
        // 计算4个像素的标准化坐标
        let i_vec = f32x4(i as f32, (i + 1) as f32, (i + 2) as f32, (i + 3) as f32);
        let d_w_f32 = d_w as f32;
        let vx_vec = f32x4_div(i_vec, f32x4_splat(d_w_f32));

        // 变换矩阵计算
        let tx_vec = f32x4_add(f32x4_mul(f32x4_splat(m[0]), vx_vec), f32x4_splat(m2_m1vy));
        let ty_vec = f32x4_add(f32x4_mul(f32x4_splat(m[3]), vx_vec), f32x4_splat(m5_m4vy));
        let tz_vec = f32x4_add(f32x4_mul(f32x4_splat(m[6]), vx_vec), f32x4_splat(m8_m7vy));

        // 计算最终坐标
        let s_w_f32 = s_w as f32;
        let s_h_f32 = s_h as f32;
        let final_vx_vec = f32x4_div(f32x4_mul(f32x4_splat(s_w_f32), tx_vec), tz_vec);
        let final_vy_vec = f32x4_div(f32x4_mul(f32x4_splat(s_h_f32), ty_vec), tz_vec);

        // 一次性提取所有值
        let final_vx: [f32; 4] = unsafe { std::mem::transmute(final_vx_vec) };
        let final_vy: [f32; 4] = unsafe { std::mem::transmute(final_vy_vec) };

        // 处理每个像素
        for lane in 0..4 {
            let pixel_i = i + lane;
            interpolate_pixel(
                src_ptr,
                dst_ptr,
                pixel_i,
                j,
                final_vx[lane as usize],
                final_vy[lane as usize],
                s_w,
                s_h,
                d_w,
            );
        }
    }

    // 处理剩余像素
    for i in max_simd_i..d_w {
        let vx = (i as f32) / (d_w as f32);
        let tx = m[0] * vx + m2_m1vy;
        let ty = m[3] * vx + m5_m4vy;
        let tz = m[6] * vx + m8_m7vy;

        let final_vx = (s_w as f32 * tx) / tz;
        let final_vy = (s_h as f32 * ty) / tz;

        interpolate_pixel(src_ptr, dst_ptr, i, j, final_vx, final_vy, s_w, s_h, d_w);
    }
}

#[cfg(target_arch = "wasm32")]
#[target_feature(enable = "simd128")]
fn interpolate_pixel(
    src_ptr: *const u8,
    dst_ptr: *mut u8,
    i: i32,
    j: i32,
    vx: f32,
    vy: f32,
    s_w: i32,
    s_h: i32,
    d_w: i32,
) {
    let x = vx.floor() as i32;
    let y = vy.floor() as i32;

    if x < 0 || x + 1 >= s_w || y < 0 || y + 1 >= s_h {
        // 边界情况：填充黑色
        unsafe {
            let dst_index = ((j * d_w + i) * 4) as isize;
            *(dst_ptr.offset(dst_index) as *mut u32) = 0;
        }
        return;
    }

    let factor_x = vx - x as f32;
    let factor_y = vy - y as f32;

    unsafe {
        // 快速内存访问
        let src_base = ((y * s_w + x) * 4) as isize;
        let src_stride = (s_w * 4) as isize;

        // 加载4个相邻像素
        let p00 = *(src_ptr.offset(src_base) as *const u32);
        let p10 = *(src_ptr.offset(src_base + 4) as *const u32);
        let p01 = *(src_ptr.offset(src_base + src_stride) as *const u32);
        let p11 = *(src_ptr.offset(src_base + src_stride + 4) as *const u32);

        // 分离RGBA分量并转换为向量
        let c00 = f32x4(
            (p00 & 0xFF) as f32,
            ((p00 >> 8) & 0xFF) as f32,
            ((p00 >> 16) & 0xFF) as f32,
            ((p00 >> 24) & 0xFF) as f32,
        );

        let c10 = f32x4(
            (p10 & 0xFF) as f32,
            ((p10 >> 8) & 0xFF) as f32,
            ((p10 >> 16) & 0xFF) as f32,
            ((p10 >> 24) & 0xFF) as f32,
        );

        let c01 = f32x4(
            (p01 & 0xFF) as f32,
            ((p01 >> 8) & 0xFF) as f32,
            ((p01 >> 16) & 0xFF) as f32,
            ((p01 >> 24) & 0xFF) as f32,
        );

        let c11 = f32x4(
            (p11 & 0xFF) as f32,
            ((p11 >> 8) & 0xFF) as f32,
            ((p11 >> 16) & 0xFF) as f32,
            ((p11 >> 24) & 0xFF) as f32,
        );

        // 双线性插值
        let fx = f32x4_splat(factor_x);
        let fy = f32x4_splat(factor_y);

        let top = f32x4_add(c00, f32x4_mul(f32x4_sub(c10, c00), fx));
        let bottom = f32x4_add(c01, f32x4_mul(f32x4_sub(c11, c01), fx));
        let result = f32x4_add(top, f32x4_mul(f32x4_sub(bottom, top), fy));

        // 存储结果
        let dst_index = ((j * d_w + i) * 4) as isize;
        let rgba: [f32; 4] = std::mem::transmute(result);

        *dst_ptr.offset(dst_index) = rgba[0] as u8;
        *dst_ptr.offset(dst_index + 1) = rgba[1] as u8;
        *dst_ptr.offset(dst_index + 2) = rgba[2] as u8;
        *dst_ptr.offset(dst_index + 3) = rgba[3] as u8;
    }
}

// Fallback SIMD function for non-wasm32 targets
#[wasm_bindgen]
#[cfg(not(target_arch = "wasm32"))]
pub fn perspective_transform_simd(
    src_ptr: *const u8,
    dst_ptr: *mut u8,
    s_w: i32,
    s_h: i32,
    d_w: i32,
    d_h: i32,
    m0: f64,
    m1: f64,
    m2: f64,
    m3: f64,
    m4: f64,
    m5: f64,
    m6: f64,
    m7: f64,
    m8: f64,
) {
    // Fallback to regular implementation on non-wasm32 targets
    perspective_transform(
        src_ptr, dst_ptr, s_w, s_h, d_w, d_h, m0, m1, m2, m3, m4, m5, m6, m7, m8,
    );
}
