import { useQueryStates } from "nuqs";
import { params } from "../search-params";

export const useProductFilters = () => {
  return useQueryStates(params);
};
