import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Adestro",
    short_name: "Adestro",
    description: "Plataforma para adestradores gerenciarem rotina, treinos, relatorios e agenda com apoio de IA.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#eaf4fb",
    theme_color: "#0f3d5e",
    lang: "pt-BR",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
