import React from "react";
import PropTypes from 'prop-types';
import Markdown from "react-markdown";
import remarkGfm from 'remark-gfm'
import rehypeMathjax from 'rehype-mathjax/browser'
import remarkMath from 'remark-math'
import { Link } from "react-router";
import { parse } from "fecha";

function parseRelativeDate(date) {
  let today = new Date();
  let yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  switch (parse(date, "MMMM Do YYYY").setHours(0,0,0,0)) {
    case today.setHours(0,0,0,0):
      return "Today";
    case yesterday.setHours(0,0,0,0):
      return "Yesterday";
    default:
      return date;
  }
}

// TODO: image
export const BlogCover = ({ title, date, _image, link }) => {
  return <Link to={link}>
    <div className="flex shrink flex-col m-5 border-stone-800 border-2">
      <div className="h-48 w-72"></div> {/* image */}
      <div className="bg-neutral-500 p-2.5">
      <h1 className="font-bold">{title}</h1>
      <footer>{parseRelativeDate(date)}</footer></div>
    </div>
  </Link>
}

BlogCover.propTypes = {
  title: PropTypes.string,
  date: PropTypes.string,
  _image: PropTypes.string,
  link: PropTypes.string
};

export default function BlogPost({ title, date, image, content }) {
  return <article>
    <h2>{title}</h2>
    <img src={image} />
    <span>{date.toUpperCase()}.</span>
    <Markdown remarkPlugins={[[remarkGfm, {singleTilde: false}], remarkMath]} rehypePlugins={[rehypeMathjax]}>
      {content}
    </Markdown>
  </article>
}

BlogPost.propTypes = {
  title: PropTypes.string,
  date: PropTypes.string,
  image: PropTypes.string,
  content: PropTypes.string
};
