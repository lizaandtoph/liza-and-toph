import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isInTrialPeriod(createdAt: Date | string | undefined): boolean {
  if (!createdAt) return false;
  
  const accountCreationDate = new Date(createdAt);
  const now = new Date();
  const daysSinceCreation = (now.getTime() - accountCreationDate.getTime()) / (1000 * 60 * 60 * 24);
  
  return daysSinceCreation <= 14;
}
