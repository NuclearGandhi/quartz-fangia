const handleNav = () => {
  const dialog = document.querySelector('.welcome-dialog') as HTMLDialogElement | null;
  const shouldShow = localStorage.getItem("dontShowAgain") !== "true";
  if (shouldShow && dialog) {
    dialog.showModal();
  }
};

const handleClose = () => {
  const dialog = document.querySelector('.welcome-dialog') as HTMLDialogElement | null;
  const checkbox = document.querySelector('.checkbox-label input[type="checkbox"]') as HTMLInputElement | null;
  if (checkbox?.checked) {
    localStorage.setItem("dontShowAgain", "true");
  }
  dialog?.close();
};

document.addEventListener('nav', handleNav);

document.addEventListener('DOMContentLoaded', () => {
  const closeButton = document.querySelector('.welcome-dialog button') as HTMLButtonElement | null;
  closeButton?.addEventListener('click', handleClose);
});
