const initGPU = async (selector?: string, size?: { width: number, height: number }) => {
  let canvas: HTMLCanvasElement;
  let context: GPUCanvasContext ;
  const gpu = navigator.gpu;
  const adapter = await gpu.requestAdapter({
    powerPreference: "high-performance"
  });
  if (!adapter) {
    throw new Error("Request adapter failed.");
  }
  const device = await adapter.requestDevice();
  if (!device) {
    throw new Error("Request adapter failed.");
  }

  if (selector) {
    canvas = <HTMLCanvasElement>document.querySelector(selector);
    context = <GPUCanvasContext>canvas.getContext("webgpu");

    if (!size) {
      const devicePixelRatio = window.devicePixelRatio;
      size = {
        width: canvas.clientWidth * devicePixelRatio,
        height: canvas.clientHeight * devicePixelRatio
      }
    }
    canvas.width = size.width;
    canvas.height = size.height;

    context?.configure({
      device,
      format: gpu.getPreferredCanvasFormat()
    })
  }
  return { canvas, context, adapter, device, size }
}

export {
  initGPU
}