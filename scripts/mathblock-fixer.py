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
    end_dollar_pattern = re.compile(r'^\s*>\s*\$\$$|^\s*\$\$$')

    # Look for numbers followed by '$$' on the same line, and separate them into two lines
    content = re.sub(r'(\d+\.)\s?\$\$', r'\1\n$$', content)

    def fix_block(block):
        # Ensure $$ are on separate lines if not already
        lines = block.split('\n')
        if not lines[0].strip() == '$$':
            lines[0] = '$$\n' + lines[0].lstrip('$')
        if not end_dollar_pattern.match(lines[-1].strip()):
            lines[-1] = lines[-1].rstrip('$') + '\n$$'
        return '\n'.join(lines)

    # Replace each math block with the fixed version
    content = math_block_pattern.sub(lambda m: fix_block(m.group(1)), content)

    # Replace all 4 spaces with tabs
    content = content.replace('    ', '\t')
    content = content.replace(' \t', '\t')

    # Split content into lines and process each line for callouts and tabs
    lines = content.split('\n')
    inside_callout = False
    inside_tab_block = False
    inside_double_tab_block = False
    inside_tabbed_callout = False
    inside_tab_in_callout = False
    inside_double_tab_block_in_callout = False
    for i, line in enumerate(lines):

        # Handle double tabs inside callout
        if line.startswith('>\t\t'):
            inside_double_tab_block_in_callout = True
        elif line.strip() == '' or line.strip().startswith('#') or line.strip().startswith('---'):
            inside_double_tab_block_in_callout = False
        if inside_double_tab_block_in_callout and not line.startswith('>\t\t') and not re.match(r'^>\t\d+\.', line.strip()) and not re.match(r'^>\t\- ', line.strip()):
            if line.strip().startswith('>\t'):
                lines[i] = '>\t\t' + line.strip().lstrip('>\t')
            elif line.strip().startswith('>'):
                lines[i] = '>\t\t' + line.strip().lstrip('>')
            else:
                lines[i] = '>\t\t' + line
            continue
        
        # Handle double tabs
        if line.startswith('\t\t'):
            inside_double_tab_block = True
        elif line.strip() == '' or line.strip().startswith('#') or line.strip().startswith('---'):
            inside_double_tab_block = False
        if inside_double_tab_block and not line.startswith('\t\t') and not re.match(r'^\d+\.', line.strip()) and not re.match(r'^\t\- ', line.strip()):
            if line.startswith('\t'):
                lines[i] = '\t' + line
            else:
                lines[i] = '\t\t' + line
            continue
            

        # Handle tabbed callouts
        if re.match(r'^\t ?\>', line):
            inside_tabbed_callout = True
        elif line.strip() == '' or line.strip().startswith('#') or line.strip().startswith('---'):
            inside_tabbed_callout = False
        if not inside_tabbed_callout and re.match(r'^\t ?\>', line.strip()):
            lines[i] = line.strip().lstrip('\t>')
        elif inside_tabbed_callout and not line.startswith('\t>'):
            if line.strip().startswith('\t'):
                lines[i] = '>' + line
            elif line.strip().startswith('>'):
                lines[i] = '\t' + line
            else:
                lines[i] = '\t>' + line
            continue
            
            

        # Handle tabs in callouts
        if re.match(r'^\> ?\t', line) or re.match(r'^\> ?\d+\.', line.strip()):
            inside_tab_in_callout = True
        elif line.strip() == '' or line.strip().startswith('#') or line.strip().startswith('---'):
            inside_tab_in_callout = False

        if inside_tab_in_callout and re.match(r'^\> ?\t ?', line):
            lines[i] = re.sub(r'^\> ?\t ?', '>\t', line)
            continue

        if inside_tab_in_callout and not re.match(r'^\> ?\t', line.strip()) and not re.match(r'^\> ?\t', line) and not re.match(r'^\> ?\d+\.', line.strip()) and not re.match(r'^\- ', line):
            if re.match(r'\d+\.', line.strip()):
                lines[i] = '>' + line
            elif line.strip().startswith('>'):
                # Replace '>' with '>\t'
                lines[i] = '>\t' + line.strip().lstrip('>')
            else:
                lines[i] = '>\t' + line
            continue
            

        # Handle callouts
        if line.strip().startswith('>'):
            inside_callout = True
        elif line.strip() == '' or line.strip().startswith('#') or line.strip().startswith('---'):
            inside_callout = False
        if inside_callout and not line.strip().startswith('>'):
            lines[i] = '> ' + line
            continue


        # Handle tabs
        if re.match(r'^\d+\.', line.strip()) or re.match(r'^\- ', line.strip()):
            inside_tab_block = True
        elif line.strip() == '' or line.strip().startswith('#') or line.strip().startswith('---'):
            inside_tab_block = False
        if not inside_tab_block and re.match(r'^ ?\t', line):
            lines[i] = line.strip().lstrip('\t')
        elif inside_tab_block and not re.match(r'^ ?\t', line) and not re.match(r'^\d+\.', line.strip()) and not re.match(r'^\- ', line.strip()):
            lines[i] = '\t' + line
            continue


    # Join lines back into content
    fixed_content = '\n'.join(lines)

    with open(file_path, 'w', encoding='utf-8') as file:
        file.write(fixed_content)

# Run the script on all the .md files in the 'content' directory and below it, but exclude '.excalidraw.md' files
import os
content_dir = os.path.abspath('content/Technion')
for root, dirs, files in os.walk(content_dir):
    for file in files:
        if file.endswith('.md') and not file.endswith('.excalidraw.md'):
            fix_math_blocks(os.path.join(root, file))
            print(f'Fixed math blocks in {os.path.join(root, file)}')


# Run the script on 'content/mathblock-fixer-test.md' for testing
# fix_math_blocks('content/test/mathblock-fixer-test.md')
# print('Fixed math blocks in content/test/mathblock-fixer-test.md')