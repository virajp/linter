---
title: Frontmatter With A Comment
description: The comment below starts with a hash. Parsed as markdown body it
  is an H1, which makes the real title a second H1 and trips no-multiple-h1.
status: draft # draft | reviewed | stable
# optional, standardized: timestamp: <ISO 8601>  owner  resource  tags
---

# Frontmatter With A Comment

The document has exactly one H1. It lints clean only when frontmatter is parsed
as frontmatter rather than as markdown content.
