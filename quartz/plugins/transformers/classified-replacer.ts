import { QuartzTransformerPlugin } from "../types"

export interface Options {
  debug: boolean
}

const defaultOptions: Options = {
  debug: false,
}

const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
const idPattern = /\b\d{9}\b/g

function IDValidator(id: string): boolean {
  if (!id || !Number(id) || id.length !== 9 || isNaN(Number(id))) {
    return false;
  }
  let sum = 0;
  for (let i = 0; i < id.length; i++) {
    const incNum = Number(id[i]) * ((i % 2) + 1);
    sum += (incNum > 9) ? incNum - 9 : incNum;
  }
  return (sum % 10 === 0);
}

export const ClassifiedReplacer: QuartzTransformerPlugin<Partial<Options>> = (userOpts) => {
  const opts = { ...defaultOptions, ...userOpts }

  const replaceClassified = (content: string): string => {
    content = content.replace(emailPattern, '**CLASSIFIED**')
    content = content.replace(idPattern, (match) => IDValidator(match) ? '**CLASSIFIED**' : match)
    return content
  }

  return {
    name: "ClassifiedReplacer",
    textTransform(_ctx, src) {
      const content = replaceClassified(src.toString())
      return content
    },
  }
}
