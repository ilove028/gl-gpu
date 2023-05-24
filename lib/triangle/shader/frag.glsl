#version 300 es
precision highp float;

out vec4 fragColor;
in vec4 fragPosition;

void main() {
  fragColor = fragPosition * 0.5 + vec4(.5, 0.5, 0.5, 0.5);
}