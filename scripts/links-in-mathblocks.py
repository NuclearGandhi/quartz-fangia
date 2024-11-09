# A python scripts that reads a markdown file and prints out all the '[[]]' that are in math blocks.

import re

def extract_links_in_math_blocks(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()

    # Regex to find all display math blocks
    math_block_pattern = re.compile(r'\$\$(.*?)\$\$', re.DOTALL)
    link_pattern = re.compile(r'\[\[(.*?)\]\]')

    # Find all math blocks
    math_blocks = math_block_pattern.findall(content)

    # Extract and print links location - file path
    for i, block in enumerate(math_blocks):
        links = link_pattern.findall(block)
        if links:
            print(f'{file_path}: {links}')

# Run on all the markdown files in the 'content' directory
import os
for root, dirs, files in os.walk('../content'):
    for file in files:
        if file.endswith('.md'):
            extract_links_in_math_blocks(os.path.join(root, file))