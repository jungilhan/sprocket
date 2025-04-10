import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// https://vite.dev/config/
export default defineConfig(({
    base: '/sprocket/',
    plugins: [svelte()],
    build: {
      rollupOptions: {
        output: {},
      },
    },
  }));
