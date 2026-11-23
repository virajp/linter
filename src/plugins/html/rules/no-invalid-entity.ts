// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/no-invalid-entity.js.
import type { Text } from "@html-eslint/types";
import type { Rule } from "eslint";
import { RULE_CATEGORY } from "../constants/index.js";
import entitiesData from "../data/entities.js";
import type { RuleModule } from "../types/index.js";
import { getRuleUrl } from "../utils/rule.js";
import { createVisitors } from "../utils/visitors.js";

// Define the type for entities.json
type EntityData = {
  codepoints: number[];
  characters: string;
};

const entities: { [key: string]: EntityData } = entitiesData;

const MESSAGE_IDS = {
  INVALID_ENTITY: "invalidEntity",
};

const rule: RuleModule<[]> = {
  meta: {
    type: "code" as "problem",
    docs: {
      description: "Disallows the use of invalid HTML entities",
      category: RULE_CATEGORY.BEST_PRACTICE,
      recommended: false,
      url: getRuleUrl("no-invalid-entity"),
    } as Rule.RuleMetaData["docs"],
    fixable: null as unknown as undefined,
    hasSuggestions: false,
    schema: [],
    messages: {
      [MESSAGE_IDS.INVALID_ENTITY]: "Invalid HTML entity '{{entity}}' used.",
    },
  },

  create(context) {
    function check(node: Text) {
      const text = node.value;

      // Regular expression to match named and numeric entities
      const entityRegex = /&([a-zA-Z]+|#[0-9]+|#x[0-9a-fA-F]+|[#][^;]+);/g;
      let match;

      while ((match = entityRegex.exec(text)) !== null) {
        const entity = match[0];
        const entityName = match[1]!;

        // Check named entities
        if (!entityName.startsWith("#")) {
          const fullEntity = `&${entityName};`;
          if (!Object.prototype.hasOwnProperty.call(entities, fullEntity)) {
            context.report({
              node,
              messageId: MESSAGE_IDS.INVALID_ENTITY,
              data: { entity },
            });
          }
        } // Check numeric entities
        else {
          const isHex = entityName[1] === "x";
          const numStr = isHex ? entityName.slice(2) : entityName.slice(1);
          const num = isHex ? parseInt(numStr, 16) : parseInt(numStr, 10);

          // If the number is not a valid integer, report an error
          if (isNaN(num)) {
            context.report({
              node,
              messageId: MESSAGE_IDS.INVALID_ENTITY,
              data: { entity },
            });
            continue;
          }

          // Check if the numeric entity is valid (exists in entities.json or within valid Unicode range)
          const entityKey = Object.values(entities).find(({ codepoints }) => {
            return codepoints.length === 1 && codepoints[0] === num;
          });

          if (!entityKey && (num < 0 || num > 0x10ffff)) {
            context.report({
              node,
              messageId: MESSAGE_IDS.INVALID_ENTITY,
              data: { entity },
            });
          }
        }
      }
    }

    return createVisitors(context, {
      Text: check,
    });
  },
};

export default rule;
