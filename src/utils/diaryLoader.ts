import { Record, RecordFrontmatter } from '../types/diary';
import { RecordList } from '../types/diaryList';
import diaryList from './diaryList.json';

// 간단한 frontmatter 파싱 함수 (gray-matter 대신 사용)
function parseFrontmatter(content: string): { data: RecordFrontmatter; content: string } {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    return { data: {}, content };
  }
  
  const [, frontmatterText, markdownContent] = match;
  const data: RecordFrontmatter = {};
  
  // YAML 파싱 (간단한 버전)
  const lines = frontmatterText.split('\n');
  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;
    
    const key = line.substring(0, colonIndex).trim();
    let value = line.substring(colonIndex + 1).trim();
    
    // 배열 처리 (tags)
    if (value.startsWith('[') && value.endsWith(']')) {
      value = value.slice(1, -1);
      if (key === 'tags') {
        data.tags = value.split(',').map(v => v.trim().replace(/['"]/g, ''));
      }
    } else {
      // 문자열 처리 (따옴표 제거)
      const cleanValue = value.replace(/^['"]|['"]$/g, '');
      if (key === 'title') {
        data.title = cleanValue;
      } else if (key === 'date') {
        data.date = cleanValue;
      } else if (key === 'summary') {
        data.summary = cleanValue;
      } else if (key === 'type') {
        data.type = cleanValue as 'PP' | 'DL';
      }
    }
  }
  
  return { data, content: markdownContent };
}

// 간단 캐시(세션 단위)
let cachedRecords: Record[] | null = null;
let lastFetchAtMs: number | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5분

export async function loadAllRecords(): Promise<Record[]> {
  // 캐시 유효 시 반환
  if (cachedRecords && lastFetchAtMs && Date.now() - lastFetchAtMs < CACHE_TTL_MS) {
    return cachedRecords;
  }

  const records: Record[] = [];

  try {
    const allFiles = (diaryList as RecordList).files;
    const recordFiles = allFiles.filter(file => !file.includes('memo.md'));

    // 네트워크 타임아웃 보호
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const filePromises = recordFiles.map(async (filePath) => {
      try {
        const fullPath = `/daily-record${filePath}`;
        const response = await fetch(fullPath, { signal: controller.signal });
        if (!response.ok) return null;
        const content = await response.text();
        const record = parseRecordFile(filePath, content);
        return record;
      } catch {
        return null;
      }
    });

    const results = await Promise.all(filePromises);
    clearTimeout(timeoutId);

    const validRecords = results.filter((record): record is Record => record !== null);
    records.push(...validRecords);

  } catch {
    // 에러 발생 시 빈 배열 반환
  }

  const sorted = records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  cachedRecords = sorted;
  lastFetchAtMs = Date.now();
  return sorted;
}

// 이미지 경로를 GitHub Pages에 맞게 변환하는 함수
function processImagePaths(content: string, filePath: string): string {
  // 상대 경로 이미지를 절대 경로로 변환
  const basePath = '/daily-record';
  const processedContent = content.replace(
    /!\[([^\]]*)\]\(image\/([^)]+)\)/g,
    `![$1](${basePath}/records${filePath.replace('/records', '').replace(/\/[^/]+\.md$/, '')}/image/$2)`
  );
  return processedContent;
}

export function parseRecordFile(filePath: string, content: string): Record | null {
  try {
    const { data, content: markdownContent } = parseFrontmatter(content);
    const frontmatter = data as RecordFrontmatter;
    
    // 파일명에서 날짜와 인덱스 추출
    const fileName = filePath.split('/').pop()?.replace('.md', '') || '';
    const dateMatch = fileName.match(/^(\d{4}-\d{2}-\d{2})-(\d+)$/);
    
    if (!dateMatch) {
      return null;
    }
    
    const [, fileDate, index] = dateMatch;
    
    // frontmatter의 날짜가 있으면 우선 사용, 없으면 파일명에서 추출
    const date = frontmatter.date || fileDate;
    const title = frontmatter.title || `기록 ${index}`;
    
    // slug 생성 (URL에 사용) - 인덱스 사용
    const slug = index;
    
    // 이미지 경로 처리
    const processedContent = processImagePaths(markdownContent, filePath);
    
    const record = {
      id: fileName,
      title,
      date,
      tags: frontmatter.tags || [],
      summary: frontmatter.summary,
      content: processedContent,
      slug,
      type: frontmatter.type
    };
    
    return record;
  } catch {
    return null;
  }
}

export function getRecordBySlug(records: Record[], year: string, month: string, day: string, slug: string): Record | null {
  const targetDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  return records.find(record => 
    record.date === targetDate && record.slug === slug
  ) || null;
}

export function getRecordsByDate(records: Record[], year: string, month: string, day: string): Record[] {
  const targetDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  return records.filter(record => record.date === targetDate);
}

export function getRecordsByMonth(records: Record[], year: string, month: string): Record[] {
  const targetMonth = `${year}-${month.padStart(2, '0')}`;
  return records.filter(record => record.date.startsWith(targetMonth));
}
