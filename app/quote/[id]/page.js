'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function QuotePage({ params }) {
  const router = useRouter();
  const { id } = params;
  
  // 견적서 인쇄 페이지로 이동하는 함수
  const navigateToPrintPage = (type) => {
    router.push(`/quote/${id}/${type}`);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">견적서 인쇄</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => navigateToPrintPage('consumer')}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg shadow transition-colors"
        >
          견적서 (일반소비자)
        </button>
        
        <button
          onClick={() => navigateToPrintPage('business')}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg shadow transition-colors"
        >
          견적서 (기업)
        </button>
        
        <button
          onClick={() => navigateToPrintPage('contract')}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg shadow transition-colors"
        >
          견적계약서
        </button>
        
        <button
          onClick={() => navigateToPrintPage('delivery')}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg shadow transition-colors"
        >
          납품서
        </button>
      </div>
      
      <button
        onClick={() => router.back()}
        className="mt-6 text-gray-600 hover:text-gray-800 font-medium"
      >
        ← 돌아가기
      </button>
      <div className="mt-6">현재 견적서(일반소비자)만 완성했어요~~~</div>
    </div>
  );
} 