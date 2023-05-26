import { mat4 } from "gl-matrix";
import { initGPU } from "../common/gpu";
import { vertices, indices } from "./cube";
import vertext from "./shader/vertex.wgsl?raw";
import frag from "./shader/frag.wgsl?raw";
import { loadImage, addKeyBoardControl } from "../common/util";

const initPipeline = async (device: GPUDevice, format: GPUTextureFormat, size: { width: number, height: number }) => {
  const pipeline = await device.createRenderPipelineAsync({
    label: "Camer pipeline",
    layout: "auto",
    vertex: {
      module: device.createShaderModule({
        code: vertext
      }),
      entryPoint: "main",
      buffers: [{
        arrayStride: 5 * vertices.BYTES_PER_ELEMENT,
        attributes: [
          {
            shaderLocation: 0,
            offset: 0,
            format: "float32x3"
          },
          {
            shaderLocation: 1,
            offset: 12,
            format: "float32x2"
          }
        ]
      }]
    },
    fragment: {
      module: device.createShaderModule({ code: frag }),
      entryPoint: "main",
      targets: [{
        format
      }]
    },
    primitive: {
      topology: "triangle-list"
    },
    depthStencil: {
      format: "depth24plus",
      depthWriteEnabled: true,
      depthCompare: "less"
    }
  });
  const indicesBuffer = device.createBuffer({
    size: indices.byteLength,
    usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
  });
  device.queue.writeBuffer(indicesBuffer, 0, indices);
  const matrixBuffer = device.createBuffer({
    size: 64,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
  });
  const image = await loadImage("/wall.jpg");
  const texture = device.createTexture({
    size: [image.width, image.height],
    format: 'rgba8unorm',
    usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT
  });
  device.queue.copyExternalImageToTexture({ source: image, flipY: true }, { texture }, [image.width, image.height]);
  const sampler = device.createSampler();
  const group = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      {
        binding: 0,
        resource: {
          buffer: matrixBuffer
        }
      },
      {
        binding: 1,
        resource: texture.createView()
      },
      {
        binding: 2,
        resource: sampler
      }
    ]
  });
  const depthTexture = device.createTexture({
    size,
    format: "depth24plus",
    usage: GPUTextureUsage.RENDER_ATTACHMENT
  });
  const depthView = depthTexture.createView();
  return { pipeline, group, matrixBuffer, indicesBuffer, depthTexture, depthView };
}

const main = async (selector: string) => {
  const { device, format, context, size } = await initGPU(selector);
  const { pipeline, group, matrixBuffer, indicesBuffer, depthView } = await initPipeline(device, format, size as any);
  const buffer = device.createBuffer({
    size: vertices.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
  })
  device.queue.writeBuffer(buffer, 0, vertices);
  const getViewMatrix = addKeyBoardControl();
  const render = (time: number) => {
    const modelMatrix = mat4.create();
    // mat4.rotateY(modelMatrix, modelMatrix, time / 10000 * Math.PI)
    const viewMatrix = getViewMatrix();
    // mat4.lookAt(viewMatrix, [0, 0, 5], [0, 0, 0], [0, 1, 0]);
    const projectMatrix = mat4.create();
    mat4.perspective(projectMatrix, Math.PI / 4, (size as any).width / (size as any).height, 0.1, 2);
    const mvpMatrix = mat4.create();
    mat4.multiply(
      mvpMatrix,
      projectMatrix,
      mat4.multiply(mvpMatrix, viewMatrix, modelMatrix)
    );
    device.queue.writeBuffer(
      matrixBuffer,
      0,
      <Float32Array>mvpMatrix
    );
    const commandEncoder = device.createCommandEncoder();
    const pass = commandEncoder.beginRenderPass({
      colorAttachments: [{
        view: context.getCurrentTexture().createView(),
        clearValue: [1, 1, 1, 1],
        loadOp: "clear",
        storeOp: "store"
      }],
      depthStencilAttachment: {
        view: depthView,
        depthClearValue: 1,
        depthLoadOp: "clear",
        depthStoreOp: "store"
      }
    });
    pass.setPipeline(pipeline);
    pass.setBindGroup(0, group);
    pass.setIndexBuffer(indicesBuffer, "uint16");
    pass.setVertexBuffer(0, buffer);
    // pass.draw(3);
    pass.drawIndexed(indices.length);
    pass.end();
    device.queue.submit([commandEncoder.finish()]);

    requestAnimationFrame(render);
  }

  render(0)
}

export default main;