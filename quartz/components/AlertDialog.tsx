import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import "./styles/alertdialog.scss";

const AlertDialog = () => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    const shouldShow = localStorage.getItem("dontShowAgain") !== "true";
    if (shouldShow && dialogRef.current) {
      dialogRef.current.showModal();
    }
  }, []);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem("dontShowAgain", "true");
    }
    dialogRef.current?.close();
  };

  return (
    <dialog ref={dialogRef} class="welcome-dialog">
      <h2>Welcome to My Digital Garden!</h2>
      <p>Here you'll find my collected notes and thoughts.</p>
      <div class="dialog-footer">
        <label class="checkbox-label">
          <input
            type="checkbox"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain((e.target as HTMLInputElement).checked)}
          />
          <span>Don't show again</span>
        </label>
        <button onClick={handleClose}>Got it!</button>
      </div>
    </dialog>
  );
};

export default AlertDialog;
