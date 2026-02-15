import { interviewCovers, mappings } from "@/constants";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const techIconBaseURL = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons";

// Cache for icon existence checks to avoid duplicate requests
const iconExistenceCache = new Map<string, boolean>();

const normalizeTechName = (tech: string) => {
  const key = tech.toLowerCase().replace(/\.js$/, "").replace(/\s+/g, "");
  return mappings[key as keyof typeof mappings];
};

const checkIconExists = async (url: string) => {
  // Check if result is already cached
  if (iconExistenceCache.has(url)) {
    return iconExistenceCache.get(url)!;
  }

  try {
    const response = await fetch(url, { 
      method: "HEAD",
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(5000)
    });
    const exists = response.ok;
    // Cache the result
    iconExistenceCache.set(url, exists);
    return exists;
  } catch {
    // Cache failed requests as false
    iconExistenceCache.set(url, false);
    return false;
  }
};

export const getTechLogos = async (techArray: string[]) => {
  // Deduplicate tech array to avoid duplicate icon checks
  const uniqueTechs = Array.from(new Set(techArray));

  const logoURLs = uniqueTechs.map((tech) => {
    const normalized = normalizeTechName(tech);
    return {
      tech,
      url: `${techIconBaseURL}/${normalized}/${normalized}-original.svg`,
    };
  });

  const results = await Promise.all(
    logoURLs.map(async ({ tech, url }) => ({
      tech,
      url: (await checkIconExists(url)) ? url : "/tech.svg",
    }))
  );

  return results;
};

export const getRandomInterviewCover = () => {
  const randomIndex = Math.floor(Math.random() * interviewCovers.length);
  return `/covers${interviewCovers[randomIndex]}`;
};

