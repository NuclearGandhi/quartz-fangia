import { classNames } from "../util/lang"
import { joinSegments, pathToRoot } from "../util/path"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const PageTitle: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
  const baseDir = pathToRoot(fileData.slug!)
  const logoPath = joinSegments(baseDir, "static/logo-dark.png")
  return (
      <a class={classNames(displayClass)} href={baseDir} style="overflow-wrap: break-word"><img class="logo" src={logoPath} style="max-width: 90%"></img></a>
  )
}

export default (() => PageTitle) satisfies QuartzComponentConstructor
