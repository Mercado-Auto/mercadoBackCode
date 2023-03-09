import { Equal, Raw } from "typeorm";

export const filterRules = {
  id: (value: any) => Equal(value),
  name: (value: any) =>
    Raw((alias) => `unaccent(${alias}) ILIKE '%'|| unaccent(:value) ||'%'`, {
      value,
    }),
  uf: (value: any) => Equal(value),
};
