import { ENV_AUTH_TOKEN } from "~/config/utils/auth";
import { Fragment } from "react";
import { Helpers } from "@quantfive/js-web-config";
import { pickFiltersForApi, QUERY_PARAM } from "~/config/utils/search";
import { useRouter } from "next/router";
import API from "~/config/api";
import Error from "next/error";
import get from "lodash/get";
import Head from "~/components/Head";
import nookies from "nookies";
import PropTypes from "prop-types";
import SearchResults from "~/components/Search/SearchResults";

// Facets specified will have their values returned
// alongside counts in the search response.
const getFacetsToAggregate = (query = {}) => {
  const facet = [];
  if (query.type === "paper" || query.type === "post") {
    facet.push("hubs");
    facet.push("external_source");
    facet.push("pdf_license");
    facet.push("paper_publish_year");
  }
  return facet;
};

const Index = ({ apiResponse, hasError }) => {
  const router = useRouter();

  if (hasError || !apiResponse) {
    return <Error statusCode={500} />;
  }

  const buildPageTitle = () => {
    if (get(router, "query.type") === "all") {
      return `${get(router, `query[${QUERY_PARAM}]`)} - ResearchHub`;
    } else {
      return `(${apiResponse.count}) ${get(
        router,
        `query[${QUERY_PARAM}]`
      )} - ResearchHub`;
    }
  };

  return (
    <Fragment>
      <Head title={buildPageTitle()} description={"Search ResearchHub"} />
      <SearchResults apiResponse={apiResponse} />
    </Fragment>
  );
};

Index.getInitialProps = async (ctx) => {
  const cookies = nookies.get(ctx);
  const authToken = cookies[ENV_AUTH_TOKEN];
  const filters = pickFiltersForApi({
    searchType: ctx.query.type,
    query: ctx.query,
  });

  const facets = getFacetsToAggregate(ctx.query);
  const config = {
    route: ctx.query.type,
  };

  return fetch(
    API.SEARCH({ filters, facets, config }),
    API.GET_CONFIG(authToken)
  )
    .then(Helpers.checkStatus)
    .then(Helpers.parseJSON)
    .then((apiResponse) => {
      return { apiResponse };
    })
    .catch((_error) => {
      return { hasError: true };
    });
};

Index.propTypes = {
  apiResponse: PropTypes.object,
  hasError: PropTypes.bool,
};

export default Index;
