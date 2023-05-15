import { State } from '../state';

export type FamilyMap<T> = Record<string, State<T>>;

export interface Family<T> {
  delete(key: string): Promise<T>;
  has(key: string): boolean;
  get(key: string): T | undefined;
  getItemState(key: string): State<T>;
  keys(): string[];
  set(key: string, item: T): Promise<State<T>>;
  setState(key: string, state: State<T>): void;
}
