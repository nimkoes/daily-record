import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { Suspense, lazy } from 'react';
const Dashboard = lazy(() => import('./components/Dashboard'));
const Calendar = lazy(() => import('./components/Calendar'));
const Timeline = lazy(() => import('./components/Timeline'));
const DiaryViewer = lazy(() => import('./components/DiaryViewer'));

function App() {
  return (
    <Router basename="/daily-record">
      <Layout>
        <Suspense fallback={<div className="p-6 text-gray-500">화면을 불러오는 중...</div>}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="/diary/:year/:month/:day/:slug" element={<DiaryViewer />} />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
}

export default App;