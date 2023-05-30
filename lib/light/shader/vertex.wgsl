@group(0) @binding(0) var<uniform> modelMatrix: mat4x4<f32>;
@group(0) @binding(1) var<uniform> viewMatrix: mat4x4<f32>;
@group(0) @binding(2) var<uniform> projectMatrix: mat4x4<f32>;
@group(0) @binding(3) var<uniform> normalMatrix: mat4x4<f32>;

struct InputData {
  @location(0) position: vec3<f32>,
  @location(1) normal: vec3<f32>,
  @location(2) uv: vec2<f32>,
};

struct OutputData {
  @builtin(position) position: vec4<f32>,
  @location(0) positionWc: vec3<f32>,
  @location(1) normal: vec3<f32>,
  @location(2) uv: vec2<f32>,
};

@vertex
fn main(input: InputData) -> OutputData {
  var output: OutputData;
  var pos: vec4<f32> = modelMatrix * vec4<f32>(input.position, 1.0);

  output.position = projectMatrix * viewMatrix * pos;
  output.positionWc = pos.xyz;
  output.normal = (normalMatrix * vec4(input.normal, 0.0)).xyz;
  // output.normal = (modelMatrix * vec4(input.normal, 0.0)).xyz;
  output.uv = input.uv;

  return output;
}