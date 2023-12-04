import { defineConfig } from "vitest/config"

export default defineConfig({
   test: {
      typecheck: {
         tsconfig: "tsconfig.json",
         allowJs: true,
         ignoreSourceErrors: false,
      },
      exclude: [
         "**/node_modules/**",
         "**/dist/**",
         "**/cypress/**",
         "**/.{idea,git,cache,output,temp}/**",
         "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*",
         "**/tests/types/**",
         "**/tests/utils/**",
      ],
   },
})
