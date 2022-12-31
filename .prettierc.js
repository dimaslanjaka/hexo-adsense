module.exports = {
  "$schema": "https://json.schemastore.org/prettierrc",
  bracketSpacing: true,
  jsxBracketSameLine: false,
  "printWidth": 120,
  semi: true,
  singleQuote: true,
  trailingComma: "none",
  proseWrap: "never",
  arrowParens: "avoid",
  endOfLine: "lf",
  "tabWidth": 2,
  overrides: [
    {
      files: ".prettierrc",
      options: {
        parser: "json",
      },
    },
  ],
};
