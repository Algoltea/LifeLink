"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

const Toaster = () => {
  const { resolvedTheme } = useTheme();

  return (
    <Sonner
      closeButton
      duration={8000}
      position="top-center"
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      toastOptions={{
        classNames: {
          description: "!text-base",
          title: "!text-base !font-semibold",
          toast:
            "!rounded-xl !border-border !bg-raised !text-foreground !text-base",
        },
      }}
    />
  );
};

export { Toaster };
