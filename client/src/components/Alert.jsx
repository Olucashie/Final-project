export default function Alert({ type = 'info', title, message, onClose }) {
  const styles = {
    success: {
      container: 'bg-emerald-50 border border-emerald-200 text-emerald-800',
      icon: (
        <svg className="h-5 w-5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16Zm3.857-9.809a.75.75 0 10-1.214-.882l-3.483 4.79-1.79-1.79a.75.75 0 10-1.06 1.06l2.5 2.5a.75.75 0 001.144-.094l3.903-5.584z" clipRule="evenodd" />
        </svg>
      )
    },
    error: {
      container: 'bg-red-50 border border-red-200 text-red-800',
      icon: (
        <svg className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16Zm-.75-5.25a.75.75 0 011.5 0 .75.75 0 01-1.5 0ZM10 6a.75.75 0 01.75.75v4a.75.75 0 01-1.5 0v-4A.75.75 0 0110 6z" clipRule="evenodd" />
        </svg>
      )
    },
    warning: {
      container: 'bg-amber-50 border border-amber-200 text-amber-800',
      icon: (
        <svg className="h-5 w-5 text-amber-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l6.518 11.6c.75 1.334-.213 3.001-1.743 3.001H3.482c-1.53 0-2.493-1.667-1.743-3.001l6.518-11.6zM10 7a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 7zm0 7a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      )
    },
    info: {
      container: 'bg-sky-50 border border-sky-200 text-sky-800',
      icon: (
        <svg className="h-5 w-5 text-sky-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16ZM9 8.5A1 1 0 1111 8.5 1 1 0 019 8.5ZM8.75 11a.75.75 0 000 1.5h.5v2.25a.75.75 0 001.5 0V12.5h.5a.75.75 0 000-1.5h-2.5z" clipRule="evenodd" />
        </svg>
      )
    }
  }[type] || {};

  return (
    <div className={`w-full rounded-md p-3 flex items-start gap-2 ${styles.container}`} role="alert">
      <div className="shrink-0 mt-0.5">{styles.icon}</div>
      <div className="flex-1">
        {title && <div className="font-semibold mb-0.5">{title}</div>}
        {message && <div className="text-sm leading-5">{message}</div>}
      </div>
      {onClose && (
        <button onClick={onClose} aria-label="Close" className="shrink-0 text-inherit/60 hover:text-inherit">
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 011.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
        </button>
      )}
    </div>
  )
}


