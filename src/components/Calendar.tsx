import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { loadAllRecords } from '../utils/diaryLoader';
import { Record } from '../types/diary';
import { getTypeColors } from '../utils/typeColors';

export default function CalendarView() {
  const location = useLocation();
  const [records, setRecords] = useState<Record[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempYear, setTempYear] = useState(new Date().getFullYear());
  const [tempMonth, setTempMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    loadAllRecords().then((loadedRecords) => {
      setRecords(loadedRecords);
      setLoading(false);
    });
  }, []);

  // RecordViewer에서 전달받은 날짜 정보로 이동
  useEffect(() => {
    if (location.state) {
      const { targetDate, targetYear, targetMonth } = location.state as {
        targetDate?: string;
        targetYear?: number;
        targetMonth?: number;
      };
      
      if (targetDate && targetYear && targetMonth) {
        const targetDateObj = new Date(targetDate);
        setCurrentMonth(new Date(targetYear, targetMonth - 1, 1));
        setSelectedDate(targetDateObj);
        setTempYear(targetYear);
        setTempMonth(targetMonth);
      }
    }
  }, [location.state]);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.date-picker-container')) {
        setShowDatePicker(false);
      }
    };

    if (showDatePicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDatePicker]);

  // 드롭다운이 열릴 때 현재 년도/월로 초기화
  useEffect(() => {
    if (showDatePicker) {
      setTempYear(currentMonth.getFullYear());
      setTempMonth(currentMonth.getMonth() + 1);
    }
  }, [showDatePicker, currentMonth]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  // 특정 날짜에 기록이 있는지 확인
  const hasRecordOnDate = (date: Date): boolean => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    return records.some(record => record.date === dateStr);
  };

  // 특정 날짜의 기록들 가져오기
  const getRecordsOnDate = (date: Date): Record[] => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    return records.filter(record => record.date === dateStr);
  };

  // 캘린더 타일 커스터마이징
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month' && hasRecordOnDate(date)) {
      const dateRecords = getRecordsOnDate(date);
      
      // 타입별로 그룹화
      const typeGroups: { [key: string]: number } = {};
      dateRecords.forEach(record => {
        const type = record.type || 'default';
        typeGroups[type] = (typeGroups[type] || 0) + 1;
      });
      
      return (
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1">
          {Object.entries(typeGroups).map(([type, count]) => {
            const typeColors = getTypeColors(type);
            return Array.from({ length: count }, (_, index) => (
              <div
                key={`${type}-${index}`}
                style={{
                  backgroundColor: typeColors.badge.includes('pink') ? '#f472b6' : 
                                 typeColors.badge.includes('purple') ? '#a855f7' :
                                 typeColors.badge.includes('blue') ? '#3b82f6' :
                                 typeColors.badge.includes('green') ? '#10b981' :
                                 typeColors.badge.includes('yellow') ? '#f59e0b' :
                                 typeColors.badge.includes('orange') ? '#f97316' :
                                 typeColors.badge.includes('red') ? '#ef4444' :
                                 typeColors.badge.includes('indigo') ? '#6366f1' :
                                 typeColors.badge.includes('teal') ? '#14b8a6' :
                                 typeColors.badge.includes('cyan') ? '#06b6d4' :
                                 typeColors.badge.includes('emerald') ? '#10b981' :
                                 typeColors.badge.includes('lime') ? '#84cc16' :
                                 typeColors.badge.includes('amber') ? '#f59e0b' :
                                 typeColors.badge.includes('rose') ? '#f43f5e' :
                                 typeColors.badge.includes('violet') ? '#8b5cf6' :
                                 typeColors.badge.includes('fuchsia') ? '#d946ef' :
                                 typeColors.badge.includes('sky') ? '#0ea5e9' :
                                 typeColors.badge.includes('slate') ? '#64748b' :
                                 typeColors.badge.includes('zinc') ? '#71717a' :
                                 typeColors.badge.includes('neutral') ? '#737373' :
                                 typeColors.badge.includes('stone') ? '#78716c' :
                                 '#6b7280'
                }}
                className="w-2 h-2 rounded-full"
              ></div>
            ));
          })}
        </div>
      );
    }
    return null;
  };

  const selectedDateRecords = getRecordsOnDate(selectedDate);

  // 이전 달, 현재 달, 다음 달 계산
  const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
  const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentMonth(prevMonth);
    } else {
      setCurrentMonth(nextMonth);
    }
  };


  const handleGoToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setTempYear(today.getFullYear());
    setTempMonth(today.getMonth() + 1);
    setSelectedDate(today);
  };

  const handleGoToSelected = () => {
    setCurrentMonth(new Date(tempYear, tempMonth - 1, 1));
    setShowDatePicker(false);
  };

  // 년도 옵션 생성 (현재 년도 기준 ±5년)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
  
  // 월 옵션 생성
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">캘린더</h1>
        <p className="mt-2 text-sm text-gray-600">날짜별로 기록을 확인하고 탐색하세요.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 캘린더 */}
        <div className="lg:col-span-2">
          <div className="bg-white p-4 rounded-lg shadow">
            {/* 년도 네비게이션 */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              {/* 년도/월 선택기와 오늘 버튼 */}
              <div className="flex items-center space-x-3">
                <div className="relative date-picker-container">
                  <button
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-xl font-bold text-gray-900">
                      {currentMonth.getFullYear()}년
                    </span>
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                
                {/* 드롭다운 메뉴 */}
                {showDatePicker && (
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4">
                    <div className="flex space-x-4">
                      {/* 년도 선택 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">년도</label>
                        <select
                          value={tempYear}
                          onChange={(e) => setTempYear(parseInt(e.target.value))}
                          className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {yearOptions.map(year => (
                            <option key={year} value={year}>{year}년</option>
                          ))}
                        </select>
                      </div>
                      
                      {/* 월 선택 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">월</label>
                        <select
                          value={tempMonth}
                          onChange={(e) => setTempMonth(parseInt(e.target.value))}
                          className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {monthOptions.map(month => (
                            <option key={month} value={month}>{month}월</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    {/* 이동 버튼 */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={handleGoToSelected}
                        className="w-full px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors font-medium"
                      >
                        이동
                      </button>
                    </div>
                  </div>
                )}
                </div>
                
                {/* 오늘 버튼 */}
                <button
                  onClick={handleGoToToday}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
                >
                  오늘
                </button>
              </div>
              
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* 세 개월 캘린더 (세로 배치) */}
            <div className="space-y-6">
              {/* 이전 달 */}
              <div>
                <h3 className="text-base font-semibold text-gray-800 mb-2">
                  {prevMonth.getMonth() + 1}월
                </h3>
                <Calendar
                  onChange={(value) => setSelectedDate(value as Date)}
                  value={selectedDate}
                  tileContent={tileContent}
                  className="w-full"
                  formatDay={(_, date) => date.getDate().toString()}
                  tileClassName={({ date, view }) => {
                    if (view === 'month' && hasRecordOnDate(date)) {
                      return 'relative';
                    }
                    return '';
                  }}
                  activeStartDate={prevMonth}
                  showNavigation={false}
                  next2Label={null}
                  prev2Label={null}
                  showNeighboringMonth={false}
                />
              </div>

              {/* 현재 달 */}
              <div>
                <h3 className="text-base font-semibold text-gray-800 mb-2">
                  {currentMonth.getMonth() + 1}월
                </h3>
                <Calendar
                  onChange={(value) => setSelectedDate(value as Date)}
                  value={selectedDate}
                  tileContent={tileContent}
                  className="w-full"
                  formatDay={(_, date) => date.getDate().toString()}
                  tileClassName={({ date, view }) => {
                    if (view === 'month' && hasRecordOnDate(date)) {
                      return 'relative';
                    }
                    return '';
                  }}
                  activeStartDate={currentMonth}
                  showNavigation={false}
                  next2Label={null}
                  prev2Label={null}
                  showNeighboringMonth={false}
                />
              </div>

              {/* 다음 달 */}
              <div>
                <h3 className="text-base font-semibold text-gray-800 mb-2">
                  {nextMonth.getMonth() + 1}월
                </h3>
                <Calendar
                  onChange={(value) => setSelectedDate(value as Date)}
                  value={selectedDate}
                  tileContent={tileContent}
                  className="w-full"
                  formatDay={(_, date) => date.getDate().toString()}
                  tileClassName={({ date, view }) => {
                    if (view === 'month' && hasRecordOnDate(date)) {
                      return 'relative';
                    }
                    return '';
                  }}
                  activeStartDate={nextMonth}
                  showNavigation={false}
                  next2Label={null}
                  prev2Label={null}
                  showNeighboringMonth={false}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 선택된 날짜의 기록 목록 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">
                {selectedDate.toLocaleDateString('ko-KR', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  weekday: 'short'
                })}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {selectedDateRecords.length}개의 기록
              </p>
            </div>
            <div className="p-4">
              {selectedDateRecords.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateRecords.map((record) => {
                    const [year, month, day] = record.date.split('-');
                    const typeColors = getTypeColors(record.type);
                    return (
                      <div key={record.id} className={`border rounded-lg p-3 hover:shadow-sm transition-shadow ${typeColors.border} ${typeColors.background}`}>
                        <Link
                          to={`/diary/${year}/${month}/${day}/${record.slug}`}
                          className="block"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`text-sm font-medium line-clamp-1 ${typeColors.text}`}>
                              {record.title}
                            </h4>
                            {record.type && (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${typeColors.badge}`}>
                                {record.type}
                              </span>
                            )}
                          </div>
                          {record.summary && (
                            <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                              {record.summary}
                            </p>
                          )}
                          {record.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {record.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </Link>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="text-gray-400 text-3xl mb-2">📝</div>
                  <p className="text-xs text-gray-500">이 날에는 일기가 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
