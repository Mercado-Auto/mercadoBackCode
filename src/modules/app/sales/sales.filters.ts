import { Equal } from "typeorm";

export const filterRules = {
  id: (value: any) => Equal(value),
  status: (value: any) => Equal(value),
};
