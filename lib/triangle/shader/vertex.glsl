#version 300 es

layout (location = 0) in vec3 aPosition;
out vec4 fragPosition;
uniform mat4 matrix;

void main() {
  gl_Position = matrix * vec4(aPosition, 1.0);
  fragPosition = gl_Position;
}