---
title: McGill Course Assistant
featured: 2
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

**The assistant** is retrieval-augmented. A question gets embedded with Cohere Embed, matched against course descriptions stored in Cloudflare Vectorize, reranked with Cohere Rerank, and answered by Command A+ using the courses it found. The backend runs on Cloudflare Workers and D1, with AI Gateway in front of the model to cache repeated questions and rate-limit the rest.

**The graph** draws McGill's prerequisites as a force-directed layout of about 5,800 nodes. Simulating that many nodes naively means every node pushes on every other node, which gets slow fast, so the layout uses a Barnes–Hut quadtree to approximate far-away nodes as groups.

<!-- TODO: the 109× Barnes–Hut speedup is worth stating, once it says what was measured: baseline, which operation, on what machine. -->
