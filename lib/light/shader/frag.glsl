#version 300 es
precision highp float;

struct Material {
  vec3 diffuse;
  vec3 ambient;
  vec3 specular;
  float shininess;
};

struct Light {
  vec3 position;
  vec3 ambient;
  vec3 diffuse;
  vec3 specular;
};

in vec3 fragNormal;
in vec3 fragPositon;
uniform vec3 cameraPosition;
out vec4 outColor;

uniform Material material;
uniform Light light;

void main() {
  vec3 ambient = light.ambient * material.ambient;
  vec3 lightDir = normalize(light.position - fragPositon);
  vec3 cameraDir = normalize(cameraPosition - fragPositon);
  float diffuseFactor = max(dot(fragNormal, lightDir), 0.0);
  vec3 diffuse = light.diffuse * diffuseFactor * material.diffuse;
  float specularFactor = pow(max(dot(fragNormal, normalize(lightDir + cameraDir)), 0.0), material.shininess);
  vec3 specular = light.specular * specularFactor * material.specular;
  outColor = vec4(ambient + diffuse + specular, 1.0);
}