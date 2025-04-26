import React from "react";
import { NavLink, Link } from "react-router";

const clsx = (...args: string[]) =>
  args
    .map((a) => a.trim())
    .filter(Boolean)
    .join(" ");

const MarqueeButton: React.FC<{
  name: string;
  link: string;
}> = ({ name, link }) => {
  const highlighted = link == location.pathname;

  return (
    <Link
      to={highlighted ? "/" : link}
      className={clsx(
        "h-full w-full text-center flex flex-col justify-center",
        highlighted
          ? "bg-stone-400 text-black"
          : "bg-transparent text-white hover:text-black transition-colors duration-150 ease-in-out",
        location.pathname == "/" || highlighted
          ? "hover:bg-stone-400"
          : "hover:bg-stone-500"
      )}
    >
      {name}
    </Link>
  );
};

const Navigation: React.FC = () => {
  return (
    <header className="pt-2.5 px-2.5">
      <div className="overflow-hidden whitespace-nowrap">
        <div className="font-mono animate-marquee inline-grid grid-cols-4 grid-rows-1 gap-2.5 w-full h-15 relative">
          <MarqueeButton name="About" link="/about" />
          <MarqueeButton name="Projects" link="/projects" />
          <MarqueeButton name="Resume" link="/resume" />
          <MarqueeButton name="Contact" link="/contact" />
        </div>
      </div>
    </header>
  );
};

export default Navigation;
