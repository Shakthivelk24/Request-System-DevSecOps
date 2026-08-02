import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./vitest.setup.js",

   coverage: {
    provider: "v8",
    reporter: ["text", "html", "lcov"],
    reportsDirectory: "coverage",

    all: true,

    include: ["src/**/*.{js,jsx}"],

    exclude: [
    "src/**/*.test.{js,jsx}",
    "src/main.jsx",
    "src/assets/**",
    "src/**/*.css"
]
}
},
});