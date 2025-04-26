import React from "react";
import Markdown from "react-markdown";
import remarkGfm from 'remark-gfm'
import rehypeMathjax from 'rehype-mathjax/browser'
import remarkMath from 'remark-math'


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

export default BlogPost;
