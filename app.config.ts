import { defineConfig } from "@solidjs/start/config";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
    ssr: false,
    vite: {
        plugins: [
            tailwindcss(),
            tsconfigPaths()
        ],
    }
});
