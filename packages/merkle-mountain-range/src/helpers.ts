// Convert number of elements in the MMR to number of leaves.
// If `elementsCount` is invalid, it throws an error.
export function elementsCountToLeafCount(elementsCount: number): number {
  let leafCount = 0;
  let mountainLeafCount = 1 << bitLength(elementsCount);
  while (mountainLeafCount > 0) {
    const mountainElementsCount = 2 * mountainLeafCount - 1;
    if (mountainElementsCount <= elementsCount) {
      leafCount += mountainLeafCount;
      elementsCount -= mountainElementsCount;
    }
    mountainLeafCount >>= 1;
  }
  if (elementsCount > 0) {
    throw new Error(`Invalid elements count: ${elementsCount}`);
  }
  return leafCount;
}

// Find the peaks of a tree of size `elementsCount`.
// If `elementsCount` is invalid, it returns an empty array.
export function findPeaks(elementsCount: number): number[] {
  let mountainElementsCount = (1 << bitLength(elementsCount)) - 1;
  let mountainIndexShift = 0;
  const peaks: number[] = [];
  while (mountainElementsCount > 0) {
    // console.log("trying mountain size", mountainElementsCount);
    if (mountainElementsCount <= elementsCount) {
      mountainIndexShift += mountainElementsCount;
      peaks.push(mountainIndexShift);
      elementsCount -= mountainElementsCount;
    }
    mountainElementsCount >>= 1;
  }
  if (elementsCount > 0) {
    return [];
  }
  return peaks;
}

// Returns true if a specified index `num` is also the index of a peak inside `peaks`.
export function isPeak(elementIndex: number, peaks: number[]): boolean {
  return peaks.indexOf(elementIndex) !== -1;
}

// For a given number of leaves, calculates how many additional nodes will be created by hashing their children after one append (not including the appended node itself).
export function leafCountToAppendNoMerges(leafCount: number): number {
  return countTrailingOnes(leafCount);
}

// Returns the number of bits in num
export function bitLength(num: number): number {
  return num.toString(2).length;
}

// Returns the number of 1 bits in binary representation of num
export function countOnes(num: number): number {
  let count = 0;
  while (num) {
    num &= num - 1;
    count++;
  }
  return count;
}

// Returns the number of trailing 1 bits in binary representation of num
export function countTrailingOnes(num: number): number {
  let count = 0;
  while (num && num & 1) {
    num >>= 1;
    count++;
  }
  return count;
}

// Number with all bits 1 with the same length as num
export function allOnes(num: number) {
  return (1 << bitLength(num)) - 1 == num;
}

// Returns the number of leading zeros of a uint64.
export function leadingZeros(num: number) {
  return num === 0 ? 64 : 64 - bitLength(num);
}

// Get the peak map height.
// @notice this fn has a uint64 size limit
export function peakMapHeight(size: number) {
  if (size === 0) {
    return [0, 0];
  }
  let peak_size =
    // uint64 size
    BigInt("18446744073709551615") >> BigInt(leadingZeros(size));
  let peak_map = 0;
  while (peak_size != BigInt(0)) {
    peak_map <<= 1;
    if (size >= peak_size) {
      size -= Number(peak_size);
      peak_map |= 1;
    }
    peak_size >>= BigInt(1);
  }
  return [peak_map, size];
}

// Assuming the first position starts with index 1
// the height of a node correspond to the number of 1 digits (in binary)
// on the leftmost branch of the tree, minus 1
// To travel left on a tree we can subtract the position by it's MSB, minus 1
export const getHeight = (elementIndex: number): number => {
  let h = elementIndex;
  // Travel left until reaching leftmost branch (all bits 1)
  while (!allOnes(h)) {
    h = h - ((1 << (bitLength(h) - 1)) - 1);
  }

  return bitLength(h) - 1;
};

// Get the offset to the next sibling from `height`
export const siblingOffset = (height: number): number => {
  return parentOffset(height) - 1;
};

// Get the offset to the next parent from `height`
export const parentOffset = (height: number): number => {
  return 2 << height;
};
