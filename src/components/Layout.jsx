import React from "react";
import Navigation from "./Navigation";
import PropTypes from "prop-types";
import clsx from "clsx";

export default function Layout(props) {
  return (
    <div className="relative flex h-full flex-1 flex-col bg-black p-2.5 text-white">
      <Navigation />
      <main className={clsx("box-border grow gap-2.5 border-x-2 border-stone-800 bg-yellow-600 p-2.5 font-mono", props.className)}>
        {props.children}
      </main>
      <footer className="mx-auto my-5">Made by Aidan Taha.</footer>
    </div>
  );
}

Layout.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string
};
