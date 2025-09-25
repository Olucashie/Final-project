import React from 'react'

export default function Modal({ open, title, children, onClose, onConfirm, confirmText = 'Confirm', cancelText = 'Cancel', type = 'info' }) {
  if (!open) return null

  const isConfirm = typeof onConfirm === 'function'
  const headerColor = type === 'error' ? 'text-red-600' : type === 'success' ? 'text-green-600' : 'text-black'
  const confirmBtnClass = type === 'error'
    ? 'bg-red-600 hover:bg-red-700'
    : 'bg-black hover:bg-black/90'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative mx-4 w-full max-w-md rounded-lg bg-white shadow-lg">
        <div className="p-4 border-b border-black/10">
          <h3 className={`text-lg font-semibold ${headerColor}`}>{title}</h3>
        </div>
        <div className="p-4 text-black/80">
          {children}
        </div>
        <div className="p-4 border-t border-black/10 flex justify-end gap-2">
          {isConfirm ? (
            <>
              <button onClick={onClose} className="px-4 py-2 rounded-md border border-black/20">
                {cancelText}
              </button>
              <button onClick={onConfirm} className={`px-4 py-2 rounded-md text-white ${confirmBtnClass}`}>
                {confirmText}
              </button>
            </>
          ) : (
            <button onClick={onClose} className="px-4 py-2 rounded-md bg-black text-white hover:bg-black/90">OK</button>
          )}
        </div>
      </div>
    </div>
  )
}
