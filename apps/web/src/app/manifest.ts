import type { MetadataRoute } from "next";

const manifest = (): MetadataRoute.Manifest => ({
  background_color: "#fffdf8",
  categories: ["lifestyle", "productivity", "utilities"],
  description:
    "Stay in touch with family, keep track of the day, and check messages that look wrong.",
  display: "standalone",
  icons: [
    {
      purpose: "any",
      sizes: "192x192",
      src: "/icons/icon-192.png",
      type: "image/png",
    },
    {
      purpose: "any",
      sizes: "512x512",
      src: "/icons/icon-512.png",
      type: "image/png",
    },
    {
      purpose: "maskable",
      sizes: "512x512",
      src: "/icons/maskable-512.png",
      type: "image/png",
    },
  ],
  id: "/",
  lang: "en-US",
  name: "LifeLink",
  orientation: "any",
  scope: "/",
  short_name: "LifeLink",
  shortcuts: [
    { name: "Today", url: "/" },
    { name: "Ask LifeLink", url: "/ask" },
    { name: "Solitaire (works offline)", url: "/solitaire" },
  ],
  start_url: "/",
  theme_color: "#8f3f25",
});

export default manifest;
