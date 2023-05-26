@group(0) @binding(1) var diffuseTexture: texture_2d<f32>;
@group(0) @binding(2) var diffuseSampler: sampler;

@fragment
fn main(@location(0) fragUv: vec2<f32>) -> @location(0) vec4<f32> {
  return textureSample(diffuseTexture, diffuseSampler, fragUv);
}