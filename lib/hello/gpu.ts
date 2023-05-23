import { initGPU } from "../common/gpu";

const main = async (selector: string) => {
  const { context, device, size } = await initGPU(selector);

  const commandEncoder = device.createCommandEncoder({
    label: "helloEncoder"
  });
  const pass = commandEncoder.beginRenderPass({
    colorAttachments: [
      {
        view: context.getCurrentTexture().createView(),
        clearValue: [0, 1, 1, 1],
        loadOp: "clear",
        storeOp: "store"
      }
    ]
  });
  pass.setViewport(100, 100, size?.width ? size?.width - 100 : 500, size?.height ? size?.height - 100 : 300, 0, 1);
  pass.end();

  device.queue.submit([commandEncoder.finish()]);
}

export {
  main
}