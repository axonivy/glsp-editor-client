import tseslint from 'typescript-eslint';
import config from '@axonivy/eslint-config';

export default tseslint.config(
  ...config.base,
  // TypeScript recommended configs
  {
    name: 'typescript-eslint',
    languageOptions: {
      parserOptions: {
        project: true, // Uses tsconfig.json from current directory
        tsconfigRootDir: import.meta.dirname
      }
    }
  },
  // Project specific configs
  {
    name: 'general',
    rules: {
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          varsIgnorePattern: 'svg' // Ignore unused svg imports as needed for snabbdom VNodes to work
        }
      ]
    }
  },
  {
    name: 'packages/editor',
    rules: {
      'react/no-unknown-property': 'off'
    }
  }
);
