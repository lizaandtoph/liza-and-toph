import { Link, Outlet } from 'react-router-dom';
import { Heart } from 'lucide-react';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-olive text-ivory py-4 shadow-md">
        <div className="container mx-auto px-4 max-w-screen-md flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl font-semibold">
            <Heart className="w-6 h-6" />
            Liza & Toph
          </Link>
        </div>
      </header>
      
      <main className="flex-1">
        <div className="container mx-auto px-4 max-w-screen-md py-8">
          <Outlet />
        </div>
      </main>
      
      <footer className="bg-sand text-espresso py-6 mt-auto">
        <div className="container mx-auto px-4 max-w-screen-md text-center text-sm">
          <p>&copy; 2024 Liza & Toph. Privacy-first play guidance.</p>
        </div>
      </footer>
    </div>
  );
}
