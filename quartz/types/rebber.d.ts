declare module 'rebber' {
  /**
   * Convert an MDAST (Markdown Abstract Syntax Tree) to LaTeX
   * @param ast The MDAST to convert
   * @returns LaTeX string representation of the MDAST
   */
  function rebber(ast: any): string;
  export = rebber;
}
