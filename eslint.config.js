import antfu from '@antfu/eslint-config';

export default antfu({
  stylistic: {
    indent: 2,
    quotes: 'single',
    semi: true,
  },
  typescript: true,
  vue: true,
  ignores: [
    'components/ui/**',
    '.github/**/*',
    'public/**',
  ],
}, {
  plugins: {
    drizzle,
  },
  rules: {
    'style/brace-style': ['warn', '1tbs', { allowSingleLine: true }],
    'vue/block-order': ['error', {
      order: ['template', 'script', 'style'],
    }],
  },
});
