import quickSort from '../../utils/quickSort.mjs';

describe('quickSort', () => {
  const testArray = [
    { id: 3, name: 'Charlie' },
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
  ];

  test('sorts array by numeric field ascending', () => {
    const sorted = quickSort([...testArray], 'id', 'asc');
    expect(sorted).toEqual([
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
      { id: 3, name: 'Charlie' },
    ]);
  });

  test('sorts array by numeric field descending', () => {
    const sorted = quickSort([...testArray], 'id', 'desc');
    expect(sorted).toEqual([
      { id: 3, name: 'Charlie' },
      { id: 2, name: 'Bob' },
      { id: 1, name: 'Alice' },
    ]);
  });

  test('sorts array by string field ascending', () => {
    const sorted = quickSort([...testArray], 'name', 'asc');
    expect(sorted).toEqual([
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
      { id: 3, name: 'Charlie' },
    ]);
  });

  test('sorts array by string field descending', () => {
    const sorted = quickSort([...testArray], 'name', 'desc');
    expect(sorted).toEqual([
      { id: 3, name: 'Charlie' },
      { id: 2, name: 'Bob' },
      { id: 1, name: 'Alice' },
    ]);
  });

  test('handles empty array', () => {
    expect(quickSort([], 'id', 'asc')).toEqual([]);
  });

  test('handles single element array', () => {
    const singleElement = [{ id: 1, name: 'Alice' }];
    expect(quickSort(singleElement, 'id', 'asc')).toEqual(singleElement);
  });

  test('handles duplicate values', () => {
    const arrayWithDuplicates = [
      { id: 2, name: 'Bob' },
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Charlie' },
    ];
    const sorted = quickSort(arrayWithDuplicates, 'id', 'asc');
    expect(sorted[0].id).toBe(1);
    expect(sorted[1].id).toBe(2);
    expect(sorted[2].id).toBe(2);
  });
});
