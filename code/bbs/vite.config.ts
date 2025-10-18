import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { env } from "process";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: Number(env.PORT) ?? 5173,
  },
});
