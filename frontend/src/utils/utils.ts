// Partitions an array into two array sets depending on conditional
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
