/**
 * Format a date string or Date object into a localized French string.
 * @param date - ISO string or Date object
 * @param options - 'short' for compact format, 'long' for verbose format
 */
export function formatDate(date: string | Date, options?: "short" | "long"): string {
  const d = typeof date === "string" ? new Date(date) : date;

  if (options === "long") {
    return d.toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  // short / default
  return d.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format a duration in seconds to MM:SS.
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

/**
 * Calculate the number of unique participant pairings across all tours/tables.
 */
export function calculateUniqueMeetings(
  tours: { tables: { participants: { id: string }[] }[] }[]
): number {
  const seen = new Set<string>();

  for (const tour of tours) {
    for (const table of tour.tables) {
      const ids = table.participants.map((p) => p.id);
      for (let i = 0; i < ids.length; i++) {
        for (let j = i + 1; j < ids.length; j++) {
          const key = ids[i] < ids[j] ? `${ids[i]}-${ids[j]}` : `${ids[j]}-${ids[i]}`;
          seen.add(key);
        }
      }
    }
  }

  return seen.size;
}

/**
 * Merge class names, filtering out falsy values.
 */
export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
