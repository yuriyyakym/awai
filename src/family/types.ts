import { State } from '../state';

export type FamilyMap<T> = Record<string, State<T>>;

export interface Family<T> {
  delete(key: string): Promise<T>;
  has(key: string): boolean;
  get(key: string): T;
  getItemState(key: string): State<T>;
  keys(): string[];
  set(key: string, value: T): void;
  setState(key: string, state: State<T>): void;
}
