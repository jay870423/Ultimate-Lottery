import { Participant, Prize } from './types';

export const DEFAULT_PRIZES: Prize[] = [
  { id: 'p1', name: '特等奖: 未来探索之旅 (SpaceX 参观)', count: 1, level: 1, image: '🚀' },
  { id: 'p2', name: '一等奖: MacBook Pro M3', count: 3, level: 2, image: '💻' },
  { id: 'p3', name: '二等奖: iPhone 16 Pro', count: 5, level: 3, image: '📱' },
  { id: 'p4', name: '三等奖: PS5 Pro + VR2', count: 10, level: 4, image: '🎮' },
  { id: 'p5', name: '幸运奖: 机械键盘', count: 20, level: 5, image: '⌨️' },
];

export const MOCK_PARTICIPANTS: Participant[] = Array.from({ length: 50 }, (_, i) => ({
  id: `u${i}`,
  name: `员工 ${i + 1}`,
  department: ['技术部', '产品部', '设计部', '市场部', '人事部'][Math.floor(Math.random() * 5)],
}));
