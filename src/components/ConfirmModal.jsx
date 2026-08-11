export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[var(--radius-card)] shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 text-center">
          <h3 className="font-heading text-lg font-bold text-text mb-2">
            {title}
          </h3>
          <p className="text-sm text-text/70 leading-relaxed mb-6">
            {message}
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={onConfirm}
              className="w-full py-2.5 rounded-[var(--radius-button)] bg-warning text-white text-sm font-semibold hover:bg-warning/90 transition-all"
            >
              {confirmText}
            </button>
            <button
              onClick={onCancel}
              className="w-full py-2.5 rounded-[var(--radius-button)] border border-text/15 text-text/70 text-sm font-medium hover:bg-text/5 transition-all"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
