import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadAllRecords } from '../utils/diaryLoader';
import { searchRecords } from '../utils/searchUtils';
import { Record, SearchResult } from '../types/diary';
import { getTypeColors } from '../utils/typeColors';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [records, setRecords] = useState<Record[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadAllRecords().then(setRecords);
  }, []);

  useEffect(() => {
    if (query.trim()) {
      const searchResults = searchRecords(records, query);
      setResults(searchResults.slice(0, 5)); // 최대 5개 결과만 표시
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query, records]);

  const handleResultClick = (record: Record) => {
    const [year, month, day] = record.date.split('-');
    navigate(`/diary/${year}/${month}/${day}/${record.slug}`);
    setQuery('');
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setQuery('');
    }
  };

  return (
    <div className="relative w-full md:w-auto">
      <div className="relative">
        <input
          type="text"
          placeholder="기록 검색..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim() && setIsOpen(true)}
          className="w-full md:w-64 px-4 py-2 pl-10 pr-16 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        {query.trim() && results.length > 0 && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {results.length}개
            </span>
          </div>
        )}
      </div>

      {/* 검색 결과 드롭다운 */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-100 px-3 py-2 text-xs text-gray-500">
            검색어: <span className="font-medium text-gray-900">{query}</span>
          </div>
          {results.map((result, index) => (
            <div
              key={index}
              onClick={() => handleResultClick(result.record)}
              className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-start gap-2 mb-1">
                {result.record.type && (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColors(result.record.type).badge} flex-shrink-0 mt-0.5`}>
                    {result.record.type}
                  </span>
                )}
                <div className="flex-1 min-w-0" style={{ maxWidth: 'calc(100% - 40px)' }}>
                  <div 
                    className="font-medium text-gray-900" 
                    style={{ 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '100%'
                    }}
                    title={result.record.title}
                  >
                    {result.record.title.length > 15 ? `${result.record.title.substring(0, 15)}...` : result.record.title}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {new Date(result.record.date).toLocaleDateString('ko-KR')}
                  </div>
                  {result.record.summary && (
                    <div 
                      className="text-xs text-gray-500 mt-1" 
                      style={{ 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        lineHeight: '1.2',
                        maxHeight: '2.4em'
                      }}
                      title={result.record.summary}
                    >
                      {result.record.summary.length > 40 ? `${result.record.summary.substring(0, 40)}...` : result.record.summary}
                    </div>
                  )}
                  {result.record.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {result.record.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                        >
                          #{tag}
                        </span>
                      ))}
                      {result.record.tags.length > 3 && (
                        <div className="relative group">
                          <span className="text-xs text-gray-400 cursor-help">
                            +{result.record.tags.length - 3}
                          </span>
                          <div className="absolute bottom-full right-0 mb-2 p-2 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 max-w-xs">
                            <div className="flex flex-wrap gap-1">
                              {result.record.tags.slice(3).map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 whitespace-nowrap"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 검색 결과가 없을 때 */}
      {isOpen && query.trim() && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-3">
          <div className="text-sm text-gray-500">검색 결과가 없습니다.</div>
        </div>
      )}
    </div>
  );
}
