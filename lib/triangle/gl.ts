import { initWebGL, createProgram } from "../common/gl";
import { vertices } from "./triangle";
import vertex from "./shader/vertex.glsl?raw";
import frag from "./shader/frag.glsl?raw";

const main = (selector: string) => {
  const { context, size } = initWebGL(selector, { alpha: true });
  
  if (context) {
    // Init
    const program = createProgram(context, vertex, frag);
    const buffer = context.createBuffer();

    context.bindBuffer(context.ARRAY_BUFFER, buffer);
    context.bufferData(context.ARRAY_BUFFER, vertices, context.STATIC_DRAW);
    context.enableVertexAttribArray(0);
    context.vertexAttribPointer(0, 3, context.FLOAT, false, 3 * vertices.BYTES_PER_ELEMENT, 0);
    context.bindBuffer(context.ARRAY_BUFFER, null);

    const render = () => {
      context.clearColor(0, 0, 0, 1);
      context.clear(context.COLOR_BUFFER_BIT);
      context.viewport(0, 0, size.width, size.height);
      context.useProgram(program);
      context.bindBuffer(context.ARRAY_BUFFER, buffer);
      context.enableVertexAttribArray(0);
      context.vertexAttribPointer(0, 3, context.FLOAT, false, 3 * vertices.BYTES_PER_ELEMENT, 0);
      context.drawArrays(context.TRIANGLES, 0, 3);
      requestAnimationFrame(render);
    }

    render();
  }
}

export default main