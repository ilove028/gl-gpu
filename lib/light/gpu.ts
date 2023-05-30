import { mat3, mat4, vec3 } from "gl-matrix";
import { initGPU } from "../common/gpu";
import { vertices } from "./mesh";
import vertext from "./shader/vertex.wgsl?raw";
import frag from "./shader/frag.wgsl?raw";
import { loadImage } from "../common/util";

const initPipeline = async (device: GPUDevice, format: GPUTextureFormat, size: { width: number, height: number }) => {
  const pipeline = await device.createRenderPipelineAsync({
    label: "Light pipeline",
    layout: "auto",
    vertex: {
      module: device.createShaderModule({
        code: vertext
      }),
      entryPoint: "main",
      buffers: [{
        arrayStride: 8 * vertices.BYTES_PER_ELEMENT,
        attributes: [
          {
            shaderLocation: 0,
            offset: 0,
            format: "float32x3"
          },
          {
            shaderLocation: 1,
            offset: 12,
            format: "float32x3"
          },
          {
            shaderLocation: 2,
            offset: 24,
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
  const uniformBuffer = device.createBuffer({
    size: 256 * 7,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
  });
  const diffuseImage = await loadImage("/container2.png");
  const diffuseTexture = device.createTexture({
    size: [diffuseImage.width, diffuseImage.height],
    format: 'rgba8unorm',
    usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT
  });
  device.queue.copyExternalImageToTexture({ source: diffuseImage, flipY: true }, { texture: diffuseTexture }, [diffuseImage.width, diffuseImage.height]);
  const diffuseSampler = device.createSampler();
  const specularImage = await loadImage("/container2_specular.png");
  const specularTexture = device.createTexture({
    size: [specularImage.width, specularImage.height],
    format: 'rgba8unorm',
    usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT
  });
  device.queue.copyExternalImageToTexture({ source: specularImage, flipY: true }, { texture: specularTexture }, [specularImage.width, specularImage.height]);
  const specularSampler = device.createSampler();
  const group = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      {
        binding: 0,
        resource: {
          buffer: uniformBuffer,
          offset: 256 * 0,
          size: 64
        }
      },
      {
        binding: 1,
        resource: {
          buffer: uniformBuffer,
          offset: 256 * 1,
          size: 64
        }
      },
      {
        binding: 2,
        resource: {
          buffer: uniformBuffer,
          offset: 256 * 2,
          size: 64
        }
      },
      {
        binding: 3,
        resource: {
          buffer: uniformBuffer,
          offset: 256 * 3,
          size: 64
        }
      },
      {
        binding: 4,
        resource: {
          buffer: uniformBuffer,
          offset: 256 * 4,
          size: 64
        }
      },
      {
        binding: 5,
        resource: {
          buffer: uniformBuffer,
          offset: 256 * 5,
          size: 12
        }
      },
      {
        binding: 6,
        resource: {
          buffer: uniformBuffer,
          offset: 256 * 6,
          size: 4
        }
      },
      {
        binding: 7,
        resource: diffuseTexture.createView()
      },
      {
        binding: 8,
        resource: specularTexture.createView()
      },
      {
        binding: 9,
        resource: diffuseSampler
      },
      {
        binding: 10,
        resource: specularSampler
      }
    ]
  });
  const depthTexture = device.createTexture({
    size,
    format: "depth24plus",
    usage: GPUTextureUsage.RENDER_ATTACHMENT
  });
  const depthView = depthTexture.createView();
  return { pipeline, group, uniformBuffer, depthTexture, depthView };
}

function createUniformData(modelMatrix: mat4, viewMatrix: mat4, projectMatrix: mat4, normalMatrix: mat4): Float32Array {
  const result = new Float32Array(64 * 7);
  
  result.set(modelMatrix, 0);
  result.set(viewMatrix, 64);
  result.set(projectMatrix, 64 * 2);
  result.set(normalMatrix, 64 * 3);
  result.set(
    [
      -1, 0.5, 1, 1,// light position
      0.5, 0.5, 0.5, 1,// ambient
      1, 1, 1, 1,// diffuse
      1, 1, 1, 1,// specular
    ],
    64 * 4
  );
  result.set(vec3.negate(vec3.create(), mat4.getTranslation(vec3.create(), viewMatrix)), 64 * 5); // viewPositionWc
  result.set([32], 64 * 6); // shininess
  return result;
}

const main = async (selector: string) => {
  const { device, format, context, size } = await initGPU(selector);
  const { pipeline, group, uniformBuffer, depthView } = await initPipeline(device, format, (size as any));
  const buffer = device.createBuffer({
    size: vertices.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
  })
  device.queue.writeBuffer(buffer, 0, vertices);
  const render = (time: number) => {
    const modelMatrix = mat4.create();
    mat4.rotateY(modelMatrix, modelMatrix, time / 10000 * Math.PI);
    const viewMatrix = mat4.create();
    mat4.lookAt(viewMatrix, [0, 0, 2], [0, 0, 0], [ 0, 1, 0]);
    const projectMatrix = mat4.create();
    mat4.perspective(projectMatrix, Math.PI / 4, (size as any).width / (size as any).height, 0.1, 10);
    const normalMatrix = mat4.create();
    // mat3.fromMat4(normalMatrix, mat4.transpose(mat4.create(), mat4.invert(mat4.create(), modelMatrix)));
    mat4.transpose(normalMatrix, mat4.invert(mat4.create(), modelMatrix))
    const uniformData = createUniformData(modelMatrix, viewMatrix, projectMatrix, normalMatrix);
    device.queue.writeBuffer(
      uniformBuffer,
      0,
      uniformData
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
    pass.setVertexBuffer(0, buffer);
    pass.draw(vertices.length / 8);
    // pass.drawIndexed(indices.length);
    pass.end();
    device.queue.submit([commandEncoder.finish()]);

    requestAnimationFrame(render);
  }

  render(0)
}

export default main;
