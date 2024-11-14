import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UilCheckCircle, 
  UilExclamationCircle, 
  UilInfoCircle 
} from '@iconscout/react-unicons';

const Toast = ({ message, type = 'info', onClose }) => {
  const icons = {
    success: <UilCheckCircle className="w-5 h-5 text-green-500" />,
    error: <UilExclamationCircle className="w-5 h-5 text-red-500" />,
    info: <UilInfoCircle className="w-5 h-5 text-blue-500" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed bottom-24 right-4 bg-dark/90 backdrop-blur-lg px-4 py-3 rounded-lg 
                shadow-lg border border-light/20 flex items-center space-x-3"
    >
      {icons[type]}
      <span className="text-sm">{message}</span>
    </motion.div>
  );
};

export const ToastContainer = ({ toasts, removeToast }) => (
  <div className="fixed bottom-24 right-4 z-50">
    <AnimatePresence>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </AnimatePresence>
  </div>
);

export default Toast; 