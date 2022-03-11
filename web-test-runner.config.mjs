import { playwrightLauncher } from '@web/test-runner-playwright';
import { visualRegressionPlugin } from '@web/test-runner-visual-regression/plugin';

export default {
  browsers: [
    playwrightLauncher({ product: 'chromium' }),
    playwrightLauncher({ product: 'firefox' }),
  ],
  files: ['test/**/*.spec.js'],
  nodeResolve: true,
  plugins: [
    visualRegressionPlugin({
      update: process.argv.includes('--update-visual-baseline'),
      baseDir: 'test/screenshots',
    }),
  ],
};
