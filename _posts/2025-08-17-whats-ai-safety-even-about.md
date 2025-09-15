---
title: "What's AI Safety even about?"
excerpt: "Where did this field even come from? Why are we worrying about the safety of the things that will replace us? Well, that's not what most AI Safety researchers do, they worry about something else."
date: 2025-08-17T19:43:13-04:00
categories:
  - Decoding AI
tags:
  - AI Safety
  - LLMs
  - Medical AI
---

If you pay attention, alongside big AI labs like DeepMind or OpenAI's [releases on the performance of their models on the IMO](https://www.nature.com/articles/d41586-025-02343-x), you'll notice that they'll talk about things like making their AIs 'safe', 'interpretable' or even 'trustworthy' in their blog posts. Or at least that was my case.

And then you tend to wonder, what does this even mean? How do you go about trusting a machine? And with those questions, you've entered the field of AI safety.

The issue is that, as AI models get more advanced, people tend to give them more and more responsibility. And it's a problem because, no matter who you ask, they'll tell you that we don't *really* understand them.

---

Throughout my research, I've found that academics and industry refer to individual AIs as "an AI model", or just "this model", because they use AI to refer to the whole field. This is a reference to models in the field of statistics, which are basically really fancy equations, and AIs, in a certain sense, can also be seen as really big and fancy equations.

---

Before getting to the first major problem in AI safety, we have to understand what an AI model actually is.

Artificial Intelligence as a word was invented by John McCarthy at what became the first AI conference. It describes, in so little words, a smart computer. Among the different ways we've tried to make computers smart is through copying brains. Brains are blobs of inter-connected neurons, and each neuron can receive an electrical signal and emit electrical signals to other neurons. But not all signals are equal: some of them are stronger than others[^1]. Neurons can also change their connections, so which neurons they're connected to, and that's how we learn information.

So in the 1900s, we created a virtual neuron and called it a Perceptron. It's called that because they were trying to recognize, *perceive*, what was on a picture, which was basically impossible for computers to do at the time. Each perceptron has two different knobs, but I'll avoid going into detail because it's not useful for this exercise.

We can understand modern AI models as a collection of millions, billions or even trillions of Perceptrons. That's a lot of dials. To train them, we give them huge amounts of information, huge amounts of books and almost the entire internet for models like ChatGPT or Gemini, and let them turn all the knobs a little bit each time, until we're satisfied with them. We do this because it's impossible for a team of humans to turn these nobs themselves. If we were able to tweak 3 knobs per second, that would take ~2000[^2] years for a model like GPT-3, just to turn each dial once. As of now, it's impossible for us to understand what each knob does, since we're not the ones who tweaked them, and because there's an incredible amount of them. That's the first problem of AI safety: we're unable to *interpret* what each knob does, how it influences the rest of the knobs (since they're interconnected!), so we have no clue how the model works.

The second problem comes from how we train it. Humans are imperfect, and as time passed we got rid of more and more of our stereotypes and prejudice. But since we're trying to give AI models more and more content to train on, we end up training on some bad stuff which I won't get into the details of here. You've probably seen what's on the Internet, you know what I'm talking about. Another example is that there are a lot more white faces on the Internet then those of minorities such as black women, which means that face recognition models (much much much smaller than ChatGPT[^3]) are much more accurate on white males than on darker-faced women[^4]. That's the second problem of AI safety, which is called algorithmic bias.

The third and fourth problems in AI safety are simpler to understand. Imagine if you had a new job as a cleaner, and your manager taught you to clean by showing you how to mop the floor or wash a shirt, with water, soap, etc. And then a customer comes in and asks you to clean their computer, which you do by washing it under the sink, and you end up breaking it because electronics aren't supposed to touch water. The thing that the manager did wrong was not telling you how to clean laptops, and the thing you did wrong is that you washed the laptop instead of cleaning it, which would've been to open it and blow air inside it to remove the dust. We call the former "out of distribution errors" or "robustness failure", because you weren't taught how to clean that specific thing because your manager wasn't robust with your training. Sorry if it's weird, academics are known for the confusing names they give things. The latter is called "goal misgeneralisation", where the customer told you their goal but you didn't understand it correctly.

That's basically the gist of it. And to answer the question I asked at the start, AI safety is about making sure that we can trust AI models in sensitive scenarios, like in hospitals for example, while being sure that if something goes wrong, it won't mess everything up.

[^1]: Neurons can emit electrical signals from -40 to -90 millivolts ([Purves, Augustine, Fitzpatrick, et al. 2001]). It's negative because the inside of the neuron is more negatively charged than the outside.
[^2]: GPT-3 has approximately 175 trillion parameters (or nobs), divided by 3 knobs per second, is around 60 trillion seconds, or around 2000 years.
[^3]: Just to name an example, FaceNet, which is on the bigger side, has 140 million parameters ([LearnOpenCV, Durai 2023]). That's 1,000x less than GPT-3!
[^4]: According to a study published in 2018 by MIT and Microsoft researchers, the error rate on darker-skinned women is 34.7% as compared to 0.8% on light-skinned men ([Buolamwini and Gebru 2018]), which is a huge difference in accuracy.

[Buolamwini and Gebru 2018]: https://proceedings.mlr.press/v81/buolamwini18a/buolamwini18a.pdf
[Purves, Augustine, Fitzpatrick, et al. 2001]: https://www.ncbi.nlm.nih.gov/books/NBK11069/
[LearnOpenCV, Durai 2023]: https://learnopencv.com/face-recognition-models/

If you want to spend more time learning about AI safety, Nicky Case made a really good resource on it—even if it's not finished yet—that's available online: [AI Safety for Fleshy Humans](https://aisafety.dance/)
