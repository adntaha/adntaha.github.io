import React from "react";
import { Link } from "react-router";
import Navigation from "../components/Navigation";
import { BlogCover } from "../components/BlogPost";
import Posts from "../posts/posts";
import { parse } from "fecha";

export default function About() {
  console.log(Posts
    .sort((a, b) => parse(b.date, "MMMM Do YYYY") - parse(a.date, "MMMM Do YYYY")).slice(0,2)
  )
  return (
    <div className="p-2.5 bg-black h-full text-white flex flex-col flex-1">
      <Navigation />
      <main className="grid grid-cols-3 grid-rows-2 gap-2.5 p-2.5 border-x-2 box-border border-stone-800 font-mono bg-yellow-600 grow">
        <div className="bg-black row-start-1 col-start-1 col-span-2 row-span-2 p-5">
          <h1 className="my-auto text-4xl">
            Hi. I&apos;m Aidan.
          </h1>
          I enjoy tinkering with <Link to="/projects">things</Link>.<br/><br/>
          I&apos;m currently working on:
          <ul className="list-disc list-inside">
            <li className="after:content-[';'] last:after:content-['.']">making people passionate about computers</li>
            <li className="after:content-[';'] last:after:content-['.']">this portfolio</li>
            <li className="after:content-[';'] last:after:content-['.']"><img className="inline" src="/images/task_kitchen_dark.svg" /> <Link to="https://task.kitchen">Task Kitchen</Link></li>
          </ul>
        </div>
        <div className="bg-black row-start-1 col-start-3 col-span-1 row-span-2 flex flex-col">
          {
            Posts
              .sort((a, b) => parse(b.date, "MMMM Do YYYY") - parse(a.date, "MMMM Do YYYY"))
              .slice(0, 2)
              .map((post, index) => <BlogCover key={index} title={post.title} date={post.date} link={"/" + post.route} />)
          }
          {/* <BlogCover title="Beep" date="Today" link="/contact" />
          <Link to="/projects" className="w-60 h-60 flex flex-col justify-center text-center">More</Link> */}
        </div>
      </main>
      <footer className="mx-auto my-5">Made by me!</footer>
    </div>

  );
}
