import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Common/Navbar';
import Footer from '../components/Common/Footer';

export default function MainLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
