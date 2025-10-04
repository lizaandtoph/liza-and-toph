import { useStore } from '../store';

export default function Admin() {
  const { subscribed, setSubscribed, reset } = useStore();

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin Debug</h1>
      
      <div className="bg-[#EDE9DC] p-6 rounded shadow-md space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Subscription Status</h3>
          <p className="mb-3">
            Current: <span className="font-bold">{subscribed ? 'Subscribed' : 'Free'}</span>
          </p>
          <button
            onClick={() => setSubscribed(!subscribed)}
            className="px-4 py-2 bg-olive text-ivory rounded hover:bg-ochre transition"
          >
            Toggle Subscription
          </button>
        </div>

        <hr className="border-sand" />

        <div>
          <h3 className="font-semibold mb-2">Reset Store</h3>
          <button
            onClick={reset}
            className="px-4 py-2 bg-burnt text-ivory rounded hover:bg-maroon transition"
          >
            Clear All Data
          </button>
        </div>
      </div>
    </div>
  );
}
