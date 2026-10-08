---
title: Cortesol
featured: 1
period: "2026"
summary: Critical thinking over a knowledge graph. A memory for research agents that can change its mind, and show why.
outcome: Hack the 6ix finalist
team: Kuan Yi Wang, Bill Xu, David Liang, and me
role: null # TODO: what did you build on Cortesol? One or two sentences, in your words.
asset:
  type: image
  src: /media/cortesol/demo.jpg
  alt: The Cortesol belief graph, with claims coloured by confidence from refuted to established.
links:
  - label: Live demo
    url: https://cortesol.onrender.com/
  - label: Code
    url: https://github.com/billxby/Cortesol
  - label: Devpost
    url: https://devpost.com/software/cortesol
---

Research agents read a lot, and not all of it is true. A paper gets retracted, a benchmark turns out to be contaminated, two sources disagree. If an agent's memory is just a pile of notes, it has no good way to notice that something it "knows" has lost its footing.

Cortesol stores what an agent believes as a graph of claims, each one tied to the evidence for and against it. When new evidence arrives, confidence in a claim moves in controlled steps, and every update is recorded, so you can look back and see exactly why the agent believes what it believes.

The key design choice is a split of responsibilities. The language model never edits the graph directly: it *proposes* structured changes, and a validation step and a separate belief engine decide what actually gets applied. The model does the reading; the bookkeeping stays inspectable.

<!-- TODO: add your own contribution and anything that broke along the way. The screenshot on top is the live demo's belief graph view, taken by Claude; swap in a better one if you have it. -->
