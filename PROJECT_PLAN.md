# 📖 Markdown 일기 블로그 프로젝트 계획서

## 🎯 프로젝트 개요

React + TypeScript + Vite로 Markdown 일기를 블로그 형식으로 렌더링하는 웹 애플리케이션 구축. 대시보드, 캘린더, 타임라인, 로드맵 뷰와 검색 기능 포함.

## 🛠️ 기술 스택

- **Frontend**: React 18 + TypeScript + Vite
- **스타일링**: Tailwind CSS
- **Markdown 처리**: react-markdown, gray-matter (frontmatter 파싱)
- **라우팅**: React Router
- **캘린더**: react-calendar
- **그래프**: recharts (월별 작성 통계)
- **코드 하이라이팅**: react-syntax-highlighter
- **배포**: GitHub Pages (gh-pages)

## 📁 프로젝트 구조

```
/
├── diaries/                    # Markdown 일기 파일들
│   └── 2025/10/               # 년도/월별 폴더 구조
│       └── 2025-10-15-example.md
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx       # 대시보드 (통계, 최근 일기)
│   │   ├── Calendar.tsx        # 캘린더 뷰
│   │   ├── Timeline.tsx        # 타임라인 뷰
│   │   ├── Roadmap.tsx         # 칸반 보드 (월별)
│   │   ├── DiaryViewer.tsx     # Markdown 렌더링
│   │   ├── Search.tsx          # 검색 기능
│   │   └── Layout.tsx          # 네비게이션 포함
│   ├── utils/
│   │   ├── diaryLoader.ts      # MD 파일 로드 및 파싱
│   │   └── searchUtils.ts      # 검색 로직
│   ├── types/
│   │   └── diary.ts            # 일기 타입 정의
│   └── App.tsx
├── vite.config.ts
├── tailwind.config.js
└── package.json
```

## 📝 Frontmatter 형식

```yaml
---
title: "제목"
date: 2025-10-15
tags: [일상, 개발, 여행]
summary: "요약 (선택사항)"
---
```

## 🎨 UI 구조

### 네비게이션
- 홈(대시보드), 캘린더, 타임라인, 로드맵
- 상단 바에 검색 기능 통합

### URL 라우팅
- `/` - 대시보드
- `/calendar` - 캘린더 뷰
- `/timeline` - 타임라인 뷰
- `/roadmap` - 로드맵 뷰
- `/diary/YYYY/MM/DD/title` - 일기 상세

## ✨ 주요 기능

### 1. 대시보드
- 전체 일기 수, 이번 달 작성 수, 최근 작성일
- 자주 사용한 태그 (Top 5)
- 월별 작성 그래프 (recharts)
- 최근 일기 3-5개 미리보기

### 2. 캘린더 뷰
- 월별 캘린더에 일기 작성일 표시
- 날짜 클릭 시 해당 일기 열기
- 하루에 여러 일기가 있을 경우 리스트 표시

### 3. 타임라인 뷰
- 시간 역순으로 모든 일기 표시
- 무한 스크롤 또는 페이지네이션
- 각 항목에 날짜, 제목, 태그, 요약 표시

### 4. 로드맵 뷰
- GitHub Project 스타일 칸반 보드
- 월별로 컬럼 구분 (2025년 1월, 2월...)
- 드래그 불필요 (읽기 전용, 시간순 자동 배치)
- 각 카드에 제목, 날짜, 태그 표시

### 5. 검색
- 제목, 본문, 태그 전체 검색
- 실시간 검색 결과 표시
- 검색어 하이라이트

### 6. Markdown 렌더링
- react-markdown으로 HTML 변환
- 코드 블록 신택스 하이라이팅 (prism/highlight.js)
- 이미지, 링크, 테이블 등 지원
- 깔끔한 타이포그래피

## 🔧 추가 고려사항

### Markdown 파일 동적 로드
- Vite의 `import.meta.glob`을 사용하여 빌드 시 모든 MD 파일 자동 로드
- 파일명에서 날짜 추출 (`YYYY-MM-DD-title.md` 형식)
- frontmatter와 파일명 날짜 중복 시 frontmatter 우선

### 반응형 디자인
- 모바일, 태블릿, 데스크톱 대응
- 네비게이션 햄버거 메뉴 (모바일)
- 캘린더와 로드맵의 모바일 최적화

### 에러 처리
- 잘못된 frontmatter 형식 처리
- 존재하지 않는 일기 접근 시 404 페이지
- Markdown 파싱 실패 시 에러 표시

## 🌐 GitHub Pages 배포 설정

- `vite.config.ts`에 base URL 설정 (`/hh-repository/`)
- `gh-pages` 브랜치로 자동 배포
- npm script 추가 (`npm run deploy`)
- `.nojekyll` 파일 생성 (언더스코어 파일 무시 방지)

## 📋 구현 순서

1. ✅ Vite + React + TypeScript 프로젝트 초기화
2. ✅ Tailwind CSS 설정
3. ✅ 기본 레이아웃 및 라우팅 구조
4. ✅ Markdown 로더 및 파서 구현
5. ✅ 대시보드 구현 (통계 + 그래프)
6. ✅ 캘린더 뷰 구현
7. ✅ 타임라인 뷰 구현
8. ✅ 로드맵 뷰 구현
9. ✅ 검색 기능 구현
10. ✅ Markdown 뷰어 구현
11. ✅ 예제 일기 파일 작성
12. ✅ GitHub Pages 배포 설정

## 🎯 사용자 요구사항

### 파일명 규칙
- `YYYY-MM-DD-title.md` 형식
- 예시: `2025-10-15-my-first-diary.md`

### 일기 작성 방식
- 텍스트 에디터로 직접 md 파일 작성 후 프로젝트에 추가
- 웹 UI에서 작성/수정 기능은 추후 추가 예정

### Frontmatter 사용
- 날짜, 제목, 태그 등을 파일 상단에 정의
- summary 필드는 선택사항

### 검색 기능
- 제목 + 본문 + 태그 검색

### 로드맵 분류
- 날짜/기간별 (월별 또는 분기별)
- GitHub Project 스타일 칸반 보드

### 대시보드 통계
- 전체 일기 수, 이번 달 작성 수, 최근 작성일, 자주 사용한 태그
- 월별 작성 그래프 포함

## 🚀 배포 및 실행

### 로컬 실행
```bash
npm install
npm run dev
```

### GitHub Pages 배포
```bash
npm run deploy
```

## 📄 라이선스

MIT License

---

**프로젝트 완료일**: 2025년 10월 15일  
**버전**: 1.0.0  
**상태**: ✅ 완료
