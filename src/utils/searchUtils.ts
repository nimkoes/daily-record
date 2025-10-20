import { Record, SearchResult } from '../types/diary';

export function searchRecords(records: Record[], query: string): SearchResult[] {
  if (!query.trim()) {
    return [];
  }
  
  const searchTerm = query.toLowerCase().trim();
  const results: SearchResult[] = [];
  
  records.forEach(record => {
    const matches: SearchResult['matches'] = [];
    
    // 제목 검색
    if (record.title.toLowerCase().includes(searchTerm)) {
      matches.push({
        field: 'title',
        text: record.title
      });
    }
    
    // 본문 검색
    if (record.content.toLowerCase().includes(searchTerm)) {
      matches.push({
        field: 'content',
        text: record.content
      });
    }
    
    // 태그 검색
    const matchingTags = record.tags.filter(tag => 
      tag.toLowerCase().includes(searchTerm)
    );
    if (matchingTags.length > 0) {
      matches.push({
        field: 'tags',
        text: matchingTags.join(', ')
      });
    }
    
    if (matches.length > 0) {
      results.push({
        record,
        matches
      });
    }
  });
  
  return results;
}

export function highlightText(text: string, searchTerm: string): string {
  if (!searchTerm.trim()) {
    return text;
  }
  
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
}
