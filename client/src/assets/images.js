import fallbackImg from "./hero.png";

const IMAGES = import.meta.glob("./Images/**/*.{png,jpg,jpeg,webp}", {
  eager: true,
  import: "default",
});

export function resolveImage(imagePath) {
  if (!imagePath) return fallbackImg;

  return IMAGES[`./${imagePath}`] ?? fallbackImg;
}

export { fallbackImg };
