import type { ComputedRef, Ref } from 'vue';

export interface IGetterIndex extends Record<string, ComputedRef<any>> {}

export interface IStateIndex extends Record<string, Ref<any>> {}
