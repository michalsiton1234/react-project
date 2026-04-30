import React from 'react';
import { Outlet } from 'react-router-dom';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* כאן בדרך כלל שמים Navbar או Sidebar */}
      <header>
        <nav>
          {/* תפריט ניווט לדוגמה */}
        </nav>
      </header>

      <main>
        {/* ה-Outlet הוא המקום שבו יוצגו הדפים השונים שלכן */}
        <Outlet />
      </main>

      <footer>
        {/* כותרת תחתונה */}
      </footer>
    </div>
  );
};

export default Layout;