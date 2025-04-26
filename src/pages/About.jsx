import Navigation from "../components/Navigation";

export default function About() {
  return (
    <>
      <Navigation />
      <main className="p-2.5 font-mono h-full bg-stone-400">
        <div className="grid grid-cols-2 grid-rows-2 gap-2.5 m-2.5 h-full overflow-hidden">
          <div className="h-[100%] bg-black row-start-1 col-start-1 col-span-1 row-span-2">Big square</div>
          <div className="h-[50%] bg-black row-start-1 col-start-2 col-span-1 row-span-1">
            Small squares
          </div>
          <div className="h-[50%] bg-black row-start-2 col-start-2 col-span-1 row-span-1">
            Small squares
          </div>
        </div>
        <footer>Made by Aidan Taha.</footer>
      </main>
    </>
  );
}
