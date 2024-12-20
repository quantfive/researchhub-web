import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGraduationCap } from "@fortawesome/pro-solid-svg-icons";
import { css, StyleSheet } from "aphrodite";
import PropTypes from "prop-types";
import numeral from "numeral";
import { isEmpty } from "~/config/utils/nullchecks";
import { useRouter } from "next/router";

import get from "lodash/get";
import { createUserSummary } from "~/config/utils/user";
import AuthorAvatar from "~/components/AuthorAvatar";
import colors, { genericCardColors } from "~/config/themes/colors";
import { breakpoints } from "~/config/themes/screen";

import Link from "next/link";

const UserCard = ({ authorProfile, reputation, styleVariation }) => {
  const getName = (authorProfile) =>
    `${get(authorProfile, "first_name", "")} ${get(
      authorProfile,
      "last_name",
      ""
    )}`;

  const userSummary = createUserSummary(authorProfile);

  return (
    <Link
      key={`person-${authorProfile.id}`}
      href={`/author/${authorProfile.id}`}
      className={css(styles.card, styleVariation && styles[styleVariation])}
    >
      <div className={css(styles.detailsWrapper)}>
        <AuthorAvatar
          author={authorProfile}
          name={name}
          disableLink={true}
          size={35}
        />
        <div className={css(styles.details)}>
          <h2
            className={css(
              styles.name,
              isEmpty(userSummary) && styles.withoutSummary
            )}
          >
            {getName(authorProfile)}
          </h2>
          {userSummary && (
            <div className={css(styles.summary)}>
              <span className={css(styles.eduIcon)}>
                {<FontAwesomeIcon icon={faGraduationCap}></FontAwesomeIcon>}
              </span>
              {userSummary}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

const styles = StyleSheet.create({
  card: {
    border: `1px solid ${genericCardColors.BORDER}`,
    display: "flex",
    padding: 15,
    marginBottom: 10,
    cursor: "pointer",
    background: "white",
    borderRadius: 2,
    textDecoration: "none",
    ":hover": {
      backgroundColor: genericCardColors.BACKGROUND,
    },
    [`@media only screen and (max-width: ${breakpoints.small.str})`]: {
      display: "block",
    },
  },
  noBorderVariation: {
    border: 0,
    borderBottom: `1px solid ${genericCardColors.BORDER}`,
    marginBottom: 0,
    marginTop: 0,
    ":last-child": {
      borderBottom: 0,
    },
  },
  detailsWrapper: {
    textDecoration: "none",
    color: colors.BLACK(),
    display: "flex",
    flexDirection: "row",
  },
  details: {
    display: "flex",
    flexDirection: "column",
    marginLeft: 15,
    justifyContent: "center",
  },
  name: {
    fontSize: 20,
    color: colors.BLACK(),
    fontWeight: 500,
    marginBottom: 10,
    [`@media only screen and (max-width: ${breakpoints.small.str})`]: {
      fontSize: 16,
    },
  },
  withoutSummary: {
    marginTop: 8,
    [`@media only screen and (max-width: ${breakpoints.small.str})`]: {
      marginTop: 8,
    },
  },
  eduIcon: {
    color: colors.GREY(),
    marginRight: 5,
  },
  summary: {
    color: colors.BLACK(0.6),
    lineHeight: "22px",
    fontSize: 14,
    display: "flex",
    marginRight: 25,
    [`@media only screen and (max-width: ${breakpoints.small.str})`]: {
      fontSize: 13,
      lineHeight: "18px",
      marginRight: 0,
    },
  },
  lifetimeText: {
    display: "none",
    [`@media only screen and (max-width: ${breakpoints.small.str})`]: {
      display: "block",
    },
  },
  reputation: {
    fontWeight: 500,
    marginLeft: "auto",
    display: "flex",
    alignItems: "center",
    color: colors.BLACK(0.9),
    [`@media only screen and (max-width: ${breakpoints.small.str})`]: {
      fontSize: 13,
      marginLeft: 45,
      marginTop: 5,
    },
  },
  logoIcon: {
    width: 13,
    height: 20,
    marginRight: 5,
    marginTop: -3,
    [`@media only screen and (max-width: ${breakpoints.small.str})`]: {
      width: 10,
      height: 16,
      marginRight: 10,
      verticalAlign: -2,
    },
  },
});

UserCard.propTypes = {
  authorProfile: PropTypes.object,
  reputation: PropTypes.number.isRequired,
  styleVariation: PropTypes.string,
};

export default UserCard;
