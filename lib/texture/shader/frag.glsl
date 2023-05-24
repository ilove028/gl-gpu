#version 300 es
precision highp float;

out vec4 fragColor;
in vec4 fragPosition;
in vec2 fragUv;

uniform sampler2D diffuseTexture;

void main() {
  fragColor = texture(diffuseTexture, vec2(fragUv.x, 1.0 - fragUv.y));
}