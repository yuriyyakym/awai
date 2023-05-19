import { action, composeState, scenario, scenarioOnEvery, state } from '../../src';

describe('Scenario: Shop flow', () => {
  it('Manages shop cart state as expected', async () => {
    const store = createStore();
    const discount = 100;

    await store.addItem('apple');
    await store.addItem('mango');

    await store.voucher.set({ code: 'test', discount, minValue: 600 });
    await store.changeItemQuantity('apple', 4);

    const expectedTotal =
      -discount + 4 * getItemByName('apple').price + 1 * getItemByName('mango').price;

    expect(store.cartTotal.get()).toBe(expectedTotal);
    expect(await store.cartTotal).toBe(expectedTotal);
  });

  it('scenario is executed when item quantity is 0', async () => {
    const store = createStore();

    await store.addItem('apple');
    await store.addItem('mango');
    expect(store.cart.get()).toHaveLength(2);

    await store.changeItemQuantity('apple', 0);
    expect(store.cart.get()).toHaveLength(1);
    expect(store.cart.get().find((item) => item.name === 'apple')).not.toBeDefined();
  });
});

const createStore = () => {
  const voucher = state<Voucher | null>(null);
  const cart = state<StateItem[]>([]);
  const cartTotal = composeState([cart, voucher], (cart, voucher) => {
    const total = cart.reduce((sum, stateItem) => {
      return sum + stateItem.quantity * getItemByName(stateItem.name).price;
    }, 0);
    return voucher && total > voucher.minValue ? total - voucher.discount : total;
  });

  const addItem = action(async (name: Item['name']) => {
    await cart.set((current) => [...current, { name, quantity: 1 }]);
  });

  const changeItemQuantity = action((name: Item['name'], quantity: number) => {
    cart.set((cart) =>
      cart.map((cartItem) => {
        return cartItem.name === name ? { ...cartItem, quantity } : cartItem;
      }),
    );
  });

  scenarioOnEvery(changeItemQuantity.events.invoked, async ([name, quantity]) => {
    if (quantity === 0) {
      cart.set((cart) => cart.filter((cartItem) => cartItem.name !== name));
    }
  });

  return {
    voucher,
    cart,
    cartTotal,
    addItem,
    changeItemQuantity,
  };
};

interface Item {
  name: string;
  price: number;
}

interface StateItem {
  name: string;
  quantity: number;
}

interface Voucher {
  code: string;
  discount: number;
  minValue: number;
}

const items = [
  { name: 'apple', price: 200 },
  { name: 'durian', price: 400 },
  { name: 'mango', price: 350 },
];

const getItemByName = (name: string) => items.find((item) => item.name === name)!;
