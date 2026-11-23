// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/require-open-graph-protocol.js.
import type {
  AnyNode,
  Tag,
} from "@html-eslint/types";
import { RULE_CATEGORY } from "../constants/index.js";
import type { RuleModule } from "../types/index.js";
import { filter } from "../utils/array.js";
import {
  findAttr,
  isTag,
} from "../utils/node.js";
import { getRuleUrl } from "../utils/rule.js";

type Option = string[];

const MESSAGE_IDS = {
  MISSING: "missing",
  EMPTY: "empty",
};

const DEFAULT_REQUIRED_PROPERTIES = [
  "og:title",
  "og:type",
  "og:url",
  "og:image",
];

function normalize(properties: string[]): string[] {
  return properties.map((prop) => {
    if (prop.indexOf("og:") === 0) { return prop; }
    return `og:${prop}`;
  });
}

const rule: RuleModule<[Option]> = {
  meta: {
    type: "code" as "problem",

    docs: {
      description: "Enforce use of specified meta tags for open graph protocol.",
      category: RULE_CATEGORY.SEO,
      recommended: false,
      url: getRuleUrl("require-open-graph-protocol"),
    } as RuleModule<[Option]>["meta"]["docs"],

    fixable: null as unknown as undefined,
    schema: [
      {
        type: "array",
        items: {
          type: "string",
        },
        uniqueItems: true,
      },
    ],
    messages: {
      [MESSAGE_IDS.MISSING]: "Require use of meta tags for OGP. ({{properties}})",
      [MESSAGE_IDS.EMPTY]: "Unexpected empty 'content' attribute",
    },
  },

  create(context) {
    const requiredProperties: string[] = normalize(
      (context.options && context.options[0]) || DEFAULT_REQUIRED_PROPERTIES,
    );

    function isOgpMeta(node: AnyNode): node is Tag {
      const isMeta = isTag(node) && node.name === "meta";
      const property = isMeta ? findAttr(node, "property") : undefined;
      const hasOgProperty = property?.value?.value?.indexOf("og:") === 0;
      return hasOgProperty;
    }

    return {
      Tag(node) {
        if (node.name !== "head") {
          return;
        }
        const { children } = node;

        const metaTags = filter(children as AnyNode[], isOgpMeta);

        const missingProperties = requiredProperties.filter((required) => {
          return !metaTags.some((meta) => {
            const property = findAttr(meta, "property");
            if (property?.value) {
              return property.value.value === required;
            }
            return false;
          });
        });

        const emptyContentMetaTags = metaTags.filter((meta) => {
          const property = findAttr(meta, "property");
          if (
            property?.value
            && requiredProperties.includes(property.value.value)
          ) {
            const content = findAttr(meta, "content");
            return !content?.value?.value;
          }
          return false;
        });

        if (missingProperties.length) {
          context.report({
            node: node.openStart,
            data: {
              properties: missingProperties.join(", "),
            },
            messageId: MESSAGE_IDS.MISSING,
          });
        }

        if (emptyContentMetaTags.length) {
          emptyContentMetaTags.forEach((meta) => {
            const content = findAttr(meta, "content");
            context.report({
              node: content || meta,
              messageId: MESSAGE_IDS.EMPTY,
            });
          });
        }
      },
    };
  },
};

export default rule;
