'use client';

import { useState, useEffect } from 'react';

export default function BibleVerse() {
  const [verseData, setVerseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBibleVerse = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/bible');
      if (!response.ok) {
        throw new Error('API 요청에 실패했습니다');
      }
      const data = await response.json();
      setVerseData(data);
      setError(null);
    } catch (err) {
      setError('성경 구절을 불러오는 데 실패했습니다. 다시 시도해 주세요.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBibleVerse();
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-2 px-4 bg-gradient-to-b from-slate-50 to-white min-h-[30vh]">
      <div className="flex flex-wrap justify-between items-center mb-2">
        <div>
          <h1 className="text-xl font-serif font-bold text-slate-800 tracking-tight">오늘의 성경 구절</h1>
          <p className="text-slate-500 text-xs">매일 새로운 영감을 주는 말씀</p>
        </div>
        <button 
          onClick={fetchBibleVerse} 
          className="px-3 py-1.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all duration-300 shadow-sm flex items-center gap-1.5 text-xs"
          disabled={loading}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>불러오는 중</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>새로운 구절</span>
            </>
          )}
        </button>
      </div>

      {error ? (
        <div className="bg-red-50 p-2 rounded-lg border border-red-200 text-red-800 my-2 text-xs flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>{error}</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="relative w-12 h-12">
            <div className="absolute top-0 left-0 right-0 bottom-0 animate-pulse bg-indigo-100 rounded-full opacity-75"></div>
            <div className="absolute inset-2 animate-spin">
              <div className="h-full w-full border-3 border-t-indigo-500 border-b-indigo-300 border-l-indigo-300 border-r-indigo-300 rounded-full"></div>
            </div>
          </div>
        </div>
      ) : verseData && (
        <div className="relative">
          {/* 배경 장식 요소 - 더 작게 수정 */}
          <div className="absolute -top-2 -left-2 w-16 h-16 rounded-full bg-blue-50 opacity-30 blur-lg z-0"></div>
          <div className="absolute bottom-2 -right-2 w-16 h-16 rounded-full bg-amber-50 opacity-30 blur-lg z-0"></div>
          
          {/* 통합된 내용 컨테이너 */}
          <div className="bg-white rounded-lg overflow-hidden shadow-md relative z-10 border border-slate-100">
            {/* 헤더와 콘텐츠를 가로로 배치 */}
            <div className="grid grid-cols-1 md:grid-cols-4">
              {/* 헤더 영역 - 세로 형태로 */}
              <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 p-3 text-white relative md:col-span-1">
                <div className="absolute top-0 right-0 w-full h-full opacity-10">
                  <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path fill="currentColor" d="M0,0 L100,0 C60,20 40,40 20,60 L0,100 Z"></path>
                  </svg>
                </div>
                <h2 className="text-lg font-bold">오늘의 말씀</h2>
                <p className="text-white text-opacity-80 text-xs">{new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}</p>
                
                <div className="mt-3 flex items-center gap-1.5 bg-white bg-opacity-20 p-1.5 rounded-lg">
                  <div className="w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center text-violet-500 shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
                    </svg>
                  </div>
                  <p className="text-white text-xs font-medium">{verseData.reference}</p>
                </div>
              </div>

              {/* 내용 영역 */}
              <div className="p-3 md:col-span-3">
                <div className="grid grid-cols-1 gap-2">
                  {/* 성경 구절 */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center text-amber-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <h3 className="text-xs font-medium text-slate-600">성경 구절</h3>
                    </div>
                    <div className="relative bg-amber-50 bg-opacity-50 p-2 rounded-lg">
                      <p className="text-slate-800 font-serif text-base leading-snug mx-1">{verseData.verse}</p>
                    </div>
                  </div>

                  {/* 설명 */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-4 h-4 rounded-full bg-teal-100 flex items-center justify-center text-teal-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <h3 className="text-xs font-medium text-slate-600">말씀 해설</h3>
                    </div>
                    <p className="text-slate-700 text-sm leading-snug ml-6">{verseData.explanation}</p>
                  </div>
                </div>

                {/* 푸터 텍스트 */}
                <div className="text-right mt-2 text-slate-400 text-[10px] italic">
                  <p>하나님의 말씀이 당신의 하루에 빛이 되기를</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
