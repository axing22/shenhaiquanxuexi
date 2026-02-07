"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { useTranslations } from "next-intl";
import { authEventBus } from "@/lib/auth-event";

export default function SignModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations("sign_modal");

  // 监听登录事件
  useEffect(() => {
    const unsubscribe = authEventBus.subscribe((event) => {
      if (event.type === 'login-expired' || event.type === 'unauthorized') {
        setIsOpen(true);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // 监听全局登录触发事件
  useEffect(() => {
    const handleOpenSignModal = () => {
      setIsOpen(true);
    };

    window.addEventListener('open-sign-modal', handleOpenSignModal);
    return () => {
      window.removeEventListener('open-sign-modal', handleOpenSignModal);
    };
  }, []);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      console.error("Sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("sign_in_title")}</DialogTitle>
          <DialogDescription>{t("sign_in_description")}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <Button
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full"
          >
            <FcGoogle className="mr-2 h-5 w-5" />
            {isLoading ? t("signing_in") : t("google_sign_in")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
