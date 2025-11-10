/**
 * Local lint overrides to suppress noisy rules while the codebase is stabilized.
 * Add more granular linting per file instead of re-enabling these globally.
 */
export default {
  rules: {
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-explicit-any": "off",
  },
};
