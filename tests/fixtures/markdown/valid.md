---
title: Valid Markdown
description: The comment below starts with a hash. Parsed as markdown body it
  is an H1, which makes the real title a second H1 and trips no-multiple-h1.
status: draft # draft | reviewed | stable
# optional, standardized: timestamp: <ISO 8601>  owner  resource  tags
---

# Valid Markdown

This is a paragraph with a [link](https://example.com).

| Name | Value |
| ---- | ----- |
| a    | 1     |

```ts
const x = 1;
```

```json
{ "a": 1 }
```

```sh
npx @virajp.dev/linter --fix
```

## Lists and Inline Syntax

- [x] A task that is done
- [ ] A task with ~~strikethrough~~ and `code`
  1. A nested item with **bold** and _italic_
  2. A nested item with a footnote[^note]

An autolink: <https://example.com>. A [reference link][ref].
A link to the [heading below](#lists-and-inline-syntax).

![An image](image.png "Title")

> A quote with a list:
>
> - One

[ref]: https://example.com/ref

[^note]: The text of the footnote.

```yaml
key: value
```

```css
.a {
  display: block;
}
```
