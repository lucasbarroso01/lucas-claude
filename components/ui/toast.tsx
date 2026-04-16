"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: "hsl(224 15% 11%)",
          color: "hsl(210 40% 98%)",
          border: "1px solid hsl(217.2 32.6% 17.5%)",
          borderRadius: "0.5rem",
          fontSize: "0.875rem",
        },
        success: {
          iconTheme: {
            primary: "#C2185B",
            secondary: "#fff",
          },
        },
        error: {
          iconTheme: {
            primary: "#ef4444",
            secondary: "#fff",
          },
        },
      }}
    />
  );
}
