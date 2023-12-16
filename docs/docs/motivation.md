---
sidebar_position: 1
slug: /motivation
---

# Motivation

When using different state management libraries like Redux, Recoil, Jotai, MobX, XState I was never satisfied about how state management is done. My main dissatisfaction was caused by how much logics is mixed into UI layer.

When I discovered Recoil, I was impressed about its simplicity. But after using it in [Websktop](https://websktop.com) I've realized that using it was one of the biggest mistakes, because it introduced a lot of React hooks, which were strongly dependant on each other and caused lots of redundant re-renders.

Being annoyed by this, the idea of devising new approach to state management bothered me. I've spent days on thinking about new architecture, and finally while swimming [here](https://maps.app.goo.gl/SUsLJhfjSMbCfUJs6) the concept of [re-resolvable](/awai-event) was born in my head.

After implementing basic re-resolvable functionality and creating a few proof of concepts I've seen a great opportunity for this approach and started implementing variety of helpers which altogether grown into a full-featured standalone state management library.

As for now I've rewritten state management of two of my private project using Awai:
- [Type2Learn](https://github.com/yuriyyakym/type2learn)
- [Websktop](https://websktop.com) (opened an experimental PR)

And created few examples:

- Paint - [Playground](https://codesandbox.io/p/github/yuriyyakym/awai-paint/master) | [Repository](https://github.com/yuriyyakym/awai-paint) | [Demo](https://awai-paint.vercel.app/)
- Todo list - [Playground](https://codesandbox.io/p/sandbox/awai--todo-list-wqyjfz?file=%2FREADME.md%3A3%2C23)
- Safe counter - [Playground](https://codesandbox.io/p/sandbox/awai--cunter-qk7h6p?file=%2FREADME.md%3A3%2C23)
