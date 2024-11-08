# For a given file (for testing, let's use PHY2\PHY2_002 אלקטרוסטטיקה - שטף חשמלי, חוק גאוס ופוטנציאל חשמלי.md), this script will fix the math blocks in the file.
# For each display math block (i.e. a block that starts with $$ and ends with $$), it will:
# 1. Put the beginning $$ and ending $$ on a separate line.
# 2. If the math block is in a callout (i.e., begins with >), then ensure that each new line in the math block is also prefixed with >.

import re

def fix_math_blocks(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()

    # Regex to find all display math blocks
    math_block_pattern = re.compile(r'(\$\$.*?\$\$)', re.DOTALL)

    def fix_block(block):
        # Ensure $$ are on separate lines if not already
        lines = block.split('\n')
        if not lines[0].strip() == '$$':
            lines[0] = '$$\n' + lines[0].lstrip('$')
        if not lines[-1].strip() == '$$' and not lines[-1].strip() == '> $$' and not lines[-1].strip() == '>$$' and not lines[-1].strip() == '\t$$' and not lines[-1].strip() == '\t> $$' and not lines[-1].strip() == '\t>$$' and not lines[-1].strip() == '\t\t$$' and not lines[-1].strip() == '\t\t> $$' and not lines[-1].strip() == '\t\t>$$' and not lines[-1].strip() == '\t$$\t':
            lines[-1] = lines[-1].rstrip('$') + '\n$$'
        return '\n'.join(lines)

    # Replace each math block with the fixed version
    content = math_block_pattern.sub(lambda m: fix_block(m.group(1)), content)

    # Split content into lines and process each line for callouts and tabs
    lines = content.split('\n')
    inside_callout = False
    inside_tab_block = False
    inside_double_tab_block = False
    inside_tabbed_callout = False
    inside_tab_in_callout = False
    for i, line in enumerate(lines):
        if line.strip().startswith('>'):
            inside_callout = True
        elif line.strip() == '':
            inside_callout = False
        if inside_callout and not line.strip().startswith('>'):
            lines[i] = '> ' + line

        if line.startswith('\t'):
            inside_tab_block = True
        elif line.strip() == '':
            inside_tab_block = False
        if inside_tab_block and not line.startswith('\t') and not re.match(r'^\d+\.', line.strip()) and not line.strip().startswith('-'):
            lines[i] = '\t' + line

        # Handle double tabs
        if line.startswith('\t\t'):
            inside_double_tab_block = True
        elif line.strip() == '':
            inside_double_tab_block = False
        if inside_double_tab_block and not line.startswith('\t\t') and not re.match(r'^\d+\.', line.strip()) and not line.strip().startswith('-'):
            if line.startswith('\t'):
                lines[i] = '\t' + line
            else:
                lines[i] = '\t\t' + line

        # Handle tabbed callouts
        if line.startswith('\t>'):
            inside_tabbed_callout = True
        elif line.strip() == '':
            inside_tabbed_callout = False
        if inside_tabbed_callout and not line.startswith('\t>'):
            if line.startswith('\t'):
                lines[i] = '>' + line
            elif line.startswith('>'):
                lines[i] = '\t' + line
            else:
                lines[i] = '\t>' + line

        # Handle tabs in callouts
        if line.startswith('>\t'):
            inside_tab_in_callout = True
        elif line.strip() == '':
            inside_tab_in_callout = False
        if inside_tab_in_callout and not line.startswith('>\t') and not re.match(r'^\d+\.', line.strip()) and not line.strip().startswith('-'):
            if line.startswith('>'):
                lines[i] = '\t' + line
            else:
                lines[i] = '>\t' + line


    # Join lines back into content
    fixed_content = '\n'.join(lines)

    with open(file_path, 'w', encoding='utf-8') as file:
        file.write(fixed_content)

# Run the script on all the .md files in the 'content' directory and below it, but exclude '.excalidraw.md' files
import os
for root, dirs, files in os.walk('content'):
    for file in files:
        if file.endswith('.md') and not file.endswith('.excalidraw.md'):
            fix_math_blocks(os.path.join(root, file))
            print(f'Fixed math blocks in {os.path.join(root, file)}')