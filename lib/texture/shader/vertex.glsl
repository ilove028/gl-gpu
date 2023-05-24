#version 300 es

layout (location = 0) in vec3 aPosition;
layout (location = 1) in vec2 aUv;
out vec4 fragPosition;
out vec2 fragUv;
uniform mat4 matrix;

void main() {
  gl_Position = matrix * vec4(aPosition, 1.0);
  fragPosition = gl_Position;
  fragUv = aUv;
}