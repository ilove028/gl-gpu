@group(0) @binding(4) material: Material;
@group(0) @binding(5) light: Light;
@group(0) @binding(6) viewPositionWc: vec3<f32>;

struct Material {
  diffuse: texture_2d<f32>,
  specular: texture_2d<f32>,
  diffuseSampler: sampler,
  specularSamper: sampler,
  shininess: f32,
};

struct Light {
  position: vec3<f32>,
  ambient: vec3<f32>,
  diffuse: vec3<f32>,
  specular: vec3<f32>,
};

struct InputData {
  @location(0) positionWc: vec3<f32>,
  @location(1) normal: vec3<f32>,
  @location(2) uv: vec2<f32>,
};

@fragment
fn main(input: InputData) -> @location(0) vec4<f32> {
  var normal: vec3<f32> = normalize(input.normal);
  var materialDiffuse: vec3<f32> = textureSample(material.diffuse, material.diffuseSampler, input.uv).rgb;
  var ambient: vec3<f32> = light.ambient * materialDiffuse;
  var lightDirection: vec3<f32> = normalize(light.position - input.positionWc);
  var diffuseFactor: f32 = max(dot(lightDirection, normal), 0.0);
  var diffuse: vec3<f32> = light.diffuse * diffuseFactor * materialDiffuse;
  var viewDirection: vec3<f32> = normalize(viewPositionWc - input.positionWc);
  var specularFactor: f32 = pow(max(dot(reflect(-lightDirection, normal), viewDirection), 0.0), material.shininess);
  var specular: vec3<f32> = light.specular * specularFactor * textureSample(material.specular, material.specularSamper, input.uv).rgb;

  return vec4<f32>(ambient + diffuse + specular, 1.0);
}