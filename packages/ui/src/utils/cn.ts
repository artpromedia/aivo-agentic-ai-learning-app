import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names using clsx and tailwind-merge
 * This utility ensures Tailwind classes are properly merged without conflicts
 * 
 * @param inputs - Class names to combine
 * @returns Merged class string
 * 
 * @example
 * cn('px-4 py-2', condition && 'bg-blue-500', 'px-6')
 * // Returns: 'px-6 py-2 bg-blue-500'
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
