import PropTypes from "prop-types";
import React from "react";
import { Link } from "react-router";

const clsx = (...args) =>
  args
    .map((a) => a.trim())
    .filter(Boolean)
    .join(" ");

const MarqueeButton = ({ name, link }) => {
  const highlighted = link == location.pathname;

  return (
    <Link
      to={highlighted ? "/" : link}
      className={clsx(
        "h-full w-full text-center flex flex-col justify-center",
        highlighted
          ? "bg-yellow-600 text-black"
          : "bg-transparent text-white hover:text-black transition-colors duration-150 ease-in-out border-2 border-stone-800",
        location.pathname == "/" || highlighted
          ? "hover:bg-yellow-600 border-t-2 border-x-2 border-stone-800 box-border"
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
        <div className="font-mono animate-marquee inline-grid grid-cols-5 grid-rows-1 gap-2.5 w-full h-15 relative">
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
