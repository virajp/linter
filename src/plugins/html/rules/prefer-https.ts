// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/prefer-https.js.
import type {
  Attribute,
  AttributeValue,
  ScriptTag,
  Tag,
} from "@html-eslint/types";
import { RULE_CATEGORY } from "../constants/index.js";
import type { RuleModule } from "../types/index.js";
import {
  findAttr,
  getNameOf,
  isScript,
} from "../utils/node.js";
import { getRuleUrl } from "../utils/rule.js";
import { createVisitors } from "../utils/visitors.js";

const MESSAGE_IDS = {
  UNEXPECTED: "unexpected",
};

function getProtocol(url: string) {
  try {
    return new URL(url).protocol;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_) {
    return null;
  }
}

function getResourceAttributeValue(
  node: Tag | ScriptTag,
): AttributeValue | undefined {
  let attribute: Attribute | undefined;
  if (isScript(node)) {
    attribute = findAttr(node, "src");
  } else {
    switch (getNameOf(node)) {
      case "img":
      case "iframe":
      case "audio":
      case "video":
      case "source":
      case "embed": {
        attribute = findAttr(node, "src");
        break;
      }
      case "link": {
        attribute = findAttr(node, "href");
        break;
      }
      case "object": {
        attribute = findAttr(node, "data");
        break;
      }
    }
  }
  if (attribute) {
    return attribute.value;
  }
  return undefined;
}

const rule: RuleModule<[]> = {
  meta: {
    type: "code" as "problem",
    docs: {
      description: "Prefer to use HTTPS for embedded resources",
      recommended: false,
      category: RULE_CATEGORY.BEST_PRACTICE,
      url: getRuleUrl("prefer-https"),
    } as RuleModule<[]>["meta"]["docs"],
    fixable: false as unknown as undefined,
    schema: [],
    messages: {
      [MESSAGE_IDS.UNEXPECTED]: "Unexpected use 'HTTP' protocol.",
    },
  },

  create(context) {
    function check(node: Tag | ScriptTag) {
      const attributeValue = getResourceAttributeValue(node);
      if (attributeValue && !attributeValue.parts.length) {
        const protocol = getProtocol(attributeValue.value);
        if (protocol === "http:") {
          context.report({
            node: attributeValue,
            messageId: MESSAGE_IDS.UNEXPECTED,
          });
        }
      }
    }

    return createVisitors(context, {
      ScriptTag: check,
      Tag: check,
    });
  },
};

export default rule;
