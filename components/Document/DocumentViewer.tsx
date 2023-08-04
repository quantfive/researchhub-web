import { StyleSheet, css } from "aphrodite";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { breakpoints } from "~/config/themes/screen";
import DocumentControls from "~/components/Document/DocumentControls";
import DocumentExpandedNav from "~/components/Document/DocumentExpandedNav";
import { zoomOptions } from "~/components/Document/lib/PDFViewer/config";
import { DocumentContext } from "./lib/DocumentContext";
import { DocumentMetadata, GenericDocument } from "./lib/types";
import throttle from "lodash/throttle";
import { LEFT_SIDEBAR_MAX_WIDTH } from "../Home/sidebar/RootLeftSidebar";
import DocumentPlaceholder from "./lib/Placeholders/DocumentPlaceholder";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleExclamation } from "@fortawesome/pro-light-svg-icons";
import {
  Comment as CommentType,
  CommentThreadGroup,
} from "../Comment/lib/types";
import config from "./lib/config";
const AnnotationLayer = dynamic(
  () => import("~/components/Comment/modules/annotation/AnnotationLayer")
);
const PDFViewer = dynamic(() => import("./lib/PDFViewer/_PDFViewer"), {
  ssr: false,
});

export type ZoomAction = {
  isExpanded: boolean;
  zoom: number;
  newWidth: number;
};

type Props = {
  metadata: DocumentMetadata;
  postHtml?: string;
  onZoom: Function;
  document: GenericDocument;
  viewerWidth: number;
};

const DocumentViewer = ({
  document: doc,
  postHtml,
  onZoom,
  viewerWidth,
  metadata,
}: Props) => {
  const documentContext = useContext(DocumentContext);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [annotationCount, setAnnotationCount] = useState<number>(0);
  const contentRef = useRef(null);
  const [hasLoadError, setHasLoadError] = useState<boolean>(false);
  const [fullScreenSelectedZoom, setFullScreenSelectedZoom] =
    useState<number>(1.25);
  const [selectedZoom, setSelectedZoom] = useState<number>(1);
  const [isPdfReady, setIsPdfReady] = useState<boolean>(false);
  const [numPagesToPreload, setNumPagesToPreload] = useState<number>(
    config.numPdfPagesToPreload
  );
  const [pageRendered, setPageRendered] = useState<{ pageNum: number }>({
    pageNum: 0,
  });
  const [windowDimensions, setWindowDimensions] = useState<{
    width: number;
    height: number;
  }>({
    width: 0,
    height: 0,
  });

  const onPdfReady = ({ numPages }) => {
    setIsPdfReady(true);
  };

  const throttledSetDimensions = useCallback(
    throttle(() => {
      console.log("throttledSetDimensions");
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }, 1000),
    []
  );

  useEffect(() => {
    if (window.innerWidth < breakpoints.small.int) {
      setFullScreenSelectedZoom(1.0);
    }
  }, []);

  useEffect(() => {
    throttledSetDimensions();
    window.addEventListener("resize", throttledSetDimensions);

    return () => {
      throttledSetDimensions.cancel();
      window.removeEventListener("resize", throttledSetDimensions);
    };
  }, []);

  useEffect(() => {
    if (isExpanded) {
      document.documentElement.style.setProperty(
        "--zoom-multiplier",
        String(fullScreenSelectedZoom)
      );
    } else {
      document.documentElement.style.setProperty(
        "--zoom-multiplier",
        String(selectedZoom)
      );
    }
  }, [isExpanded, fullScreenSelectedZoom, selectedZoom]);

  function handleZoomIn() {
    if (isExpanded) {
      const currentIdx = zoomOptions.findIndex(
        (option) => option.value === fullScreenSelectedZoom
      );
      const isLastOption = currentIdx === zoomOptions.length - 1;
      if (isLastOption) {
        return;
      }

      const newZoom = zoomOptions[currentIdx + 1].value;
      setFullScreenSelectedZoom(newZoom);
      onZoom &&
        onZoom({
          isExpanded: true,
          zoom: newZoom,
          newWidth: viewerWidth * newZoom,
        } as ZoomAction);
    } else {
      const currentIdx = zoomOptions.findIndex(
        (option) => option.value === selectedZoom
      );
      const isLastOption = currentIdx === zoomOptions.length - 1;
      if (isLastOption) {
        return;
      }

      const newZoom = zoomOptions[currentIdx + 1].value;
      setSelectedZoom(newZoom);
      onZoom &&
        onZoom({
          isExpanded: false,
          zoom: newZoom,
          newWidth: viewerWidth * newZoom,
        } as ZoomAction);
    }
  }
  function handleZoomOut() {
    if (isExpanded) {
      const currentIdx = zoomOptions.findIndex(
        (option) => option.value === fullScreenSelectedZoom
      );
      const isFirstOption = currentIdx === 0;
      if (isFirstOption) {
        return;
      }
      const newZoom = zoomOptions[currentIdx - 1].value;
      setFullScreenSelectedZoom(newZoom);
      onZoom &&
        onZoom({
          isExpanded: true,
          zoom: newZoom,
          newWidth: viewerWidth * newZoom,
        } as ZoomAction);
    } else {
      const currentIdx = zoomOptions.findIndex(
        (option) => option.value === selectedZoom
      );
      const isFirstOption = currentIdx === 0;
      if (isFirstOption) {
        return;
      }
      const newZoom = zoomOptions[currentIdx - 1].value;
      setSelectedZoom(newZoom);
      onZoom &&
        onZoom({
          isExpanded: false,
          zoom: newZoom,
          newWidth: viewerWidth * newZoom,
        } as ZoomAction);
    }
  }

  function handleZoomSelection(zoomOption: any) {
    const newZoom = zoomOptions.find(
      (z) => z.value === zoomOption.value
    )!.value;
    if (isExpanded) {
      onZoom &&
        onZoom({
          isExpanded: true,
          zoom: newZoom,
          newWidth: viewerWidth * newZoom,
        } as ZoomAction);
      setFullScreenSelectedZoom(newZoom);
    } else {
      onZoom &&
        onZoom({
          isExpanded: false,
          zoom: newZoom,
          newWidth: viewerWidth * newZoom,
        } as ZoomAction);
      setSelectedZoom(newZoom);
    }
  }

  function onCommentsFetched({
    threads,
    comments,
    urlPosition,
  }: {
    threads: { [threadId: string]: CommentThreadGroup };
    comments: CommentType[];
    urlPosition: any;
  }) {
    setAnnotationCount(Object.values(threads).length);

    let furthestPageToPreload = config.numPdfPagesToPreload;

    if (
      urlPosition?.pageNumber &&
      urlPosition?.pageNumber > furthestPageToPreload
    ) {
      furthestPageToPreload = urlPosition?.pageNumber;
    }

    comments.forEach((comment) => {
      const commentPageNum = comment?.thread?.anchor?.pageNumber || 1;

      if (commentPageNum > furthestPageToPreload) {
        furthestPageToPreload = commentPageNum;
      }
    });

    setNumPagesToPreload(furthestPageToPreload);
  }

  const commentDisplayPreference = documentContext.preferences?.comments;
  const pdfUrl = doc.formats.find((f) => f.type === "pdf")?.url;
  const actualContentWidth = isExpanded
    ? viewerWidth * fullScreenSelectedZoom
    : viewerWidth * selectedZoom;
  const actualZoom = isExpanded ? fullScreenSelectedZoom : selectedZoom;
  const shouldScroll =
    actualContentWidth > windowDimensions.width - LEFT_SIDEBAR_MAX_WIDTH;

  return (
    <div
      className={css(
        styles.documentViewer,
        isExpanded && styles.expandedWrapper
      )}
    >
      {isExpanded && (
        <DocumentExpandedNav
          document={doc}
          handleClose={() => setIsExpanded(false)}
        />
      )}
      <div
        className={css(
          styles.main,
          isExpanded && styles.expandedContent,
          shouldScroll && styles.scroll
        )}
        style={{
          maxWidth: actualContentWidth,
        }}
      >
        {commentDisplayPreference !== "none" && (
          <AnnotationLayer
            document={doc}
            contentRef={contentRef}
            pageRendered={pageRendered}
            displayPreference={commentDisplayPreference}
            onFetch={onCommentsFetched}
          />
        )}

        {documentContext.documentType === "paper" ? (
          <>
            {hasLoadError ? (
              <div className={css(styles.error)}>
                <FontAwesomeIcon
                  icon={faCircleExclamation}
                  style={{ fontSize: 44 }}
                />
                <span style={{ fontSize: 22 }}>
                  There was an error loading the PDF.
                </span>
              </div>
            ) : (
              <>
                {!isPdfReady && <DocumentPlaceholder />}
                <PDFViewer
                  pdfUrl={pdfUrl}
                  scale={actualZoom}
                  onReady={onPdfReady}
                  contentRef={contentRef}
                  viewerWidth={actualContentWidth}
                  onLoadError={setHasLoadError}
                  numPagesToPreload={numPagesToPreload}
                  onPageRender={setPageRendered}
                  showWhenLoading={
                    <div style={{ padding: 20 }}>
                      <DocumentPlaceholder />
                    </div>
                  }
                />
              </>
            )}
          </>
        ) : (
          <div
            ref={contentRef}
            id="postBody"
            className={css(styles.postBody) + " rh-post"}
            dangerouslySetInnerHTML={{ __html: postHtml! }}
          />
        )}
      </div>

      <DocumentControls
        handleFullScreen={() => setIsExpanded(!isExpanded)}
        handleZoomIn={handleZoomIn}
        handleZoomOut={handleZoomOut}
        handleZoomSelection={handleZoomSelection}
        currentZoom={isExpanded ? fullScreenSelectedZoom : selectedZoom}
        showExpand={true}
        isExpanded={isExpanded}
        annotationCount={annotationCount}
      />
    </div>
  );
};

const styles = StyleSheet.create({
  main: {
    position: "relative",
  },
  scroll: {
    overflowX: "scroll",
    overflowY: "hidden",
  },
  expandedWrapper: {
    position: "fixed",
    zIndex: 999999,
    top: 0,
    right: 0,
    background: "rgb(230, 230, 230, 1.0)",
    width: "100%",
    height: "100%",
    marginTop: 0,
    overflow: "scroll",
  },
  expandedContent: {
    background: "white",
    margin: "75px auto 0 auto",
  },
  documentViewer: {},
  postBody: {
    padding: 45,
    paddingTop: 25,
    [`@media only screen and (max-width: ${breakpoints.small.str})`]: {
      padding: 15,
    },
  },
  postHeader: {
    marginBottom: 45,
  },
  error: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    alignItems: "center",
    rowGap: "15px",
    justifyContent: "center",
    marginTop: "20%",
  },
});

export default DocumentViewer;