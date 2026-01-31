import React, { useState, useEffect, useCallback } from "react";
import "./Toast.css";

const TOAST_EVENT = "showToast";

export function toast(message, type = "success") {
  window.dispatchEvent(
    new CustomEvent(TOAST_EVENT, { detail: { message, type } })
  );
}

const Toast = () => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("success");

  const show = useCallback((event) => {
    const { message: msg, type = "success" } = event.detail || {};
    setMessage(msg);
    setVariant(type);
    setVisible(true);
  }, []);

  useEffect(() => {
    window.addEventListener(TOAST_EVENT, show);
    return () => window.removeEventListener(TOAST_EVENT, show);
  }, [show]);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => setVisible(false), 3500);
    return () => clearTimeout(timer);
  }, [visible, message]);

  if (!visible) return null;

  const icon =
    variant === "success" ? (
      <span className="toast-icon toast-icon-success">✓</span>
    ) : variant === "error" ? (
      <span className="toast-icon toast-icon-error">!</span>
    ) : (
      <span className="toast-icon toast-icon-info">i</span>
    );

  return (
    <div
      className={`toast-notification toast-${variant}`}
      role="alert"
      aria-live="polite"
    >
      {icon}
      <span className="toast-message">{message}</span>
    </div>
  );
};

export default Toast;
