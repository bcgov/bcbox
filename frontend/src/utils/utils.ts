// Checks if the app is currently running in debug mode
export const isDebugMode: boolean = import.meta.env.MODE.toUpperCase() === 'DEBUG';

// Partitions an array into two array sets depending on conditional
// https://stackoverflow.com/a/71247432
export function partition<T>(
  arr: Array<T>,
  predicate: (v: T, i: number, ar: Array<T>) => boolean
) {
  return arr.reduce(
    (acc, item, index, array) => {
      acc[+!predicate(item, index, array)].push(item);
      return acc;
    },
    [[], []] as [Array<T>, Array<T>]
  );
}
