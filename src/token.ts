/**
 * A token produced by the `path-to-regexp` v8 grammar.
 */
export type Token =
  | { readonly type: 'text'; readonly value: string }
  | { readonly type: 'param'; readonly name: string }
  | { readonly type: 'wildcard'; readonly name: string }
  | { readonly type: 'group'; readonly tokens: readonly Token[] }

type TextToken<Value extends string> = { readonly type: 'text'; readonly value: Value }

type ParamToken<Name extends string> = { readonly type: 'param'; readonly name: Name }

type WildcardToken<Name extends string> = { readonly type: 'wildcard'; readonly name: Name }

type GroupToken<Tokens extends readonly Token[]> = {
  readonly type: 'group'
  readonly tokens: Tokens
}

type LowercaseLetter =
  | 'a'
  | 'b'
  | 'c'
  | 'd'
  | 'e'
  | 'f'
  | 'g'
  | 'h'
  | 'i'
  | 'j'
  | 'k'
  | 'l'
  | 'm'
  | 'n'
  | 'o'
  | 'p'
  | 'q'
  | 'r'
  | 's'
  | 't'
  | 'u'
  | 'v'
  | 'w'
  | 'x'
  | 'y'
  | 'z'

type UppercaseLetter =
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'E'
  | 'F'
  | 'G'
  | 'H'
  | 'I'
  | 'J'
  | 'K'
  | 'L'
  | 'M'
  | 'N'
  | 'O'
  | 'P'
  | 'Q'
  | 'R'
  | 'S'
  | 'T'
  | 'U'
  | 'V'
  | 'W'
  | 'X'
  | 'Y'
  | 'Z'

type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'

type IdentifierStart = LowercaseLetter | UppercaseLetter | '_' | '$'
type IdentifierPart = IdentifierStart | Digit

type AppendText<Text extends string, Acc extends readonly Token[]> = Text extends ''
  ? Acc
  : readonly [...Acc, TextToken<Text>]

type PushToken<
  Text extends string,
  Acc extends readonly Token[],
  Next extends Token,
> = Text extends '' ? readonly [...Acc, Next] : readonly [...Acc, TextToken<Text>, Next]

type ParseIdentifierPart<
  S extends string,
  Name extends string,
> = S extends `${infer Head}${infer Rest}`
  ? Head extends IdentifierPart
    ? ParseIdentifierPart<Rest, `${Name}${Head}`>
    : readonly [Name, S]
  : readonly [Name, S]

type ParseIdentifierStart<S extends string> = S extends `${infer First}${infer Rest}`
  ? First extends IdentifierStart
    ? ParseIdentifierPart<Rest, First>
    : never
  : never

type ParseQuotedName<S extends string, Name extends string> = S extends `${infer Head}${infer Rest}`
  ? Head extends '"'
    ? Name extends ''
      ? never
      : readonly [Name, Rest]
    : Head extends '\\'
      ? Rest extends `${infer Escaped}${infer Tail}`
        ? ParseQuotedName<Tail, `${Name}${Escaped}`>
        : never
      : ParseQuotedName<Rest, `${Name}${Head}`>
  : never

type ParseName<S extends string> = S extends `"${infer Rest}`
  ? ParseQuotedName<Rest, ''>
  : ParseIdentifierStart<S>

type ParseChars<
  S extends string,
  Text extends string,
  Acc extends readonly Token[],
  Terminator extends string,
> = S extends `${infer Head}${infer Rest}`
  ? Head extends Terminator
    ? readonly [AppendText<Text, Acc>, Rest]
    : Head extends '\\'
      ? Rest extends `${infer Escaped}${infer Tail}`
        ? ParseChars<Tail, `${Text}${Escaped}`, Acc, Terminator>
        : never
      : Head extends ':'
        ? ParseNamed<Rest, Text, Acc, Terminator, 'param'>
        : Head extends '*'
          ? ParseNamed<Rest, Text, Acc, Terminator, 'wildcard'>
          : Head extends '{'
            ? ParseGroup<Rest, Text, Acc, Terminator>
            : Head extends '}' | '(' | ')' | '[' | ']' | '+' | '?' | '!'
              ? never
              : ParseChars<Rest, `${Text}${Head}`, Acc, Terminator>
  : Terminator extends ''
    ? readonly [AppendText<Text, Acc>, '']
    : never

type ParseNamed<
  S extends string,
  Text extends string,
  Acc extends readonly Token[],
  Terminator extends string,
  Kind extends 'param' | 'wildcard',
> =
  ParseName<S> extends infer R
    ? R extends readonly [infer Name extends string, infer Next extends string]
      ? Name extends ''
        ? never
        : ParseChars<
            Next,
            '',
            Kind extends 'param'
              ? PushToken<Text, Acc, ParamToken<Name>>
              : PushToken<Text, Acc, WildcardToken<Name>>,
            Terminator
          >
      : never
    : never

type ParseGroup<
  S extends string,
  Text extends string,
  Acc extends readonly Token[],
  Terminator extends string,
> =
  ParseChars<S, '', readonly [], '}'> extends infer R
    ? R extends readonly [infer Tokens extends readonly Token[], infer Next extends string]
      ? ParseChars<Next, '', PushToken<Text, Acc, GroupToken<Tokens>>, Terminator>
      : never
    : never

/**
 * Parses a `path-to-regexp` v8 pattern into a tuple of tokens.
 *
 * Parameter names support ASCII identifiers and quoted names (`:"foo-bar"`).
 * Invalid patterns resolve to `never`.
 */
export type Parse<Path extends string> =
  ParseChars<Path, '', readonly [], ''> extends infer R
    ? R extends readonly [infer Tokens extends readonly Token[], string]
      ? Tokens
      : never
    : never
