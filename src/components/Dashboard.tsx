import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { loadAllRecords } from '../utils/diaryLoader';
import { Record } from '../types/diary';
import { getTypeColors } from '../utils/typeColors';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function Dashboard() {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const loadedRecords = await loadAllRecords();
        setRecords(loadedRecords);
      } catch (error) {
        console.error('데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  // 통계 계산
  const totalRecords = records.length;
  const thisMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const thisMonthRecords = records.filter(record => record.date.startsWith(thisMonth));
  const thisMonthCount = thisMonthRecords.length;
  
  const lastRecord = records[0]; // 최신 기록
  const lastRecordDate = lastRecord ? new Date(lastRecord.date).toLocaleDateString('ko-KR') : '없음';

  // 태그 통계
  const tagCounts: { [key: string]: number } = {};
  records.forEach(record => {
    record.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  // 인기 태그 차트 데이터
  const tagChartData = Object.entries(tagCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([tag, count]) => ({
      태그: tag,
      사용횟수: count
    }));

  // 월별 통계 (실제로 기록이 작성된 월만)
  const monthlyStats: { [key: string]: number } = {};
  
  records.forEach(record => {
    const monthKey = record.date.slice(0, 7);
    monthlyStats[monthKey] = (monthlyStats[monthKey] || 0) + 1;
  });

  // 추가 통계 계산
  const totalTags = Object.keys(tagCounts).length;
  const avgRecordsPerMonth = totalRecords > 0 ? (totalRecords / Math.max(1, Object.keys(monthlyStats).length)).toFixed(1) : '0';
  
  // 연속 작성일 계산
  const sortedDates = records.map(d => d.date).sort().reverse();
  let consecutiveDays = 0;
  const today = new Date();
  
  // 오늘부터 역순으로 연속된 날짜 확인
  let checkDate = new Date(today);
  
  for (let i = 0; i < sortedDates.length; i++) {
    const checkDateStr = checkDate.toISOString().slice(0, 10);
    const hasRecordOnDate = sortedDates.includes(checkDateStr);
    
    if (hasRecordOnDate) {
      consecutiveDays++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // 가장 긴 기록과 가장 짧은 기록
  const recordLengths = records.map(record => record.content.length);
  const longestRecord = recordLengths.length > 0 ? Math.max(...recordLengths) : 0;
  const avgRecordLength = recordLengths.length > 0 ? Math.round(recordLengths.reduce((a, b) => a + b, 0) / recordLengths.length) : 0;

  // 이번 주 작성 기록 수
  const thisWeek = new Date();
  const startOfWeek = new Date(thisWeek.setDate(thisWeek.getDate() - thisWeek.getDay()));
  const endOfWeek = new Date(thisWeek.setDate(thisWeek.getDate() + 6));
  const thisWeekRecords = records.filter(record => {
    const recordDate = new Date(record.date);
    return recordDate >= startOfWeek && recordDate <= endOfWeek;
  }).length;

  // 주간 작성 현황 (최근 12주)
  const weeklyStats: { [key: string]: number } = {};
  const weekLabels: string[] = [];
  
  for (let i = 11; i >= 0; i--) {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - (weekStart.getDay() + (i * 7)));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const weekKey = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;
    weekLabels.push(weekKey);
    
    const weekRecords = records.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= weekStart && recordDate <= weekEnd;
    });
    
    weeklyStats[weekKey] = weekRecords.length;
  }

  const weeklyChartData = weekLabels.map(week => ({
    주차: week,
    작성수: weeklyStats[week] || 0
  }));

  // 요일별 작성 패턴 분석
  const weekdayStats: { [key: string]: number } = {};
  const weekdayNames = ['일', '월', '화', '수', '목', '금', '토'];
  
  records.forEach(record => {
    const date = new Date(record.date);
    const weekday = weekdayNames[date.getDay()];
    weekdayStats[weekday] = (weekdayStats[weekday] || 0) + 1;
  });

  const mostActiveWeekday = Object.entries(weekdayStats)
    .sort(([,a], [,b]) => b - a)[0];

  // 요일별 차트 데이터
  const weekdayChartData = weekdayNames.map(weekday => ({
    요일: weekday,
    작성수: weekdayStats[weekday] || 0
  }));

  // 트렌드 분석
  const monthlyTrends = Object.entries(monthlyStats)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => {
      const monthDate = new Date(month + '-01');
      const monthRecords = records.filter(record => record.date.startsWith(month));
      
      // 월별 평균 글자수
      const avgLength = monthRecords.length > 0 
        ? Math.round(monthRecords.reduce((sum, record) => sum + record.content.length, 0) / monthRecords.length)
        : 0;
      
      // 월별 태그 다양성 (고유 태그 수)
      const uniqueTags = new Set();
      monthRecords.forEach(record => {
        record.tags.forEach(tag => uniqueTags.add(tag));
      });
      
      return {
        month: monthDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short' }),
        count,
        avgLength,
        tagDiversity: uniqueTags.size
      };
    });

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">대시보드</h1>
        <p className="text-gray-600">기록 작성 현황과 최근 활동을 확인하세요</p>
      </div>

      {/* 기본 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-xl">
              <span className="text-xl">📝</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">리스트</p>
              <p className="text-2xl font-bold text-gray-900">{totalRecords}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-xl">
              <span className="text-xl">📅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">이번 달</p>
              <p className="text-2xl font-bold text-gray-900">{thisMonthCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-xl">
              <span className="text-xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">월평균 작성</p>
              <p className="text-2xl font-bold text-gray-900">{avgRecordsPerMonth}개</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-cyan-100 rounded-xl">
              <span className="text-xl">📅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">이번 주 작성</p>
              <p className="text-2xl font-bold text-gray-900">{thisWeekRecords}개</p>
            </div>
          </div>
        </div>
      </div>

      {/* 패턴 분석 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-violet-100 rounded-lg">
              <span className="text-lg">📅</span>
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">가장 활발한 요일</p>
              <p className="text-lg font-bold text-gray-900">{mostActiveWeekday ? mostActiveWeekday[0] : '없음'}</p>
              <p className="text-xs text-gray-500">{mostActiveWeekday ? `${mostActiveWeekday[1]}개` : ''}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <span className="text-lg">🔥</span>
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">연속 작성일</p>
              <p className="text-lg font-bold text-gray-900">{consecutiveDays}일</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-teal-100 rounded-lg">
              <span className="text-lg">📖</span>
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">가장 긴 기록</p>
              <p className="text-lg font-bold text-gray-900">{longestRecord.toLocaleString()}자</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <span className="text-lg">📝</span>
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">평균 글자수</p>
              <p className="text-lg font-bold text-gray-900">{avgRecordLength.toLocaleString()}자</p>
            </div>
          </div>
        </div>
      </div>

      {/* 세 번째 행: 기타 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-lg">⏰</span>
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">최근 작성</p>
              <p className="text-xs font-bold text-gray-900">{lastRecordDate}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-pink-100 rounded-lg">
              <span className="text-lg">📈</span>
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">총 태그 수</p>
              <p className="text-lg font-bold text-gray-900">{totalTags}개</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-sky-100 rounded-lg">
              <span className="text-lg">🎯</span>
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">태그 다양성</p>
              <p className="text-lg font-bold text-gray-900">{monthlyTrends.length > 0 ? monthlyTrends[monthlyTrends.length - 1].tagDiversity : 0}개</p>
              <p className="text-xs text-gray-500">이번 달</p>
            </div>
          </div>
        </div>
      </div>

      {/* 차트 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 주간 작성 현황 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">주간 작성 현황</h3>
          <p className="text-sm text-gray-600 mb-4">최근 12주간의 작성 패턴</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="주차" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="작성수" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 요일별 작성 패턴 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">요일별 작성 패턴</h3>
          <p className="text-sm text-gray-600 mb-4">요일별 작성 빈도 분석</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekdayChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="요일" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="작성수" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 인기 태그 (상위 10개) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">인기 태그</h3>
          <p className="text-sm text-gray-600 mb-4">상위 10개 태그 사용 빈도</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tagChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="태그" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="사용횟수" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 트렌드 분석 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 월별 글자수 트렌드 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">월별 평균 글자수</h3>
          <p className="text-sm text-gray-600 mb-4">월별 글자수 변화 추이</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value.toLocaleString()}자`, '평균 글자수']} />
                <Line type="monotone" dataKey="avgLength" stroke="#8b5cf6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 월별 태그 다양성 트렌드 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">월별 태그 다양성</h3>
          <p className="text-sm text-gray-600 mb-4">월별 고유 태그 수 변화</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}개`, '태그 다양성']} />
                <Line type="monotone" dataKey="tagDiversity" stroke="#f97316" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 최근 일기 섹션 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">최근 기록</h3>
          <p className="text-sm text-gray-600 mt-1">최근 작성된 기록 목록</p>
        </div>
        <div className="divide-y divide-gray-200">
          {records.slice(0, 5).map((record) => {
            const [year, month, day] = record.date.split('-');
            const typeColors = getTypeColors(record.type);
            return (
              <div key={record.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {record.type && (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${typeColors.badge}`}>
                          {record.type}
                        </span>
                      )}
                      <Link
                        to={`/diary/${year}/${month}/${day}/${record.slug}`}
                        className="text-sm font-medium text-gray-900 hover:text-blue-600"
                      >
                        {record.title}
                      </Link>
                    </div>
                    <p className="mt-1 text-xs text-gray-600">
                      {new Date(record.date).toLocaleDateString('ko-KR')}
                    </p>
                    {record.summary && (
                      <p className="mt-2 text-xs text-gray-500 line-clamp-2">
                        {record.summary}
                      </p>
                    )}
                    {record.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {record.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}