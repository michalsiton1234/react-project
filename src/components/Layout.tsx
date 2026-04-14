import React from 'react';
import { Outlet } from 'react-router-dom';

const Layout: React.FC = () => {
  return (
    <div className="layout-container">
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