import { describe, expectTypeOf, it } from 'vitest'

import type { Parse, PathParams } from '../src/index.ts'

describe('Parse', () => {
  it('parses text and parameters', () => {
    expectTypeOf<Parse<'/users/:id'>>().toEqualTypeOf<
      readonly [
        { readonly type: 'text'; readonly value: '/users/' },
        { readonly type: 'param'; readonly name: 'id' },
      ]
    >()
  })

  it('parses nested groups', () => {
    expectTypeOf<Parse<'/users{/:id}'>>().toEqualTypeOf<
      readonly [
        { readonly type: 'text'; readonly value: '/users' },
        {
          readonly type: 'group'
          readonly tokens: readonly [
            { readonly type: 'text'; readonly value: '/' },
            { readonly type: 'param'; readonly name: 'id' },
          ]
        },
      ]
    >()
  })

  it('parses escaped text and quoted names', () => {
    expectTypeOf<Parse<'/\\:literal/:"foo-bar"'>>().toEqualTypeOf<
      readonly [
        { readonly type: 'text'; readonly value: '/:literal/' },
        { readonly type: 'param'; readonly name: 'foo-bar' },
      ]
    >()
  })

  it('parses wildcards', () => {
    expectTypeOf<Parse<'/files/*path'>>().toEqualTypeOf<
      readonly [
        { readonly type: 'text'; readonly value: '/files/' },
        { readonly type: 'wildcard'; readonly name: 'path' },
      ]
    >()
  })

  it('rejects invalid syntax', () => {
    expectTypeOf<Parse<'/users/:id?'>>().toEqualTypeOf<never>()
  })
})

describe('PathParams', () => {
  it('extracts required parameters', () => {
    expectTypeOf<PathParams<'/users/:id/posts/:postId'>>().toEqualTypeOf<{
      id: string
      postId: string
    }>()
  })

  it('extracts wildcards as arrays', () => {
    expectTypeOf<PathParams<'/files/*path'>>().toEqualTypeOf<{ path: string[] }>()
  })

  it('marks group parameters optional', () => {
    expectTypeOf<PathParams<'/users{/:id}'>>().toEqualTypeOf<{ id?: string }>()
  })

  it('marks nested group parameters optional', () => {
    expectTypeOf<PathParams<'/a{/b{/:c}}'>>().toEqualTypeOf<{ c?: string }>()
  })

  it('keeps duplicated parameters required when any occurrence is required', () => {
    expectTypeOf<PathParams<'/:id{/:id}'>>().toEqualTypeOf<{ id: string }>()
  })

  it('supports quoted parameter names', () => {
    expectTypeOf<PathParams<'/:"foo-bar"'>>().toEqualTypeOf<{ 'foo-bar': string }>()
  })

  it('ignores escaped markers', () => {
    expectTypeOf<PathParams<'/\\:literal'>>().toEqualTypeOf<Record<never, never>>()
  })

  it('returns never for invalid patterns', () => {
    expectTypeOf<PathParams<'/users/:id?'>>().toEqualTypeOf<never>()
  })
})
