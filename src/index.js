import React, { render } from "preact";
import { Switch, Route } from "wouter-preact";

import "./globals.css";

import About from "./pages/About";
import Blog from "./pages/Blog";
import Projects from "./pages/Projects";
import Resume from "./pages/Resume";
import Contact from "./pages/Contact";
import BlogPost from "./components/BlogPost";

render(
  <Switch>
    <Route path="/" component={About} />
    <Route path="/blog" component={Blog} />
    <Route path="/projects" component={Projects} />
    <Route path="/resume" component={Resume} />
    <Route path="/contact" component={Contact} />
    <Route path="/blog/:route" component={BlogPost} />
  </Switch>,
  document.getElementById("app")
);
