---
sidebar_position: 100
slug: /awai-event
---

# Awai Event

Awai event is a promise-like object which has no terminal state and may resolve multiple times. It plays role of event-emitter.

### Example of usage

```ts title="Example of AwaiEvent usage"
const event = new AwaiEvent();

setTimeout(event.emit, 100, 'hello');
setTimeout(event.emit, 200, 'awai');

const value1 = await event;
const value2 = await event;

console.log(`${value1} ${value2}`); // hello awai
```

Notice how we can await the `event` object multiple times and receive different values.


:::note Hint
 AwaiEvent is promise-like, hence may be combined with other promise-like objects using Promise methods like `race`, `all` or used in any async function.
:::

### Example of replacing event-emitter with re-resolvable

In the very traditional approach you would attach event listener like this:

```ts title="Traditional way of listening to events"
const eventHandler = (event) => /* handle event */;
document.addEventListener('click', eventHandler);
```

The same functionality may be achieved by the following code:

```ts title="AwaiEvent way of listening to events"
const clickEvent = new AwaiEvent();

while (true) {
  const event = await clickEventReResolvable;
  /* handle event */
}
```
