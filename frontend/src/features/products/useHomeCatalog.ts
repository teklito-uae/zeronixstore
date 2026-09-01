import { useEffect, useState } from "react";
import { fetchBrands, fetchCategories } from "./api";
import type { Brand, Category } from "./types";

// Homepage category strip: same curated slug list the mock catalog used, now
// resolved against whatever the API actually returns — categories that
// don't exist yet are silently skipped instead of breaking the page.
const HOME_CATEGORY_SLUGS = [
  "laptops",
  "desktops",
  "graphics-cards",
  "processors",
  "monitors",
  "storage",
  "accessories",
  "keyboards-mice",
  "headsets",
  "gaming-laptops",
  "gaming-pcs",
  "webcams-streaming",
];

function flattenCategories(tree: Category[]): Map<string, Category> {
  const map = new Map<string, Category>();
  function walk(list: Category[]) {
    for (const cat of list) {
      map.set(cat.slug, cat);
      if (cat.children?.length) walk(cat.children);
    }
  }
  walk(tree);
  return map;
}

interface HomeEssentials {
  loading: boolean;
  homeCategories: Category[];
  brands: Brand[];
}

/**
 * The two requests small/fast enough (and needed high enough on the page)
 * to fetch eagerly on mount. Per-carousel product data is fetched lazily
 * instead — see useLazyProducts — so the homepage doesn't fire a burst of
 * 6+ parallel requests before the user has scrolled anywhere.
 */
export function useHomeCatalog(): HomeEssentials {
  const [loading, setLoading] = useState(true);
  const [homeCategories, setHomeCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      fetchCategories().catch(() => [] as Category[]),
      fetchBrands().catch(() => [] as Brand[]),
    ]).then(([tree, brandList]) => {
      if (cancelled) return;
      const flat = flattenCategories(tree);
      setHomeCategories(
        HOME_CATEGORY_SLUGS.map((slug) => flat.get(slug)).filter((c): c is Category => Boolean(c)),
      );
      setBrands(brandList);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return { loading, homeCategories, brands };
}
