#version 300 es
precision highp float;

struct Material {
  vec3 diffuse;
  vec3 specular;
  float shininess;

  vec3 position; // wc
  vec3 normal; // nm ww
};

struct DirectionLight {
  vec3 direction; // nm wc
  vec3 color;
  float density;
};

struct PointLight {
  vec3 position; // wc
  vec3 color;

  float density;
  float constant;
  float linear;
  float quadratic;
};

struct SpotLight {
  vec3 position; // wc
  vec3 color;
  float density;
  vec3 spotDirection; // nm wc
  float cutOff;
  float outerCutOff;

  float constant;
  float linear;
  float quadratic;
};

#define NR_POINT_LIGHTS 4

in vec3 fragPosition;
in vec3 fragNormal;
in vec2 fragUv;

out vec4 outColor;

uniform vec3 cameraPosition;
uniform DirectionLight directionLight;
uniform PointLight pointLights[NR_POINT_LIGHTS];
uniform SpotLight spotLight;
uniform float uShininess;
uniform sampler2D diffuseTexture;
uniform sampler2D specularTexture;

vec3 computeAmbient(vec3 color, float density, Material material) {
  return color * density * material.diffuse;
}

vec3 computeDirectionLight(DirectionLight light, Material material, vec3 cameraPosition) {
  vec3 viewDirection = normalize(cameraPosition - material.position);
  vec3 reflectDirection = normalize(reflect(-light.direction, material.normal));

  return light.color * light.density * max(dot(light.direction, material.normal), 0.0) * material.diffuse
    + light.color
    * light.density
    * pow(max(dot(reflectDirection, viewDirection), 0.0), material.shininess)
    * material.diffuse;
}

vec3 computePointLight(PointLight light, Material material, vec3 cameraPosition) {
  vec3 lightDirection = normalize(light.position - material.position);
  vec3 reflectDirection = normalize(reflect(-lightDirection, material.normal));
  vec3 viewDirection = normalize(cameraPosition - material.position);

  float distance = length(light.position - material.position);
  float attenuation = 1.0 / (light.constant + light.linear * distance + light.quadratic * (distance * distance));

  return light.color * light.density * max(dot(lightDirection, material.normal), 0.0) * material.diffuse
    + light.color
    * light.density
    * pow(max(dot(reflectDirection, viewDirection), 0.0), material.shininess)
    * attenuation
    * material.diffuse;
}

vec3 computeSpotLight(SpotLight light, Material material, vec3 cameraPosition) {
  vec3 lightDirection = normalize(light.position - material.position);
  float delta = dot(light.spotDirection, lightDirection);
  float cutOffFactor = clamp((delta - light.outerCutOff) / (light.cutOff - light.outerCutOff), 0.0, 1.0);

  PointLight pointLight;

  pointLight.position = light.position;
  pointLight.color = light.color;
  pointLight.density = light.density;

  pointLight.constant = light.constant;
  pointLight.linear = light.linear;
  pointLight.quadratic = light.quadratic;

  return computePointLight(pointLight, material, cameraPosition) * cutOffFactor;
}

void main() {
  Material material;
  material.shininess = uShininess;
  material.diffuse = texture(diffuseTexture, fragUv).rgb;
  material.specular = texture(specularTexture, fragUv).rgb;
  material.position = fragPosition;
  material.normal = normalize(fragNormal);

  vec3 result = computeAmbient(vec3(1.0, 1.0, 1.0), 0.2, material);

  result += computeDirectionLight(directionLight, material, cameraPosition);

  for (int i = 0; i < NR_POINT_LIGHTS; i++) {
    result + computePointLight(pointLights[i], material, cameraPosition);
  }

  result += computeSpotLight(spotLight, material, cameraPosition);

  outColor = vec4(result, 1.0);
}
