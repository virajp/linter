# @askviraj/linter

This package moved to `@virajp.dev/linter`. The source is at
<https://github.com/virajp/linter>. Use the new package:

```sh
npx @virajp.dev/linter [flags] [files...]
```

In `eslint.config.mjs`, change the import to this line:

```js
export { default } from "@virajp.dev/linter/auto";
```

This package does not lint files. When you run the `linter` command, it writes
the name of the new package to stderr. Then it stops with exit status 1. When
you import this package, it throws an error. This package will not get more
updates.
