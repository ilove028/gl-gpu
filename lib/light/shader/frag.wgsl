@group(0) @binding(4) var<uniform> light: Light;
@group(0) @binding(5) var<uniform> viewPositionWc: vec3<f32>;
@group(0) @binding(6) var<uniform> shininess: f32;
@group(0) @binding(7) var diffuse: texture_2d<f32>;
@group(0) @binding(8) var specular: texture_2d<f32>;
@group(0) @binding(9) var diffuseSampler: sampler;
@group(0) @binding(10) var specularSamper: sampler;

struct Light {
  position: vec4<f32>,
  ambient: vec4<f32>,
  diffuse: vec4<f32>,
  specular: vec4<f32>,
};

struct Light2 {
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
    var lightF: Light2;
    lightF.position = light.position.xyz;
    lightF.ambient = light.ambient.rgb;
    lightF.diffuse = light.diffuse.rgb;
    lightF.specular = light.specular.rgb;
    // lightF.position = vec3<f32>(1.0, 0.5, 1.0);
    // lightF.ambient = vec3<f32>(0.2, 0.2, 0.2);
    // lightF.diffuse = vec3<f32>(1.0, 1.0, 1.0);
    // lightF.specular = vec3<f32>(1.0, 1.0, 1.0);

  var normal: vec3<f32> = normalize(input.normal);
  var materialDiffuse: vec3<f32> = textureSample(diffuse, diffuseSampler, input.uv).rgb;
  var ambient: vec3<f32> = lightF.ambient * materialDiffuse;
  var lightDirection: vec3<f32> = normalize(lightF.position - input.positionWc);
  var diffuseFactor: f32 = max(dot(lightDirection, normal), 0.0);
  var diffuse: vec3<f32> = lightF.diffuse * diffuseFactor * materialDiffuse;
  var viewDirection: vec3<f32> = normalize(viewPositionWc - input.positionWc);
  var specularFactor: f32 = pow(max(dot(reflect(-lightDirection, normal), viewDirection), 0.0), shininess);
  var specular: vec3<f32> = lightF.specular * specularFactor * textureSample(specular, specularSamper, input.uv).rgb;

  return vec4<f32>(ambient + diffuse + specular, 1.0);
  // return vec4<f32>(light.specular, 1.0);
}