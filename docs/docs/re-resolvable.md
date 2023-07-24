---
sidebar_position: 4
---

# Re-resolvable

Re-resolvable is a promise-like object which has no terminal state and may resolve multiple times.

Re-resolvables play role of event-emitters, and their interface lead to a unique approach of writing logics.

### Example of usage

In this library, re-resolvable is called `AwaitableEvent`.

```ts title="Example of AwaitableEvent usage"
const event = new AwaitableEvent();

setTimeout(event.emit, 100, 'hello');
setTimeout(event.emit, 200, 'awai');

const value1 = await event;
const value2 = await event;

console.log(`${value1} ${value2}`); // hello awai
```

Notice how we can await the `event` object multiple times.


:::note Hint
 Re-resolvables are promise-like, hence may be combined with other promise-like objects using Promise methods like `any`, `race`, `all`, etc.
:::


### Example of replacing event-emitter with re-resolvable

In the very traditional approach you would attach event listener like this:

```ts title="Traditional way of listening to events"
const eventHandler = (event) => /* handle event */;
document.addEventListener('click', eventHandler);
```

Assuming that we have click event re-resolvable assigned to `clickEventReResolvable` variable, the same functionality may be achieved by the following code:

```ts title="Re-resolvable way of listening to events"
while (true) {
  const event = await clickEventReResolvable;
  /* handle event */
}
```

### Memory cleanup

Whereas in traditional approach we have a `removeEventListener`, in async-await approach it's more complex to free memory up. Let's leave this topic for later.

