const defaultMacro = (innerText: string) => {
    if (innerText.trim() === '') return '';
    return `\\begin{SimpleBlockquote}\n${innerText}\n\\end{SimpleBlockquote}\n\n`;
};

/* Stringify a Blockquote `node`. */
export function blockquote(all: Function, one: Function, ctx: Context, node: Node) {
    if (!node.children) {
        return defaultMacro(all(ctx, node));
    }

    // First child may be an html node, and if it is, then its the title, and we should pass it as
    // the title to the blockquote
    const titleNode = node.children[0].type === 'html' ? node.children[0] : null;
    const titleText = titleNode ? one(ctx, titleNode) : '';

    // Remove the title node from the children if there is a title
    if (titleNode) {
        node.children.shift();
    }

    const innerText = all(ctx, node);
    
    if (node.data && node.data.latexIgnore) {
        // If the node is marked to be ignored, return empty string
        return '';
    }

    // Return a latex Callout according to the node.hProperties.data-callout
    if (node.data && node.data.hProperties && node.data.hProperties['data-callout']) {
        const calloutType = node.data.hProperties['data-callout'];
        return calloutLatex(calloutType, titleText, innerText);
    }

    return defaultMacro(innerText);
}

function calloutLatex(calloutType: string, titleText: string, innerText: string) {
    if (innerText.trim() === '') return '';
    var boxName;
    switch (calloutType) {
        case 'example':
            boxName = 'ExampleBox';
            break;
        case 'notes':
        case 'note':
            boxName = 'NotesBox';
            break;
        case 'question':
            boxName = 'QuestionBox';
            break;
        case 'warning':
            boxName = 'WarningBox';
            break;
        case 'error':
        case 'failure':
        case 'danger':
        case 'bug':
            boxName = 'ErrorBox';
            break;
        case 'info':
        case 'todo':
            boxName = 'InfoBox';
            break;
        case 'success':
            boxName = 'SuccessBox';
            break;
        case 'tip':
            boxName = 'TipBox';
            break;
        case 'abstract':
        case 'new':
            boxName = 'AbstractBox';
            break;
        case 'theorem':
            boxName = 'TheoremBox';
            break;
        case 'quote':
            boxName = 'QuotationBox';
            break;
        default:
            return defaultMacro(innerText);
    }

    return `\\begin{Callout}{${boxName}}[${titleText}]\n${innerText}\\end{Callout}\n\n`;
}