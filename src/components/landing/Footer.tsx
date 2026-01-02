import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';

export function Footer() {
  return (
    <footer className="py-12 border-t border-border/50 bg-secondary/20">
      <div className="container px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">FarmFlow</span>
          </div>

          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link to="/login" className="hover:text-foreground transition-colors">Login</Link>
            <Link to="/register" className="hover:text-foreground transition-colors">Register</Link>
          </nav>

          <p className="text-sm text-muted-foreground">
            © 2025 FarmFlow. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
