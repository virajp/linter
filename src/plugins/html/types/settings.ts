// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/types/settings.ts.
export type MaybeHTMLSettings = {
  templateLiterals?: {
    tags?: string[];
    comments?: string[];
  };
};

export type HTMLSettings = {
  templateLiterals: {
    tags: RegExp[];
    comments: RegExp[];
  };
};
