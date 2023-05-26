#version 300 es
precision highp float;

in vec2 fragUv;

out vec4 outColor;

uniform sampler2D diffuseTexture;

void main() {
  outColor = texture(diffuseTexture, fragUv);
}
