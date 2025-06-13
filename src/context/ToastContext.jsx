import React, {createContext, useContext, useState, useCallback} from "react";

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export default function ToastProvider({children}) {
  const [message, setMessage] = useState(null);

  const showToast = useCallback((msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  }, []);

  return (
    <ToastContext.Provider value={{showToast}}>
      {children}
      {message && (
        <div className="fixed bottom-4 right-4 bg-black text-white px-4 py-2 rounded shadow-lg z-50">
          {message}
        </div>
      )}
    </ToastContext.Provider>
  );
}
