import type { Token } from './token.ts'

type State = 'text' | 'capture' | 'either'

type MergeState<A extends State, B extends State> = A extends B ? A : 'either'

type ScanTokens<Tokens extends readonly Token[], Current extends State> = Tokens extends readonly [
  infer Head extends Token,
  ...infer Tail extends readonly Token[],
]
  ? Head extends { readonly type: 'param' } | { readonly type: 'wildcard' }
    ? Current extends 'text'
      ? ScanTokens<Tail, 'capture'>
      : never
    : Head extends { readonly type: 'text' }
      ? ScanTokens<Tail, 'text'>
      : Head extends {
            readonly type: 'group'
            readonly tokens: infer GroupTokens extends readonly Token[]
          }
        ? ScanTokens<GroupTokens, Current> extends infer Out
          ? [Out] extends [never]
            ? never
            : ScanTokens<Tail, MergeState<Current, Out & State>>
          : never
        : never
  : Current

export type ValidateTokens<Tokens extends readonly Token[]> = ScanTokens<Tokens, 'text'>
