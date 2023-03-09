import { Equal, Raw, In, Between, MoreThanOrEqual } from "typeorm";

export const filterRules = {
  id: (value: any) => Equal(value),
  name: (value: any) =>
    Raw((alias) => `unaccent(${alias}) ILIKE '%'|| unaccent(:value) ||'%'`, {
      value,
    }),
  sections: (value: any) => ({
    id: In(typeof value == "string" ? [value] : value),
  }),
  tags: (value: any) => ({
    id: In(typeof value == "string" ? [value] : value),
  }),
  price: (value: any) => ({
    price:
      typeof value === "string"
        ? MoreThanOrEqual(Number(value))
        : Between(Number(value[0]), Number(value[1])),
  }),
};
