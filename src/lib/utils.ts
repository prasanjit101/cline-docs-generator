import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const modelsList = [
  {
    name: "gpt-4o",
    provider: "openai",
  },
  {
    name: "gpt-4o-mini",
    provider: "openai",
  },
  {
    name: "llama3-70b-8192",
    provider: "groq",
  },
  {
    name: "llama3-8b-8192",
    provider: "groq",
  },
  {
    name: "gemini-2.0-flash-001",
    provider: "gemini",
  },
  {
    name: "deepseek/deepseek-chat:free",
    provider: "openrouter",
  },
];
