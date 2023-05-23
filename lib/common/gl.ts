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

const createShader = (gl: WebGL2RenderingContext, source: string, type: number) => {
  const shader = gl.createShader(type);

  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader))
  }
  return shader;
}

const createProgram = (gl: WebGL2RenderingContext, vertexSource: string, fragSource: string): WebGLProgram => {
  const program = gl.createProgram();
  const vertexShader = createShader(gl, vertexSource, gl.VERTEX_SHADER);
  const fragShader = createShader(gl, fragSource, gl.FRAGMENT_SHADER);
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
  }
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragShader);
  return program;
}

export {
  initWebGL,
  createShader,
  createProgram
}