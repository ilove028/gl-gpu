const initWebGL = (selector: string, optons?: WebGLContextAttributes, size?: { width: number, height: number }) => {
  const canvas = <HTMLCanvasElement>document.querySelector(selector);
  const context = canvas.getContext("webgl2", optons);

  if (!size) {
    const devicePixelRatio = window.devicePixelRatio;
    size = {
      width: canvas.clientWidth * devicePixelRatio,
      height: canvas.clientHeight * devicePixelRatio
    }
  }
  canvas.width = size.width;
  canvas.height = size.height;
  return { canvas, context, size }
}

export {
  initWebGL
}