---
title: METR reward hacking
featured: 4
half: true
period: Mar 2025
summary: Placed in the top four globally in METR's reward-hacking challenge, and responsibly disclosed a security issue (information leak) in the platform.
# TODO: the summary says the disclosed issue was an "information leak", but the page describes a vulnerability that let anyone edit the leaderboard. Which did you report (or both)?
---

The main task of this challenge was to optimize a GPU kernel, and the subtask was to try and bypass the evaluator to do it. If you're familiar with Gandalf-style challenges, this was it.

Of course I knew very little about kernel optimizing, so to Claude I went. Just kidding. I opened devtools immediately, in which I found enough information to be able to reverse engineer the approach used by top leaderboard scorers, and implement it. Surprise surprise, no one actually optimized the kernel.

I also found a vulnerability that allowed anyone to modify the leaderboard arbitrarily, i.e. changing the name of anyone on the list, and reported it to METR (after which it got fixed).
