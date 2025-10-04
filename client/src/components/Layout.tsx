import { Link, Outlet, useLocation } from 'react-router-dom';
import { Heart, Home, User, ShoppingBag, Users } from 'lucide-react';
import { useStore } from '../store';

export default function Layout() {
  const location = useLocation();
  const { isLoggedIn, child } = useStore();

  const navLinks = [
    { to: '/', label: 'Home', icon: Home, show: true },
    { to: '/playboard', label: 'Play Board', icon: User, show: isLoggedIn },
    { to: '/shop', label: 'Shop', icon: ShoppingBag, show: isLoggedIn },
    { to: '/find-pros', label: 'Find Pros', icon: Users, show: isLoggedIn },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex flex-col pb-16">
      {/* Top Navigation */}
      <header className="bg-olive text-ivory py-4 shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 max-w-7xl flex items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-xl font-semibold hover:opacity-90 transition"
            data-testid="link-home"
          >
            <Heart className="w-6 h-6" fill="currentColor" />
            Liza & Toph
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.filter(link => link.show).map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-2 hover:text-ochre transition ${
                  isActive(link.to) ? 'text-ochre font-medium' : ''
                }`}
                data-testid={`link-${link.label.toLowerCase().replace(' ', '-')}`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {!isLoggedIn ? (
              <Link
                to="/onboarding"
                className="px-4 py-2 bg-ochre text-ivory rounded-lg hover:bg-burnt transition font-medium"
                data-testid="button-try-free"
              >
                Try for Free
              </Link>
            ) : (
              <div className="text-sm">
                <span className="opacity-80">Hello, </span>
                <span className="font-semibold">{child.name || 'Parent'}</span>
              </div>
            )}
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>
      
      {/* Bottom Navigation (Mobile) - Only show when logged in */}
      {isLoggedIn && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-sand md:hidden z-50">
          <div className="flex items-center justify-around py-3">
            {navLinks.filter(link => link.show).map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex flex-col items-center gap-1 px-4 py-2 ${
                  isActive(link.to) ? 'text-olive' : 'text-espresso/60'
                }`}
                data-testid={`mobile-link-${link.label.toLowerCase().replace(' ', '-')}`}
              >
                <link.icon className="w-5 h-5" />
                <span className="text-xs font-medium">{link.label}</span>
              </Link>
            ))}
          </div>
        </nav>
      )}
      
      {/* Footer */}
      <footer className="bg-sand text-espresso py-8 mt-auto">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid md:grid-cols-3 gap-8 mb-6">
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Liza & Toph
              </h3>
              <p className="text-sm opacity-80">
                Personalized play guidance for every child's unique journey.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/shop" className="hover:text-olive transition">Shop</Link></li>
                <li><Link to="/find-pros" className="hover:text-olive transition">Find Professionals</Link></li>
                <li><Link to="/admin" className="hover:text-olive transition opacity-50">Admin</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-olive transition">Help Center</a></li>
                <li><a href="#" className="hover:text-olive transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-olive transition">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-espresso/20 pt-6 text-center text-sm opacity-70">
            <p>&copy; 2024 Liza & Toph. Privacy-first play guidance for growing families.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
