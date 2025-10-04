import { useStore } from '../store';
import { Settings, ToggleLeft, ToggleRight, RefreshCw } from 'lucide-react';

export default function Admin() {
  const { subscribed, setSubscribed, isLoggedIn, setLoggedIn, reset, child } = useStore();

  return (
    <div className="container mx-auto px-4 max-w-4xl py-8">
      {/* Hero */}
      <div className="bg-gradient-to-br from-olive/20 via-ivory to-sand/20 py-8 px-6 rounded-2xl mb-8 text-center">
        <Settings className="w-12 h-12 text-olive mx-auto mb-4" />
        <h1 className="text-4xl font-bold mb-2" data-testid="heading-admin">Admin Debug Panel</h1>
        <p className="opacity-70">Control application state for testing and development</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Subscription Status Card */}
        <div className="bg-white border-2 border-sand rounded-2xl p-8 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            {subscribed ? (
              <ToggleRight className="w-8 h-8 text-olive" />
            ) : (
              <ToggleLeft className="w-8 h-8 text-espresso/40" />
            )}
            <h3 className="text-2xl font-bold">Subscription</h3>
          </div>
          <div className="bg-gradient-to-br from-olive/5 to-blush/5 rounded-xl p-4 mb-6">
            <p className="text-sm font-medium text-espresso/70 mb-1">Current Status</p>
            <p className="text-2xl font-bold" data-testid="text-subscription-status">
              {subscribed ? (
                <span className="text-olive">✓ Subscribed</span>
              ) : (
                <span className="text-espresso/50">✗ Free</span>
              )}
            </p>
          </div>
          <button
            onClick={() => setSubscribed(!subscribed)}
            className={`w-full px-6 py-3 rounded-xl transition font-semibold ${
              subscribed
                ? 'bg-burnt text-ivory hover:bg-maroon'
                : 'bg-olive text-ivory hover:bg-ochre'
            }`}
            data-testid="button-toggle-subscription"
          >
            {subscribed ? 'Unsubscribe' : 'Subscribe'}
          </button>
        </div>

        {/* Login Status Card */}
        <div className="bg-white border-2 border-sand rounded-2xl p-8 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            {isLoggedIn ? (
              <ToggleRight className="w-8 h-8 text-olive" />
            ) : (
              <ToggleLeft className="w-8 h-8 text-espresso/40" />
            )}
            <h3 className="text-2xl font-bold">Login State</h3>
          </div>
          <div className="bg-gradient-to-br from-olive/5 to-blush/5 rounded-xl p-4 mb-6">
            <p className="text-sm font-medium text-espresso/70 mb-1">Current Status</p>
            <p className="text-2xl font-bold" data-testid="text-login-status">
              {isLoggedIn ? (
                <span className="text-olive">✓ Logged In</span>
              ) : (
                <span className="text-espresso/50">✗ Logged Out</span>
              )}
            </p>
            {isLoggedIn && child.name && (
              <p className="text-sm mt-2 opacity-70">Child: {child.name}</p>
            )}
          </div>
          <button
            onClick={() => setLoggedIn(!isLoggedIn)}
            className={`w-full px-6 py-3 rounded-xl transition font-semibold ${
              isLoggedIn
                ? 'bg-burnt text-ivory hover:bg-maroon'
                : 'bg-olive text-ivory hover:bg-ochre'
            }`}
            data-testid="button-toggle-login"
          >
            {isLoggedIn ? 'Log Out' : 'Log In'}
          </button>
        </div>
      </div>

      {/* Reset Card */}
      <div className="mt-6 bg-gradient-to-br from-burnt/10 to-maroon/10 border-2 border-burnt/30 rounded-2xl p-8 shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <RefreshCw className="w-8 h-8 text-burnt" />
          <h3 className="text-2xl font-bold">Reset Application</h3>
        </div>
        <p className="mb-6 opacity-70">
          Clear all stored data including child profile, answers, subscription status, and login state. This action cannot be undone.
        </p>
        <button
          onClick={reset}
          className="px-8 py-3 bg-burnt text-ivory rounded-xl hover:bg-maroon transition font-semibold"
          data-testid="button-reset"
        >
          Clear All Data
        </button>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blush/10 border-2 border-blush/30 rounded-2xl p-6">
        <p className="text-sm opacity-70">
          <strong>Note:</strong> This admin panel is for development and testing purposes only. 
          Changes made here will persist in your browser's local storage until cleared.
        </p>
      </div>
    </div>
  );
}
