import { Equal, Raw } from "typeorm";

export const filterRules = {
  reseller_id: (value: any) => Equal(value),
};
