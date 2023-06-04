import { mat4, vec3 } from "gl-matrix";
import { initWebGL, createProgram } from "../common/gl";
import { vertices } from "../light/mesh";
import vertex from "./shader/vertex.glsl?raw";
import frag from "./shader/frag.glsl?raw";
import { loadImage } from "../common/util";

const main = (selector: string) => {
  const { context, size } = initWebGL(selector);
  
  if (context) {
    // Init
    const program = createProgram(context, vertex, frag);
    
    const diffuseTexture = context.createTexture();
    context.activeTexture(context.TEXTURE0);
    context.bindTexture(context.TEXTURE_2D, diffuseTexture);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_S, context.CLAMP_TO_EDGE);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_T, context.CLAMP_TO_EDGE);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, context.LINEAR);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MAG_FILTER, context.LINEAR);
    context.texImage2D(context.TEXTURE_2D, 0, context.RGBA, 1, 1, 0, context.RGBA, context.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
    loadImage("/container2.png")
      .then((image) => {
        context.activeTexture(context.TEXTURE0);
        context.bindTexture(context.TEXTURE_2D, diffuseTexture);
        context.texImage2D(context.TEXTURE_2D, 0, context.RGBA, image.width, image.height, 0, context.RGBA, context.UNSIGNED_BYTE, image);
      });

    const specularTexture = context.createTexture();
    context.activeTexture(context.TEXTURE0 + 1);
    context.bindTexture(context.TEXTURE_2D, diffuseTexture);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_S, context.CLAMP_TO_EDGE);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_T, context.CLAMP_TO_EDGE);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, context.LINEAR);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MAG_FILTER, context.LINEAR);
    context.texImage2D(context.TEXTURE_2D, 0, context.RGBA, 1, 1, 0, context.RGBA, context.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
    loadImage("/container2_specular.png")
      .then((image) => {
        context.activeTexture(context.TEXTURE0 + 1);
        context.bindTexture(context.TEXTURE_2D, specularTexture);
        context.texImage2D(context.TEXTURE_2D, 0, context.RGBA, image.width, image.height, 0, context.RGBA, context.UNSIGNED_BYTE, image);
      });

    const modelMatrixLoc = context.getUniformLocation(program, "matrix.modelMatrix");
    const viewMatrixLoc = context.getUniformLocation(program, "matrix.viewMatrix");
    const projectMatrixLoc = context.getUniformLocation(program, "matrix.projectMatrix");
    const normalMatrixLoc = context.getUniformLocation(program, "matrix.normalMatrix");
    const cameraPositionLoc = context.getUniformLocation(program, "cameraPosition");
    const directionLightDirectionLoc = context.getUniformLocation(program, "directionLight.direction");
    const directionLightColorLoc = context.getUniformLocation(program, "directionLight.color");
    const directionLightDensityLoc = context.getUniformLocation(program, "directionLight.density");
    const pointLightLocs = Array.from({ length: 4 }).map((_, index) => {
      return {
        positionLoc: context.getUniformLocation(program, `pointLights[${index}].position`),
        colorLoc: context.getUniformLocation(program, `pointLights[${index}].color`),
        densityLoc: context.getUniformLocation(program, `pointLights[${index}].density`),
        constantLoc: context.getUniformLocation(program, `pointLights[${index}].constant`),
        linearLoc: context.getUniformLocation(program, `pointLights[${index}].linear`),
        quadraticLoc: context.getUniformLocation(program, `pointLights[${index}].quadratic`),
      }
    })
    const spotLightPositionLoc = context.getUniformLocation(program, "spotLight.position");
    const spotLightColorLoc = context.getUniformLocation(program, "spotLight.color");
    const spotLightDensityLoc = context.getUniformLocation(program, "spotLight.density");
    const spotLightSpotDirectionLoc = context.getUniformLocation(program, "spotLight.spotDirection");
    const spotLightCutOffLoc = context.getUniformLocation(program, "spotLight.cutOff");
    const spotLightOuterCutOffLoc = context.getUniformLocation(program, "spotLight.outerCutOff");
    const spotLightConstantLoc = context.getUniformLocation(program, "spotLight.constant");
    const spotLightLinearLoc = context.getUniformLocation(program, "spotLight.linear");
    const spotLightQuadraticLoc = context.getUniformLocation(program, "spotLight.quadratic");

    const uShininessLoc = context.getUniformLocation(program, "uShininess");
    const diffuseTextureLoc = context.getUniformLocation(program, "diffuseTexture");
    const specularTextureLoc = context.getUniformLocation(program, "specularTexture");
    const verticesBuffer = context.createBuffer();

    const vao = context.createVertexArray();
    context.bindVertexArray(vao);
    context.bindBuffer(context.ARRAY_BUFFER, verticesBuffer);
    context.bufferData(context.ARRAY_BUFFER, vertices, context.STATIC_DRAW);
    context.enableVertexAttribArray(0);
    context.vertexAttribPointer(0, 3, context.FLOAT, false, 8 * vertices.BYTES_PER_ELEMENT, 0);
    context.enableVertexAttribArray(1);
    context.vertexAttribPointer(1, 3, context.FLOAT, false, 8 * vertices.BYTES_PER_ELEMENT, 3 * vertices.BYTES_PER_ELEMENT);
    context.enableVertexAttribArray(2);
    context.vertexAttribPointer(2, 2, context.FLOAT, false, 8 * vertices.BYTES_PER_ELEMENT, 5 * vertices.BYTES_PER_ELEMENT);
    context.bindVertexArray(null);

    const render = (time) => {
      context.viewport(0, 0, size.width, size.height);
      context.enable(context.DEPTH_TEST);
      context.clearColor(0, 0, 0, 1);
      context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);
      context.useProgram(program);
      const modelMatrix = mat4.create();
      mat4.rotateY(modelMatrix, modelMatrix, time / 1000 * Math.PI / 4);
      const viewMatrix = mat4.create();
      mat4.lookAt(viewMatrix, [0, 0, 2], [0, 0, 0], [ 0, 1, 0]);
      const projectMatrix = mat4.create();
      mat4.perspective(projectMatrix, Math.PI / 2, size.width / size.height, 0.1, 4);
      const normalMatrix = mat4.create();
      mat4.transpose(normalMatrix, mat4.invert(normalMatrix, modelMatrix));
      
      context.uniformMatrix4fv(modelMatrixLoc, false, modelMatrix);
      context.uniformMatrix4fv(viewMatrixLoc, false, viewMatrix);
      context.uniformMatrix4fv(projectMatrixLoc, false, projectMatrix);
      context.uniformMatrix4fv(normalMatrixLoc, false, normalMatrix);

      context.uniform3fv(cameraPositionLoc, vec3.negate(vec3.create(), mat4.getTranslation(vec3.create(), viewMatrix)));
      
      context.uniform3fv(directionLightDirectionLoc, [-1, -1, -1]);
      context.uniform3fv(directionLightColorLoc, [1, 1, 1]);
      context.uniform1f(directionLightDensityLoc, 0.5);

      Array.from({ length: 4 }).forEach((_, index) => {
        context.uniform3fv(pointLightLocs[index].colorLoc, [1, 1, 1]);
        context.uniform3fv(pointLightLocs[index].positionLoc, [1, 1, 1]);
        context.uniform1f(pointLightLocs[index].densityLoc, 0.4);
        context.uniform1f(pointLightLocs[index].constantLoc, 1);
        context.uniform1f(pointLightLocs[index].linearLoc, 0.09);
        context.uniform1f(pointLightLocs[index].quadraticLoc, 0.032);
      });

      context.uniform3fv(spotLightPositionLoc, [-1, -1, 1]);
      context.uniform3fv(spotLightColorLoc, [1, 1, 1]);
      context.uniform3fv(spotLightSpotDirectionLoc, [-1, -1, 1]);
      context.uniform1f(spotLightDensityLoc, 0.4);
      context.uniform1f(spotLightCutOffLoc, Math.cos(12.5 / 180 * Math.PI));
      context.uniform1f(spotLightOuterCutOffLoc, Math.cos(15 / 180 * Math.PI));
      context.uniform1f(spotLightConstantLoc, 1);
      context.uniform1f(spotLightLinearLoc, 0.09);
      context.uniform1f(spotLightQuadraticLoc, 0.032);

      context.uniform1f(uShininessLoc, 32);

      context.uniform1i(diffuseTextureLoc, 0);
      context.uniform1i(specularTextureLoc, 1);

      context.bindVertexArray(vao);
      // context.drawArrays(context.TRIANGLES, 0, 3);
      context.drawArrays(context.TRIANGLES, 0, vertices.length / 8);
      requestAnimationFrame(render);
    }

    render(0);
  }
}

export default main