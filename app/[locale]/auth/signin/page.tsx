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

  // 临时硬编码启用 Google 登录
  // TODO: 等待 Vercel 环境变量问题解决后，恢复使用环境变量检查
  const isGoogleEnabled = true;

  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignInForm
        callbackUrl={params.callbackUrl}
        isGoogleEnabled={isGoogleEnabled}
      />
    </div>
  );
}
