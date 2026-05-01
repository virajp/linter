export interface CliFlags {
  init: boolean;
  force: boolean;
  fix: boolean;
  cache: boolean;
  quiet: boolean;
  ignore: boolean;
  debug: boolean;
  version: boolean;
  help: boolean;
}

export interface CliArgs {
  flags: CliFlags;
  cacheLocation?: string;
  format?: string;
  maxWarnings?: number;
  positional: string[];
}

export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ParseError";
  }
}
