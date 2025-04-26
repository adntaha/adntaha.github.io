import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";

import "./globals.css";

import About from "./pages/About";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import Resume from "./pages/Resume";
import Contact from "./pages/Contact";
import BlogPost from "./components/BlogPost";
import Posts from "./posts/posts";

const root = document.getElementById("app");

ReactDOM.createRoot(root).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/resume" element={<Resume />} />
      <Route path="/contact" element={<Contact />} />
      {Posts.map((post, index) => (
        <Route
          key={index}
          path={post.route}
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
  </BrowserRouter>
);
