import {Equal} from "typeorm";

export const filterRules = {
    status: (value: any) => Equal(value),
  };