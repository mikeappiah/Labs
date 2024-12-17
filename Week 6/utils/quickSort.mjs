const quickSort = (arr, field, order) => {
  if (arr.length <= 1) return arr;
  const pivot = arr[arr.length - 1];
  const left = [];
  const right = [];

  for (let i = 0; i < arr.length - 1; i++) {
    if (
      (order === 'asc' && arr[i][field] <= pivot[field]) ||
      (order === 'desc' && arr[i][field] >= pivot[field])
    ) {
      left.push(arr[i]);
    } else {
      right.push(arr[i]);
    }
  }
  return [
    ...quickSort(left, field, order),
    pivot,
    ...quickSort(right, field, order),
  ];
};

export default quickSort;
