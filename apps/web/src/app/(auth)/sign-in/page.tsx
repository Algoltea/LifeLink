import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/i18n/messages/en/auth";
import { isAuthenticated } from "@/lib/auth-server";

import { SignInContent } from "./sign-in-content";

export const metadata: Metadata = { title: auth.signIn };

const SignInPage = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  if (await isAuthenticated()) {
    redirect("/");
  }

  const { mode } = await searchParams;
  const initialMode = mode === "sign-up" ? "sign-up" : "sign-in";

  return <SignInContent initialMode={initialMode} key={initialMode} />;
};

export default SignInPage;
