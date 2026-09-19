import { createRoot } from "react-dom/client";
import AstroApp from "@/components/astro-app";
import { installStandaloneApi } from "@/standalone/api";

declare global {
  interface Window {
    __ASTRO_STANDALONE__?: boolean;
  }
}

window.__ASTRO_STANDALONE__ = true;
installStandaloneApi();

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root");
createRoot(root).render(<AstroApp />);
