import { useEffect } from "react";

const BRAND = "Ardena for Business";

// Keeps the tab title branded as the user navigates the SPA.
export default function usePageTitle(page) {
  useEffect(() => {
    document.title = page ? `${page} | ${BRAND}` : BRAND;
    return () => {
      document.title = BRAND;
    };
  }, [page]);
}
