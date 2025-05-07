import React from "react";
import { Link } from "react-router";
import Layout from "../components/Layout";
import { BlogCover } from "../components/BlogPost";
import Posts from "../posts/posts";
import { parse } from "fecha";

export default function About() {
  return (
    <Layout className="grid grid-cols-3 grid-rows-2">
      <div className="col-span-2 col-start-1 row-span-2 row-start-1 bg-(--background) p-5">
        <h1 className="my-auto text-4xl mb-2">
          hi. i&apos;m aidan.
        </h1>
        I enjoy tinkering with <Link to="/projects">things</Link>.<br/><br/>
        I&apos;m currently working on:
        <ul className="list-inside list-disc">
          <li className="after:content-[';'] last:after:content-['.']">making people passionate about computers</li>
          <li className="after:content-[';'] last:after:content-['.']">this portfolio</li>
          <li className="after:content-[';'] last:after:content-['.']">
            {/* <img className="inline w-6 h-6 -mt-1 bg-white rounded-md p-0.5" src="/assets/images/task_kitchen_dark.png" /> */}
            <img className="inline w-6 h-6 -mt-1 rounded-md" src="/assets/images/task_kitchen_light.png" />
            {" "}
            <Link to="https://task.kitchen">Task Kitchen</Link>
          </li>
        </ul>
      </div>
      <div className="col-span-1 col-start-3 row-span-2 row-start-1 flex flex-col bg-(--foreground)">
        {
          Posts
            .sort((a, b) => parse(b.date, "MMMM Do YYYY") - parse(a.date, "MMMM Do YYYY"))
            .slice(0, 2)
            .map((post, index) => <BlogCover key={index} title={post.title} date={post.date} link={"/blog/" + post.route} />)
        }
      </div>
    </Layout>
  );
}
