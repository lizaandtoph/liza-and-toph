import { useStore } from '../store';
import { logEvent } from '../analytics';

export default function PaywallNotice() {
  const setSubscribed = useStore(state => state.setSubscribed);

  const handleSubscribe = () => {
    logEvent('subscribe_clicked');
    setSubscribed(true);
  };

  return (
    <div className="bg-blush/20 border-2 border-blush rounded p-6 text-center my-6">
      <h3 className="text-xl font-semibold mb-2">Unlock Full Insights</h3>
      <p className="mb-4">Subscribe to see the developmental journey and personalized insights.</p>
      <button
        onClick={handleSubscribe}
        className="bg-olive text-ivory px-6 py-2 rounded hover:bg-ochre transition"
      >
        Subscribe
      </button>
    </div>
  );
}
