import FastGlob from "fast-glob";
import path from "path";
import type { AST } from "yaml-eslint-parser";

import {
  isFileExists,
  isLocalLink,
  isYAMLPair,
  isYAMLScalar,
  isYAMLSequence,
  resolvePathname,
  type RuleModule,
} from "../utils.ts";

export const rule: RuleModule = {
  meta: {
    type: "problem",
    schema: [
      {
        type: "object",
        properties: {
          redirects: {
            type: "object",
            patternProperties: {
              ".*": {
                type: "string",
              },
            },
            additionalProperties: false,
          },
        },
        additionalProperties: false,
      },
    ],
    docs: {
      description:
        "`_nav.yaml` 파일에 정의되어 있는 markdown 파일 링크의 유효성을 검사합니다.",
    },
    fixable: "code",
  },
  create(context) {
    const { name: filename, dir } = path.parse(context.physicalFilename);

    const baseDir = path.resolve(dir, "..");
    if (filename !== "_nav") return {};
    const files = new Set(
      FastGlob.sync("**/*", { cwd: baseDir }).map(resolvePathname),
    );
    return {
      YAMLScalar(node: AST.YAMLScalar) {
        let url: string | null = null;
        if (
          isYAMLSequence(node.parent) &&
          isYAMLPair(node.parent.parent) &&
          isYAMLScalar(node.parent.parent.key) &&
          node.parent.parent.key.value === "items" &&
          typeof node.value === "string"
        ) {
          url = node.value;
        }
        if (
          isYAMLPair(node.parent) &&
          node.parent.key !== node &&
          isYAMLScalar(node.parent.key) &&
          node.parent.key.value === "slug" &&
          typeof node.value === "string"
        ) {
          url = node.value;
        }
        if (url && isLocalLink(url)) {
          url = url.split(/[#?]/)[0] ?? "";
          isFileExists(url, [], files, (reason) => {
            context.report({
              loc: node.loc,
              message: reason,
            });
          });
        }
      },
    };
  },
};

const plugin = {
  rules: { "local-links-valid": rule },
};

export default plugin;
