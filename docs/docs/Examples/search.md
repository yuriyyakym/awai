---
---

# Search

In this example we will implement debounced search with sorting.

First create state nodes and actions, then we create a scenario which executes a callback on every searchQuery state change. Inside of the callback we start a two promises race - if delay promise is resolved first, we are safe to perform a search request. Notice how we used `searchQuery.events.changed` as a promise, in case it resolves before the delay, we just reject, which stops current callback execution; meanwhile new scenario callback with updated query is executed in parallel and starts the same flow.


```ts
type SearchResult = string;
type SortDirection = 'asc' | 'desc';

const DEBOUNCE_TIMEOUT = 200;

const searchQuery = state('');
const searchResults = asyncState<SearchResult[]>([]);
const sortDirection = state<SortDirection>('asc');

const sortedSearchResults = selector(
  [searchResults, sortDirection],
  (results, direction) => {
    return results.toSorted(
      (a, b) => direction === 'asc' ? a.localCompare(b) : b.localCompare(a)
    );
  }
);

const setSearchQuery = action(searchQuery.set);
const resetSearch = action(() => setSearchQuery(''));
const setSortDirection = action(sortDirection.set);

scenario(
  searchQuery.events.changed,
  async (query) => {
    await Promise.race([
      delay(DEBOUNCE_TIMEOUT),
      searchQuery.events.changed.then(() => Promise.reject()),
    ]);

    if (query === '') {
      setSearchResults([]);
      return;
    }

    const results = await fetch(`/search?query={query}`).then(response => response.json());
    setSearchResults(results);
  }
);

scenario(sortedSearchResults.events.changed, (results) => {
  console.log(`Sorted search results: ${results.join(', ')}`);
});
```
