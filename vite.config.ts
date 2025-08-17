import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import mkcert from 'vite-plugin-mkcert';
import type { UserConfig, Plugin } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }): UserConfig => {
  const plugins = [
    react(),
    mode === 'development' && componentTagger(),
    mkcert()
  ].filter(Boolean) as Plugin[];

  return {
    server: {
      host: "0.0.0.0",
      port: 5173,
      https: {},
      strictPort: true,
      hmr: {
        protocol: 'wss',
        host: 'localhost',
        port: 5173
      }
    },
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
