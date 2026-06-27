---
name: mems-homework-reviewer
description: Review Advanced Modeling in MEMS / electromechanical systems homework in this Obsidian vault. Use when the user asks to complete, revise, or generate MEMS homework solutions, especially from assignment PDFs with existing notes, MATLAB scripts, dimensionless modeling, stability, pull-in, buckling, bifurcation, or post-buckling analysis.
---

# MEMS Homework Reviewer

## Purpose

Use this skill to complete MEMS homework in the style of this vault: concise derivations in Obsidian Markdown, dimensionless formulations when possible, focused physical explanations, and MATLAB-generated SVG figures saved beside the homework.

## Workflow

1. Read the target homework `.md`, the assignment PDF, and all user-named reference notes/scripts before editing.
2. Preserve completed sections unless the user explicitly asks to rewrite them. Continue the current structure, equation numbering, captions, and language.
3. Identify the actual question intent. Do not over-answer conceptual questions; if the prompt asks for an example or explanation, keep it short unless the user asks for depth.
4. For analytical MEMS questions, start from energy/potential:
	- mechanical elastic energy;
	- voltage-controlled electrostatic potential, usually $-\frac{1}{2}CV^{2}$;
	- charge-controlled energy, usually $\frac{1}{2}Q^{2}/C$;
	- gravity, residual stress, axial load, thermal stress, or other physical terms.
5. Normalize early. Define dimensionless displacement/angle, potential, and loading parameters, then present the final threshold in dimensionless form.
6. For stability, derive the equilibrium and tangent stiffness from the potential. Near a symmetric bifurcation, expand the potential around the symmetric equilibrium and use the quadratic coefficient as the stability test.
7. For post-buckling explanations, explain why a critical mode approximation is allowed: at bifurcation one eigenvalue vanishes while other modes remain stiff, so the first post-critical motion is dominated by the critical eigenmode amplitude.
8. Add or update MATLAB scripts in the homework folder when figures support the solution. Use the local style:
	- `clear; close all; clc;`
	- LaTeX interpreters for axes/text/legend;
	- `out_dir = fileparts(mfilename('fullpath'));`
	- 600x400 figures by default;
	- `exportgraphics(..., 'ContentType', 'vector')`;
	- local functions at the end of the file.
9. Run MATLAB if available and regenerate SVGs. If MATLAB is unavailable, say so clearly.
10. After edits, run lints on edited files and fix introduced issues.

## Obsidian Style

- Use `$...$` and `$$...$$` math. Do not put Hebrew text inside math.
- Use `\begin{aligned}...\end{aligned}` for multi-step derivations.
- Use `\tag{HWn.m}` equation tags for homework equations.
- Use `\boxed{...}` for final results.
- Use `![[figure.svg|bookhue|600]]` plus a caption line beginning with `>`.
- Use local wiki links like `[[MCS2_004 Experimental Validation of Electro Mechanical Buckling|electromechanical buckling]]`.
- Keep answers proportional: one paragraph for "give an example"; no more than a few paragraphs for "explain in words" unless requested.

## MATLAB Figure Pattern

Use a script shaped like:

```matlab
%% Homework N: Short Title
clear; close all; clc;

set(groot, 'defaultAxesTickLabelInterpreter', 'latex');
set(groot, 'defaultTextInterpreter', 'latex');
set(groot, 'defaultLegendInterpreter', 'latex');

out_dir = fileparts(mfilename('fullpath'));

fig = figure('Position', [100, 100, 600, 400]);
hold on;
plot(x, y, 'b-', 'LineWidth', 2.8);
xlabel('$\tilde{x}$', 'FontSize', 15);
ylabel('$\tilde{V}$', 'FontSize', 15);
grid on;
set(gca, 'FontSize', 12);

exportgraphics(fig, fullfile(out_dir, 'descriptive_name.svg'), ...
    'ContentType', 'vector');
```

## Common Solution Patterns

- Symmetric electrostatic bifurcation: symmetric equilibrium remains valid because first-order forces cancel; instability appears when electrostatic negative stiffness cancels mechanical stiffness.
- Pull-in: use equilibrium plus tangent stiffness equal to zero.
- Buckling with multiple mechanisms: express the critical condition as a sum of dimensionless destabilizing contributions reaching one threshold.
- Post-buckling: reduce to the critical eigenmode amplitude and inspect the first nonzero energy coefficient beyond the vanished quadratic term.
