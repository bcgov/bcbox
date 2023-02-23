import { computed, unref } from 'vue';

import type { IGetterIndex, IStateIndex } from '@/interfaces';

export function generateGetters(state: IStateIndex): IGetterIndex {
  return Object.fromEntries(Object.keys(state).map((k: string) => ([
    `get${k.charAt(0).toUpperCase() + k.slice(1)}`,
    computed(() => unref(state[k]))
  ])));
}

export const isDebugMode: boolean = import.meta.env.MODE.toUpperCase() === 'DEBUG';
