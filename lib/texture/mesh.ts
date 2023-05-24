const vertices = new Float32Array([
  -0.5, -0.5, 0, 0, 0,
  0.5, -0.5, 0, 1, 0,
  0.5, 0.5, 0, 1, 1,
  -0.5, 0.5, 0, 0, 1
])

const indices = new Uint16Array([
  0, 1, 2,
  0, 2, 3
])

export {
  vertices,
  indices
}