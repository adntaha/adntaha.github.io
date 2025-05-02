import React from "react";
import Navigation from "../components/Navigation";

export default function Blog() {
  return (
    <div className="p-2.5 bg-black h-full text-white flex flex-col flex-1">
      <Navigation />
      <main className="grid grid-cols-3 grid-rows-2 gap-2.5 p-2.5 border-x-2 box-border border-stone-800 font-mono bg-yellow-600 grow">
        <div className="bg-black row-start-1 col-start-1 col-span-2 row-span-2 p-5">
          <div className="bg-black row-start-1 col-start-1 col-span-1 row-span-2">Big square</div>
          <div className="bg-black row-start-1 col-start-2 col-span-1 row-span-1">
            Small squares
          </div>
          <div className="bg-black row-start-2 col-start-2 col-span-1 row-span-1">
            Small squares
          </div>
        </div>
        <footer>Made by Aidan Taha.</footer>
      </main>
    </div>

  );
}
