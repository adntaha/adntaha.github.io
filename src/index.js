import React, { render } from 'preact';
import { BrowserRouter, Routes, Route } from "react-router";

import "./globals.css";

import About from "./pages/About";
import Blog from "./pages/Blog";
import Projects from "./pages/Projects";
import Resume from "./pages/Resume";
import Contact from "./pages/Contact";
import BlogPost from "./components/BlogPost";
import Posts from "./posts/posts";

render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<About />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/resume" element={<Resume />} />
      <Route path="/contact" element={<Contact />} />
      {Posts.map((post, index) => (
        <Route
          key={index}
          path={"/blog/" + post.route}
          element={
            <BlogPost
              title={post.title}
              date={post.date}
              image={post.image}
              content={post.content}
            />
          }
        />
      ))}
    </Routes>
  </BrowserRouter>,
  document.getElementById("app")
);
