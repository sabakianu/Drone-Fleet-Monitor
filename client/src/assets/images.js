import fallbackImg from "./hero.png";

// Vite face bundle la toate imaginile din assets/Images si ne da URL-ul final.
// Cheile arata asa: "./Images/DroneModels/MQ9Reaper.jpeg"
const IMAGES = import.meta.glob("./Images/**/*.{png,jpg,jpeg,webp}", {
  eager: true,
  import: "default",
});

// imagePath vine de la backend, relativ la assets (ex: "Images/Bases/CivilianDroneBase.jpg")
export function resolveImage(imagePath) {
  if (!imagePath) return fallbackImg;

  return IMAGES[`./${imagePath}`] ?? fallbackImg;
}

export { fallbackImg };
