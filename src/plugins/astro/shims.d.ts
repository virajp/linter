// Local type declarations for the style preprocessors that the astro
// transforms load from the user's project. Only the parts the transforms use.

declare module "less" {
  interface RenderOutput {
    css: string;
    map: string;
  }
  interface RenderOptions {
    sourceMap?: object;
    syncImport?: boolean;
    filename?: string;
    lint?: boolean;
  }
  function render(
    input: string,
    options: RenderOptions,
    callback: (error: unknown, output: RenderOutput | undefined) => void,
  ): void;
  function render(
    input: string,
    options?: RenderOptions,
  ): Promise<RenderOutput>;
}

declare module "sass" {
  interface CompileResult {
    css: string;
    sourceMap?: { mappings: string };
  }
  interface StringOptions {
    sourceMap?: boolean;
    syntax?: "scss" | "indented" | "css";
  }
  function compileString(source: string, options?: StringOptions): CompileResult;
}

declare module "stylus" {
  interface Renderer {
    set(key: string, value: unknown): Renderer;
    render(callback: (error: Error | null, css: string) => void): void;
  }
  function stylus(code: string, options?: { filename?: string }): Renderer;
  export = stylus;
}

declare module "postcss-load-config" {
  import type {
    AcceptedPlugin,
    ProcessOptions,
  } from "postcss";

  interface Result {
    plugins: AcceptedPlugin[];
    options: ProcessOptions;
  }
  function postcssrc(
    ctx?: Record<string, unknown>,
    path?: string,
  ): Promise<Result>;
  export = postcssrc;
}

declare module "source-map-js" {
  interface RawSourceMap {
    version: number;
    sources: string[];
    names: string[];
    sourcesContent?: string[];
    mappings: string;
    file: string;
  }
}
