---
title: McGill Course Assistant
featured: 3
half: true
period: May 2026 – now
summary: Ask questions about McGill courses in plain language, and explore every prerequisite as one big interactive graph.
stack: Cohere (Embed, Rerank, Command A+), Cloudflare Workers, Vectorize, D1 and AI Gateway, plain HTML/CSS/JS on GitHub Pages
asset:
  type: image
  src: /media/course-assistant/graph.jpg
  alt: The McGill prerequisite graph zoomed out, thousands of course nodes over the coloured cells of the Barnes–Hut quadtree.
links:
  - label: Try it
    url: https://adntaha.github.io/course-assistant/
  - label: Code
    url: https://github.com/adntaha/course-assistant
---

Two tools that answer the same question from different directions: *what should I take, and what do I need first?*

**The assistant** is retrieval-augmented. A question gets embedded with Cohere Embed, matched against course descriptions stored in Cloudflare Vectorize. Then, on query, it cheaply gets the ~10 nearest elements in vector space (using cosine distance), then uses Cohere Rerank to find the most relevant out of them. These courses are then passed to Command A+, which answers the original query. The backend runs on Cloudflare Workers and D1, with AI Gateway in front of the model to cache repeated questions and rate-limit the rest.

**The graph** draws McGill's prerequisites as a force-directed layout of about 5,800 nodes. The first version was painfully slow, even on a fairly powerful laptop: every node pushes on every other node, so the work grows with the square of the number of courses. A Barnes–Hut quadtree, which treats far-away clusters of nodes as a single estimated mass, made the simulation 109× faster. After also sorting out some memory and animation problems, it became properly snappy, and it works on phones too, with touch controls.

The graph uses no libraries: the simulation, the quadtree, the rendering and the controls are all written from scratch. (Some of the assistant's tools were written with AI help.)

<!-- TODO: the graph paragraphs above are Claude's draft from your notes, now with the 109× figure. Approve or rewrite. -->
