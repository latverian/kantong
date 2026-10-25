import { useEffect } from 'react';
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { IntroSplash } from './components/IntroSplash';
import { TabBar } from './components/TabBar';
import { applyTheme } from './lib/theme';
import { AccountDetail } from './screens/AccountDetail';
import { AccountForm } from './screens/AccountForm';
import { Accounts } from './screens/Accounts';
import { AddTransaction } from './screens/AddTransaction';
import { Categories } from './screens/Categories';
import { Favorites } from './screens/Favorites';
import { Home } from './screens/Home';
import { Onboarding } from './screens/Onboarding';
import { Reports } from './screens/Reports';
import { SettingsScreen } from './screens/Settings';
import { Transactions } from './screens/Transactions';
import { DataProvider, useData } from './state/data';
import { ToastProvider } from './state/toast';

const TAB_PATHS = ['/', '/transaksi', '/rekening', '/laporan'];

function ThemeSync() {
  const { settings } = useData();
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => applyTheme(settings.theme);
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [settings.theme]);
  return null;
}

function Shell() {
  const { settings } = useData();
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0); // newer browsers return a Promise here; it must not become the effect cleanup
  }, [pathname]);
  if (!settings.onboarded && pathname !== '/onboarding') return <Navigate to="/onboarding" replace />;
  return (
    <div className="mx-auto min-h-dvh max-w-[480px]">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/transaksi" element={<Transactions />} />
        <Route path="/transaksi/:id" element={<AddTransaction />} />
        <Route path="/tambah" element={<AddTransaction />} />
        <Route path="/rekening" element={<Accounts />} />
        <Route path="/rekening/baru" element={<AccountForm />} />
        <Route path="/rekening/:id" element={<AccountDetail />} />
        <Route path="/rekening/:id/edit" element={<AccountForm />} />
        <Route path="/laporan" element={<Reports />} />
        <Route path="/pengaturan" element={<SettingsScreen />} />
        <Route path="/pengaturan/kategori" element={<Categories />} />
        <Route path="/pengaturan/favorit" element={<Favorites />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {TAB_PATHS.includes(pathname) && <TabBar />}
    </div>
  );
}

const Splash = () => <div className="min-h-dvh bg-bg" />;

export function App() {
  return (
    <HashRouter>
      <ToastProvider>
        <DataProvider fallback={<Splash />}>
          <ThemeSync />
          <Shell />
        </DataProvider>
      </ToastProvider>
      <IntroSplash />
    </HashRouter>
  );
}
