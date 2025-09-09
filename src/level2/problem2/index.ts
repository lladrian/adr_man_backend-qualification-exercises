export type DowntimeLogs = [Date, Date][];

/**
 * Merge downtime logs from multiple sources into a single sorted list.
 * Overlapping or contiguous intervals are merged.
 */
export function merge(...args: DowntimeLogs[]): DowntimeLogs {
  // Flatten all logs into a single array
  const allLogs: DowntimeLogs = args.flat();

  if (allLogs.length === 0) return [];

  // Sort by start time
  allLogs.sort((a, b) => a[0].getTime() - b[0].getTime());

  const merged: DowntimeLogs = [];
  let current: [Date, Date] = [...allLogs[0]] as [Date, Date];

  for (let i = 1; i < allLogs.length; i++) {
    const [start, end] = allLogs[i];

    if (start.getTime() <= current[1].getTime()) {
      // Overlaps or touches → extend the end if needed
      if (end.getTime() > current[1].getTime()) {
        current[1] = end;
      }
    } else {
      // No overlap → save current and start new one
      merged.push(current);
      current = [start, end];
    }
  }

  merged.push(current);
  return merged;
}
