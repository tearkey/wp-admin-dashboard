import { useEffect, useState } from "react";
import type { Device } from "@/lib/cms/theme";

const TABLET_MAX = 1023;
const MOBILE_MAX = 767;

/**
 * Current admin layout tier. Resolved after hydration (server renders the
 * desktop tier) so the markup matches on the first client render.
 */
export function useDeviceTier(): Device {
  const [tier, setTier] = useState<Device>("desktop");

  useEffect(() => {
    const read = () => {
      const w = window.innerWidth;
      setTier(w <= MOBILE_MAX ? "mobile" : w <= TABLET_MAX ? "tablet" : "desktop");
    };
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, []);

  return tier;
}
