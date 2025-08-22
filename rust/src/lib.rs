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
    let m = [m0, m1, m2, m3, m4, m5, m6, m7, m8];

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
    m: &[f64; 9],
) {
    let vy = j as f64 / d_h as f64;

    let m1vy = m[1] * vy;
    let m4vy = m[4] * vy;
    let m7vy = m[7] * vy;

    let m2_m1vy = m[2] + m1vy;
    let m5_m4vy = m[5] + m4vy;
    let m8_m7vy = m[8] + m7vy;

    const SIMD_WIDTH: i32 = 4;
    let max_simd_i = (d_w / SIMD_WIDTH) * SIMD_WIDTH;

    // Process 4 pixels at a time using SIMD
    for i in (0..max_simd_i).step_by(SIMD_WIDTH as usize) {
        let i_vec = f32x4(i as f32, (i + 1) as f32, (i + 2) as f32, (i + 3) as f32);
        let d_w_vec = f32x4_splat(d_w as f32);
        let s_w_vec = f32x4_splat(s_w as f32);
        let s_h_vec = f32x4_splat(s_h as f32);

        let vx_vec = f32x4_div(i_vec, d_w_vec);

        let m0_vec = f32x4_splat(m[0] as f32);
        let m2_m1vy_vec = f32x4_splat(m2_m1vy as f32);
        let tx_vec = f32x4_add(f32x4_mul(m0_vec, vx_vec), m2_m1vy_vec);

        let m3_vec = f32x4_splat(m[3] as f32);
        let m5_m4vy_vec = f32x4_splat(m5_m4vy as f32);
        let ty_vec = f32x4_add(f32x4_mul(m3_vec, vx_vec), m5_m4vy_vec);

        let m6_vec = f32x4_splat(m[6] as f32);
        let m8_m7vy_vec = f32x4_splat(m8_m7vy as f32);
        let tz_vec = f32x4_add(f32x4_mul(m6_vec, vx_vec), m8_m7vy_vec);

        let final_vx_vec = f32x4_div(f32x4_mul(s_w_vec, tx_vec), tz_vec);
        let final_vy_vec = f32x4_div(f32x4_mul(s_h_vec, ty_vec), tz_vec);

        // Extract and process each pixel
        let final_vx_values = [
            f32x4_extract_lane::<0>(final_vx_vec) as f64,
            f32x4_extract_lane::<1>(final_vx_vec) as f64,
            f32x4_extract_lane::<2>(final_vx_vec) as f64,
            f32x4_extract_lane::<3>(final_vx_vec) as f64,
        ];
        let final_vy_values = [
            f32x4_extract_lane::<0>(final_vy_vec) as f64,
            f32x4_extract_lane::<1>(final_vy_vec) as f64,
            f32x4_extract_lane::<2>(final_vy_vec) as f64,
            f32x4_extract_lane::<3>(final_vy_vec) as f64,
        ];

        for lane in 0..4 {
            interpolate_pixel_optimized(
                src_ptr,
                dst_ptr,
                i + lane,
                j,
                final_vx_values[lane as usize],
                final_vy_values[lane as usize],
                s_w,
                s_h,
                d_w,
            );
        }
    }

    // Process remaining pixels
    for i in max_simd_i..d_w {
        let vx = i as f64 / d_w as f64;

        let tx = m[0] * vx + m2_m1vy;
        let ty = m[3] * vx + m5_m4vy;
        let tz = m[6] * vx + m8_m7vy;

        let final_vx = (s_w as f64 * tx) / tz;
        let final_vy = (s_h as f64 * ty) / tz;

        interpolate_pixel_optimized(src_ptr, dst_ptr, i, j, final_vx, final_vy, s_w, s_h, d_w);
    }
}

#[cfg(target_arch = "wasm32")]
#[target_feature(enable = "simd128")]
fn interpolate_pixel_optimized(
    src_ptr: *const u8,
    dst_ptr: *mut u8,
    i: i32,
    j: i32,
    vx: f64,
    vy: f64,
    s_w: i32,
    s_h: i32,
    d_w: i32,
) {
    let x = vx.floor() as i32;
    let y = vy.floor() as i32;

    let factor_x = vx - x as f64;
    let factor_y = vy - y as f64;

    let dst_index = ((j * d_w + i) * 4) as isize;

    if x >= 0 && x + 1 < s_w && y >= 0 && y + 1 < s_h {
        // Fast path: all pixels are within bounds
        let src_index_00 = ((y * s_w + x) * 4) as isize;
        let src_index_10 = ((y * s_w + x + 1) * 4) as isize;
        let src_index_01 = (((y + 1) * s_w + x) * 4) as isize;
        let src_index_11 = (((y + 1) * s_w + x + 1) * 4) as isize;

        unsafe {
            // Load 4 pixels as u32 values
            let pixel_00 = *(src_ptr.offset(src_index_00) as *const u32);
            let pixel_10 = *(src_ptr.offset(src_index_10) as *const u32);
            let pixel_01 = *(src_ptr.offset(src_index_01) as *const u32);
            let pixel_11 = *(src_ptr.offset(src_index_11) as *const u32);

            // Extract RGBA components using SIMD
            let c00 = f32x4(
                (pixel_00 & 0xff) as f32,
                ((pixel_00 >> 8) & 0xff) as f32,
                ((pixel_00 >> 16) & 0xff) as f32,
                ((pixel_00 >> 24) & 0xff) as f32,
            );

            let c10 = f32x4(
                (pixel_10 & 0xff) as f32,
                ((pixel_10 >> 8) & 0xff) as f32,
                ((pixel_10 >> 16) & 0xff) as f32,
                ((pixel_10 >> 24) & 0xff) as f32,
            );

            let c01 = f32x4(
                (pixel_01 & 0xff) as f32,
                ((pixel_01 >> 8) & 0xff) as f32,
                ((pixel_01 >> 16) & 0xff) as f32,
                ((pixel_01 >> 24) & 0xff) as f32,
            );

            let c11 = f32x4(
                (pixel_11 & 0xff) as f32,
                ((pixel_11 >> 8) & 0xff) as f32,
                ((pixel_11 >> 16) & 0xff) as f32,
                ((pixel_11 >> 24) & 0xff) as f32,
            );

            let factor_x_vec = f32x4_splat(factor_x as f32);
            let factor_y_vec = f32x4_splat(factor_y as f32);

            // Bilinear interpolation using SIMD
            let top = f32x4_add(c00, f32x4_mul(f32x4_sub(c10, c00), factor_x_vec));
            let bottom = f32x4_add(c01, f32x4_mul(f32x4_sub(c11, c01), factor_x_vec));
            let result = f32x4_add(top, f32x4_mul(f32x4_sub(bottom, top), factor_y_vec));

            // Store results
            *dst_ptr.offset(dst_index) = f32x4_extract_lane::<0>(result) as u8;
            *dst_ptr.offset(dst_index + 1) = f32x4_extract_lane::<1>(result) as u8;
            *dst_ptr.offset(dst_index + 2) = f32x4_extract_lane::<2>(result) as u8;
            *dst_ptr.offset(dst_index + 3) = f32x4_extract_lane::<3>(result) as u8;
        }
    } else {
        // Slow path: handle boundary conditions
        for k in 0..4 {
            let c00 = get_color_safe(src_ptr, x, y, k, s_w, s_h);
            let c10 = get_color_safe(src_ptr, x + 1, y, k, s_w, s_h);
            let c01 = get_color_safe(src_ptr, x, y + 1, k, s_w, s_h);
            let c11 = get_color_safe(src_ptr, x + 1, y + 1, k, s_w, s_h);

            let top = c00 + (c10 - c00) * factor_x;
            let bottom = c01 + (c11 - c01) * factor_x;
            let result = top + (bottom - top) * factor_y;

            unsafe {
                *dst_ptr.offset(dst_index + k as isize) = result as u8;
            }
        }
    }
}

#[allow(dead_code)]
fn get_color_safe(src_ptr: *const u8, i: i32, j: i32, k: i32, w: i32, h: i32) -> f64 {
    if i >= 0 && i < w && j >= 0 && j < h {
        unsafe { *src_ptr.offset(((j * w + i) * 4 + k) as isize) as f64 }
    } else {
        0.0
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
