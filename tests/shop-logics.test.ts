import { action, composeState, scenario, state } from '../src';

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
    await cart.set([...cart.get(), { name, quantity: 1 }]);
  });

  const changeItemQuantity = action(async (name: Item['name'], quantity: number) => {
    const newItems = cart.get().map((stateItem) => {
      return stateItem.name === name ? { ...stateItem, quantity } : stateItem;
    });
    await cart.set(newItems);
  });

  scenario(async () => {
    // prettier-ignore
    const { args: [name, quantity] } = await changeItemQuantity.events.invoke;

    if (quantity === 0) {
      await cart.set(cart.get().filter((cartItem) => cartItem.name !== name));
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

    expect(await store.cartTotal).toBe(expectedTotal);
  });

  it('Fires scenario when item quantity is 0', async () => {
    const store = createStore();

    await store.addItem('apple');
    await store.addItem('mango');
    expect(store.cart.get().length).toBe(2);

    await store.changeItemQuantity('apple', 0);
    expect(store.cart.get().length).toBe(1);
  });
});
