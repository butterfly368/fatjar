import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home/Home';
import { CreateFund } from './pages/CreateFund/CreateFund';
import { FundDetail } from './pages/FundDetail/FundDetail';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { ExploreJars } from './pages/ExploreJars/ExploreJars';
import { Admin } from './pages/Admin/Admin';
export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateFund />} />
        <Route path="/fund/:id" element={<FundDetail />} />
        <Route path="/jars" element={<ExploreJars />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<Admin />} />
      </Route>
    </Routes>
  );
}
