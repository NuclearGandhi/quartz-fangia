// Define interfaces for types
interface Node {
    type: string;
    url?: string;
    data?: {
        caption?: string;
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