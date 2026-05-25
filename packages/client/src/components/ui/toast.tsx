import * as React from "react"
import { Toaster as HotToaster } from "react-hot-toast"

const Toaster: React.FC = () => {
  return (
    <HotToaster
      position="bottom-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: "hsl(var(--background))",
          color: "hsl(var(--foreground))",
          border: "1px solid hsl(var(--border))",
          borderRadius: "var(--radius)",
          fontSize: "0.875rem",
        },
        success: {
          iconTheme: {
            primary: "hsl(var(--foreground))",
            secondary: "hsl(var(--background))",
          },
        },
        error: {
          iconTheme: {
            primary: "hsl(var(--foreground))",
            secondary: "hsl(var(--background))",
          },
        },
      }}
    />
  )
}

export { Toaster }
