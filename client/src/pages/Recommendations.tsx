import { useStore } from '../store';
import { logEvent } from '../analytics';
import rulesData from '../data/rules.json';
import needsToProductsData from '../data/needsToProducts.json';

export default function Recommendations() {
  const { child, answers } = useStore();

  if (!child.ageBand) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">No Recommendations Yet</h2>
        <p>Complete the onboarding first.</p>
      </div>
    );
  }

  const computeNeeds = () => {
    const needs = new Set<string>();
    const allConditions = [...answers.schemas, ...answers.barriers];
    
    rulesData.forEach((rule) => {
      if (allConditions.includes(rule.condition)) {
        needs.add(rule.need);
      }
    });

    return Array.from(needs);
  };

  const needIds = computeNeeds();
  
  const ageMap: Record<string, [number, number]> = {
    'newborn-2': [0, 2],
    '2-5': [2, 5],
    '5-8': [5, 8],
  };
  const [minAge, maxAge] = ageMap[child.ageBand];

  const products = needIds.flatMap((needId) => {
    const items = needsToProductsData[needId as keyof typeof needsToProductsData] || [];
    return items.filter(
      (item) => item.ageMin <= maxAge && item.ageMax >= minAge
    );
  });

  const uniqueProducts = Array.from(
    new Map(products.map((p) => [p.skuId, p])).values()
  ).slice(0, 12);

  const handleClick = (skuId: string, url: string) => {
    logEvent('recommendation_clicked', { sku: skuId });
    const encodedUrl = encodeURIComponent(url);
    window.open(`/api/links?sku=${skuId}&to=${encodedUrl}`, '_blank');
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Recommended for {child.name}</h1>
      <p className="text-lg mb-8">Curated picks based on your Play Board</p>

      {uniqueProducts.length === 0 && (
        <p className="text-center py-12">No recommendations available yet.</p>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {uniqueProducts.map((product) => (
          <div key={product.skuId} className="bg-[#EDE9DC] p-6 rounded shadow-md">
            <h3 className="text-lg font-semibold mb-3">{product.title}</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {product.domains.map((domain) => (
                <span
                  key={domain}
                  className="px-2 py-1 bg-sand text-espresso text-xs rounded"
                >
                  {domain}
                </span>
              ))}
            </div>
            <button
              onClick={() => handleClick(product.skuId, product.url)}
              className="w-full px-4 py-2 bg-olive text-ivory rounded hover:bg-ochre transition"
            >
              View
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
