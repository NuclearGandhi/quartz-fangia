import { joinSegments} from "../util/path"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const DiscussionLink: QuartzComponent = ({ cfg, fileData, displayClass }: QuartzComponentProps) => {

    const url = new URL(`https://${cfg.baseUrl ?? "example.com"}`)

    // Url of current page
    const socialUrl =
        fileData.slug === "404" ? url.toString() : joinSegments(url.toString(), fileData.slug!)

    return (
        <div className={displayClass} id="discussion-link">
            {`מצאתם טעות? שלחו `}<a href={`#tally-open=wd8bAK&page=${socialUrl}&tally-auto-close=1000`}>הודעה קצרה</a>.
            <br />
            {`תודה לינאי וגיל ששיכנעו אותי להוסיף את זה...`}
        </div>
    )
}

export default (() => DiscussionLink) satisfies QuartzComponentConstructor