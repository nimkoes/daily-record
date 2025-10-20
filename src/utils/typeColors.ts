export type DiaryType = string;

export interface TypeColorConfig {
  background: string;
  border: string;
  text: string;
  badge: string;
}

// 30개의 파스텔 톤 색상 팔레트 (PP, DL 포함)
const COLOR_PALETTE: TypeColorConfig[] = [
  // 기존 PP, DL 색상 유지 (인덱스 0, 1)
  {
    background: 'bg-pink-50',
    border: 'border-pink-200',
    text: 'text-pink-800',
    badge: 'bg-pink-100 text-pink-700'
  },
  {
    background: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-800',
    badge: 'bg-purple-100 text-purple-700'
  },
  // 추가 파스텔 톤 색상들
  {
    background: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    badge: 'bg-blue-100 text-blue-700'
  },
  {
    background: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    badge: 'bg-green-100 text-green-700'
  },
  {
    background: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
    badge: 'bg-yellow-100 text-yellow-700'
  },
  {
    background: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-800',
    badge: 'bg-orange-100 text-orange-700'
  },
  {
    background: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    badge: 'bg-red-100 text-red-700'
  },
  {
    background: 'bg-indigo-50',
    border: 'border-indigo-200',
    text: 'text-indigo-800',
    badge: 'bg-indigo-100 text-indigo-700'
  },
  {
    background: 'bg-teal-50',
    border: 'border-teal-200',
    text: 'text-teal-800',
    badge: 'bg-teal-100 text-teal-700'
  },
  {
    background: 'bg-cyan-50',
    border: 'border-cyan-200',
    text: 'text-cyan-800',
    badge: 'bg-cyan-100 text-cyan-700'
  },
  {
    background: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-800',
    badge: 'bg-emerald-100 text-emerald-700'
  },
  {
    background: 'bg-lime-50',
    border: 'border-lime-200',
    text: 'text-lime-800',
    badge: 'bg-lime-100 text-lime-700'
  },
  {
    background: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    badge: 'bg-amber-100 text-amber-700'
  },
  {
    background: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-800',
    badge: 'bg-rose-100 text-rose-700'
  },
  {
    background: 'bg-violet-50',
    border: 'border-violet-200',
    text: 'text-violet-800',
    badge: 'bg-violet-100 text-violet-700'
  },
  {
    background: 'bg-fuchsia-50',
    border: 'border-fuchsia-200',
    text: 'text-fuchsia-800',
    badge: 'bg-fuchsia-100 text-fuchsia-700'
  },
  {
    background: 'bg-sky-50',
    border: 'border-sky-200',
    text: 'text-sky-800',
    badge: 'bg-sky-100 text-sky-700'
  },
  {
    background: 'bg-slate-50',
    border: 'border-slate-200',
    text: 'text-slate-800',
    badge: 'bg-slate-100 text-slate-700'
  },
  {
    background: 'bg-zinc-50',
    border: 'border-zinc-200',
    text: 'text-zinc-800',
    badge: 'bg-zinc-100 text-zinc-700'
  },
  {
    background: 'bg-neutral-50',
    border: 'border-neutral-200',
    text: 'text-neutral-800',
    badge: 'bg-neutral-100 text-neutral-700'
  },
  {
    background: 'bg-stone-50',
    border: 'border-stone-200',
    text: 'text-stone-800',
    badge: 'bg-stone-100 text-stone-700'
  },
  {
    background: 'bg-slate-100',
    border: 'border-slate-300',
    text: 'text-slate-900',
    badge: 'bg-slate-200 text-slate-800'
  },
  {
    background: 'bg-zinc-100',
    border: 'border-zinc-300',
    text: 'text-zinc-900',
    badge: 'bg-zinc-200 text-zinc-800'
  },
  {
    background: 'bg-neutral-100',
    border: 'border-neutral-300',
    text: 'text-neutral-900',
    badge: 'bg-neutral-200 text-neutral-800'
  },
  {
    background: 'bg-stone-100',
    border: 'border-stone-300',
    text: 'text-stone-900',
    badge: 'bg-stone-200 text-stone-800'
  },
  {
    background: 'bg-gray-100',
    border: 'border-gray-300',
    text: 'text-gray-900',
    badge: 'bg-gray-200 text-gray-800'
  },
  {
    background: 'bg-blue-100',
    border: 'border-blue-300',
    text: 'text-blue-900',
    badge: 'bg-blue-200 text-blue-800'
  },
  {
    background: 'bg-green-100',
    border: 'border-green-300',
    text: 'text-green-900',
    badge: 'bg-green-200 text-green-800'
  },
  {
    background: 'bg-yellow-100',
    border: 'border-yellow-300',
    text: 'text-yellow-900',
    badge: 'bg-yellow-200 text-yellow-800'
  },
  {
    background: 'bg-orange-100',
    border: 'border-orange-300',
    text: 'text-orange-900',
    badge: 'bg-orange-200 text-orange-800'
  }
];

// 타입별 색상 매핑 캐시
const typeColorCache = new Map<string, TypeColorConfig>();

// 해시 함수를 사용하여 타입명을 색상 인덱스로 변환
function getColorIndex(type: string): number {
  let hash = 0;
  for (let i = 0; i < type.length; i++) {
    const char = type.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 32bit 정수로 변환
  }
  return Math.abs(hash) % COLOR_PALETTE.length;
}

export const getTypeColors = (type?: string): TypeColorConfig => {
  if (!type) {
    return {
      background: 'bg-gray-50',
      border: 'border-gray-200',
      text: 'text-gray-800',
      badge: 'bg-gray-100 text-gray-700'
    };
  }

  // 캐시에서 확인
  if (typeColorCache.has(type)) {
    return typeColorCache.get(type)!;
  }

  // PP, DL은 기존 색상 유지 (인덱스 0, 1)
  let colorIndex: number;
  if (type === 'PP') {
    colorIndex = 0;
  } else if (type === 'DL') {
    colorIndex = 1;
  } else {
    // 다른 타입들은 해시 기반으로 색상 할당
    colorIndex = getColorIndex(type);
  }

  const colorConfig = COLOR_PALETTE[colorIndex];
  
  // 캐시에 저장
  typeColorCache.set(type, colorConfig);
  
  return colorConfig;
};
