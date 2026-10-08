---
title: Cortesol
featured: 1
period: "2026"
summary: Critical thinking over a knowledge graph. A memory for research agents that can change its mind, and show why.
outcome: Hack the 6ix finalist
team: Kuan Yi Wang, Bill Xu, David Liang, and me
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

Cortesol stores what an agent believes as a graph of claims, each one tied to the evidence for and against it, as a number. When new evidence arrives, this number (claim confidence) moves in discrete steps, and every update is recorded, so you can look back and see exactly why the agent believes what it believes.

The key design choice is a split of responsibilities. The language model never edits the graph directly: it *proposes* structured changes, which are validated before anything is applied. And when the model reads a piece of evidence, all it gets to say is whether it supports or contradicts a claim, and whether it's weak, moderate or strong. The actual change in confidence is computed by a small, deterministic engine, with no model in the loop:

- the model's label sets the *most* a single report could move a claim, and every step after this can only shrink it;
- each source has a trust cap, so a sensational report from a weak source barely moves anything;
- repeated reports from the same group count for less and less, so echoes don't pass for independent replication;
- red flags like possible fraud or a missing control shrink a report's weight toward zero;
- and no single report can move a claim past a hard limit.

Confidence is stored as log-odds, so each update is a simple addition (Bayes' rule in log form). Every step of that arithmetic is shown in the app's reasoning log, so you can open any update and see exactly why a claim moved as much as it did.

My part was the assistant that works with the graph, which calls the model with the right tools and shows its thinking traces in the interface, and a lot of the frontend.

<!-- TODO: the engine paragraphs and the "My part" sentence are Claude's draft. Approve or rewrite. -->
