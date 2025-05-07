import clsx from "clsx";
import PropTypes from "prop-types";
import React from "react";
import { Link } from "react-router";

const MarqueeButton = ({ name, link }) => {
  const highlighted = link === location.pathname;

  return (
    <Link
      to={highlighted ? "/" : link}
      className={clsx(
        "flex size-full flex-row items-center justify-center text-center border-2 border-(--border)",
        highlighted
          ? "text-(--text-inversed) bg-(--foreground) border-b-0"
          : "text-(--text) transition-colors duration-150 ease-in-out hover:text-(--text-inversed) hover:bg-(--foreground-hover)",
      )}
    >
      {name}
      {
        // external
        !link.startsWith("/")
          ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" height={16} width={16} fill="currentColor" className="ml-2 mt-0.5 inline">
              <path d="M228-110q-49.7 0-83.85-34.15Q110-178.3 110-228v-504q0-49.7 34.15-83.85Q178.3-850 228-850h252v118H228v504h504v-252h118v252q0 49.7-34.15 83.85Q781.7-110 732-110H228Zm190-226-82-82 314-314h-74v-118h274v274H732v-74L418-336Z" />
            </svg>
          : null
      }
    </Link>
  );
};

MarqueeButton.propTypes = {
  name: PropTypes.string,
  link: PropTypes.string
};

export default function Navigation() {
  return (
    <header>
      <div className="overflow-hidden whitespace-nowrap">
        <div className="relative inline-grid w-full grid-cols-5 grid-rows-1 h-15 gap-2.5 font-mono">
          <MarqueeButton name="about" link="/" />
          <MarqueeButton name="blog" link="/blog" variable />
          <MarqueeButton name="projects" link="/projects" />
          <MarqueeButton name="resume" link="https://drive.google.com/file/d/1-NLNdKKA595L2ugI_tt8hfYSvcjan2sv/view?usp=sharing" />
          <MarqueeButton name="contact" link="/contact" />
        </div>
      </div>
    </header>
  );
};
