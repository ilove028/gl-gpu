@group(0) @binding(0) var<uniform> mvpMatrix: mat4x4<f32>;

struct InputData {
  @location(0) position: vec3<f32>,
  @location(1) uv: vec2<f32>,
}

struct OutpuData {
  @builtin(position) position: vec4<f32>,
  @location(0) fragUv: vec2<f32>,
}

@vertex
fn main(input: InputData) -> OutpuData {
  var output: OutpuData;

  output.position = mvpMatrix * vec4(input.position, 1.0);
  output.fragUv = input.uv;

  return output;
}