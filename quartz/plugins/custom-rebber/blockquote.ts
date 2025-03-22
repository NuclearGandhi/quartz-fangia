const defaultMacro = (innerText: string) => `\\begin{Quotation}\n${innerText}\n\\end{Quotation}\n\n`;

/* Stringify a Blockquote `node`. */
export function blockquote(all: Function, one: Function, ctx: Context, node: Node) {
    if (!node.children) return defaultMacro(all(ctx, node));

    // First child may be an html node, and if it is, then its the title, and we should pass it as
    // the title to the blockquote
    const titleNode = node.children[0].type === 'html' ? node.children[0] : null;
    const titleText = titleNode ? one(ctx, titleNode) : '';

    // Remove the title node from the children
    node.children = node.children.slice(1);


    const innerText = all(ctx, node);

    // Return a latex Callout according to the node.hProperties.data-callout
    if (node.data && node.data.hProperties && node.data.hProperties['data-callout']) {
        const calloutType = node.data.hProperties['data-callout'];
        return calloutLatex(calloutType, titleText, innerText);
    }

    return defaultMacro(innerText);
}

function calloutLatex(calloutType: string, titleText: string, innerText: string) {
    var boxName;
    switch (calloutType) {
        case 'example':
            boxName = 'ExampleBox';
            break;
        case 'notes':
            boxName = 'NotesBox';
            break;
        case 'question':
            boxName = 'QuestionBox';
            break;
        case 'warning':
            boxName = 'WarningBox';
            break;
        case 'error':
            boxName = 'ErrorBox';
            break;
        case 'info':
            boxName = 'InfoBox';
            break;
        default:
            boxName = 'Quotation';
            break;
    }

    return `\\begin{Callout}{${boxName}}[${titleText}]\n${innerText}\\end{Callout}\n\n`;
}