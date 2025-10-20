import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Calendar from './components/Calendar';
import Timeline from './components/Timeline';
import DiaryViewer from './components/DiaryViewer';

function App() {
  return (
    <Router basename="/daily-record">
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/diary/:year/:month/:day/:slug" element={<DiaryViewer />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;