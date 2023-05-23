import { main } from "../lib/hello/gl";
import { main as gpuMain } from "../lib/hello/gpu";

main("#gl");
gpuMain("#gpu");