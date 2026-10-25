"use client";

import { useEffect } from "react";

import { SignInForm } from "@/components/app/sign-in-form";
import { useMessages } from "@/i18n/locale";

const SignInContent = ({
  initialMode,
}: {
  initialMode: "sign-in" | "sign-up";
}) => {
  const t = useMessages().auth;

  useEffect(() => {
    document.title = `${t.signIn} · LifeLink`;
  }, [t.signIn]);

  return <SignInForm initialMode={initialMode} />;
};

export { SignInContent };
