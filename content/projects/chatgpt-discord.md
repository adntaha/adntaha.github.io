---
title: ChatGPT in Discord
featured: 5
half: true
period: Dec 2022
summary: One of the first publicly demonstrated ChatGPT integrations. I built it less than five days after ChatGPT launched.
note: "fun fact: i was 15 when i built this!"
asset:
  type: video
  src: /media/chatgpt-discord/demo.mp4
  alt: Screen recording of the bot answering a /talk command in Discord, then taking a follow-up through a Respond button.
links:
  - label: The original tweet
    url: https://x.com/adntaha_ai/status/1599654574536593408
---

ChatGPT came out on November 30, 2022. There was no API yet, but there was a website, and people were already wiring it into WhatsApp, Telegram and Twitter. On December 5, I posted this:

![Tweet from December 5, 2022: "i made a thing using #ChatGPT", with a video of a Discord bot named ChatGPT Staging answering a /talk command](/media/chatgpt-discord/tweet.png)

The demo above is that original 32-second clip. You type `/talk` with a message, and the bot answers in the channel. Under its answer is a **Respond** button, which opens a little form so you can keep the conversation going.

## How it worked, with no API

There was no official API yet, so the first version simply borrowed my own login: I copied my ChatGPT session token and called the same internal API the website used.

Then, to make it work consistently, I kept the login alive with a refresh token: a scheduled worker refreshed it periodically and stored the fresh one in Workers KV, where the bot could always use the latest version.

Of course, a few months later, an official API was created and this method was patched, unfortunately.
