import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "The Boshaw Classic",
    short_name: "Boshaw",
    description: "Bachelor party golf tournament — Lake Chelan 2026",
    start_url: "/",
    display: "standalone",
    background_color: "#161B22",
    theme_color: "#161B22",
    orientation: "portrait",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
