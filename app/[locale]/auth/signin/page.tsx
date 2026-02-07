import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SignInForm from "@/components/auth/signin-form";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;

  if (session) {
    redirect(params.callbackUrl || "/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignInForm callbackUrl={params.callbackUrl} />
    </div>
  );
}
