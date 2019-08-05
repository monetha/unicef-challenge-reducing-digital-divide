import { Location } from 'history';
import queryString from 'query-string';

const persistedParams = ['network'];

export interface IParsedQueryString {
  [key: string]: string;
}

export function createRouteUrl(location: Location, base: string, queryParams?: IParsedQueryString) {
  const oldParams = queryString.parse(location.search);
  const newParams = {};

  // Persisted ones
  persistedParams.forEach(p => {
    newParams[p] = oldParams[p];
  });

  // Specified ones
  if (queryParams) {
    for (const key in queryParams) {
      if (!queryParams.hasOwnProperty(key)) {
        continue;
      }

      const value = queryParams[key];
      if (!value) {
        continue;
      }

      newParams[key] = value;
    }
  }

  // Construct query param string
  let newSearch = queryString.stringify(newParams);
  if (newSearch) {
    newSearch = `?${newSearch}`;
  }

  return `${base}${newSearch}`;
}
