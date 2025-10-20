import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { loadAllRecords } from '../utils/diaryLoader';
import { Record } from '../types/diary';
import { getTypeColors } from '../utils/typeColors';

export default function Timeline() {
  const location = useLocation();
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [showAllTags, setShowAllTags] = useState(false);
  // 기본값은 전체 기간 (빈값)
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadAllRecords().then((loadedRecords) => {
      setRecords(loadedRecords);
      setLoading(false);
    });
  }, []);

  // 검색 기록 복원 (RecordViewer에서 돌아올 때)
  useEffect(() => {
    if (location.state) {
      const { searchTerm: savedSearchTerm, selectedTags: savedSelectedTags, selectedTypes: savedSelectedTypes } = location.state as {
        searchTerm?: string;
        selectedTags?: string[];
        selectedTypes?: string[];
      };
      
      if (savedSearchTerm !== undefined) {
        setSearchTerm(savedSearchTerm);
      }
      if (savedSelectedTags !== undefined) {
        setSelectedTags(savedSelectedTags);
      }
      if (savedSelectedTypes !== undefined) {
        setSelectedTypes(savedSelectedTypes);
      }
    }
  }, [location.state]);

  // 검색 기록 저장
  useEffect(() => {
    sessionStorage.setItem('timelineSearchTerm', searchTerm);
    sessionStorage.setItem('timelineSelectedTags', JSON.stringify(selectedTags));
    sessionStorage.setItem('timelineSelectedTypes', JSON.stringify(selectedTypes));
  }, [searchTerm, selectedTags, selectedTypes]);

  // 필터링된 기록 목록
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const matchesSearch = searchTerm === '' || 
        record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.some(selectedTag => record.tags.includes(selectedTag));
      
      const matchesTypes = selectedTypes.length === 0 || 
        (record.type && selectedTypes.includes(record.type));
      
      const matchesDateRange = (() => {
        if (!startDate && !endDate) return true;
        
        const recordDate = new Date(record.date);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        
        if (start && end) {
          return recordDate >= start && recordDate <= end;
        } else if (start) {
          return recordDate >= start;
        } else if (end) {
          return recordDate <= end;
        }
        
        return true;
      })();
      
      return matchesSearch && matchesTags && matchesTypes && matchesDateRange;
    });
  }, [records, searchTerm, selectedTags, selectedTypes, startDate, endDate]);

  // 모든 타입 목록 (중복 제거, 개수 포함)
  const allTypesWithCount = useMemo(() => {
    const typeCount = new Map<string, number>();
    records.forEach(record => {
      if (record.type) {
        typeCount.set(record.type, (typeCount.get(record.type) || 0) + 1);
      }
    });
    
    return Array.from(typeCount.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => {
        // 알파벳 순으로 고정 (활성 상태와 관계없이)
        return a.type.localeCompare(b.type);
      });
  }, [records, selectedTypes]);

  // 모든 태그 목록 (중복 제거, 개수 포함)
  const allTagsWithCount = useMemo(() => {
    const tagCount = new Map<string, number>();
    records.forEach(record => {
      record.tags.forEach(tag => {
        tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
      });
    });
    
    return Array.from(tagCount.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => {
        // 활성 태그를 앞으로 정렬
        const aActive = selectedTags.includes(a.tag);
        const bActive = selectedTags.includes(b.tag);
        
        if (aActive && !bActive) return -1;
        if (!aActive && bActive) return 1;
        
        // 그 외는 가나다 순
        return a.tag.localeCompare(b.tag, 'ko');
      });
  }, [records, selectedTags]);

  // 타입 토글 함수
  const toggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  // 태그 토글 함수
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // 모든 타입 선택 해제
  const clearAllTypes = () => {
    setSelectedTypes([]);
  };

  // 모든 태그 선택 해제
  const clearAllTags = () => {
    setSelectedTags([]);
  };

  // 날짜 필터 초기화 (빈값으로 리셋)
  const clearDateFilter = () => {
    setStartDate('');
    setEndDate('');
  };

  // 모든 필터 초기화
  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedTags([]);
    setSelectedTypes([]);
    setStartDate('');
    setEndDate('');
  };

  // 날짜 변경 함수 (날짜 역전 방지 + 실제 선택 시에만 변경)
  const handleStartDateChange = (newStartDate: string) => {
    // 유효한 날짜 형식인지 확인
    if (!newStartDate || /^\d{4}-\d{2}-\d{2}$/.test(newStartDate)) {
      setStartDate(newStartDate);
      
      // 날짜 역전 방지: 시작일이 종료일보다 미래인 경우
      if (newStartDate && endDate) {
        const start = new Date(newStartDate);
        const end = new Date(endDate);
        
        if (start > end) {
          const newEndDate = new Date(start);
          newEndDate.setMonth(newEndDate.getMonth() + 1);
          setEndDate(newEndDate.toISOString().split('T')[0]);
        }
      }
    }
  };

  const handleEndDateChange = (newEndDate: string) => {
    // 유효한 날짜 형식인지 확인
    if (!newEndDate || /^\d{4}-\d{2}-\d{2}$/.test(newEndDate)) {
      setEndDate(newEndDate);
      
      // 날짜 역전 방지: 종료일이 시작일보다 과거인 경우
      if (startDate && newEndDate) {
        const start = new Date(startDate);
        const end = new Date(newEndDate);
        
        if (end < start) {
          const newStartDate = new Date(end);
          newStartDate.setMonth(newStartDate.getMonth() - 1);
          setStartDate(newStartDate.toISOString().split('T')[0]);
        }
      }
    }
  };

  // 빠른 날짜 선택 함수들
  const setQuickDateRange = (months: number) => {
    const today = new Date();
    const startDate = new Date();
    startDate.setMonth(today.getMonth() - months);
    
    setStartDate(startDate.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  };

  const quickDateOptions = [
    { label: '최근 1개월', months: 1 },
    { label: '최근 3개월', months: 3 },
    { label: '최근 6개월', months: 6 },
    { label: '최근 1년', months: 12 }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">리스트</h1>
        <p className="mt-2 text-sm text-gray-600">모든 기록을 테이블 형태로 확인하세요.</p>
      </div>

      {/* 필터 영역 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        {/* 1행: 2x2 그리드 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* 왼쪽 열: 검색 + 타입 */}
          <div className="space-y-4">
            {/* 검색 영역 */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                검색
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  placeholder="제목, 내용, 태그로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {/* 검색 아이콘 */}
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                {/* 검색어 삭제 버튼 */}
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-100 rounded-r-lg transition-colors"
                    type="button"
                  >
                    <svg className="h-4 w-4 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* 타입 영역 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  타입
                </label>
                {selectedTypes.length > 0 && (
                  <button
                    onClick={clearAllTypes}
                    className="text-xs text-gray-500 hover:text-gray-700 underline"
                  >
                    전체 해제
                  </button>
                )}
              </div>
              
              <div className="space-y-2">
                {/* 타입 목록 */}
                <div className="flex flex-wrap gap-2">
                  {allTypesWithCount.map(({ type, count }) => {
                    const isActive = selectedTypes.includes(type);
                    const typeColors = getTypeColors(type);
                    
                    return (
                      <button
                        key={type}
                        onClick={() => toggleType(type)}
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${typeColors.text} ${
                          isActive 
                            ? `${typeColors.badge}` 
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {type}
                        <span className="ml-1 text-xs opacity-75">({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* 오른쪽 열: 기간 + 빠른선택 */}
          <div className="space-y-4">
            {/* 기간 영역 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  기간
                </label>
                {(startDate || endDate) && (
                  <button
                    onClick={clearDateFilter}
                    className="text-xs text-gray-500 hover:text-gray-700 underline"
                  >
                    초기화
                  </button>
                )}
              </div>
              
              {/* 시작일, 종료일 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="startDate" className="block text-xs text-gray-600 mb-1">
                    시작일
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-xs text-gray-600 mb-1">
                    종료일
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    value={endDate}
                    onChange={(e) => handleEndDateChange(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* 빠른 선택 영역 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                빠른 선택
              </label>
              <div className="flex gap-2">
                {quickDateOptions.map((option) => (
                  <button
                    key={option.months}
                    onClick={() => setQuickDateRange(option.months)}
                    className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3행: 태그 영역 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              태그
            </label>
            {selectedTags.length > 0 && (
              <button
                onClick={clearAllTags}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                전체 해제
              </button>
            )}
          </div>
          
          <div className="space-y-2">
            {/* 태그 목록 */}
            <div className="flex flex-wrap gap-2">
              {allTagsWithCount.map(({ tag, count }, index) => {
                const isActive = selectedTags.includes(tag);
                const shouldShow = showAllTags || index < 8; // 2줄 기준 약 8개
                
                if (!shouldShow) return null;
                
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-100 text-blue-800 shadow-sm'
                        : 'bg-gray-100 text-blue-800 hover:bg-gray-200'
                    }`}
                  >
                    <span>#{tag}</span>
                    <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                      isActive 
                        ? 'bg-blue-200 text-blue-900' 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
            
            {/* 더보기/숨기기 버튼 */}
            {allTagsWithCount.length > 8 && (
              <div className="flex justify-center">
                <button
                  onClick={() => setShowAllTags(!showAllTags)}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {showAllTags ? '숨기기' : `더보기 (${allTagsWithCount.length - 8}개 더)`}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 필터 결과 정보 */}
        {(searchTerm || selectedTags.length > 0 || selectedTypes.length > 0 || startDate || endDate) && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">
                    필터 적용됨
                  </span>
                </div>
                <span className="text-sm text-gray-600">
                  {filteredRecords.length}개의 결과
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {filteredRecords.length !== records.length && (
                  <span className="text-sm text-gray-500">
                    전체 {records.length}개 중
                  </span>
                )}
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  모든 필터 초기화
                </button>
              </div>
            </div>
            
            {/* 활성 필터 배지들 */}
            <div className="flex flex-wrap gap-2">
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:opacity-80 transition-opacity cursor-pointer"
                  title="클릭하여 필터 제거"
                >
                  <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  검색: "{searchTerm}"
                </button>
              )}
              
              {selectedTypes.map(type => {
                const typeColors = getTypeColors(type);
                return (
                  <button
                    key={type}
                    onClick={() => toggleType(type)}
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${typeColors.badge} hover:opacity-80 transition-opacity cursor-pointer`}
                    title="클릭하여 필터 제거"
                  >
                    <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    타입: {type}
                  </button>
                );
              })}
              
              {selectedTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:opacity-80 transition-opacity cursor-pointer"
                  title="클릭하여 필터 제거"
                >
                  <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  #{tag}
                </button>
              ))}
              
              {(startDate || endDate) && (
                <button
                  onClick={clearDateFilter}
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-800 hover:opacity-80 transition-opacity cursor-pointer"
                  title="클릭하여 필터 제거"
                >
                  <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  기간: {startDate || '시작'} ~ {endDate || '종료'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="max-w-screen-lg mx-auto">
        {/* 기록 테이블 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    제목
                  </th>
                  <th className="hidden">
                    요약
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider md:hidden">
                    태그
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    작성일
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record) => {
                  const [year, month, day] = record.date.split('-');
                  const date = new Date(record.date);
                  const typeColors = getTypeColors(record.type);
                  
                  return (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap align-top">
                        <div className="flex items-center gap-2">
                          {record.type && (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${typeColors.badge}`}>
                              {record.type}
                            </span>
                          )}
                          <Link
                            to={`/diary/${year}/${month}/${day}/${record.slug}`}
                            className="text-base md:text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                            title={record.title}
                          >
                            {record.title.length > 15 ? `${record.title.substring(0, 15)}...` : record.title}
                          </Link>
                        </div>
                        {/* PC에서 제목 아래 요약/태그 표시 */}
                        {record.summary && (
                          <div className="hidden md:block mt-1 text-sm text-gray-500 max-w-2xl">
                            <div className="line-clamp-2" title={record.summary}>
                              {record.summary}
                            </div>
                          </div>
                        )}
                        {record.tags.length > 0 && (
                          <div className="hidden md:flex flex-wrap gap-1 mt-1">
                            {record.tags.map((tag) => (
                              <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">#{tag}</span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="hidden">
                        {/* 요약 열은 PC에서 숨김 (제목 아래로 이동) */}
                      </td>
                      <td className="px-3 md:px-6 py-4 md:hidden">
                        <div className="flex flex-wrap gap-1">
                          {record.tags.map((tag) => {
                            const isActive = selectedTags.includes(tag);
                            return (
                              <button
                                key={tag}
                                onClick={() => toggleTag(tag)}
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                                  isActive
                                    ? 'bg-blue-100 text-blue-800 shadow-sm'
                                    : 'bg-gray-100 text-blue-800 hover:bg-gray-200'
                                }`}
                              >
                                #{tag}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                        {date.toLocaleDateString('ko-KR', { 
                          year: 'numeric',
                          month: 'short', 
                          day: 'numeric',
                          weekday: 'short'
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 기록이 없는 경우 */}
        {records.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">아직 기록이 없습니다</h3>
            <p className="text-gray-500">첫 번째 기록을 작성해보세요!</p>
          </div>
        )}

        {/* 필터 결과가 없는 경우 */}
        {records.length > 0 && filteredRecords.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">검색 결과가 없습니다</h3>
            <p className="text-gray-500">다른 검색어나 태그를 시도해보세요.</p>
            <button
              onClick={clearAllFilters}
              className="mt-4 px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              필터 초기화
            </button>
          </div>
        )}

        {/* 통계 정보 */}
        {records.length > 0 && (
          <div className="mt-4 text-sm text-gray-500">
            {filteredRecords.length === records.length 
              ? `총 ${records.length}개의 게시물이 있습니다.`
              : `총 ${records.length}개 중 ${filteredRecords.length}개가 표시됩니다.`
            }
          </div>
        )}
      </div>
    </div>
  );
}
