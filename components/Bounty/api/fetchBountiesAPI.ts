import API, { generateApiUrl } from "~/config/api";
import { Helpers } from "@quantfive/js-web-config";
import { PaginatedApiResponse } from "~/config/types/root_types";

type Args = {
  personalized?: boolean;
  page?: number;
  status?: string;
};

export const fetchBounties = ({ personalized = true, page, status = 'OPEN' }: Args): Promise<PaginatedApiResponse> => {
  const url = generateApiUrl(`bounty?status=${status}`) + (personalized ? '&personalized=true' : '');

  return fetch(url, API.GET_CONFIG())
    .then(Helpers.checkStatus)
    .then(Helpers.parseJSON)
    .then((res: any) => {
      return res;
    })
};

