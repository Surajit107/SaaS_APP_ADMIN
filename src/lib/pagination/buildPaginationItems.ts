/**
 * Page numbers for a compact pagination control (first, last, neighbors of current, ellipses).
 */
export function buildPaginationItems(
  currentPage: number,
  totalPages: number,
): Array<number | 'ellipsis'> {
  const safeTotal = Math.max(totalPages, 1);
  if (safeTotal <= 1) {
    return [1];
  }
  if (safeTotal <= 7) {
    return Array.from({ length: safeTotal }, (_, index) => index + 1);
  }

  const pages = new Set<number>();
  pages.add(1);
  pages.add(safeTotal);
  const windowRadius = 1;
  for (
    let pageNumber = currentPage - windowRadius;
    pageNumber <= currentPage + windowRadius;
    pageNumber += 1
  ) {
    if (pageNumber >= 1 && pageNumber <= safeTotal) {
      pages.add(pageNumber);
    }
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const result: Array<number | 'ellipsis'> = [];
  for (let index = 0; index < sorted.length; index += 1) {
    const value = sorted[index];
    const previous = sorted[index - 1];
    if (index > 0 && previous !== undefined && value - previous > 1) {
      result.push('ellipsis');
    }
    result.push(value);
  }
  return result;
}
