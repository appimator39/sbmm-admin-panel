import { Quiz } from './types';

// ----------------------------------------------------------------------

type Order = 'asc' | 'desc';

export function getComparator(order: Order, orderBy: string) {
  return order === 'desc'
    ? (a: Quiz, b: Quiz) => descendingComparator(a, b, orderBy)
    : (a: Quiz, b: Quiz) => -descendingComparator(a, b, orderBy);
}

export function descendingComparator(a: Quiz, b: Quiz, orderBy: string) {
  // Handle nested properties
  if (orderBy === 'topic') {
    return b.topicId.name.localeCompare(a.topicId.name);
  }

  // Handle batch count
  if (orderBy === 'batches') {
    return b.batchIds.length - a.batchIds.length;
  }

  // Handle direct properties
  const aValue = a[orderBy as keyof Quiz];
  const bValue = b[orderBy as keyof Quiz];

  if (typeof aValue === 'string' && typeof bValue === 'string') {
    return bValue.localeCompare(aValue);
  }

  if (typeof aValue === 'number' && typeof bValue === 'number') {
    return bValue - aValue;
  }

  return 0;
}

export function applyFilter({
  inputData,
  comparator,
  filterName,
}: {
  inputData: Quiz[];
  comparator: (a: Quiz, b: Quiz) => number;
  filterName: string;
}) {
  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (filterName) {
    inputData = inputData.filter(
      (quiz) =>
        quiz.title.toLowerCase().indexOf(filterName.toLowerCase()) !== -1 ||
        quiz.topicId.name.toLowerCase().indexOf(filterName.toLowerCase()) !== -1 ||
        quiz.batchIds.some(batch => 
          batch.title.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
        )
    );
  }

  return inputData;
} 