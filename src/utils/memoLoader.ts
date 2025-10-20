// 메모 파일 로드 함수
export const loadMemo = async (): Promise<string> => {
  try {
    // 올바른 경로 설정
    const memoPath = '/records/memo.md';
    const fullPath = process.env.NODE_ENV === 'development' ? `/daily-record-template${memoPath}` : memoPath;
    
    const response = await fetch(fullPath);
    
    if (!response.ok) {
      throw new Error(`파일을 찾을 수 없습니다. 상태: ${response.status}`);
    }
    
    const content = await response.text();
    
    // HTML 태그가 포함된 경우 에러
    if (content.includes('<!doctype html>') || content.includes('<html') || content.includes('<script')) {
      throw new Error('HTML 응답 감지');
    }
    
    // 마크다운 내용인지 확인
    if (content.trim().length > 0 && !content.includes('<!doctype html>') && !content.includes('<html')) {
      return content;
    }
    
    throw new Error('마크다운 내용이 아님');
    
  } catch (error) {
    // 기본 메모 반환
    return `# 📝 메모

## 현재 확인 중인 내용들

- 대시보드 통계 개선 완료
- Timeline 기간 필터 기능 추가
- 캘린더 태그 표시 개선
- 마크다운 중첩 목록 렌더링 수정

## 다음 작업 예정

- [ ] 메모 영역 UI 개선
- [ ] 메모 내용 실시간 편집 기능
- [ ] 메모 히스토리 관리

## 참고사항

- 모든 변경사항이 GitHub에 반영됨
- 개발 서버 실행 중

---
*메모 파일 로드 실패: ${(error as Error).message}`;
  }
};