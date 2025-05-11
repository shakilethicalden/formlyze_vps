'use client'
import React from 'react';

const Modal = ({ children, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="relative">
        <button 
          onClick={onClose}
          className="absolute -top-10 cursor-pointer -right-10 text-white text-2xl"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;