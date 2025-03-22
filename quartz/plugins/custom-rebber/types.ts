// Define interfaces for types
interface Node {
    type: string;
    data?: {
        hProperties?: {
            className?: string[] | string;
            'data-callout'?: string;
        };
    };
    value?: string;
    children?: Node[];
}

interface Context {
    math?: {
        [key: string]: (content: string) => string;
    };
    blockquote?: {
        [key: string]: (content: string) => string;
    };
}