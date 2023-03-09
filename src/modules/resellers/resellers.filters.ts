import { Equal, Raw } from "typeorm";

export const filterRules = {
  id: (value: any) => Equal(value),
  name: (value: any) =>
    Raw((alias) => `unaccent(${alias}) ILIKE '%'|| unaccent(:value) ||'%'`, {
      value,
    }),
  email: (value: any) => Equal(value),
};

export const filterTransactionsRules = {
  operation: (value: any) => Equal(value),
  processed: (value: any) => Equal(value),
};
