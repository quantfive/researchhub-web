import { css, StyleSheet } from "aphrodite";
import { NullableString } from "~/config/types/root_types";
import colors from "./lib/colors";
import { filterOpts } from "./lib/options";

type Args = {
  selectedFilterValue: NullableString;
  handleSelect: Function;
  hideOptions?: Array<string|null>
};

const CommentFilters = ({ selectedFilterValue, handleSelect, hideOptions = [] }: Args) => {
  const selectedFilter =
    filterOpts.find((f) => f.value === selectedFilterValue) || filterOpts[0];

  const _filterOpts = filterOpts.filter((f) => !hideOptions.includes(f.value));

  return (
    <div className={css(styles.filtersWrapper)}>
      {_filterOpts.map((f) => {
        return (
          <div key={`filter-${f.value}`}>
            {f.value === selectedFilter.value ? (
              <div
                className={css([styles.filter, styles.filterSelected])}
                key={`filter-${f.value}`}
              >
                {f.label}
              </div>
            ) : (
              <div
                onClick={() => handleSelect(f.value)}
                className={css([styles.filter, styles.filterUnselected])}
                key={`filter-${f.value}`}
              >
                {f.label}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const styles = StyleSheet.create({
  filtersWrapper: {
    display: "flex",
    alignItems: "center",
    columnGap: "8px",
    userSelect: "none",
  },
  filter: {
    borderRadius: "4px",
    padding: "5px 10px",
    cursor: "pointer",
    color: colors.filters.unselected.text,
  },
  filterUnselected: {
    ":hover": {
      background: colors.hover.background,
      transition: "0.3s",
    },
  },
  filterSelected: {
    color: colors.filters.selected.text,
    background: colors.filters.selected.background,
  },
});

export default CommentFilters;
