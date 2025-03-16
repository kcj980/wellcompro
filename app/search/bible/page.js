import BibleVerse from '../bible';

export const metadata = {
  title: '오늘의 성경 구절',
  description: 'AI로 추천받는 오늘의 의미있는 성경 구절',
};

export default function BibleVersePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <BibleVerse />
    </main>
  );
} 