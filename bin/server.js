import 'reflect-metadata';
// Register ts-node to handle TypeScript files
import { register } from 'ts-node';
register({
  transpileOnly: true,
  compilerOptions: {
    module: 'ESNext',
    moduleResolution: 'NodeNext',
  },
});

import { Ignitor, prettyPrintError } from '@adonisjs/core';
const APP_ROOT = new URL('../', import.meta.url);
const IMPORTER = (filePath) => {
    if (filePath.startsWith('./') || filePath.startsWith('../')) {
        // Handle both .js and .ts extensions
        try {
            return import(new URL(filePath, APP_ROOT).href);
        } catch (error) {
            // If .js fails, try .ts
            if (filePath.endsWith('.js')) {
                const tsFilePath = filePath.replace(/\.js$/, '.ts');
                return import(new URL(tsFilePath, APP_ROOT).href);
            }
            throw error;
        }
    }
    return import(filePath);
};
new Ignitor(APP_ROOT, { importer: IMPORTER })
    .tap((app) => {
    app.booting(async () => {
        await import('#start/env');
    });
    app.listen('SIGTERM', () => app.terminate());
    app.listenIf(app.managedByPm2, 'SIGINT', () => app.terminate());
})
    .httpServer()
    .start()
    .catch((error) => {
    process.exitCode = 1;
    prettyPrintError(error);
});
//# sourceMappingURL=server.js.map
