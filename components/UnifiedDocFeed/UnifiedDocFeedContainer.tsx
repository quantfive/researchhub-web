import { connect } from "react-redux";
import { css, StyleSheet } from "aphrodite";
import { emptyFncWithMsg } from "../../config/utils/nullchecks";
import { filterOptions, scopeOptions } from "~/config/utils/options";
import { formatMainHeader } from "./UnifiedDocFeedUtil";
import { getDocumentCard } from "./utils/getDocumentCard";
import {
  PaginationInfo,
  getFilterFromRouter,
  useEffectForceUpdate,
  useEffectPrefetchNext,
  getPaginationInfoFromServerLoaded,
  useEffectUpdateStatesOnServerChanges,
} from "./utils/UnifiedDocFeedUtil";
import { ReactElement, useMemo, useState } from "react";
import {
  UnifiedDocFilterLabels,
  UnifiedDocFilters,
} from "./constants/UnifiedDocFilters";
import { useRouter } from "next/router";
import colors from "~/config/themes/colors";
import CreateFeedBanner from "../Home/CreateFeedBanner";
import EmptyFeedScreen from "../Home/EmptyFeedScreen";
import FeedBlurWithButton from "./FeedBlurWithButton";
import Loader from "../Loader/Loader";
import Ripples from "react-ripples";
import UnifiedDocFeedCardPlaceholder from "./UnifiedDocFeedCardPlaceholder";
import UnifiedDocFeedFilterButton from "./UnifiedDocFeedFilterButton";
import UnifiedDocFeedSubFilters from "./UnifiedDocFeedSubFilters";

function UnifiedDocFeedContainer({
  auth, // redux
  feed,
  home: isHomePage,
  hub, // selected hub
  hubName,
  hubState, // hub data of current user
  isLoggedIn,
  loggedIn,
  serverLoadedData, // Loaded on the server via getInitialProps on full page load
  subscribeButton,
}): ReactElement<"div"> {
  const router = useRouter();
  const [docTypeFilter, setDocTypeFilter] = useState<string>(
    getFilterFromRouter(router)
  );
  const [subFilters, setSubFilters] = useState({
    filterBy: filterOptions[0],
    scope: scopeOptions[0],
  });
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>(
    getPaginationInfoFromServerLoaded(serverLoadedData)
  );
  const [unifiedDocuments, setUnifiedDocuments] = useState<any>(
    serverLoadedData?.results || []
  );

  useEffectUpdateStatesOnServerChanges({
    setUnifiedDocuments,
    setPaginationInfo,
    routePath: router.pathname,
    serverLoadedData,
  });

  const { hasMore, isLoading, isLoadingMore, isServerLoaded, localPage, page } =
    paginationInfo;
  const isOnMyHubsTab = ["/my-hubs"].includes(router.pathname);
  const hubID = hub?.id ?? null;
  const fetchParamsWithoutCallbacks = {
    docTypeFilter,
    hubID,
    isLoggedIn,
    page,
    subFilters,
    subscribedHubs: isOnMyHubsTab,
  };
  /* NOTE (100): paginationInfo (BE) increments by 20 items. localPage is used to increment by 10 items for UI optimization */
  const canShowLoadMoreButton = unifiedDocuments.length > localPage * 10;
  const shouldPrefetch = page * 2 - 1 === localPage && hasMore;
  useEffectPrefetchNext({
    fetchParams: {
      ...fetchParamsWithoutCallbacks,
      onError: (error: Error): void => {
        emptyFncWithMsg(error);
        setPaginationInfo({
          hasMore,
          isLoading: false,
          isLoadingMore: false,
          isServerLoaded: false,
          localPage,
          page,
        });
      },
      onSuccess: ({
        hasMore: nextPageHasMore,
        page: updatedPage,
        documents: nextDocs,
      }): void => {
        setUnifiedDocuments([...unifiedDocuments, ...nextDocs]);
        setPaginationInfo({
          hasMore: nextPageHasMore,
          isLoading: false,
          isLoadingMore: false,
          isServerLoaded: false,
          localPage,
          page: updatedPage,
        });
      },
      page: page + 1,
    },
    shouldPrefetch,
  });

  /* Force update when hubs or docType changes. start from page 1 */
  useEffectForceUpdate({
    fetchParams: {
      ...fetchParamsWithoutCallbacks,
      onError: (error: Error): void => {
        emptyFncWithMsg(error);
        setPaginationInfo({
          hasMore,
          isLoading: false,
          isLoadingMore: false,
          isServerLoaded: false,
          localPage: 1,
          page,
        });
      },
      onSuccess: ({
        hasMore: nextPageHasMore,
        page: updatedPage,
        documents,
      }): void => {
        setUnifiedDocuments(documents);
        setPaginationInfo({
          hasMore: nextPageHasMore,
          isLoading: false,
          isLoadingMore: false,
          isServerLoaded: false,
          localPage: 1,
          page: updatedPage,
        });
      },
      page: 1 /* when force updating, start from page 1 */,
    },
    shouldEscape: isServerLoaded,
    updateOn: [docTypeFilter, hubID, isLoggedIn, subFilters],
  });

  const hasSubscribed = useMemo(
    (): Boolean => auth.authChecked && hubState.subscribedHubs.length > 0,
    [auth.authChecked, hubState.subscribedHubs]
  );

  const formattedMainHeader = useMemo(
    (): string =>
      formatMainHeader({
        feed,
        filterBy: subFilters.filterBy ?? null,
        hubName,
        isHomePage,
      }),
    [hubName, feed, subFilters, isHomePage]
  );

  const handleDocTypeChange = (docTypeValue: string): void => {
    setDocTypeFilter(docTypeValue);
    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, type: docTypeValue },
      },
      router.pathname + `?type=${docTypeValue}`
    );
  };

  const docTypeFilterButtons = useMemo(() => {
    return Object.keys(UnifiedDocFilters).map(
      (filterKey: string): ReactElement<typeof UnifiedDocFeedFilterButton> => {
        const filterValue = UnifiedDocFilters[filterKey];
        return (
          <div className={css(styles.feedButtonContainer)}>
            <UnifiedDocFeedFilterButton
              isActive={docTypeFilter === filterValue}
              key={filterKey}
              label={UnifiedDocFilterLabels[filterKey]}
              onClick={() => handleDocTypeChange(filterValue)}
            />
          </div>
        );
      }
    );
  }, [docTypeFilter, router]);

  const renderableUniDoc = unifiedDocuments.slice(0, localPage * 10);
  const cards = getDocumentCard({
    hasSubscribed,
    isLoggedIn,
    isOnMyHubsTab,
    setUnifiedDocuments,
    unifiedDocumentData: renderableUniDoc,
  });

  return (
    <div className={css(styles.unifiedDocFeedContainer)}>
      <div className={css(styles.titleContainer)}>
        <h1 className={css(styles.title) + " clamp2"}>{formattedMainHeader}</h1>
        {isHomePage ? null : (
          <div className={css(styles.subscribeContainer)}>
            {hub && subscribeButton}
          </div>
        )}
        <div className={css(styles.subFilters)}>
          <UnifiedDocFeedSubFilters
            onSubFilterSelect={(_type: string, filterBy: any): void =>
              setSubFilters({ filterBy, scope: subFilters.scope })
            }
            onScopeSelect={(_type: string, scope: any): void =>
              setSubFilters({ filterBy: subFilters.filterBy, scope })
            }
            subFilters={subFilters}
          />
        </div>
      </div>
      <div className={css(styles.buttonGroup)}>
        <div className={css(styles.mainFilters)}>{docTypeFilterButtons}</div>
      </div>
      {!hasSubscribed ? (
        <div>
          <div className={css(styles.bannerContainer)} id="create-feed-banner">
            {/* @ts-ignore */}
            <CreateFeedBanner loggedIn={loggedIn} />
          </div>
        </div>
      ) : null}
      {isLoading ? (
        <div className={css(styles.initPlaceholder)}>
          <UnifiedDocFeedCardPlaceholder color="#efefef" />
          <UnifiedDocFeedCardPlaceholder color="#efefef" />
          <UnifiedDocFeedCardPlaceholder color="#efefef" />
        </div>
      ) : (
        <div className={css(styles.feedPosts)}>
          <FeedBlurWithButton />
          {cards.length > 0 ? cards : <EmptyFeedScreen />}
        </div>
      )}
      {/* if not Loggedin & trying to view "My Hubs", redirect them to "All" */}
      {!isLoggedIn && isOnMyHubsTab ? null : (
        <div className={css(styles.loadMoreWrap)}>
          {isLoadingMore ? (
            <Loader
              key={"authored-loader"}
              loading={true}
              size={25}
              color={colors.BLUE()}
            />
          ) : canShowLoadMoreButton ? (
            <Ripples
              className={css(styles.loadMoreButton)}
              onClick={(): void =>
                setPaginationInfo({
                  ...paginationInfo,
                  localPage: localPage + 1,
                })
              }
            >
              {"Load More"}
            </Ripples>
          ) : null}
        </div>
      )}
    </div>
  );
}

const mapStateToProps = (state: any) => ({
  auth: state.auth,
  hubState: state.hubs,
  allHubs: state.hubs.hubs,
  isLoggedIn: state.auth.isLoggedIn,
});

export default connect(mapStateToProps)(UnifiedDocFeedContainer);

const styles = StyleSheet.create({
  unifiedDocFeedContainer: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    width: "100%",
    "@media only screen and (min-width: 1200px)": {
      paddingLeft: 28,
      paddingRight: 28,
    },
    "@media only screen and (max-width: 990px)": {
      width: "100%",
    },
    "@media only screen and (max-width: 415px)": {
      width: "100%",
    },
  },
  buttonGroup: {
    alignItems: "center",
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 16,
    marginBottom: 16,
    overflow: "auto",
  },
  mainFilters: {
    alignItems: "center",
    display: "flex",
    height: "inherit",
    width: "100%",
  },
  feedButtonContainer: {
    marginRight: 24,
  },
  subFilters: {
    alignItems: "center",
    display: "flex",
    height: "inherit",
    marginLeft: "auto",

    "@media only screen and (max-width: 767px)": {
      width: "100%",
      marginTop: 16,
    },
  },
  titleContainer: {
    display: "flex",
    alignItems: "center",
    "@media only screen and (max-width: 767px)": {
      flexDirection: "column",
    },
  },
  title: {
    color: "#241F3A",
    // width: "100%",
    fontWeight: 400,
    fontSize: 30,
    padding: 0,
    margin: 0,
    textOverflow: "ellipsis",

    "@media only screen and (max-width: 1149px)": {
      fontSize: 30,
    },
    "@media only screen and (max-width: 767px)": {
      fontSize: 25,
      textAlign: "center",
      justifyContent: "center",
      whiteSpace: "pre-wrap",
      wordBreak: "normal",
      display: "flex",
    },
    "@media only screen and (max-width: 416px)": {
      fontSize: 25,
    },
    "@media only screen and (max-width: 321px)": {
      fontSize: 20,
    },
  },
  subscribeContainer: {
    marginLeft: 16,
    minWidth: 100,
    "@media only screen and (max-width: 767px)": {
      display: "none",
    },
  },
  loadMoreButton: {
    fontSize: 14,
    border: `1px solid ${colors.BLUE()}`,
    boxSizing: "border-box",
    borderRadius: 4,
    height: 45,
    width: 155,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: colors.BLUE(),
    cursor: "pointer",
    userSelect: "none",
    ":hover": {
      color: "#FFF",
      backgroundColor: colors.BLUE(),
    },
  },
  loadMoreWrap: {
    alignItems: "center",
    display: "flex",
    justifyContent: "center",
    width: "100%",
    margin: "8px 0 16px",
  },
  initPlaceholder: {
    alignContent: "center",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    width: "100%",
  },
  bannerContainer: {
    marginBottom: 16,
    boxShadow: "0px 2px 4px rgba(185, 185, 185, 0.25)",
    "@media only screen and (max-width: 415px)": {
      padding: 0,
      width: "100%",
    },
  },
  feedPosts: {
    position: "relative",
    minHeight: 200,
  },
  tabFeature: {
    marginLeft: 8,
    width: 38,
  },
  hypoFeedButton: {
    alignItems: "center",
    display: "flex",
    marginRight: 24,
  },
});
