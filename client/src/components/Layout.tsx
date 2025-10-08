import { Link, useLocation } from 'wouter';
import { Baby, Heart, ShoppingCart, HardHat, Settings as SettingsIcon, User, ChevronDown, Plus, AlertCircle, X, LogOut } from 'lucide-react';
import { useStore } from '../store';
import { useAuth } from '../hooks/useAuth';
import { queryClient } from '@/lib/queryClient';
import logoImage from '@assets/symbol_orange_mono_1759602921856.png';
import { useState, useEffect, useRef } from 'react';

const CURRENT_QUESTIONNAIRE_VERSION = 2;

export default function Layout({ children: pageContent }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { children, getActiveChild, setActiveChild, getAnswers, dismissedQuestionnaireUpdates, dismissQuestionnaireUpdate, reset, parentAccount, updateParentAccount, setParentAccount, loadChildren } = useStore();
  const { user, isAuthenticated } = useAuth();
  const [showChildDropdown, setShowChildDropdown] = useState(false);
  const activeChild = getActiveChild();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const activeChildAnswers = activeChild ? getAnswers(activeChild.id) : null;
  const needsQuestionnaireUpdate = activeChildAnswers && 
    (!activeChildAnswers.questionnaire_version || activeChildAnswers.questionnaire_version < CURRENT_QUESTIONNAIRE_VERSION);
  const dismissedVersion = activeChild ? (dismissedQuestionnaireUpdates[activeChild.id] || 0) : 0;
  const showUpdateBanner = needsQuestionnaireUpdate && dismissedVersion < CURRENT_QUESTIONNAIRE_VERSION;

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all cached data
      reset(); // Clear Zustand store
      queryClient.clear(); // Clear all React Query cache
      setLocation('/');
    }
  };

  // Load children from database when authenticated
  useEffect(() => {
    const loadChildrenFromDb = async () => {
      if (isAuthenticated && user) {
        try {
          const response = await fetch('/api/auth/me');
          if (response.ok) {
            const data = await response.json();
            const childrenData = (data.children || []).map((c: any) => ({
              id: c.id,
              name: c.name,
              birthday: c.birthday || '',
              ageYears: c.ageYears || 0,
              ageMonths: c.ageMonths || 0,
              ageBand: c.ageBand || '',
            }));

            const answersMap: Record<string, any> = {};
            (data.children || []).forEach((child: any) => {
              answersMap[child.id] = {
                schemas: child.schemas || [],
                barriers: child.barriers || [],
                interests: child.interests || [],
                milestones: child.milestones || {},
                ...(child.fullQuestionnaire ? { fullQuestionnaire: child.fullQuestionnaire } : {}),
                questionnaire_version: child.questionnaireVersion || 1,
              };
            });

            // Always call loadChildren to set childrenLoaded flag, even if array is empty
            loadChildren(childrenData, answersMap);
          }
        } catch (error) {
          console.error('Failed to load children:', error);
        }
      }
    };

    loadChildrenFromDb();
  }, [isAuthenticated, user, loadChildren]);

  // Sync parent account data from auth user
  useEffect(() => {
    if (isAuthenticated && user) {
      if (!parentAccount) {
        // If no parent account exists, create one from auth user data
        // Use setTimeout to defer state update until after render
        setTimeout(() => {
          setParentAccount({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            role: user.role || 'parent',
            password: ''
          });
        }, 0);
      } else {
        // Update parent account with auth user data, especially the role
        if (user.firstName !== parentAccount.firstName || 
            user.lastName !== parentAccount.lastName || 
            user.email !== parentAccount.email ||
            user.role !== parentAccount.role) {
          // Use setTimeout to defer state update until after render
          setTimeout(() => {
            updateParentAccount({
              firstName: user.firstName || parentAccount.firstName,
              lastName: user.lastName || parentAccount.lastName,
              email: user.email || parentAccount.email,
              role: user.role || parentAccount.role
            });
          }, 0);
        }
      }
    }
  }, [isAuthenticated, user, parentAccount, setParentAccount, updateParentAccount]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowChildDropdown(false);
      }
    };

    if (showChildDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showChildDropdown]);

  const secondaryNavLinks = [
    { to: '/your-child', label: 'Your Child', icon: Baby },
    { to: '/playboard', label: 'Play Board', icon: Heart },
    { to: '/shop', label: 'Shop', icon: ShoppingCart },
    { to: '/pros', label: 'Professionals', icon: HardHat },
    { to: '/settings', label: 'Settings', icon: SettingsIcon },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location === '/';
    return location.startsWith(path);
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
            {!isAuthenticated ? (
              <Link
                to="/login"
                className="w-10 h-10 bg-ochre rounded-full flex items-center justify-center hover:bg-burnt transition"
                data-testid="link-sign-in"
              >
                <User className="w-6 h-6 text-ivory" />
              </Link>
            ) : (
              <div className="flex items-center gap-3 relative">
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowChildDropdown(!showChildDropdown)}
                    className="flex items-center gap-2 px-3 py-2 bg-ivory/10 hover:bg-ivory/20 rounded-lg transition"
                    data-testid="button-child-selector"
                  >
                    <div className="w-8 h-8 bg-ochre rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-ivory" />
                    </div>
                    {children.length > 0 && (
                      <span className="font-semibold text-base hidden sm:inline" data-testid="text-active-child-name">
                        {activeChild?.name || 'Select Child'}
                      </span>
                    )}
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {showChildDropdown && (
                    <div className="absolute top-full right-0 mt-2 bg-white text-espresso rounded-lg shadow-lg border-2 border-sand min-w-[200px] z-50">
                      <div className="p-2">
                        {children.length > 0 && (
                          <>
                            <p className="text-xs uppercase tracking-wide text-espresso/60 px-3 py-2 font-semibold">
                              Your Children
                            </p>
                            {children.map((child) => (
                              <button
                                key={child.id}
                                onClick={() => {
                                  setActiveChild(child.id);
                                  setShowChildDropdown(false);
                                }}
                                className={`w-full text-left px-3 py-2 rounded-lg transition flex items-center gap-2 ${
                                  activeChild?.id === child.id
                                    ? 'bg-olive/10 text-olive font-semibold'
                                    : 'hover:bg-sand/50'
                                }`}
                                data-testid={`option-child-${child.id}`}
                              >
                                <User className="w-4 h-4" />
                                <span>{child.name}</span>
                                {child.ageBand && (
                                  <span className="text-xs opacity-70 ml-auto">
                                    {child.ageBand.replace('-', ' - ')}
                                  </span>
                                )}
                              </button>
                            ))}
                            <div className="border-t border-sand my-2"></div>
                          </>
                        )}
                        <Link
                          to="/onboarding"
                          onClick={() => setShowChildDropdown(false)}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-olive/10 transition flex items-center gap-2 text-olive font-semibold"
                          data-testid="button-add-child"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Another Child</span>
                        </Link>
                        <Link
                          to="/settings"
                          onClick={() => setShowChildDropdown(false)}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-olive/10 transition flex items-center gap-2"
                          data-testid="button-settings-dropdown"
                        >
                          <User className="w-4 h-4" />
                          <span>Settings</span>
                        </Link>
                        <div className="border-t border-sand my-2"></div>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-burnt/10 transition flex items-center gap-2 text-burnt font-semibold"
                          data-testid="button-logout"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Secondary Navigation - Desktop (Below Header) */}
      <nav className="hidden md:block bg-white border-b-2 border-sand fixed top-[60px] left-0 right-0 z-40">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-center gap-8 py-4">
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
      
      {/* Questionnaire Update Banner */}
      {isAuthenticated && showUpdateBanner && (
        <div className="fixed top-[60px] md:top-[108px] left-0 right-0 bg-ochre text-ivory py-3 px-4 shadow-md z-30">
          <div className="container mx-auto max-w-7xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm sm:text-base font-medium">
                <strong>New questionnaire available!</strong> Update {activeChild?.name}'s profile to get more personalized recommendations.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/settings"
                className="px-4 py-2 bg-ivory text-olive rounded-lg hover:bg-sand transition font-semibold text-sm whitespace-nowrap"
                data-testid="button-update-questionnaire"
              >
                Update Now
              </Link>
              <button
                onClick={() => activeChild && dismissQuestionnaireUpdate(activeChild.id, CURRENT_QUESTIONNAIRE_VERSION)}
                className="p-2 hover:bg-ivory/10 rounded-lg transition"
                aria-label="Dismiss"
                data-testid="button-dismiss-update-banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={`flex-1 pt-[60px] md:pt-[108px] ${isAuthenticated && showUpdateBanner ? 'mt-[52px]' : ''}`}>
        {pageContent}
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
                The first evidence-based platform for childhood development and play.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/shop" className="hover:text-olive transition">Shop</Link></li>
                <li><Link to="/find-pros" className="hover:text-olive transition">Find Professionals</Link></li>
                <li><Link to="/settings" className="hover:text-olive transition">My Account</Link></li>
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
            <p>&copy; 2025 Liza & Toph.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
