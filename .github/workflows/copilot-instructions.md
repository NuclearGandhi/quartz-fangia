# Markdown formatting

## General - Obsidian Markdown
- Use "$" for inline math and "$$" for math blocks.
- Do not put Hebrew text inside math blocks
- Put definitions, examples, notes and so forth in callouts.
- Reference local links using [[]] and not []().
- Each image (callouts are exempt, but still desirable) should have a caption

## Mathematical Content and Theorems
- Use `>[!def] הגדרה:` for definitions
- Use `>[!theorem] משפט:` for theorems
- Use `>[!example] דוגמאות:` for examples
- Use `>[!notes] הערות:` for notes
- Use `>[!info] מסקנה:` for corollaries or conclusions
- Use `>[!quote]` for quotes
- Place mathematical proofs after theorem statements, ending with "$\blacksquare$"
- For multi-step calculations, use aligned environments: `\begin{aligned}...\end{aligned}`
- Include appropriate references using bibliography notation: `[[Course_000 Course Name#ביבליוגרפיה|(Author et al., Year)]]`

## Equation Formatting
- For equations that need numbering, use `\tag{n.m}` at the end of the equation
- For multi-line equations, use `\\[1ex]` for medium line spacing and `\\[2ex]` or `\\[3ex]` for larger spacing
- Use `\begin{aligned}...\end{aligned}` for aligned calculations
- Use `\boxed{...}` to highlight important results or final answers
- For matrices, use `\begin{pmatrix}...\end{pmatrix}` format
- When using equation arrays, properly align entries with `&` symbol
- Include footnotes for clarifying mathematical notation with `[^n]` syntax

## Document Structure
- Start content files with YAML frontmatter including aliases
- Place images in their appropriate context with proper captions using `|bookhue` or `|book` for textbook images
- For solutions, precede the answer with "**פתרון**:" or "**Solution**:"
- When showing a calculation process, use proper equation alignment with `\begin{aligned}...\end{aligned}`
- End calculations with boxed answers: `\boxed{result}`
- For diagrams, use Excalidraw and embed SVG files
- Structure sections with proper headings using Markdown heading syntax (# for main headings, ## for subheadings)
- For exercises, use "# תרגילים" as the section heading with "## שאלה n" for individual problems
- For multiple-part questions, use "### סעיף א'" format for each part

## Algorithm and Special Content
- Use `#אלגוריתם:` for algorithm descriptions
- For vector and matrix notation, use `\mathbf{x}` for vectors and `[\mathbf{A}]` for matrices
- When using special units, wrap them in `\pu{...}` for proper formatting
- For references to figures, use the format `![[filename.svg]]` with a caption line below starting with ">"