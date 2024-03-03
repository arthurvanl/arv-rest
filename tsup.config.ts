import { defineConfig } from "tsup";

export default defineConfig({
    name: 'tsup',
    entry: ["src/index.ts"],
    dts: 'src/types/index.ts',
    //     resolve: true,
    //     entry: ['src/rest_api.ts', 'src/types/index.ts']
    // },
    splitting: false,
    clean: true,
    format: 'esm',
    sourcemap: false,
})