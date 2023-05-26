#version 300 es

layout (location = 0) in vec3 position;
layout (location = 1) in vec2 uv;

out vec2 fragUv;

uniform mat4 mvpMatrix;

void main() {
  fragUv = uv;
  gl_Position = mvpMatrix * vec4(position, 1.0);
}