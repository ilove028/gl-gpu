// import { main } from "../lib/hello/gl";
// import { main as gpuMain } from "../lib/hello/gpu";

// main("#gl");
// gpuMain("#gpu");

// import { default as glMain} from "../lib/triangle/gl";
// import { main as gpuMain } from "../lib/triangle/gpu";

// glMain("#gl");
// gpuMain("#gpu");

import { default as glMain} from "../lib/light/gl";
import { default as gpuMain } from "../lib/light/gpu";

glMain("#gl");
gpuMain("#gpu");