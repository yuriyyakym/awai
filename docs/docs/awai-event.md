---
sidebar_position: 100
slug: /awai-event
---

# Awai Event

Awai event is a promise-like object which has no terminal state and may resolve multiple times. It plays role of event-emitter.

### Methods

- **abortable** - method that receives AbortController instance and returns Promise which can be aborted using that controller. It is mainly introduced for internal usage, in order to free memory up as soon as possible
- **emit** - method to emit an event to all the awaiters
- **filter** - method that returns a Promise of an event for which predicate returns truthy value.

### Examples

#### Simple usage

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

#### Replacing event-emitter with re-resolvable

In the very traditional approach you would attach event listener like this:

```ts title="Traditional way of listening to events"
const eventHandler = (event) => /* handle event */;
document.addEventListener('click', eventHandler);
```

With AwaiEvent, you can write same functionality using async flow. Of course, at some places you would need to attach native events and proxy them to AwaiEvent, but then you can build whole app architecture using Awai approach.

```ts title="AwaiEvent way of listening to events"
const clickEvent = new AwaiEvent();

while (true) {
  const event = await clickEventReResolvable;
  /* handle event */
}
```

The above snippet is only written for demonstration purposes. You should use [Scenario](/scenario) instead.

```ts title="AwaiEvent way of listening to events using Scenario"
const clickEvent = new AwaiEvent();

scenario(clickEventReResolvable, (event) => {
  /* handle event */
});
```

#### Filter out events

```ts title="Handle Enter key only"
const keyDownEvent = new AwaiEvent();

scenario(
  () => keyDownEvent.filter(event => event.key === 'Enter'),
  (event) => {
    /* handle event */
  },
);
```
