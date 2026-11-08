import type { Parse, Token } from '../src/token.ts'

type TextToken<Value extends string> = { readonly type: 'text'; readonly value: Value }
type ParamToken<Name extends string> = { readonly type: 'param'; readonly name: Name }
type WildcardToken<Name extends string> = { readonly type: 'wildcard'; readonly name: Name }
type GroupToken<Tokens extends readonly Token[]> = {
  readonly type: 'group'
  readonly tokens: Tokens
}

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false

describe('Parse', () => {
  it('returns no tokens for an empty path', () => {
    expectTypeOf<Equal<Parse<''>, readonly []>>().toEqualTypeOf<true>()
  })

  it('parses text', () => {
    expectTypeOf<Parse<'/users'>>().toEqualTypeOf<readonly [TextToken<'/users'>]>()
  })

  it('parses parameters', () => {
    expectTypeOf<Parse<'/users/:id'>>().toEqualTypeOf<
      readonly [TextToken<'/users/'>, ParamToken<'id'>]
    >()

    expectTypeOf<Parse<'/:a/:b'>>().toEqualTypeOf<
      readonly [TextToken<'/'>, ParamToken<'a'>, TextToken<'/'>, ParamToken<'b'>]
    >()
  })

  it('parses wildcards', () => {
    expectTypeOf<Parse<'/files/*path'>>().toEqualTypeOf<
      readonly [TextToken<'/files/'>, WildcardToken<'path'>]
    >()
  })

  it('parses groups', () => {
    expectTypeOf<Parse<'/users{/:id}'>>().toEqualTypeOf<
      readonly [TextToken<'/users'>, GroupToken<readonly [TextToken<'/'>, ParamToken<'id'>]>]
    >()
  })

  it('parses nested groups', () => {
    expectTypeOf<Parse<'/a{/b{/:c}}'>>().toEqualTypeOf<
      readonly [
        TextToken<'/a'>,
        GroupToken<
          readonly [TextToken<'/b'>, GroupToken<readonly [TextToken<'/'>, ParamToken<'c'>]>]
        >,
      ]
    >()
  })

  it('parses escaped characters as text', () => {
    expectTypeOf<Parse<'/\\:id'>>().toEqualTypeOf<readonly [TextToken<'/:id'>]>()
  })

  it('parses quoted parameter names', () => {
    expectTypeOf<Parse<'/:"foo-bar"'>>().toEqualTypeOf<
      readonly [TextToken<'/'>, ParamToken<'foo-bar'>]
    >()
  })

  it('stops parameter names at the first non-identifier character', () => {
    expectTypeOf<Parse<'/:id.json'>>().toEqualTypeOf<
      readonly [TextToken<'/'>, ParamToken<'id'>, TextToken<'.json'>]
    >()
  })

  it('keeps parsing patterns rejected by pathToRegexp', () => {
    expectTypeOf<Parse<'/:a:b'>>().toEqualTypeOf<
      readonly [TextToken<'/'>, ParamToken<'a'>, ParamToken<'b'>]
    >()
  })

  it('rejects invalid patterns', () => {
    expectTypeOf<Parse<'/users/:id?'>>().toEqualTypeOf<never>()
    expectTypeOf<Parse<'/users/{'>>().toEqualTypeOf<never>()
    expectTypeOf<Parse<'/:""'>>().toEqualTypeOf<never>()
    expectTypeOf<Parse<'/:'>>().toEqualTypeOf<never>()
  })
})
