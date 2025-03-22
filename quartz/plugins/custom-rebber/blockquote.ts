const defaultMacro = (innerText: string) => `\\begin{Quotation}\n${innerText}\n\\end{Quotation}\n\n`;

/* Stringify a Blockquote `node`. */
export function blockquote(all: Function, ctx: Context, node: Node) {
    const innerText = all(ctx, node);

    // Return a latex Callout according to the node.hProperties.data-callout
    if (node.data && node.data.hProperties && node.data.hProperties['data-callout']) {
        const calloutType = node.data.hProperties['data-callout'];
        return calloutLatex(calloutType, innerText);
    }

    return defaultMacro(innerText);
}

function calloutLatex(calloutType: string, innerText: string) {
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

    return `\\begin{Callout}{${boxName}}{Title}\n${innerText}\\end{Callout}\n\n`;
}