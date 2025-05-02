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

export const BlogCover = ({ title, date, _image, link }) => {
  return <Link to={link}>
    <div className="flex flex-col shrink p-5">
      <div className="h-48 w-72"></div> {/* image */}
      <div className="bg-neutral-500 p-2.5">
      <h3 className="font-bold">{title}</h3>
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

const BlogPost = ({ title, date, image, content }) => {
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

export default BlogPost;
