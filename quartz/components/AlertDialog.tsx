import { QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import alertDialogStyle from "./styles/alertdialog.scss"

// @ts-ignore
import alertDialogScript from "./scripts/alertDialog.inline"

export default (() => {
  function AlertDialog ({ displayClass }: QuartzComponentProps) {
    return (
      <dialog className={`welcome-dialog ${displayClass}`}>
        <h2>הכתובת משתנה בקרוב</h2>
        <p>שלום שלום אני הולך לשנות את הכתובת בקרוב ל- <a href="https://idofangbentov.uk">idofangbentov.uk</a> כי למה לא. אם שמרתם
          את הכתובת <a href="https://nucleargandhi.github.io/quartz-fangia">nucleargandhi.github.io/quartz-fangia</a> אז הכל טוב זה גם יעבוד,
          אבל אם שמרתם את <a href="https://idofangbentov.xyz">idofangbentov.xyz</a>, אז כדאי לשנות כי זה יפסיק לעבוד בקרוב.
          <br /><br />
          תודה רבה,
          <br />
          צוות הפנגייה
        </p>
        <div className="dialog-footer">
          <label className="checkbox-label">
            <input type="checkbox" />
            <span>אל תציג שוב</span>
          </label>
          <button>בסדר בסדר הבנתי</button>
        </div>
      </dialog>
    )
  }
  AlertDialog.afterDOMLoaded = alertDialogScript;
  AlertDialog.css = alertDialogStyle;
  return AlertDialog
}) satisfies QuartzComponentConstructor;
