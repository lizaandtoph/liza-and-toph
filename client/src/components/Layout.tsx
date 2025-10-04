import { Link, Outlet, useLocation } from 'react-router-dom';
import { Baby, Heart, ShoppingCart, HardHat, MoreHorizontal, User } from 'lucide-react';
import { useStore } from '../store';
import logoImage from '@assets/symbol_orange_mono_1759602921856.png';

export default function Layout() {
  const location = useLocation();
  const { isLoggedIn, child } = useStore();

  const secondaryNavLinks = [
    { to: '/onboarding', label: 'Your Child', icon: Baby },
    { to: '/playboard', label: 'Play Board', icon: Heart },
    { to: '/shop', label: 'Shop', icon: ShoppingCart },
    { to: '/find-pros', label: 'Find Pros', icon: HardHat },
    { to: '/admin', label: 'More', icon: MoreHorizontal },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex flex-col pb-20 md:pb-0">
      {/* Top Navigation */}
      <header className="bg-olive text-ivory py-4 shadow-md fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 max-w-7xl flex items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center gap-3 text-2xl font-semibold hover:opacity-90 transition"
            data-testid="link-home"
          >
            <img src={logoImage} alt="Liza & Toph Logo" className="w-10 h-10" />
            <span className="hidden sm:inline">Liza & Toph</span>
          </Link>

          <div className="flex items-center gap-4">
            {!isLoggedIn ? (
              <Link
                to="/onboarding"
                className="px-6 py-2.5 bg-ochre text-ivory rounded-lg hover:bg-burnt transition font-semibold text-base"
                data-testid="button-try-free"
              >
                Try for Free
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-ochre rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-ivory" />
                </div>
                <span className="font-semibold text-base hidden sm:inline" data-testid="text-user-name">
                  {child.name || 'Parent'}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Secondary Navigation - Desktop (Below Header) */}
      <nav className="hidden md:block bg-white border-b-2 border-sand fixed top-[60px] left-0 right-0 z-40">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-center gap-8 py-3">
            {secondaryNavLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  isActive(link.to)
                    ? 'bg-olive/10 text-olive font-semibold'
                    : 'text-espresso/70 hover:bg-sand/50'
                }`}
                data-testid={`secondary-link-${link.label.toLowerCase().replace(' ', '-')}`}
              >
                <link.icon className="w-5 h-5" />
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="flex-1 pt-[60px] md:pt-[108px]">
        <Outlet />
      </main>

      {/* Secondary Navigation - Mobile (Fixed Bottom) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-sand md:hidden z-50 shadow-lg">
        <div className="flex items-center justify-around py-3">
          {secondaryNavLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex flex-col items-center gap-1 px-3 py-2 transition ${
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
      
      {/* Footer */}
      <footer className="bg-sand text-espresso py-8 mt-auto">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid md:grid-cols-3 gap-8 mb-6">
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <img src={logoImage} alt="Liza & Toph Logo" className="w-5 h-5" />
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
