import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home/Home';
import { CreateFund } from './pages/CreateFund/CreateFund';
import { FundDetail } from './pages/FundDetail/FundDetail';
import { Dashboard } from './pages/Dashboard/Dashboard';

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateFund />} />
        <Route path="/fund/:id" element={<FundDetail />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}
