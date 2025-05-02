import React from "react";
import { Link } from "react-router";
import { parse } from "fecha";

import Navigation from "../components/Navigation";
import Posts from "../posts/posts";

export default function Blog() {
  return (
    <div className="relative flex min-h-full flex-1 flex-col bg-black p-2.5 text-white">
      <Navigation />
      <main className="relative box-border grid grow grid-cols-3 grid-rows-2 gap-2.5 border-x-2 border-stone-800 bg-yellow-600 p-2.5 font-mono">
        <ul className="col-span-3 col-start-1 row-span-3 row-start-1 flex flex-col gap-2.5 bg-black p-5">
          {
            Posts
              .sort((a, b) => parse(b.date, "MMMM Do YYYY") - parse(a.date, "MMMM Do YYYY"))
              .map((post, index) => (
                <li key={index}>
                  <Link to={"/blog/" + post.route} className="flex flex-row justify-between border-2 border-stone-800 p-2.5">
                    <h3 className="font-semibold">
                      {post.title}
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" height="16" width="16" fill="white" className="-mt-0.5 ml-2 inline">
                        <path d="M228-110q-49.7 0-83.85-34.15Q110-178.3 110-228v-504q0-49.7 34.15-83.85Q178.3-850 228-850h252v118H228v504h504v-252h118v252q0 49.7-34.15 83.85Q781.7-110 732-110H228Zm190-226-82-82 314-314h-74v-118h274v274H732v-74L418-336Z" />
                      </svg>
                    </h3>
                    <span>{post.date}</span>
                  </Link>
                </li>
              ))
          }
        </ul>
      </main>
      <footer className="mx-auto my-5">Made by me!</footer>
    </div>

  );
}
