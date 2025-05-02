import clsx from "clsx";
import PropTypes from "prop-types";
import React from "react";
import { Link } from "react-router";

const MarqueeButton = ({ name, link }) => {
  const highlighted = link == location.pathname;

  return (
    <Link
      to={highlighted ? "/" : link}
      className={clsx(
        "flex size-full flex-col justify-center text-center",
        highlighted
          ? "bg-yellow-600 text-black"
          : "border-2 border-stone-800 bg-transparent text-white transition-colors duration-150 ease-in-out hover:text-black",
        location.pathname == "/" || highlighted
          ? "box-border border-x-2 border-t-2 border-stone-800 hover:bg-yellow-600"
          : "hover:bg-yellow-800"
      )}
    >
      {name}
    </Link>
  );
};

MarqueeButton.propTypes = {
  name: PropTypes.string,
  link: PropTypes.string
};

const Navigation = () => {
  return (
    <header>
      <div className="overflow-hidden whitespace-nowrap">
        <div className="relative inline-grid w-full grid-cols-5 grid-rows-1 h-15 gap-2.5 font-mono">
          <MarqueeButton name="About" link="/" />
          <MarqueeButton name="Blog" link="/blog" variable />
          <MarqueeButton name="Projects" link="/projects" />
          <MarqueeButton name="Resume" link="/resume" />
          <MarqueeButton name="Contact" link="/contact" />
        </div>
      </div>
    </header>
  );
};

export default Navigation;
