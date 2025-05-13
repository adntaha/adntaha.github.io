import React from "preact";
import Navigation from "./Navigation";
import PropTypes from "prop-types";
import clsx from "clsx";

export default function Layout(props) {
  return (
    <div className="relative flex min-h-screen flex-1 flex-col bg-(--background) p-2.5 text-(--text)">
      <Navigation />
      <main className={clsx("grow gap-2.5 bg-(--foreground) p-2.5 font-mono", props.className)}>
        {props.children}
      </main>
      <footer className="mx-auto mt-2.5">Made by Aidan Taha.</footer>
    </div>
  );
}

Layout.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string
};
