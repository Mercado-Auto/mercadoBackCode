export interface IResponseError {
  statusCode: number;
  message: string;
}

export const GlobalResponseError: (
  statusCode: number,
  message: string
) => IResponseError = (statusCode: number, message: string): IResponseError => {
  return {
    statusCode: statusCode,
    message,
  };
};
