module.exports = {
  bracketSpacing: true,
  jsxBracketSameLine: false,
  printWidth: 140,
  semi: true,
  singleQuote: true,
  trailingComma: "none",
  proseWrap: "never",
  arrowParens: "avoid",
  endOfLine: "lf",
  overrides: [
    {
      files: ".prettierrc",
      options: {
        parser: "json",
      },
    },
  ],
};
