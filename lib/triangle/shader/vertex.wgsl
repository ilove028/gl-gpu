@vertex
fn main(@location(0) aPosition: vec3<f32>) -> @builtin(position) vec4<f32> {
  return vec4<f32>(aPosition, 1.0);
}