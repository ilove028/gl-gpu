import { initWebGL } from "../common/gl";

const main = (selector: string) => {
  const { context, size } = initWebGL(selector, { alpha: true });

  context?.viewport(0, 0, size.width / 2, size.height / 2);
  context?.clearColor(1, 1, 0, 0.1);
  context?.clear(context.COLOR_BUFFER_BIT);
}

export { main }