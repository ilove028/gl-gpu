@fragment
fn main(@location(0) fragPosition: vec4<f32>, @location(1) fragUv: vec2<f32>) -> @location(0) vec4<f32> {
  return vec4<f32>(fragUv, 0.0, 1.0);
}