---
title: WeBWrite
featured: 1
period: Oct 2026
summary: Homework where students answer in their own words, and Gemma checks each answer against the teacher's key ideas as they type.
outcome: Best Use of Gemma (Google DeepMind)
stack: Next.js, Prisma and PostgreSQL, Gemma 4 through the Gemini API, Vercel
thumb: /media/webwrite/poster.jpg
asset:
  type: video
  loop: true
  src: /media/webwrite/demo.mp4
  poster: /media/webwrite/poster.jpg
  alt: Screen recording at double speed of a student answering "Name the three Estates of pre-revolutionary France". Gemma flags part of the answer as inaccurate, gives a hint, and marks the question complete once it's fixed.
  caption: A student revising an answer while Gemma checks it, at double speed. (Cut from our [demo video](https://www.youtube.com/watch?v=UfIw0Nt5TuM).)
links:
  - label: Try it
    url: https://www.webwrite.tech
  - label: Code
    url: https://github.com/Dutu2019/webwrite
  - label: Submission
    url: https://www.mlh.com/events/hacktoberfest-hack-day-montreal-x-ageei/submissions/01a12335-f91e-8a37-1f9d-5806954da7fa
---

Homework tools like WeBWorK can easily grade an expression because it's either right or wrong. An explanation is harder: there are a dozen ways to say the right thing, and a dozen more to 'almost' say it. Our project, WeBWrite, solved this problem: it let teachers ask questions that need an answer in words, while providing the key ideas that a good answer should contain.

As the student types, Gemma reads the answer and marks each key idea as 'missing', 'getting there', or 'included', and shows the a hint for anything still missing (available to the student after 3 false tries). That way, we can grade essays fairly, since a unpredicted but defensible position shouldn't be as marked wrong. And multiple-choice questions are, of course, marked exactly.

All of a question's key ideas, plus a check for anything factually wrong, are judged in an HTTP request that takes about a second, so the feedback keeps up with the typing. 

The interface is in Québec French by default, with English a toggle away. As part of the team, I handled the our integration with Gemma. We built it at Hacktoberfest Hack Day Montréal, where it won the Best Use of Gemma prize from Google DeepMind.
