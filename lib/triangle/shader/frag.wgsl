@fragment
fn main(@location(0) fragPosition: vec4<f32>) -> @location(0) vec4<f32> {
  return fragPosition * 0.5 + vec4<f32>(0.5, 0.5, 0.5, 0.5);
}