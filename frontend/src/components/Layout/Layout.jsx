import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

function Layout() {
  return (
    <div className="min-h-screen flex flex-col" style={{ margin: 0, padding: 0, width: '100%' }}>
      <Navbar />
      <main className="flex-grow pt-16" style={{ margin: 0, padding: 0, width: '100%' }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default Layout;

