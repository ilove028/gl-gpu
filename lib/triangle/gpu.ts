import { initGPU } from "../common/gpu";
import { vertices } from "./triangle";
import vertext from "./shader/vertex.wgsl?raw";
import frag from "./shader/frag.wgsl?raw";

const initPipeline = async (device: GPUDevice, format: GPUTextureFormat) => {
  const pipeline = await device.createRenderPipelineAsync({
    label: "Triangle pipeline",
    layout: "auto",
    vertex: {
      module: device.createShaderModule({
        code: vertext
      }),
      entryPoint: "main",
      buffers: [{
        arrayStride: 3 * vertices.BYTES_PER_ELEMENT,
        attributes: [{
          shaderLocation: 0,
          offset: 0,
          format: "float32x3"
        }]
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
    }
  });

  return pipeline;
}

const main = async (selector: string) => {
  const { device, format, context } = await initGPU(selector);
  const pipeline = await initPipeline(device, format);
  const buffer = device.createBuffer({
    size: vertices.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
  })
  device.queue.writeBuffer(buffer, 0, vertices);
  const render = () => {
    const commandEncoder = device.createCommandEncoder();
    const pass = commandEncoder.beginRenderPass({
      colorAttachments: [{
        view: context.getCurrentTexture().createView(),
        clearValue: [1, 1, 1, 1],
        loadOp: "clear",
        storeOp: "store"
      }]
    });
    pass.setPipeline(pipeline);
    pass.setVertexBuffer(0, buffer);
    pass.draw(3);
    pass.end();
    device.queue.submit([commandEncoder.finish()]);

    requestAnimationFrame(render);
  }

  render()
}

export {
  main
}