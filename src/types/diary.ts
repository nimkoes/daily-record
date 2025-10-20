export interface Record {
  id: string;
  title: string;
  date: string;
  tags: string[];
  summary?: string;
  content: string;
  slug: string;
  type?: string;
}

export interface RecordFrontmatter {
  title?: string;
  date?: string;
  tags?: string[];
  summary?: string;
  type?: string;
}

export interface SearchResult {
  record: Record;
  matches: {
    field: 'title' | 'content' | 'tags';
    text: string;
  }[];
}
