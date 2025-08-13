use wasm_bindgen::prelude::*;

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
