import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Search from './Search';
import { loadMemo } from '../utils/memoLoader';
import ReactMarkdown from 'react-markdown';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // 메모 관련 상태
  const [memo, setMemo] = useState<string>('');
  const [memoHovered, setMemoHovered] = useState(false);
  const [memoFixed, setMemoFixed] = useState(false);

  // 메모 로드
  useEffect(() => {
    const loadMemoData = async () => {
      try {
        const memoContent = await loadMemo();
        setMemo(memoContent);
      } catch (error) {
        console.error('메모 로드 실패:', error);
      }
    };
    loadMemoData();
  }, []);

  // 메모 토글 함수
  const toggleMemo = () => {
    setMemoFixed(!memoFixed);
  };

  // 메모 마우스 오버 핸들러
  const handleMemoMouseEnter = () => {
    setMemoHovered(true);
  };

  const handleMemoMouseLeave = () => {
    if (!memoFixed) {
      setMemoHovered(false);
    }
  };

  // 말풍선 마우스 이벤트 핸들러
  const handleTooltipMouseEnter = () => {
    setMemoHovered(true);
  };

  const handleTooltipMouseLeave = () => {
    if (!memoFixed) {
      setMemoHovered(false);
    }
  };

  const navigation = [
    { name: '홈', href: '/', icon: '🏠' },
    { name: '캘린더', href: '/calendar', icon: '📅' },
    { name: '리스트', href: '/timeline', icon: '📝' },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 네비게이션 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* 로고 */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <span className="text-2xl">📖</span>
                <span className="text-xl font-bold text-gray-900">DR (Daily Record)</span>
              </Link>
            </div>

            {/* 데스크톱 네비게이션 */}
            <div className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>

            {/* 검색 및 모바일 메뉴 */}
            <div className="flex items-center space-x-4">
              {/* 검색 */}
              <Search />
              
              {/* 모바일 메뉴 버튼 */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
            
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                    isActive(item.href)
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Floating 메모 버튼 */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={toggleMemo}
          onMouseEnter={handleMemoMouseEnter}
          onMouseLeave={handleMemoMouseLeave}
          className="w-14 h-14 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
          title="메모"
        >
          <span className="text-2xl">📝</span>
        </button>

        {/* 말풍선 미리보기 */}
        {(memoHovered || memoFixed) && (
          <div 
            className="absolute bottom-16 right-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden"
            onMouseEnter={handleTooltipMouseEnter}
            onMouseLeave={handleTooltipMouseLeave}
          >
            {/* 말풍선 꼬리 */}
            <div className="absolute bottom-[-8px] right-6 w-4 h-4 bg-white border-r border-b border-gray-200 transform rotate-45"></div>
            
            <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-lg mr-2">📝</span>
                  <h3 className="text-sm font-semibold text-gray-800">메모</h3>
                </div>
                <div className="flex items-center">
                  <button
                    onClick={toggleMemo}
                    className="text-lg hover:bg-gray-100 rounded p-1 transition-colors"
                    title={memoFixed ? '고정 해제' : '고정하기'}
                  >
                    {memoFixed ? '📍' : '📌'}
                  </button>
                </div>
              </div>
            </div>
            <div className="p-4 max-h-64 overflow-y-auto">
              <div className="text-sm text-gray-700">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => <h1 className="text-base font-bold text-gray-900 mb-2 border-b border-gray-200 pb-1">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-sm font-semibold text-gray-800 mb-1">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-sm font-medium text-gray-800 mb-1">{children}</h3>,
                    p: ({ children }) => <p className="text-sm text-gray-600 mb-2 leading-relaxed">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc list-inside text-sm text-gray-600 mb-2 space-y-1 ml-2">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside text-sm text-gray-600 mb-2 space-y-1 ml-2">{children}</ol>,
                    li: ({ children }) => <li className="text-sm text-gray-600 leading-relaxed">{children}</li>,
                    code: ({ children }) => <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                    blockquote: ({ children }) => <blockquote className="border-l-2 border-yellow-300 pl-2 italic text-sm text-gray-500 my-2 bg-yellow-50 py-1">{children}</blockquote>,
                    strong: ({ children }) => <strong className="font-semibold text-gray-800">{children}</strong>,
                  }}
                >
                  {memo}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 메모 오버레이 - 제거됨 */}
      {false && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={toggleMemo}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">📝</span>
                  <h3 className="text-xl font-semibold text-gray-800">메모</h3>
                </div>
                <button
                  onClick={toggleMemo}
                  className="text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-full"
                  title="메모 닫기"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="text-gray-700">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => <h1 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-xl font-semibold text-gray-800 mb-3">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-lg font-medium text-gray-800 mb-2">{children}</h3>,
                    p: ({ children }) => <p className="text-gray-600 mb-3 leading-relaxed">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc list-inside text-gray-600 mb-3 space-y-1 ml-4">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside text-gray-600 mb-3 space-y-1 ml-4">{children}</ol>,
                    li: ({ children }) => <li className="text-gray-600 leading-relaxed">{children}</li>,
                    code: ({ children }) => <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">{children}</code>,
                    blockquote: ({ children }) => <blockquote className="border-l-4 border-yellow-300 pl-4 italic text-gray-500 my-3 bg-yellow-50 py-2">{children}</blockquote>,
                    strong: ({ children }) => <strong className="font-semibold text-gray-800">{children}</strong>,
                  }}
                >
                  {memo}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
