# Daily Record

Markdown으로 작성한 기록을 블로그로 변환하는 React 기반 웹 애플리케이션

![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.0.0-646CFF?style=flat-square&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.0-06B6D4?style=flat-square&logo=tailwindcss)

## 주요 기능

### 대시보드
- 통계 카드: 전체 기록 수, 이번 달 작성 수, 최근 작성일, 자주 사용한 태그
- 시각화: 월별 작성 그래프, 글자수 트렌드, 타입별 분포 차트
- 최근 기록: 최근 작성된 기록 5개 미리보기

### 캘린더 뷰
- 월별 캘린더: 기록 작성일을 시각적으로 표시
- 타입별 색상: 각 기록 타입에 따른 고유 색상 표시
- 날짜별 탐색: 특정 날짜 클릭으로 해당 기록 목록 확인

### 리스트 뷰
- 고급 검색: 제목, 본문, 태그 전체 검색
- 스마트 필터: 타입별, 태그별, 날짜 범위별 필터링
- 통계 정보: 각 필터별 결과 개수 표시
- 원클릭 제거: 적용된 필터를 개별적으로 제거 가능

### Floating 메모
- 말풍선 미리보기: 마우스 오버 시 메모 내용 미리보기
- 고정 기능: 클릭으로 메모 고정/해제
- 시각적 피드백: 압정 이모지로 상태 표시

## 기술 스택

- **React 19.2.0** - 최신 React 기능 활용
- **TypeScript 5.9.3** - 타입 안전성 보장
- **Vite 5.0.0** - 빠른 개발 서버 및 빌드
- **Tailwind CSS 3.4.0** - 유틸리티 퍼스트 CSS
- **react-markdown 10.1.0** - Markdown 렌더링
- **recharts 3.2.1** - 차트 및 그래프
- **React Router DOM 6.30.1** - 클라이언트 사이드 라우팅

## 빠른 시작

### 1. 저장소 클론
```bash
git clone https://github.com/nimkoes/daily-record.git
cd daily-record
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 `http://localhost:5173/daily-record/`으로 접속하세요.

### 4. 프로덕션 빌드
```bash
npm run build
```

## 기록 작성 가이드

### 파일 구조
```
public/records/
├── 2025/
│   └── 10/
│       ├── 2025-10-15-001.md
│       ├── 2025-10-16-001.md
│       └── image/
│           ├── 2025-10-15-001.png
│           └── 2025-10-15-002.png
└── memo.md
```

### 파일명 규칙
```
YYYY-MM-DD-순번.md
```
- **예시**: `2025-10-15-001.md`
- **순번**: 같은 날 여러 기록 작성 시 001, 002, 003...

### Frontmatter 형식
```yaml
---
title: "기록 제목"
date: "2025-10-15"
tags: [ 태그1, 태그2, 태그3 ]
summary: "기록 요약 (선택사항)"
type: "PP"  # 타입 (선택사항)
---
```

### Markdown 작성
```markdown
# 제목

**굵은 글씨**와 *기울임*을 사용할 수 있습니다.

## 목록
- 항목 1
- 항목 2

## 코드
`인라인 코드`와 블록 코드를 지원합니다.

```javascript
const example = "Hello World";
```

## 이미지
![이미지 설명](image/파일명.png)
```

## 배포

### GitHub Pages 자동 배포
이 프로젝트는 GitHub Actions를 사용하여 자동 배포가 설정되어 있습니다.

1. **GitHub 저장소 설정**
   - GitHub 저장소의 Settings → Pages로 이동
   - Source를 "GitHub Actions"로 설정

2. **자동 배포**
   - `main` 브랜치에 코드를 push하면 자동으로 배포됩니다
   - Actions 탭에서 배포 진행 상황을 확인할 수 있습니다

3. **배포 URL**
   - 배포 완료 후 `https://nimkoes.github.io/daily-record/`에서 확인 가능

### 수동 배포
```bash
# 수동 배포 (gh-pages 브랜치에 직접 배포)
npm run deploy

# 또는 빌드만 실행
npm run build
# dist 폴더를 웹 서버에 업로드
```

### 배포 전 확인사항
1. **환경 변수 확인**
   - `vite.config.ts`의 `base` 경로가 저장소 이름과 일치하는지 확인
   - 현재 설정: `base: '/daily-record/'`

2. **빌드 테스트**
   ```bash
   npm run build
   npm run preview
   ```

3. **로컬에서 배포 미리보기**
   ```bash
   npm run preview
   # http://localhost:4173에서 확인
   ```

## 프로젝트 구조
```
daily-record/
├── public/
│   └── records/                # Markdown 기록 파일들
│       ├── 2025/10/            # 년도/월별 폴더
│       └── memo.md             # 메모 파일
├── src/
│   ├── components/             # React 컴포넌트
│   │   ├── Dashboard.tsx       # 대시보드
│   │   ├── Calendar.tsx        # 캘린더 뷰
│   │   ├── Timeline.tsx        # 리스트 뷰
│   │   ├── DiaryViewer.tsx     # 기록 상세 뷰
│   │   ├── Search.tsx          # 검색 기능
│   │   └── Layout.tsx          # 레이아웃 (메모 포함)
│   ├── utils/                  # 유틸리티 함수
│   │   ├── diaryLoader.ts      # 기록 로드
│   │   ├── memoLoader.ts       # 메모 로드
│   │   ├── searchUtils.ts      # 검색 로직
│   │   └── typeColors.ts       # 동적 색상 시스템
│   ├── types/                  # TypeScript 타입
│   │   └── diary.ts            # 기록 타입 정의
│   └── App.tsx                 # 메인 앱
├── scripts/
│   └── generate-diary-list.js  # 기록 목록 생성
└── package.json
```

## 개발 스크립트
```bash
# 개발 서버 실행 (기록 목록 자동 생성)
npm run dev

# 프로덕션 빌드
npm run build

# 기록 목록만 생성
npm run generate-diary-list

# GitHub Pages 배포
npm run deploy

# 코드 린팅
npm run lint
```

## 주요 특징
- **성능 최적화**: Vite 기반 빠른 개발 서버, 동적 import, 이미지 최적화
- **반응형 디자인**: 모바일 퍼스트, 태블릿 및 데스크톱 최적화
- **사용자 경험**: 직관적인 네비게이션, 부드러운 애니메이션
- **데이터 안전성**: 로컬 파일 기반 저장, Git 버전 관리 지원

## 기여하기
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

**즐거운 기록 작성 되세요!** ✨

> 💡 **팁**: 기록을 작성할 때는 이미지를 `image/` 폴더에 저장하고 Markdown에서 참조하세요. 자동으로 최적화되어 표시됩니다.