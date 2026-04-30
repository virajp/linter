import { createConfig } from "./config-factory.js";
import { loadYamlOptions } from "./config-loader.js";

const config = createConfig(loadYamlOptions(process.cwd()));
export default config;
