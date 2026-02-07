"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useRouter, usePathname } from "@/i18n/routing";
import { useLocale } from "next-intl";

import { MdLanguage } from "react-icons/md";
import { localeNames } from "@/i18n/locale";

export default function ({ isIcon = false }: { isIcon?: boolean }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleSwitchLanguage = (value: string) => {
    if (value !== locale) {
      console.log('切换语言 - 当前locale:', locale);
      console.log('切换语言 - 目标locale:', value);
      console.log('切换语言 - pathname:', pathname);

      // next-intl 的 usePathname 返回的应该是不带语言前缀的路径
      // 直接使用即可
      router.replace(pathname, { locale: value });
    }
  };

  return (
    <Select value={locale} onValueChange={handleSwitchLanguage}>
      <SelectTrigger className="flex items-center gap-2 border-none text-muted-foreground outline-hidden hover:bg-transparent focus:ring-0 focus:ring-offset-0">
        <MdLanguage className="text-xl" />
        {!isIcon && (
          <span className="hidden md:block">{localeNames[locale]}</span>
        )}
      </SelectTrigger>
      <SelectContent className="z-50 bg-background">
        {Object.keys(localeNames).map((key: string) => {
          const name = localeNames[key];
          return (
            <SelectItem className="cursor-pointer px-4" key={key} value={key}>
              {name}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
