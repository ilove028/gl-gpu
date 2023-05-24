@group(0) @binding(0) var<uniform> matrix: mat4x4<f32>;

struct Output {
  @builtin(position) position: vec4<f32>,
  @location(0) fragPosition: vec4<f32>,
}

@vertex
fn main(@location(0) aPosition: vec3<f32>) -> Output {
  var output: Output;

  output.position = matrix * vec4<f32>(aPosition, 1.0);
  output.fragPosition = output.position;
  return output;
}