import React from "preact";
import { useState, useEffect } from 'preact/hooks'
import PropTypes from "prop-types";
import { Link as WouterLink } from "wouter-preact";

export function useDarkMode() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = (event) => {
        setIsDarkMode(event.matches);
      };

      mediaQuery.addEventListener("change", handleChange);

      return () => {
        mediaQuery.removeEventListener("change", handleChange);
      };
    }
    return undefined;
  }, []);

  return isDarkMode;
}

export const Link = ({ href, ...rest }) => {
  const LinkComponent = href.includes("://") ? "a" : WouterLink;
  return <LinkComponent href={href} {...rest} />;
};

Link.propTypes = {
  href: PropTypes.string
}
