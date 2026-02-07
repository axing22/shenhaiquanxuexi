"use client";

import { useEffect } from "react";

/**
 * AuthMigrator - Placeholder component for auth migration logic
 * Previously handled AI Hub token migration
 */
export default function AuthMigrator() {
  useEffect(() => {
    // Clean up any old AI Hub tokens if they exist
    if (typeof window !== "undefined") {
      localStorage.removeItem("aiHubToken");
      localStorage.removeItem("aiHubToken_full");
      localStorage.removeItem("aiHubData");
    }
  }, []);

  // This component doesn't render anything
  return null;
}
