import { initWebGL, createProgram } from "../common/gl";
import { indices, vertices } from "./mesh";
import vertex from "./shader/vertex.glsl?raw";
import frag from "./shader/frag.glsl?raw";

const main = (selector: string) => {
  const { context, size } = initWebGL(selector, { alpha: true });
  
  if (context) {
    // Init
    const program = createProgram(context, vertex, frag);
    const buffer = context.createBuffer();
    
    const matrixLocation = context.getUniformLocation(program, "matrix");
    const indicesBuffer = context.createBuffer();
    
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
      context.clearColor(0, 0, 0, 1);
      context.clear(context.COLOR_BUFFER_BIT);
      context.viewport(0, 0, size.width, size.height);
      context.useProgram(program);
      // context.bindBuffer(context.ARRAY_BUFFER, buffer);
      // context.enableVertexAttribArray(0);
      // context.vertexAttribPointer(0, 3, context.FLOAT, false, 3 * vertices.BYTES_PER_ELEMENT, 0);
      context.uniformMatrix4fv(
        matrixLocation,
        false,
        [
          1, 0, 0, 0,
          0, 1, 0, 0,
          0, 0, 1, 0,
          Math.sin(time * 2 * Math.PI / 10000), 0, 0, 1
        ]
      )
      context.bindVertexArray(vao);
      // context.drawArrays(context.TRIANGLES, 0, 3);
      context.drawElements(context.TRIANGLES, indices.length, context.UNSIGNED_SHORT, 0);
      requestAnimationFrame(render);
    }

    render(0);
  }
}

export default main