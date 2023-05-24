@group(0) @binding(1) var Texture: texture_2d<f32>;
@group(0) @binding(2) var Sampler: sampler;

@fragment
fn main(@location(0) fragPosition: vec4<f32>, @location(1) fragUv: vec2<f32>) -> @location(0) vec4<f32> {
  return textureSample(Texture, Sampler, fragUv);
}