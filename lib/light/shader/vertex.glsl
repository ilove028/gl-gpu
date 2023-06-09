#version 300 es

layout (location = 0) in vec3 position;
layout (location = 1) in vec3 normal;

out vec3 fragNormal;
out vec3 fragPositon;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectMatrix;
uniform mat3 normalMatrix;

void main() {
  vec4 positionWC = modelMatrix * vec4(position, 1.0);
  gl_Position = projectMatrix * viewMatrix * positionWC;
  fragPositon = positionWC.xyz;
  fragNormal = normalMatrix * normal;
}