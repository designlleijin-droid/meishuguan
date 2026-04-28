import { Hall, HallType, Sticker } from './types.ts';

export const HALLS: Hall[] = [
  {
    id: HallType.ANIMAL,
    titleZh: '动物馆',
    titleEn: 'Animal Hall',
    color: 'from-orange-400 to-red-500',
    icon: '🐾'
  },
  {
    id: HallType.PLANT,
    titleZh: '植物馆',
    titleEn: 'Plant Hall',
    color: 'from-green-400 to-emerald-600',
    icon: '🌿'
  },
  {
    id: HallType.ARTIFACT,
    titleZh: '文物馆',
    titleEn: 'Artifact Hall',
    color: 'from-amber-500 to-yellow-700',
    icon: '🏺'
  },
  {
    id: HallType.BUILDING,
    titleZh: '建筑馆',
    titleEn: 'Building Hall',
    color: 'from-blue-400 to-indigo-600',
    icon: '🏙️'
  }
];

export const INITIAL_STICKERS: Sticker[] = [
  {
    id: '1',
    nameZh: '小猫',
    nameEn: 'Cat',
    hallType: HallType.ANIMAL,
    imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&h=200&fit=crop',
    originalImageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500',
    fact: '猫咪是优秀的猎手，它们的胡须能感知细微的空气流动。',
    capturedAt: Date.now() - 86400000,
    interactionType: 'sound'
  },
  {
    id: '2',
    nameZh: '郁金香',
    nameEn: 'Tulip',
    hallType: HallType.PLANT,
    imageUrl: 'https://images.unsplash.com/photo-1520323232427-81c328de20ad?w=200&h=200&fit=crop',
    originalImageUrl: 'https://images.unsplash.com/photo-1520323232427-81c328de20ad?w=500',
    fact: '郁金香在春天开放，曾被视为财富和尊贵的象征。',
    capturedAt: Date.now() - 172800000,
    interactionType: 'detail'
  }
];
