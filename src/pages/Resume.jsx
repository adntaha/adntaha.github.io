import React from "react";
import Navigation from "../components/Navigation";

export default function About() {
  return (
    <div className="flex h-full flex-1 flex-col bg-black p-2.5 text-white">
      <Navigation />
      <main className="box-border grid grow grid-cols-3 grid-rows-2 gap-2.5 border-x-2 border-stone-800 bg-yellow-600 p-2.5 font-mono">
        <div className="col-span-2 col-start-1 row-span-2 row-start-1 bg-black p-5">
          <div className="col-span-1 col-start-1 row-span-2 row-start-1 bg-black">Big square</div>
          <div className="col-span-1 col-start-2 row-span-1 row-start-1 bg-black">
            Small squares
          </div>
          <div className="col-span-1 col-start-2 row-span-1 row-start-2 bg-black">
            Small squares
          </div>
        </div>
        <footer>Made by Aidan Taha.</footer>
      </main>
    </div>

  );
}
