// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/utils/settings.js.
import type {
  TaggedTemplateExpression,
  TemplateLiteral,
} from "@html-eslint/types";
import type {
  Context,
  HTMLSettings,
  MaybeHTMLSettings,
} from "../types/index.js";
import { getSourceCode } from "./source-code.js";

const DEFAULT_SETTINGS = {
  templateLiterals: {
    tags: ["^html$"],
    comments: ["^\\s*html\\s*$"],
  },
};

function getSettings(
  settings: { html?: MaybeHTMLSettings },
): HTMLSettings {
  const tags = (settings
    && settings.html
    && settings.html.templateLiterals
    && settings.html.templateLiterals.tags)
    || DEFAULT_SETTINGS.templateLiterals.tags;

  const comments = (settings
    && settings.html
    && settings.html.templateLiterals
    && settings.html.templateLiterals.comments)
    || DEFAULT_SETTINGS.templateLiterals.comments;

  return {
    templateLiterals: {
      tags: tags.map((tag) => new RegExp(tag, "u")),
      comments: comments.map((comment) => new RegExp(comment, "u")),
    },
  };
}

export function shouldCheckTaggedTemplateExpression(
  node: TaggedTemplateExpression,
  context: Context<any[]>,
): boolean {
  const {
    templateLiterals: { tags },
  } = getSettings(context.settings as { html?: MaybeHTMLSettings });
  const tagNode = node.tag;

  return !!(
    tagNode.type === "Identifier" && tags.some((tag) => tag.test(tagNode.name))
  );
}

export function shouldCheckTemplateLiteral(
  node: TemplateLiteral,
  context: Context<any[]>,
): boolean {
  const sourceCode = getSourceCode(context);
  const { templateLiterals } = getSettings(
    context.settings as { html?: MaybeHTMLSettings },
  );
  const comments = sourceCode.getCommentsBefore(node);
  const last = comments[comments.length - 1];
  return !!(
    last
    && templateLiterals.comments.some((comment) => comment.test(last.value))
  );
}
