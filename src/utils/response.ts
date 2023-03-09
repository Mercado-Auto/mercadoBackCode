export const formatResponseWithPagination = <T>(
  data: [T[], number],
): { data: T[]; total: number } => {
  return {
    data: data[0],
    total: data[1],
  };
};
