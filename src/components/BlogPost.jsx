import React from "preact";
import PropTypes from "prop-types";
import Markdown from "preact-markdown";
import remarkGfm from "remark-gfm"
import rehypeMathjax from "rehype-mathjax/browser"
import remarkMath from "remark-math"
import { parse } from "fecha";
import { Link } from "../utils";
import Layout from "./Layout";
import Posts from "../posts/posts";

function parseDate(date) {
  return parse(date, "MMMM Do YYYY").setHours(0,0,0,0);
}

function parseRelativeDate(date) {
  let today = new Date();
  let yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  switch (parseDate(date)) {
    case today.setHours(0,0,0,0):
      return "Today";
    case yesterday.setHours(0,0,0,0):
      return "Yesterday";
    default:
      return date;
  }
}

// TODO: image
export const BlogCover = ({ title, date, image, link }) => {
  return <Link href={link}>
    <figure className="flex shrink flex-col m-5 border-(--border-inversed) border-2">
      <div className="my-auto h-64 w-full bg-(--background)">
        <img src={image} alt={title} />
      </div>
      <figcaption className="bg-(--accent) text-(--text-inversed) p-2.5">
        <h3 className="font-bold w-full">{title}</h3>
        <time dateTime={parseDate(date)}>{parseRelativeDate(date)}</time>
      </figcaption>
    </figure>
  </Link>
}

BlogCover.propTypes = {
  title: PropTypes.string,
  date: PropTypes.string,
  image: PropTypes.string,
  link: PropTypes.string
};

export default function BlogPost({ params: { route } }) {
  // eslint-disable-next-line no-unused-vars
  const { title, date, image, content } = Posts.find((post) => post.route === route);

  return (
    <Layout className="h-fit">
      <div className="m-10 p-5 max-w-[768px] mx-auto bg-(--background) h-full">
        <article>
          <h2 className="text-4xl mb-2">{title}</h2>
          {/* <img src={image} className="float-right" /> */}
          <time dateTime={parseDate(date)}>{date.toUpperCase()}</time>.<br/>
          <hr className="my-2.5" />
          <Markdown markdown={content} remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeMathjax]} />
        </article>
      </div>
    </Layout>
  );
}

BlogPost.propTypes = {
  params: {
    route: PropTypes.string
  }
};
