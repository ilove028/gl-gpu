#version 300 es
precision highp float;

out vec4 fragColor;
in vec4 fragPosition;
in vec2 fragUv;

void main() {
  fragColor = vec4(fragUv, 0.0, 1.0);
}