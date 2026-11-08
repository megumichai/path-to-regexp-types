import type { Simplify } from './_utils.ts'
import type { Parse, Token } from './token.ts'
import type { ValidateTokens } from './validate.ts'

type ParamsFromTokens<
  Tokens extends readonly Token[],
  Required extends object,
  Optional extends object,
  InGroup extends boolean,
> = Tokens extends readonly [infer Head extends Token, ...infer Tail extends readonly Token[]]
  ? Head extends { readonly type: 'param'; readonly name: infer Name extends string }
    ? InGroup extends true
      ? ParamsFromTokens<Tail, Required, Optional & { [K in Name]?: string }, InGroup>
      : ParamsFromTokens<Tail, Required & { [K in Name]: string }, Optional, InGroup>
    : Head extends { readonly type: 'wildcard'; readonly name: infer Name extends string }
      ? InGroup extends true
        ? ParamsFromTokens<Tail, Required, Optional & { [K in Name]?: string[] }, InGroup>
        : ParamsFromTokens<Tail, Required & { [K in Name]: string[] }, Optional, InGroup>
      : Head extends {
            readonly type: 'group'
            readonly tokens: infer GroupTokens extends readonly Token[]
          }
        ? ParamsFromTokens<
            Tail,
            Required,
            Optional & ParamsFromTokens<GroupTokens, {}, {}, true>,
            InGroup
          >
        : ParamsFromTokens<Tail, Required, Optional, InGroup>
  : Simplify<Optional & Required>

/**
 * Extracts the params object from a `path-to-regexp` v8 pattern.
 *
 * Parameters inside `{...}` groups are optional. Wildcards resolve to
 * `string[]`; invalid patterns resolve to `never`. Patterns with adjacent
 * captures, such as `/:a:b`, are rejected because `pathToRegexp()` rejects them.
 */
export type PathParams<Path extends string> =
  Parse<Path> extends infer Tokens
    ? Tokens extends readonly Token[]
      ? [ValidateTokens<Tokens>] extends [never]
        ? never
        : ParamsFromTokens<Tokens, {}, {}, false>
      : never
    : never
