@vertex
fn main(@location(0) vec3<f32> aPosition) -> @bulitin(position) vec4<f32> {
  return vec4<f32>(aPosition, 1.0);
}