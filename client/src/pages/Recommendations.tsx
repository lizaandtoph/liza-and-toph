import { Link } from "wouter";
import { useStore } from "../store";
import { logEvent } from "../analytics";
import rulesData from "../data/rules.json";
import { Sparkles, ExternalLink, ShoppingBag, Heart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { type Product } from "@shared/schema";
import {
  calculateAgeFromBirthday,
  categorizeAgeBand,
  formatAgeRange,
} from "@shared/ageUtils";
import { useMemo, useEffect } from "react";

// Generate a short, supportive rationale tied to domains (no medical claims)
const generateRationale = (domains: string[], childName: string): string => {
  if (!domains || domains.length === 0)
    return `Supports ${childName}'s growth and exploration.`;

  const map: Record<string, string> = {
    Sensory: `builds ${childName}'s sensory awareness and exploration`,
    "Fine Motor": `strengthens ${childName}'s hand coordination and precision`,
    "Gross Motor": `develops ${childName}'s movement and body control`,
    Cognitive: `encourages ${childName}'s problem-solving and flexible thinking`,
    Language: `supports ${childName}'s communication and language growth`,
    "Social-Emotional": `nurtures ${childName}'s social skills and self-confidence`,
    Creative: `sparks ${childName}'s imagination and creative expression`,
    STEM: `introduces ${childName} to early science and math ideas`,
  };

  const primary = domains[0];
  const key = Object.keys(map).find((k) =>
    primary.toLowerCase().includes(k.toLowerCase()),
  );
  return key
    ? `This ${map[key]}.`
    : `Supports ${childName}'s ${primary.toLowerCase()} development.`;
};

export default function Recommendations() {
  const {
    getActiveChild,
    getAnswers,
    savedItems,
    addSavedItem,
    removeSavedItem,
  } = useStore();
  const child = getActiveChild();
  const answers = child
    ? getAnswers(child.id)
    : { schemas: [], barriers: [], interests: [] };

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Calculate ageBand from birthday if missing (for backwards compatibility)
  const effectiveAgeBand = useMemo(() => {
    if (!child) return "";
    if (child.ageBand) return child.ageBand;
    if (child.birthday) {
      const { totalMonths } = calculateAgeFromBirthday(child.birthday);
      return categorizeAgeBand(totalMonths);
    }
    return "";
  }, [child]);

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  if (!child || !effectiveAgeBand) {
    return (
      <div className="container mx-auto px-4 max-w-4xl py-12 text-center">
        <div className="bg-gradient-to-br from-[#EDE9DC] to-ivory p-12 rounded-2xl shadow-lg">
          <ShoppingBag className="w-16 h-16 text-espresso/30 mx-auto mb-4" />
          <h2 className="text-3xl font-semibold mb-4">
            No Recommendations Yet
          </h2>
          <p className="text-lg mb-6 opacity-70">
            Complete the onboarding to get personalized product recommendations
          </p>
          <Link
            to="/onboarding"
            className="inline-block px-8 py-3 bg-olive text-ivory rounded-xl hover:bg-ochre transition font-semibold"
            data-testid="link-onboarding"
          >
            Start Onboarding
          </Link>
        </div>
      </div>
    );
  }

  const computeNeeds = () => {
    const needs = new Set<string>();
    const allConditions = [...answers.schemas, ...answers.barriers];
    rulesData.forEach((rule) => {
      if (allConditions.includes(rule.condition)) needs.add(rule.need);
    });
    return Array.from(needs);
  };

  const needIds = computeNeeds();

  const normalizeCategories = (categories: any): string[] => {
    if (Array.isArray(categories)) return categories;
    if (typeof categories === "string") {
      // Handle PostgreSQL array format: {"item1","item2","item3"}
      if (categories.startsWith("{") && categories.endsWith("}")) {
        return categories
          .slice(1, -1)
          .split(",")
          .map((c) => c.replace(/^"(.*)"$/, "$1").trim())
          .filter(Boolean);
      }
      // Handle comma-separated string
      return categories
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
    }
    return [];
  };

  // Parse age range from product
  const parseAgeRange = (ageRange: string | null | undefined) => {
    if (!ageRange) return { ageMin: 0, ageMax: 99 };
    const parts = ageRange.split("-");

    const parseAgeValue = (value: string) => {
      const match = value.match(/(\d+\.?\d*)\s*(m|months?|y|years?)?/i);
      if (!match) return 0;

      const n = parseFloat(match[1]);
      const unit = match[2];
      if (
        unit &&
        (unit.startsWith("m") || unit === "months" || unit === "month")
      )
        return n / 12;
      return n;
    };

    if (parts.length === 2) {
      return {
        ageMin: parseAgeValue(parts[0].trim()),
        ageMax: parseAgeValue(parts[1].trim()),
      };
    }

    const single = parseAgeValue(ageRange);
    return { ageMin: single, ageMax: single };
  };

  const ageMap: Record<string, [number, number]> = {
    "newborn-18m": [0, 1.5],
    "18m-3y": [1.5, 3],
    "2-5y": [2, 5],
    "3-6y": [3, 6],
    "4-7y": [4, 7],
    "5-8y": [5, 8],
    "6-9y": [6, 9],
    "7-10y": [7, 10],
    "8-11y": [8, 11],
    "9-12y": [9, 12],
    "10-early-teens": [10, 13],
    "preteens-older-teens": [11, 17],
  };
  const [minAge, maxAge] = ageMap[effectiveAgeBand] || [0, 18];

  // Calculate age from birthday if available, otherwise use stored value
  const childAgeMonths = child.birthday
    ? calculateAgeFromBirthday(child.birthday).totalMonths
    : child.ageMonths || 0;

  // Filter and score products based on age and needs
  const productsWithScores = products
    .map((p) => {
      const { ageMin, ageMax } = parseAgeRange(p.ageRange);

      let relevanceScore = 0;
      const categories = normalizeCategories(p.categories);
      categories.forEach((category) => {
        needIds.forEach((needId) => {
          if (
            category.toLowerCase().includes(needId.toLowerCase()) ||
            needId.toLowerCase().includes(category.toLowerCase())
          ) {
            relevanceScore += 10;
          }
        });
      });

      return { ...p, ageMin, ageMax, relevanceScore };
    })
    .filter((p) => {
      // Use the precise min_age_months and max_age_months if available
      if (p.minAgeMonths != null && p.maxAgeMonths != null) {
        return (
          childAgeMonths >= p.minAgeMonths && childAgeMonths <= p.maxAgeMonths
        );
      }
      // Fallback to parsed age range (in years)
      const childAgeYears = childAgeMonths / 12;
      return (
        childAgeYears >= (p as any).ageMin && childAgeYears <= (p as any).ageMax
      );
    })
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 12);

  // Map to a UI-safe shape and pass TPV tier through (no behavior change elsewhere)
  const uniqueProducts = productsWithScores.map((p) => ({
    skuId: p.id,
    title: p.name,
    brand: p.brand,
    url: p.affiliateUrl || "#",
    ageMin: (p as any).ageMin,
    ageMax: (p as any).ageMax,
    ageRange: p.ageRange,
    domains: normalizeCategories(p.categories),
    imageUrl: p.imageUrl,
    tpvTier: (p as any).tpvTier ?? null,
  }));

  const handleClick = (skuId: string, url: string) => {
    logEvent("recommendation_clicked", { sku: skuId });
    if (!url || url === "#") {
      alert("Product link not available yet. This feature is coming soon!");
      return;
    }
    const encodedUrl = encodeURIComponent(url);
    window.open(`/api/links?sku=${skuId}&to=${encodedUrl}`, "_blank");
  };

  const handleSaveProduct = (
    product: (typeof uniqueProducts)[0],
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();

    const isSaved = savedItems.products.includes(product.title);

    if (isSaved) {
      removeSavedItem("products", product.title);
    } else {
      addSavedItem("products", product.title);
      // Auto-save brand if not already saved
      if (product.brand && !savedItems.brands.includes(product.brand)) {
        addSavedItem("brands", product.brand);
      }
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-olive/20 via-ivory to-blush/20 py-12 mt-6 mb-8">
        <div className="container mx-auto px-4 max-w-6xl text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-8 h-8 text-ochre" />
            <h1
              className="text-4xl md:text-5xl font-bold"
              data-testid="text-recommendations-title"
            >
              Recommended for {child.name}
            </h1>
          </div>
          <p className="text-xl opacity-80">
            Curated picks based on your Play Board and {child.name}'s unique
            development
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl pb-8">
        {uniqueProducts.length === 0 && (
          <div className="bg-gradient-to-br from-[#EDE9DC] to-ivory p-12 rounded-2xl shadow-lg text-center">
            <p className="text-xl opacity-70 mb-6">
              No specific recommendations available yet based on your
              selections.
            </p>
            <Link
              to="/shop"
              className="inline-block px-8 py-3 bg-olive text-ivory rounded-xl hover:bg-ochre transition font-semibold"
              data-testid="link-browse-shop"
            >
              Browse All Products
            </Link>
          </div>
        )}

        {uniqueProducts.length > 0 && (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {uniqueProducts.map((product) => {
                const isSaved = savedItems.products.includes(product.title);
                const rationale = generateRationale(
                  product.domains,
                  child.name,
                );
                const tpvTier = product.tpvTier;

                return (
                  <div
                    key={product.skuId}
                    className="bg-white border-2 border-sand rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden group"
                    data-testid={`card-recommendation-${product.skuId}`}
                  >
                    <div className="aspect-square bg-ivory overflow-hidden border-b-2 border-sand relative">
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        data-testid={`img-product-${product.skuId}`}
                      />

                      {/* Save Button */}
                      <button
                        onClick={(e) => handleSaveProduct(product, e)}
                        className="absolute top-3 left-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-all hover:scale-110"
                        aria-label={isSaved ? "Unsave product" : "Save product"}
                        data-testid={`button-save-${product.skuId}`}
                      >
                        <Heart
                          className={`w-5 h-5 ${isSaved ? "fill-olive text-olive" : "text-espresso"}`}
                        />
                      </button>

                      {/* TPV Badge (Silver/Gold/Platinum) */}
                      {tpvTier && (
                        <div
                          className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold shadow-md ${
                            tpvTier === "Platinum"
                              ? "bg-gray-800 text-white"
                              : tpvTier === "Gold"
                                ? "bg-yellow-500 text-white"
                                : "bg-gray-500 text-white"
                          }`}
                          data-testid={`badge-tpv-${product.skuId}`}
                        >
                          {tpvTier}
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <h3
                        className="text-lg font-bold mb-3 line-clamp-2 min-h-[3.5rem]"
                        data-testid={`text-product-title-${product.skuId}`}
                      >
                        {product.title}
                      </h3>

                      {/* Domain chips (up to 3) */}
                      <div
                        className="flex flex-wrap gap-2 mb-3"
                        data-testid={`domain-chips-${product.skuId}`}
                      >
                        {product.domains.slice(0, 3).map((domain, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-olive/10 text-olive text-xs font-medium rounded-full"
                            data-testid={`chip-domain-${idx}`}
                          >
                            {domain}
                          </span>
                        ))}
                      </div>

                      {/* One-sentence rationale */}
                      <p
                        className="text-sm text-espresso/80 mb-3 leading-relaxed"
                        data-testid={`text-rationale-${product.skuId}`}
                      >
                        {rationale}
                      </p>

                      {product.ageRange && (
                        <p className="text-xs opacity-70 mb-4">
                          Ages {formatAgeRange(product.ageRange)}
                        </p>
                      )}

                      <button
                        onClick={() => handleClick(product.skuId, product.url)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-olive text-ivory rounded-xl hover:bg-ochre transition font-semibold group-hover:shadow-lg"
                        data-testid={`button-view-product-${product.skuId}`}
                      >
                        View Product
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA to Shop */}
            <div className="mt-12 bg-gradient-to-br from-olive/10 to-blush/10 rounded-2xl p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Looking for more?</h2>
              <p className="mb-6 text-lg opacity-80">
                Browse our full collection of developmentally-appropriate toys
                and products
              </p>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-8 py-4 bg-olive text-ivory rounded-xl hover:bg-ochre transition text-lg font-semibold shadow-lg hover:shadow-xl"
                data-testid="button-browse-shop"
              >
                <ShoppingBag className="w-5 h-5" />
                Browse Full Shop
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
