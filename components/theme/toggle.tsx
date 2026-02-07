"use client";

import { BsMoonStars, BsSun } from "react-icons/bs";
import { useState, useEffect } from "react";

export default function () {
  const [theme, setTheme] = useState<string>("light");

  useEffect(() => {
    // Load theme from localStorage on mount
    const savedTheme = localStorage.getItem("theme") || process.env.NEXT_PUBLIC_DEFAULT_THEME || "light";
    setTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  const handleThemeChange = function (_theme: string) {
    if (_theme === theme) {
      return;
    }

    setTheme(_theme);
    localStorage.setItem("theme", _theme);
    document.documentElement.classList.toggle("dark", _theme === "dark");
  };

  return (
    <div className="flex items-center gap-x-2 px-2">
      {theme === "dark" ? (
        <BsSun
          className="cursor-pointer text-lg text-muted-foreground"
          onClick={() => handleThemeChange("light")}
          width={80}
          height={20}
        />
      ) : (
        <BsMoonStars
          className="cursor-pointer text-lg text-muted-foreground"
          onClick={() => handleThemeChange("dark")}
          width={80}
          height={20}
        />
      )}
    </div>
  );
}
