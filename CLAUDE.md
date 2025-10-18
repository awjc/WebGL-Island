# BASICS
Begin by reading the README.md file to understand the project structure and organization.
*** Make sure to update the README.md file whenever making substantial changes to structure or organization. ***


# Coding Instructions
- Prefer using library functions for common things like matrix multiplication,
  data structure manipulation, etc. Add new libraries to the importmap section in index.html.
- Write clean code with comments and organized into logical blocks, using helper functions
  where necessary. Avoid giant hard-to-understand function blocks with magic numbers.
- If a variable / constant number is going to be used multiple times, prefer to use a constant
  so it can be tweaked in only one place. E.g. don't say "const x = 40;" and then in a comment
  above that, say "we set x to 40". No need to mention the literal value in the comment, and
  if the code will re-use it, save it to a const variable first.
- When coding colors, always prefer the style of '#AA77FF' instead of 0xAA77FF,
  since the style of string with # prefix allows VSCode to offer a nice color 
  swatch picker tool.
- IGNORE files in the directories like 'v1', 'v2', 'v3', etc. These are just snapshots of old versions of the code at previous git commits, but kept around in such a way as to be able to visit the site and run it. They are readonly point-in-time snapshots and the current version of the code will just be in the root directory.