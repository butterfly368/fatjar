import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export function Layout() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 'var(--nav-height)' }}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
