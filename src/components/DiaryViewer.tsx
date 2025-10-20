import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { loadAllRecords, getRecordBySlug } from '../utils/diaryLoader';
import { Record } from '../types/diary';
import { getTypeColors } from '../utils/typeColors';

export default function DiaryViewer() {
  const { year, month, day, slug } = useParams<{
    year: string;
    month: string;
    day: string;
    slug: string;
  }>();
  
  const navigate = useNavigate();
  const [record, setRecord] = useState<Record | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalImage, setModalImage] = useState<{ src: string; alt: string } | null>(null);
  const [prevRecord, setPrevRecord] = useState<Record | null>(null);
  const [nextRecord, setNextRecord] = useState<Record | null>(null);

  useEffect(() => {
    if (!year || !month || !day || !slug) {
      setError('잘못된 URL입니다.');
      setLoading(false);
      return;
    }

    loadAllRecords().then((records) => {
      const foundRecord = getRecordBySlug(records, year, month, day, slug);
      if (foundRecord) {
        setRecord(foundRecord);
        
        // 파일명에서 날짜와 시퀀스 추출하는 함수
        const parseFileName = (fileName: string) => {
          const match = fileName.match(/^(\d{4})-(\d{2})-(\d{2})-(\d+)$/);
          if (match) {
            const [, year, month, day, seq] = match;
            return {
              year: parseInt(year),
              month: parseInt(month),
              day: parseInt(day),
              seq: parseInt(seq),
              dateStr: `${year}-${month}-${day}`,
              fullDate: new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
            };
          }
          return null;
        };
        
        // 현재 기록의 파일명 정보
        const currentFileInfo = parseFileName(foundRecord.id);
        if (!currentFileInfo) {
          setError('기록 파일명 형식이 올바르지 않습니다.');
          setLoading(false);
          return;
        }
        
        // 모든 기록을 파일명 기준으로 정렬 (날짜 -> 시퀀스 순)
        const sortedRecords = records
          .map(record => ({
            record,
            fileInfo: parseFileName(record.id)
          }))
          .filter(item => item.fileInfo !== null)
          .sort((a, b) => {
            const aInfo = a.fileInfo!;
            const bInfo = b.fileInfo!;
            
            // 날짜 비교
            const dateCompare = aInfo.fullDate.getTime() - bInfo.fullDate.getTime();
            if (dateCompare !== 0) return dateCompare;
            
            // 같은 날짜면 시퀀스 비교
            return aInfo.seq - bInfo.seq;
          });
        
        // 현재 기록의 인덱스 찾기
        const currentIndex = sortedRecords.findIndex(item => item.record.id === foundRecord.id);
        
        // 이전/다음 기록 찾기
        setPrevRecord(currentIndex > 0 ? sortedRecords[currentIndex - 1].record : null);
        setNextRecord(currentIndex < sortedRecords.length - 1 ? sortedRecords[currentIndex + 1].record : null);
      } else {
        setError('기록을 찾을 수 없습니다.');
      }
      setLoading(false);
    });
  }, [year, month, day, slug]);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && modalImage) {
        closeModal();
      }
    };

    if (modalImage) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [modalImage]);

  // 캘린더로 이동 (해당 날짜로)
  const goToCalendar = () => {
    if (record) {
      const date = new Date(record.date);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      
      // 캘린더로 이동하면서 URL state로 날짜 정보 전달
      navigate('/calendar', { 
        state: { 
          targetDate: record.date,
          targetYear: year,
          targetMonth: month
        } 
      });
    }
  };

  // 목록으로 이동 (검색 기록 유지)
  const goToList = () => {
    // sessionStorage에서 검색 기록 가져오기
    const savedSearchTerm = sessionStorage.getItem('timelineSearchTerm') || '';
    const savedSelectedTags = JSON.parse(sessionStorage.getItem('timelineSelectedTags') || '[]');
    
    navigate('/timeline', { 
      state: { 
        searchTerm: savedSearchTerm,
        selectedTags: savedSelectedTags
      } 
    });
  };

  // 특정 태그로 목록 이동
  const goToListWithTag = (tag: string) => {
    navigate('/timeline', { 
      state: { 
        searchTerm: '',
        selectedTags: [tag]
      } 
    });
  };

  // 이미지 클릭 핸들러
  const handleImageClick = (src: string, alt: string) => {
    setModalImage({ src, alt });
  };

  // 모달 닫기
  const closeModal = () => {
    setModalImage(null);
  };

  // 이미지 경로 처리 (상대 경로를 절대 경로로 변환)
  const processImageSrc = (src: string) => {
    if (src.startsWith('http') || src.startsWith('/')) {
      return src;
    }
    // 상대 경로인 경우 public/diaries 폴더 기준으로 절대 경로 생성
    return `/diaries/${year}/${month}/${src}`;
  };

  // 이미지 크기 조정 함수
  const getImageDimensions = (naturalWidth: number, naturalHeight: number) => {
    const maxSize = 600; // 기준 크기 (현재 화면 이미지 가로의 절반 정도)
    
    // 원본이 기준 크기보다 작으면 원본 크기 사용
    if (naturalWidth <= maxSize && naturalHeight <= maxSize) {
      return { width: naturalWidth, height: naturalHeight };
    }
    
    // 비율을 유지하면서 기준 크기에 맞춤
    const aspectRatio = naturalWidth / naturalHeight;
    
    if (naturalWidth > naturalHeight) {
      // 가로가 더 긴 경우
      return {
        width: maxSize,
        height: Math.round(maxSize / aspectRatio)
      };
    } else {
      // 세로가 더 긴 경우
      return {
        width: Math.round(maxSize * aspectRatio),
        height: maxSize
      };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">😕</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">기록을 찾을 수 없습니다</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <Link
          to="/"
          className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  const date = new Date(record.date);

  return (
    <div className="max-w-4xl mx-auto">

      {/* 이전/다음 기록 네비게이션 */}
      <div className="flex justify-between gap-3 mb-4">
        {/* 이전 기록 버튼 */}
        <div className="w-1/2 sm:w-1/3">
          {prevRecord ? (
            <Link
              to={`/diary/${prevRecord.date.split('-')[0]}/${prevRecord.date.split('-')[1]}/${prevRecord.date.split('-')[2]}/${prevRecord.slug}`}
              className="block p-3 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
            >
              {/* 2줄 구성: 1) 날짜 + 타입  2) 제목(말줄임) */}
              <div className="text-xs text-gray-700 flex items-center gap-2 mb-1">
                <span>{new Date(prevRecord.date).toLocaleDateString('ko-KR')}</span>
                {prevRecord.type && (
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${getTypeColors(prevRecord.type).badge}`}>
                    {prevRecord.type}
                  </span>
                )}
              </div>
              <div className="text-sm font-semibold text-gray-900 truncate">
                {prevRecord.title}
              </div>
              {/* PC에서 summary + 태그 표시 */}
              {prevRecord.summary && (
                <div className="hidden md:block mt-1 text-xs text-gray-500 line-clamp-2">
                  {prevRecord.summary}
                </div>
              )}
              {prevRecord.tags.length > 0 && (
                <div className="hidden md:flex flex-wrap gap-1 mt-1">
                  {prevRecord.tags.slice(0, 5).map((tag) => (
                    <span key={tag} className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-700">#{tag}</span>
                  ))}
                </div>
              )}
              {/* 모바일에서는 summary/태그 숨김 */}
            </Link>
          ) : (
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-center">
              <div className="text-xs text-gray-500">이전 기록 없음</div>
            </div>
          )}
        </div>

        {/* 중간 공간 (데스크톱 전용) */}
        <div className="hidden sm:block w-1/3"></div>

        {/* 다음 기록 버튼 */}
        <div className="w-1/2 sm:w-1/3">
          {nextRecord ? (
            <Link
              to={`/diary/${nextRecord.date.split('-')[0]}/${nextRecord.date.split('-')[1]}/${nextRecord.date.split('-')[2]}/${nextRecord.slug}`}
              className="block p-3 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-right"
            >
              <div className="text-xs text-gray-700 flex items-center gap-2 justify-end mb-1">
                {nextRecord.type && (
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${getTypeColors(nextRecord.type).badge}`}>
                    {nextRecord.type}
                  </span>
                )}
                <span>{new Date(nextRecord.date).toLocaleDateString('ko-KR')}</span>
              </div>
              <div className="text-sm font-semibold text-gray-900 truncate text-right">
                {nextRecord.title}
              </div>
              {/* PC에서 summary + 태그 표시 */}
              {nextRecord.summary && (
                <div className="hidden md:block mt-1 text-xs text-gray-500 line-clamp-2 text-right">
                  {nextRecord.summary}
                </div>
              )}
              {nextRecord.tags.length > 0 && (
                <div className="hidden md:flex flex-wrap gap-1 mt-1 justify-end">
                  {nextRecord.tags.slice(0, 5).map((tag) => (
                    <span key={tag} className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-700">#{tag}</span>
                  ))}
                </div>
              )}
              {/* 모바일에서는 summary/태그 숨김 */}
            </Link>
          ) : (
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-center">
              <div className="text-xs text-gray-500">다음 기록 없음</div>
            </div>
          )}
        </div>
      </div>

      {/* 기록 헤더 */}
      <article className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 md:p-8 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3 mb-4">
            <div className="flex items-center gap-3">
              {record.type && (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTypeColors(record.type).badge}`}>
                  {record.type}
                </span>
              )}
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight break-keep truncate">
                {record.title}
              </h1>
            </div>
            
            {/* 상단 버튼 줄 제거 (모바일 중복 방지) */}
          </div>

          {/* 모바일 전용 네비 제거(요청) */}
          
          {/* 날짜 + 아이콘 버튼을 한 줄로 우측 정렬 */}
          <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {date.toLocaleDateString('ko-KR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                weekday: 'long'
              })}
            </div>
            <div className="flex space-x-2">
              <Link to="/" className="inline-flex w-10 aspect-square md:w-8 items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50" title="홈">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </Link>
              <button onClick={goToCalendar} className="inline-flex w-10 aspect-square md:w-8 items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50" title="캘린더">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
              <button onClick={goToList} className="inline-flex w-10 aspect-square md:w-8 items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50" title="목록">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
          {/* 모바일: 요약 표시 (말줄임 처리) */}
          {record.summary && (
            <div className="md:hidden mb-3 text-gray-600 text-base leading-relaxed">
              <p className="line-clamp-2">
                {record.summary}
              </p>
            </div>
          )}

          {record.tags.length > 0 && (
            <div className="w-full flex flex-wrap justify-start content-start gap-[3px] md:gap-2">
              {record.tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => goToListWithTag(tag)}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors cursor-pointer whitespace-nowrap tag-chip"
                  title={`#${tag} 태그로 필터링`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>

          {/* 기록 내용 */}
          <div className="p-6 md:p-8">
          <div className="prose prose-lg max-w-none [&_ul]:list-disc [&_ol]:list-decimal [&_li]:ml-4 [&_ul_ul]:ml-6 [&_ol_ol]:ml-6 [&_ul_ol]:ml-6 [&_ol_ul]:ml-6">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                code({ node, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !props.inline && match ? (
                    <SyntaxHighlighter
                      style={tomorrow as any}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
                h1: ({ children }) => (
                  <h1 className="text-2xl font-bold text-gray-900 mt-8 mb-4 first:mt-0">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-2">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {children}
                  </p>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4">
                    {children}
                  </blockquote>
                ),
                ul: ({ children, ...props }: any) => (
                  <ul className={`list-disc text-gray-700 mb-4 space-y-1 ${props.depth > 0 ? 'ml-6' : 'ml-4'}`}>
                    {children}
                  </ul>
                ),
                ol: ({ children, ...props }: any) => (
                  <ol className={`list-decimal text-gray-700 mb-4 space-y-1 ${props.depth > 0 ? 'ml-6' : 'ml-4'}`}>
                    {children}
                  </ol>
                ),
                li: ({ children }: any) => (
                  <li className="text-gray-700 leading-relaxed">
                    {children}
                  </li>
                ),
                a: ({ children, href }) => (
                  <a
                    href={href}
                    className="text-blue-600 hover:text-blue-800 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
                img: ({ src, alt }) => {
                  const imageSrc = processImageSrc(src || '');
                  return (
                    <img
                      src={imageSrc}
                      alt={alt}
                      loading="lazy"
                      decoding="async"
                      className="block mx-auto my-3 md:my-4 rounded-lg shadow-sm cursor-pointer hover:opacity-90 transition-opacity w-full h-auto max-w-full"
                      onClick={() => handleImageClick(imageSrc, alt || '')}
                    />
                  );
                },
                table: ({ children }) => (
                  <div className="overflow-x-auto my-6">
                    <table className="min-w-full border-collapse border border-gray-300 rounded-lg shadow-sm">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-gray-50">
                    {children}
                  </thead>
                ),
                tbody: ({ children }) => (
                  <tbody className="bg-white divide-y divide-gray-200">
                    {children}
                  </tbody>
                ),
                tr: ({ children }) => (
                  <tr className="hover:bg-gray-50">
                    {children}
                  </tr>
                ),
                th: ({ children }) => (
                  <th className="border border-gray-300 px-4 py-3 bg-gray-50 font-semibold text-left text-gray-900 text-sm">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border border-gray-300 px-4 py-3 text-gray-700 text-sm">
                    {children}
                  </td>
                ),
              }}
            >
              {record.content}
            </ReactMarkdown>
          </div>
        </div>
      </article>

      {/* 이미지 모달 */}
      {modalImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={modalImage.src}
              alt={modalImage.alt}
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            {modalImage.alt && (
              <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded text-sm">
                {modalImage.alt}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
