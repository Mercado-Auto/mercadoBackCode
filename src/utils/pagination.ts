import { PaginationAndSorteringAndFilteringDto } from './pagination.dto';

export const resolvePaginationAndSorteringAndFiltering = (
  inputData: PaginationAndSorteringAndFilteringDto,
  filterConditions: any = {},
): PaginationAndSorteringAndFilteringDto => {
  const retval = {
    page: Number(inputData.page || 1),
    pageSize: Number(inputData.pageSize || 10),
    order_by: inputData.order_by || 'id',
    sort_by: inputData.sort_by || 'ascend',
  };

  const filters = {};

  if (inputData.filters) {
    inputData.filters = JSON.parse(inputData.filters);
    for (const queryFilterKey in inputData.filters) {
      if (queryFilterKey in filterConditions) {
        const filterValue = inputData.filters[queryFilterKey];
        filters[queryFilterKey] = filterConditions[queryFilterKey](filterValue);
      }
    }
  }

  retval['filters'] = filters;

  return retval;
};
