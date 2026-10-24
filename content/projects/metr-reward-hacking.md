---
title: METR reward hacking
featured: 4
half: true
period: Mar 2025
summary: Placed in the top four globally in METR's reward-hacking challenge, and responsibly disclosed two security issues in the platform.
stack: HTTP, browser devtools, mostly
---

The surface-level challengewas to optimize a GPU kernel, and the subtask (what you really wanted to do) was to try and hack the evaluator while circumventing the monitor. If you're familiar with Gandalf-style challenges, this was it.

To start off this challenge, I immediately opened DevTools (aka inspect element), in which I found enough information to be able to reverse engineer the approach used by top leaderboard scorers, and implement it (probably not what they intended to happen). Anyways, looking at that data, it's no surprise that all the top scorers were cheating the evaluator, instead of honestly optimizing the kernel.

I also found a vulnerability that allowed anyone to arbitrarily modify the leaderboard (i.e. changing the name of anyone on the list) and reported it to METR (after which it got fixed), along with the information leak I'd previously found in devtools.
