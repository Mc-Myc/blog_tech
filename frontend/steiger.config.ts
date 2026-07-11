import { defineConfig } from "steiger";
import fsd from "@feature-sliced/steiger-plugin";

export default defineConfig([
  ...fsd.configs.recommended,
  {
    files: ["./src/shared/**"],
    rules: { "fsd/public-api": "off" },
  },
  {
    files: ["./src/**"],
    rules: {
      // consumers of pages/*, widgets/*, features/* live in app/ (outside steiger's ./src scan),
      // so this rule misreports them as unused — disabled until steiger can scan app/.
      "fsd/insignificant-slice": "off",
    },
  },
]);
