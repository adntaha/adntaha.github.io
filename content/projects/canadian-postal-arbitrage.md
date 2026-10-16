---
title: Canadian Postal Arbitrage
period: Jul 2026
summary: Things on Amazon that cost less than a Canadian stamp and ship free, so you can send a friend a random object and a note for under $1.44.
stack: Cloudflare Workers and Workers KV; a Raspberry Pi at home that scrapes Amazon daily (Node, linkedom, Docker)
asset:
  type: image
  src: /media/postal-arbitrage/screenshot.jpg
  alt: "The list on the Canadian Postal Arbitrage page, headed 'Items cheaper than a stamp': a white wall plate for $0.49, a black plastic number 7 for $0.51, a white patch fitting for $0.63 and a mini tart tin for $0.80."
links:
  - label: Live
    url: https://adntaha.github.io/objectgrams/
  - label: The original, by Riley Walz
    url: https://walzr.com/postal-arbitrage
---

A stamp in Canada costs $1.44. Amazon Prime sells real, physical things for less than that, with free shipping and a free gift note. So instead of a postcard, you can send a friend a piano string, a tart tin or a can of cat food, with your words attached.

I sent a friend some paperclips this way. It cost about a dollar, and a couple of days after causing him some undue anxiety, I received these messages:

<div>
<picture>
<source srcset="/media/postal-arbitrage/paperclips-dark.jpg" media="(prefers-color-scheme: dark)">
<img src="/media/postal-arbitrage/paperclips-light.jpg" width="790" height="1177" loading="lazy" decoding="async" alt="A chat screenshot: a photo of an opened Amazon envelope with a gift note from Adnan, the shipping label and a small bag of green paperclips, then the replies 'Thanks for the paperclips ig' with two crying-laughing faces, and 'Tlm goofy I love it'.">
</picture>
</div>

The idea is Riley Walz's [Postal Arbitrage](https://walzr.com/postal-arbitrage), which does this for the US. I wanted the Canadian version, so I built it: every day, the page shows six items picked at random from the fifteen cheapest new Prime items under $1.44, so there's always something different to send.

The awkward part was getting the prices. Amazon blocks requests from Cloudflare's servers, where the site runs, but it returns full html pages when I tried on my computer, so I had get a bit hacky. Thus, a Raspberry Pi at home does the scraping once a day, filters out books and Amazon's internal test listings, and saves the results to the Worker's (KV) storage. The site itself, conveniently hosted on a Worker, just reads them.
