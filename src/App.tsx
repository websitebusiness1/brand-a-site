import { useEffect } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import Home from '@/pages/Home';
import Shop from '@/pages/Shop';
import ProductPage from '@/pages/ProductPage';
import Checkout from '@/pages/Checkout';
import Confirmation from '@/pages/Confirmation';
import Videos from '@/pages/Videos';
import { LookbookDetail, LookbookIndex } from '@/pages/Lookbooks';
import { useSite } from '@/site/SiteProvider';
import { ContactPage, ShippingPage } from '@/pages/Info';

function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-32 text-center">
      <h1 className="h-display text-4xl">404</h1>
      <p className="mt-4 text-white/60">That page doesn’t exist.</p>
      <Link to="/" className="btn-line mt-8">Back home</Link>
    </div>
  );
}

function ScrollTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => { if (!hash) window.scrollTo(0, 0); }, [pathname, hash]);
  return null;
}

export default function App() {
  const { preview } = useSite();
  return (
    <>
      {preview && <p className="pointer-events-none fixed bottom-3 left-3 z-[80] bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-black">Preview · drafts visible</p>}
      <ScrollTop />
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:slug" element={<ProductPage />} />
          <Route path="/lookbook" element={<LookbookIndex />} />
          <Route path="/lookbook/:slug" element={<LookbookDetail />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/shipping" element={<ShippingPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/order/:orderReference" element={<Confirmation />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}
