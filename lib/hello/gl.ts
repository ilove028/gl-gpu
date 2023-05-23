import { initWebGL } from "../common/gl";

const main = (selector: string) => {
  const { context, size } = initWebGL(selector, { alpha: true });

  context?.viewport(0, 0, size.width, size.height);
  context?.clearColor(1, 1, 0, 0.1);
  context?.clear(context.COLOR_BUFFER_BIT);
}

export { main }