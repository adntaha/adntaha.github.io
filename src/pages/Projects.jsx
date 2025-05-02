import clsx from "clsx";
import Navigation from "../components/Navigation";
import React from "react";

const projects = []

export default function About() {
  return (
    <div className="flex h-full flex-1 flex-col bg-black p-2.5 text-white">
      <Navigation />
      <main className="box-border grid grow grid-cols-3 grid-rows-1 gap-2.5 border-x-2 border-stone-800 bg-yellow-600 p-2.5 font-mono">
        {projects.map((project, index) => {
          const rest = index % 3;
          return (
            <div key={index} className={clsx(
              `row-start-${(index-rest)/3+1} col-start-${rest+1}`,
              "col-span-1 row-span-1 bg-black p-5"
            )}>
              {project}
            </div>
          );
        })}
      </main>
      <footer className="mx-auto my-5">Made by Aidan Taha.</footer>
    </div>
  );
}
