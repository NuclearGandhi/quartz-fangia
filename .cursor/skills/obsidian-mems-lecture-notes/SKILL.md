---
name: obsidian-mems-lecture-notes
description: Rewrite MEMS lecture PDFs into polished Obsidian course notes with equations, explanations, MATLAB-generated SVG graphs, and symbolic verification. Use when working on Technion MCS/MEMS notes, lecture PDFs, Obsidian markdown, MATLAB plots, pull-in/stability graphs, or when the user asks to turn lecture notes into flowing notes with generated figures.
---

# Obsidian MEMS Lecture Notes

Use this skill when converting MEMS lecture PDFs into Obsidian notes in the `content/Technion/...` vault, especially for MCS/MEMS courses.

## Core Workflow

1. Read the relevant workspace rules first when copying/adapting source material:
   - `.cursor/rules/obsidian_formatting_rules.mdc`
   - `.cursor/rules/book_sourcing_rules.mdc`

2. Read context before writing:
   - the target note;
   - the lecture PDF in chunks;
   - nearby course notes with similar style;
   - existing MATLAB scripts/figures for the course.

3. Rewrite the note as flowing course notes, not a literal transcript:
   - keep the lecture’s mathematical structure and notation;
   - add explanations where the lecture skips reasoning;
   - use Obsidian links like `[[MCS2_001 DIPIE]]`;
   - use `$$...$$` math blocks and `\tag{...}`;
   - use callouts for definitions, notes, conclusions, and warnings;
   - remove TODOs by replacing them with actual derivation/explanation.

4. For figures:
   - leave user-provided illustrative/device schematics alone unless asked;
   - generate analytic or numerical graphs in MATLAB when curves explain behavior;
   - export figures as SVG, not PNG;
   - embed as `![[folder/figure.svg|bookhue|600]]^figure-anchor`;
   - add a caption immediately below every figure.

5. Validate and iterate:
   - run MATLAB scripts after editing;
   - use `ReadLints` on changed markdown and MATLAB files;
   - check for stale `TODO`, `.png` references, duplicate equation tags, and broken figure anchors;
   - remove generated `.asv` files.

## MATLAB Figure Style

Follow the style used in the MCS2 notes:

- Set LaTeX interpreters:
  ```matlab
  set(groot, 'defaultAxesTickLabelInterpreter', 'latex');
  set(groot, 'defaultTextInterpreter', 'latex');
  set(groot, 'defaultLegendInterpreter', 'latex');
  ```

- Export SVG:
  ```matlab
  exportgraphics(fig, fullfile(out_dir, 'figure_name.svg'), 'ContentType', 'vector');
  ```

- Prefer in-graph labels over legends for lecture-style figures.
- Use consistent colors across related graphs.
- Use solid curves for stable branches and dashed/dotted curves for unstable branches.
- For pull-in loci that are poorly connected, plot points instead of forcing a continuous curve.
- If `contour` is used for a single level, pass `[level level]`, not `level`.
- If a contour lies on a masked domain boundary, draw it analytically instead of relying on `contour`.
- Avoid scatter-based vector fills for dense domains; they produce huge SVGs. Prefer parametric boundaries or clean contour regions.

## Mathematical Verification

Create a separate symbolic MATLAB script when the derivation is fragile or the user expresses doubt.

The symbolic script should:

- define the potential energy;
- differentiate to verify forces/reaction equations;
- solve equilibrium equations for voltages/charges where relevant;
- compute Hessian/stiffness entries;
- substitute equilibrium expressions into stiffness;
- verify determinant/pull-in polynomials;
- print `PASS` / `FAIL` for every claimed equation.

Use a helper like:

```matlab
function assert_zero(expr, label)
    simplified = simplify(expr, 'Steps', 200);
    [num, ~] = numden(simplified);
    num = simplify(expand(num), 'Steps', 200);

    if ~isequal(num, sym(0)) && ~isAlways(num == 0)
        fprintf(2, 'FAIL: %s\n', label);
        disp(num);
        error('Symbolic verification failed.');
    end

    fprintf('PASS: %s\n', label);
end
```

## Obsidian Formatting Requirements

- Use `$` for inline math and `$$` for display math.
- Use `\mathrm{d}` for differentials.
- Use `\begin{aligned}...\end{aligned}` for multi-step derivations.
- Use `\text{(tag)}` when referencing equation tags in prose.
- Use `\mathbf{K}` for matrices and `\boldsymbol{\beta}` for vectors where appropriate.
- Do not put Hebrew text inside math.
- Do not add headings that are not useful to the lecture structure.
- Keep one blank line between sections and equations.

## Common Graph Pitfalls

- Branches that zigzag usually come from connecting multiple implicit-curve segments. Extract contour segments with `contourc` and plot each segment separately.
- Domain-fill artifacts often come from `boundary(...)` on folded projections. Build the boundary parametrically from physical boundary curves instead.
- Zero-voltage boundaries may disappear if they are exactly on a `NaN`-masked domain boundary. Draw them analytically.
- If one scalar level behaves differently than several levels, check whether MATLAB interpreted the scalar as the number of contour levels.

## Deliverables

For each lecture conversion, leave behind:

- a polished markdown note;
- a companion folder for figures/scripts if needed;
- one MATLAB graph-generation script;
- SVG figures referenced by the note;
- optional symbolic verification script for fragile derivations.

In the final response, mention:

- which note was updated;
- which scripts/figures were created or regenerated;
- whether MATLAB ran successfully;
- whether lints are clean;
- any assumptions or source limitations, such as poor PDF OCR.
