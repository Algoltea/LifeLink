import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SignInForm } from "@/components/app/sign-in-form";
import { isAuthenticated } from "@/lib/auth-server";

export const metadata: Metadata = { title: "Sign in" };

const SignInPage = async () => {
  if (await isAuthenticated()) {
    redirect("/");
  }

  return <SignInForm />;
};

export default SignInPage;
