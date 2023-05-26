import { mat4, vec3 } from "gl-matrix";

const loadImage = async (url: string) => {
  const res = await fetch(url);
  const blob = await res.blob();
  
  return createImageBitmap(blob)
}

const addKeyBoardControl = (pos: [number, number, number] = [0, 0, 2], tar: [number, number, number] = [0, 0, 0], u: [number, number, number] = [0, 1, 0]) => {
  let speed = 0.1;
  const position = vec3.fromValues(...pos);
  const target = vec3.fromValues(...tar);
  const up = vec3.normalize(vec3.create(), vec3.fromValues(...u));
  const viewMatrix = mat4.create();
  const computeViewMatrix = () => mat4.lookAt(viewMatrix, position, target, up);

  document.addEventListener("keyup", (e) => {
    const { key } = e;
    const direction = vec3.create();

    vec3.normalize(direction, vec3.subtract(direction, target, position));
    switch (key) {
      case "w": {
        vec3.add(position, position, vec3.scale(direction, direction, speed));
        computeViewMatrix();
        break;
      }
      case "a": {
        vec3.add(
          position,
          position,
          vec3.scale(
            direction,
            vec3.cross(direction, up, direction),
            speed
          )
        );
        computeViewMatrix();
        break;
      }
      case "s": {
        vec3.add(position, position, vec3.scale(direction, direction, -speed));
        computeViewMatrix();
        break;
      }
      case "d": {
        vec3.add(
          position,
          position,
          vec3.scale(
            direction,
            vec3.cross(direction, direction, up),
            speed
          )
        );
        computeViewMatrix();
        break;
      }
    }
  });
  computeViewMatrix();
  return () => viewMatrix;
}

export {
  loadImage,
  addKeyBoardControl
}