const baseConfig = require('./.eslintrc.js');

module.exports = {
  plugins: [
    require('volar-service-eslint').default(program => ({
      ...baseConfig,
      ignorePatterns: ['**/*.vue.*'], // ignore virtual files: *.vue.ts, *.vue.html, *.vue.css
      parserOptions: {
        ...baseConfig.parserOptions,
        programs: [program], // replace eslint typescript program
      },
    })),
  ],
};
