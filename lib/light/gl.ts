import { mat4, mat3 } from "gl-matrix";
import { initWebGL, createProgram } from "../common/gl";
import { vertices } from "./mesh";
import vertex from "./shader/vertex.glsl?raw";
import frag from "./shader/frag.glsl?raw";

const main = (selector: string) => {
  const { context, size } = initWebGL(selector);
  
  if (context) {
    // Init
    const program = createProgram(context, vertex, frag);
    
    const modelMatrixLoc = context.getUniformLocation(program, "modelMatrix");
    const viewMatrixLoc = context.getUniformLocation(program, "viewMatrix");
    const projectMatrixLoc = context.getUniformLocation(program, "projectMatrix");
    const normalMatrixLoc = context.getUniformLocation(program, "normalMatrix");
    const materialDiffuseLoc = context.getUniformLocation(program, "material.diffuse");
    const materialAmbientLoc = context.getUniformLocation(program, "material.ambient");
    const materialSpecularLoc = context.getUniformLocation(program, "material.specular");
    const materialShininessLoc = context.getUniformLocation(program, "material.shininess");
    const lightPositionLoc = context.getUniformLocation(program, "light.position");
    const lightAmbientLoc = context.getUniformLocation(program, "light.ambient");
    const lightDiffuseLoc = context.getUniformLocation(program, "light.diffuse");
    const lightSpecularLoc = context.getUniformLocation(program, "light.specular");
    const verticesBuffer = context.createBuffer();

    const vao = context.createVertexArray();
    context.bindVertexArray(vao);
    context.bindBuffer(context.ARRAY_BUFFER, verticesBuffer);
    context.bufferData(context.ARRAY_BUFFER, vertices, context.STATIC_DRAW);
    context.enableVertexAttribArray(0);
    context.vertexAttribPointer(0, 3, context.FLOAT, false, 8 * vertices.BYTES_PER_ELEMENT, 0);
    context.enableVertexAttribArray(1);
    context.vertexAttribPointer(1, 3, context.FLOAT, false, 8 * vertices.BYTES_PER_ELEMENT, 3 * vertices.BYTES_PER_ELEMENT);
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
      mat4.rotateY(modelMatrix, modelMatrix, time / 1000 * Math.PI / 4);
      const viewMatrix = mat4.create();
      mat4.lookAt(viewMatrix, [0, 0, 2], [0, 0, 0], [ 0, 1, 0]);
      const projectMatrix = mat4.create();
      mat4.perspective(projectMatrix, Math.PI / 2, size.width / size.height, 0.1, 3);
      const normalMatrix = mat4.create();
      mat4.transpose(normalMatrix, mat4.invert(normalMatrix, modelMatrix));
      
      context.uniformMatrix4fv(modelMatrixLoc, false, modelMatrix);
      context.uniformMatrix4fv(viewMatrixLoc, false, viewMatrix);
      context.uniformMatrix4fv(projectMatrixLoc, false, projectMatrix);
      context.uniformMatrix3fv(normalMatrixLoc, false, mat3.fromMat4(mat3.create(), normalMatrix));
      context.uniform3fv(materialAmbientLoc, [1, 0, 0]);
      context.uniform3fv(materialDiffuseLoc, [1, 0, 0]);
      context.uniform3fv(materialSpecularLoc, [1, 0, 0]);
      context.uniform1f(materialShininessLoc, 32);
      context.uniform3fv(lightAmbientLoc, [0.2, 0, 0]);
      context.uniform3fv(lightDiffuseLoc, [1, 0, 0]);
      context.uniform3fv(lightSpecularLoc, [1, 0, 0]);
      context.uniform3fv(lightPositionLoc, [1, 0.5, 1]);
      context.bindVertexArray(vao);
      // context.drawArrays(context.TRIANGLES, 0, 3);
      context.drawArrays(context.TRIANGLES, 0, vertices.length / 8);
      requestAnimationFrame(render);
    }

    render(0);
  }
}

export default main