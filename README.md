# path-to-regexp-types

Compile-time TypeScript utilities for parsing [`path-to-regexp`](https://github.com/pillarjs/path-to-regexp) patterns.

> **This package is types-only.** It ships type declarations and no runtime code.
> Always import it with `import type` so the import is erased at compile time.

## Install

```sh
pnpm add -D path-to-regexp-types
```

`path-to-regexp` is a peer dependency (`^8.0.0 || ^9.0.0`), so it is expected to already be
installed in the project that consumes these types.

## Usage

### `PathParams<Path>`

Extracts the params object from a `path-to-regexp` pattern:

```ts
import type { PathParams } from 'path-to-regexp-types'

type Params = PathParams<'/users/:id/posts/:postId'>
//   ^? { id: string; postId: string }
```

Parameters inside `{...}` groups are optional, and wildcards resolve to `string[]`:

```ts
type Optional = PathParams<'/users{/:id}'>
//   ^? { id?: string }

type Wildcard = PathParams<'/files/*path'>
//   ^? { path: string[] }

type Mixed = PathParams<'/:a-:b/*rest'>
//   ^? { a: string; b: string; rest: string[] }
```

Quoted names support characters that are not valid identifiers:

```ts
type Quoted = PathParams<'/:"foo-bar"'>
//   ^? { 'foo-bar': string }
```

Patterns that `path-to-regexp` itself cannot compile resolve to `never`, so mistakes surface
wherever the type is used:

```ts
type Invalid = PathParams<'/users/:id?'> // never
type Adjacent = PathParams<'/:a:b'> // never
```

### `Parse<Path>`

Parses a pattern into a tuple of tokens, mirroring `path-to-regexp`'s own `parse()`:

```ts
import type { Parse } from 'path-to-regexp-types'

type Tokens = Parse<'/users/:id'>
//   ^? readonly [
//        { readonly type: 'text'; readonly value: '/users/' },
//        { readonly type: 'param'; readonly name: 'id' }
//      ]
```

The token shapes are exported as `Token`, and use the same grammar as `path-to-regexp` v8:
`text`, `param`, `wildcard`, and nested `group`.

## Typing a matched route

```ts
import { match } from 'path-to-regexp'
import type { PathParams } from 'path-to-regexp-types'

const route = '/users/:id/posts/:postId' as const
type Params = PathParams<typeof route>

const matchRoute = match(route)

export function parseRoute(url: string): Params | undefined {
  const result = matchRoute(url)
  return result ? (result.params as Params) : undefined
}
```

## Limitations

- Only the `path-to-regexp` v8 grammar is supported: legacy `?`, `+`, `(` and `)` modifiers are
  invalid and resolve to `never`.
- Adjacent captures such as `/:a:b` or `/{:a}{:b}` are rejected, matching `pathToRegexp()`.
- `PathParams` must be given a string literal. A widened `string` resolves to `never`.

## License

[MIT](./LICENSE)
