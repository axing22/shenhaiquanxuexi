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

  // 从环境变量读取配置，如果有 AUTH_GOOGLE_ID 和 AUTH_GOOGLE_SECRET 就启用
  const isGoogleEnabled: boolean = process.env.AUTH_GOOGLE_ENABLED === "true" ||
                                   process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === "true" ||
                                   (!!process.env.AUTH_GOOGLE_ID && !!process.env.AUTH_GOOGLE_SECRET);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignInForm
        callbackUrl={params.callbackUrl}
        isGoogleEnabled={isGoogleEnabled}
      />
    </div>
  );
}
