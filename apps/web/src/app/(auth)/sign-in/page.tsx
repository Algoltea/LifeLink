import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SignInForm } from "@/components/app/sign-in-form";
import { isAuthenticated } from "@/lib/auth-server";

export const metadata: Metadata = { title: "Sign in" };

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

  return <SignInForm initialMode={initialMode} key={initialMode} />;
};

export default SignInPage;
