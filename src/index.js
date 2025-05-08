import React, { render } from "preact";
import { Switch, Route, Router } from "wouter-preact";
import { useHashLocation } from "wouter-preact/use-hash-location"

import "./globals.css";

import About from "./pages/About";
import Blog from "./pages/Blog";
import Projects from "./pages/Projects";
import Resume from "./pages/Resume";
import Contact from "./pages/Contact";
import BlogPost from "./components/BlogPost";

render(
  <Router hook={useHashLocation}>
    <Switch>
      <Route path="/" component={About} />
      <Route path="/blog" component={Blog} />
      <Route path="/projects" component={Projects} />
      <Route path="/resume" component={Resume} />
      <Route path="/contact" component={Contact} />
      <Route path="/blog/:route" component={BlogPost} />
    </Switch>
  </Router>,
  document.getElementById("app")
);
