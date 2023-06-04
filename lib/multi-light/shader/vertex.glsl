#version 300 es

struct UniformMatrix {
  mat4 modelMatrix;
  mat4 viewMatrix;
  mat4 projectMatrix;
  mat4 normalMatrix;
};

layout (location = 0) in vec3 position;
layout (location=1) in vec3 normal;
layout (location=2) in vec2 uv;

out vec3 fragPosition;
out vec3 fragNormal;
out vec2 fragUv;

uniform UniformMatrix matrix;

void main() {
  vec4 positionWc = matrix.modelMatrix * vec4(position, 1.0);

  gl_Position = matrix.projectMatrix * matrix.viewMatrix * positionWc;
  fragPosition = positionWc.xyz;
  fragNormal = (matrix.normalMatrix * vec4(normal, 0.0)).xyz;
  fragUv = uv;
}