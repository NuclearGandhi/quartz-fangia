import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const DiscussionLink: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
    return (
        <div class={displayClass} id="discussion-link">
            מצאתם טעות? תפתחו <a href="https://github.com/NuclearGandhi/technion_second_brain/discussions">discussion</a>! (צריך לפתוח משתמש, די באסה).
        </div>
    )
}

export default (() => DiscussionLink) satisfies QuartzComponentConstructor