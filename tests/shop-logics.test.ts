import { action, State, composeState, cyclicFlow } from '../src';

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
  const voucher = new State<Voucher | null>(null);
  const cart = new State<StateItem[]>([]);
  const cartTotal = composeState([cart, voucher], (cart, voucher) => {
    const total = cart.reduce((sum, stateItem) => {
      return sum + stateItem.quantity * getItemByName(stateItem.name).price;
    }, 0);
    return voucher && total > voucher.minValue ? total - voucher.discount : total;
  });

  const addItem = action(async (name: Item['name']) => {
    await cart.setValue([...cart.value, { name, quantity: 1 }]);
  });

  const changeItemQuantity = action(async (name: Item['name'], quantity: number) => {
    const newItems = cart.value.map((stateItem) => {
      return stateItem.name === name ? { ...stateItem, quantity } : stateItem;
    });
    await cart.setValue(newItems);
  });

  cyclicFlow(async () => {
    // prettier-ignore
    const { args: [name, quantity] } = await changeItemQuantity.events.invoke;

    if (quantity === 0) {
      await cart.setValue(cart.value.filter((cartItem) => cartItem.name !== name));
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

    await store.voucher.setValue({ code: 'test', discount, minValue: 600 });
    await store.changeItemQuantity('apple', 4);

    const expectedTotal =
      -discount + 4 * getItemByName('apple').price + 1 * getItemByName('mango').price;

    expect(await store.cartTotal).toBe(expectedTotal);
  });

  it('Fires scenario when item quantity is 0', async () => {
    const store = createStore();

    await store.addItem('apple');
    await store.addItem('mango');
    expect(store.cart.value.length).toBe(2);

    await store.changeItemQuantity('apple', 0);
    expect(store.cart.value.length).toBe(1);
  });
});
