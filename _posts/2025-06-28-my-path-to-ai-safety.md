---
title: "My Path to AI Safety"
excerpt: "How a frustrating school project with medical AI and a leaked language model led me to discover AI safety, and why I think you should care too."
date: 2025-06-28T15:52:20-04:00
categories:
  - Blog
tags:
  - AI Safety
---

Hi there. I'm Aidan. If you've landed on this blog, then I can safely assume that AI interests you.

In March of 2023, if you don't know, [Meta's Llama model was leaked online](https://www.theverge.com/2023/3/8/23629362/meta-ai-language-model-llama-leak-online-misuse). Whether or not it's a good thing was a hot debate in various internet circles back then, one I didn't have the knowledge to participate in. All I knew was that, thanks to [LLaMA.cpp](https://github.com/ggml-org/llama.cpp), I had the ability to run it on my computer, and that it would enthusiastically respond to queries asking for the know-how on creating certain molecules and other instructions that would be very bad should they fall into the wrong hands. It was too easy. The risk that these raw, non-safeguarded models can pose is, legitimately, unreal. That being said, Meta's decisions to release the models–with safeguards in place, this time–feels to me like the only right move[^1].

I started looking at AI as a field at the start of a school year, when I had been tasked to find a topic for and get started on a year-long project. That's when I ran into the [FracAtlas dataset](https://www.nature.com/articles/s41597-023-02432-4), published on Nature[^2]. This project ended up actually being quite painful, because as it turns out, AI models are spread between a lot of libraries. On top of that, I had to figure out why the models' predictions were terrible[^3], and as any programmer can tell you, debugging complex programs without a debugger is a painful experience.

A lot of articles helped[^4], but there's one thing that I could not figure out: loss functions. Seriously, I didn't know which one to choose, nevermind the logic behind which models work better than others. Since these models took hours to train, and my [free Colab instance](https://research.google.com/colaboratory/faq.html#free-to-use) didn't like it when I left it to run overnight, I eventually settled with what I had and decided to optimize for other factors[^5]. The experience, forgive my language, it sucked. It did not feel like the technology of the future that media portrays AI to be.

This frustration with AI black boxes, that the loss was this unknown function that was minimized to try to improve the AI model yet resulted in terrible performance, made me start thinking about bigger questions. If I couldn't understand my (relatively) simple fracture detection model, how could anyone understand the AI systems making real-world decisions? Or ChatGPT with its multi-hundred-billion parameters? This rabbit hole eventually brought me to 80,000 Hours, a non-profit with the goal of identifying the world's "most pressing problems" and helping people find careers that work towards solutions to them. So what's the most pressing problem? At the time of writing, they say it's power-seeking AI systems. If we use AI to make huge decisions without knowing without any doubt what it's doing, it could misguide us and lead to catastrophic things. Humanity-ending level things. So how do we avoid this problem? Through AI safety research. Not only does 80,000 Hours classify it as the most pressing problem, but the technical side of this field aligns with my interests.

That's it. I've found what I want to spend my career towards.[^6] My next goals are an undergrad diploma, master's and a job at an AI lab if not a doctorate. But that's a very long term plan. For now, I've got my sights set on IJCAI 2025. It's an incredible opportunity for me to meet people in the field, to hold interesting discussions, and to learn. As a world-class conference, it's equally good of a place to give people, my peers, others, what I wish I had: a centralized place to learn about AI safety without needing to invest months into it. Explanations of and insights into cutting-edge research, written in a way I can understand. As someone who's felt the frustration of AI's black boxes firsthand, I want to help others understand these systems before they become even more powerful.

[^1]: This is the subject of another debate, which is ongoing, even today. As a society, we need to figure this out sooner rather than later because super-intelligent AIs are gonna arrive at some point and we need to have it figured out before then.
[^2]: I later found out that Nature is actually a pretty prestigious publication, which only motivated me to get started on this topic even more.
[^3]: I mean it. The model accuracy I ended up with was around 55%.
[^4]: I don't quite remember which articles I read, but kudos to all the authors on Medium explaining the various pieces in AI.
[^5]: I ended up going with YOLOv8s to allow the model to be ran on a phone. This was enough for the scope of the project.
[^6]: Statistically speaking, there's a good chance that I change my mind at some point, but there's no way to know the future, so I'm going to assume that I'm always going to be interested in AI safety and its problems.
