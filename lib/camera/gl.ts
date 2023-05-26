import { mat4 } from "gl-matrix";
import { initWebGL, createProgram } from "../common/gl";
import { loadImage } from "../common/util";
import { indices, vertices } from "./cube";
import vertex from "./shader/vertex.glsl?raw";
import frag from "./shader/frag.glsl?raw";

const main = (selector: string) => {
  const { context, size } = initWebGL(selector);
  
  if (context) {
    // Init
    const program = createProgram(context, vertex, frag);
    const buffer = context.createBuffer();
    
    const matrixLocation = context.getUniformLocation(program, "mvpMatrix");
    const diffuseTextureLocation = context.getUniformLocation(program, "diffuseTexture");
    const indicesBuffer = context.createBuffer();
    const texture = context.createTexture();
    // TODO 不起作用
    // context.pixelStorei(context.UNPACK_FLIP_Y_WEBGL, 1);
    context.activeTexture(context.TEXTURE0);
    context.bindTexture(context.TEXTURE_2D, texture);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_S, context.CLAMP_TO_EDGE);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_T, context.CLAMP_TO_EDGE);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, context.LINEAR);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MAG_FILTER, context.LINEAR);
    context.texImage2D(context.TEXTURE_2D, 0, context.RGBA, 1, 1, 0, context.RGBA, context.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]))
    loadImage("/wall.jpg")
      .then((image) => {
        context.activeTexture(context.TEXTURE0);
        context.bindTexture(context.TEXTURE_2D, texture);
        context.texImage2D(context.TEXTURE_2D, 0, context.RGB, image.width, image.height, 0, context.RGB, context.UNSIGNED_BYTE, image);
      })

    const vao = context.createVertexArray();
    context.bindVertexArray(vao);
    context.bindBuffer(context.ARRAY_BUFFER, buffer);
    context.bufferData(context.ARRAY_BUFFER, vertices, context.STATIC_DRAW);
    context.enableVertexAttribArray(0);
    context.vertexAttribPointer(0, 3, context.FLOAT, false, 5 * vertices.BYTES_PER_ELEMENT, 0);
    context.enableVertexAttribArray(1);
    context.vertexAttribPointer(1, 2, context.FLOAT, false, 5 * vertices.BYTES_PER_ELEMENT, 3 * vertices.BYTES_PER_ELEMENT);
    // context.bindBuffer(context.ARRAY_BUFFER, null);
    context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, indicesBuffer);
    context.bufferData(context.ELEMENT_ARRAY_BUFFER, indices, context.STATIC_DRAW);
    context.bindVertexArray(null);

    const render = (time) => {
      context.viewport(0, 0, size.width, size.height);
      context.enable(context.DEPTH_TEST);
      context.clearColor(0, 0, 0, 1);
      context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);
      context.useProgram(program);
      // context.bindBuffer(context.ARRAY_BUFFER, buffer);
      // context.enableVertexAttribArray(0);
      // context.vertexAttribPointer(0, 3, context.FLOAT, false, 3 * vertices.BYTES_PER_ELEMENT, 0);

      const modelMatrix = mat4.create();
      mat4.rotateY(modelMatrix, modelMatrix, time / 10000 * Math.PI)
      const viewMatrix = mat4.create();
      mat4.lookAt(viewMatrix, [0, 0, 5], [0, 0, 0], [0, 1, 0]);
      const projectMatrix = mat4.create();
      mat4.perspective(projectMatrix, Math.PI / 4, size.width / size.height, 0.1, 50);
      const mvpMatrix = mat4.create();
      mat4.multiply(
        mvpMatrix,
        projectMatrix,
        mat4.multiply(mvpMatrix, viewMatrix, modelMatrix)
      );

      context.uniformMatrix4fv(
        matrixLocation,
        false,
        mvpMatrix
      );
      context.uniform1i(diffuseTextureLocation, 0);
      context.bindVertexArray(vao);
      // context.drawArrays(context.TRIANGLES, 0, 3);
      context.drawElements(context.TRIANGLES, indices.length, context.UNSIGNED_SHORT, 0);
      requestAnimationFrame(render);
    }

    render(0);
  }
}

export default main