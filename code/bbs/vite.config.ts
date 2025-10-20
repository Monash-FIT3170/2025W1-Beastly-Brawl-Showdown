import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { env } from "process";

// https://vite.dev/config/
const PORT = Number(process.env.PORT) || 5173;

export default defineConfig({
  plugins: [react()],
  server: {
    port: PORT,
    host: true,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'two025w1-beastly-brawl-showdown-frontend.onrender.com'
    ]
  }
});
