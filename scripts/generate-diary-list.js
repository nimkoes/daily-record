import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// public/records 폴더에서 모든 .md 파일 찾기 (기록 파일들)
function findMarkdownFiles(dir, basePath = '') {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const relativePath = path.join(basePath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // 하위 디렉토리 재귀적으로 탐색
      files.push(...findMarkdownFiles(fullPath, relativePath));
    } else if (item.endsWith('.md')) {
      // .md 파일인 경우 목록에 추가
      files.push(`/records/${relativePath.replace(/\\/g, '/')}`);
    }
  }
  
  return files;
}

// public/records 폴더 경로
const recordsDir = path.join(__dirname, '../public/records');

if (fs.existsSync(recordsDir)) {
  const markdownFiles = findMarkdownFiles(recordsDir);
  
  // 파일 목록을 JSON으로 생성
  const output = {
    files: markdownFiles,
    generatedAt: new Date().toISOString()
  };
  
  // src/utils/diaryList.json 파일로 저장
  const outputPath = path.join(__dirname, '../src/utils/diaryList.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  
  console.log(`Generated record list with ${markdownFiles.length} files:`);
  markdownFiles.forEach(file => console.log(`  - ${file}`));
} else {
  console.log('Records directory not found:', recordsDir);
}
