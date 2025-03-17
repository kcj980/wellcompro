'use client';

import { useState, useEffect } from 'react';
//현재사용은 안하고 있음 gpt사용한거 저장용
/**
 * BibleVerse 컴포넌트 - 성경 구절을 불러와 표시하는 컴포넌트
 * 처음 로드 시 DB에서 최신 구절을 불러오고, 새로운 구절 버튼 클릭 시 새 구절을 요청함
 */
export default function BibleVerse() {
  // 성경 구절 데이터(reference, verse, explanation)를 저장하는 상태
  const [verseData, setVerseData] = useState(null);
  // 데이터 로딩 상태를 관리하는 상태
  const [loading, setLoading] = useState(true);
  // 오류 발생 시 메시지를 저장하는 상태
  const [error, setError] = useState(null);
  // 새 구절 요청 쿨다운 활성화 상태
  const [cooldown, setCooldown] = useState(false);
  // 쿨다운 남은 시간 (초)
  const [cooldownTime, setCooldownTime] = useState(0);
  // 이미 본 성경 구절 참조를 저장하는 배열 (중복 방지용)
  const [seenReferences, setSeenReferences] = useState([]);
  // 구절을 가져온/저장된 시간 표시용 상태
  const [verseTimestamp, setVerseTimestamp] = useState(null);
  // DB에서 가져온 구절인지 여부 (true: DB에서 로드, false: API에서 새로 생성)
  const [isDBVerse, setIsDBVerse] = useState(false);
  // 최근 구절 로딩 상태
  const [recentReferencesLoaded, setRecentReferencesLoaded] = useState(false);

  /**
   * 최근 10개 구절의 reference 불러오기
   * 페이지 첫 로드 시 중복 방지를 위해 호출됨
   */
  const fetchRecentReferences = async () => {
    try {
      const response = await fetch('/api/bible?references=recent');
      
      if (!response.ok) {
        throw new Error('최근 구절 목록을 불러오는데 실패했습니다');
      }
      
      const data = await response.json();
      
      if (data.references && Array.isArray(data.references)) {
        setSeenReferences(data.references);
      }
      
      setRecentReferencesLoaded(true);
    } catch (err) {
      console.error('최근 구절 reference 로드 실패:', err);
      setRecentReferencesLoaded(true); // 오류가 있어도 로드 시도는 완료된 것으로 처리
    }
  };

  /**
   * 새로운 구절 가져오기 (버튼 클릭 시 호출)
   * API에 POST 요청을 보내 새 구절을 요청하고, 이미 본 구절을 제외함
   */
  const fetchNewBibleVerse = async () => {
    try {
      // 로딩 상태를 true로 설정하여 로딩 인디케이터 표시
      setLoading(true);
      // API에 POST 요청을 보내 새 구절을 요청
      const response = await fetch('/api/bible', {
        method: 'POST', // HTTP 메서드를 POST로 설정
        headers: {
          'Content-Type': 'application/json', // JSON 형식으로 요청 설정
        },
        body: JSON.stringify({ // 요청 본문을 JSON 문자열로 변환
          excludeReferences: seenReferences, // 이미 본 구절 제외 목록 전송
          forceNew: true // 새 구절 강제 요청 플래그 (DB 구절을 사용하지 않고 항상 새 구절 생성)
        }),
      });
      
      // 응답 상태가 성공(200-299)이 아닌 경우 오류 발생
      if (!response.ok) {
        throw new Error('API 요청에 실패했습니다');
      }
      
      // 응답 데이터를 JSON으로 파싱
      const data = await response.json();
      // 파싱한 구절 데이터를 상태에 저장
      setVerseData(data);
      // API에서 새로 생성된 구절임을 표시 (UI에 "구절 조회 시간"으로 표시됨)
      setIsDBVerse(false);
      
      // 데이터와 참조가 있는 경우, 해당 구절을 본 구절 목록에 추가
      if (data && data.reference) {
        setSeenReferences(prev => [...prev, data.reference]);
      }
      
      // 현재 시간을 한국 시간으로 설정하여 타임스탬프 저장
      setVerseTimestamp(new Date().toLocaleString('ko-KR', {
        timeZone: 'Asia/Seoul', // 한국 시간대 사용
        year: 'numeric', // 연도 표시
        month: 'long', // 월 표시 (긴 형식)
        day: 'numeric', // 일 표시
        hour: '2-digit', // 시간 표시 (2자리)
        minute: '2-digit' // 분 표시 (2자리)
      }));
      
      // 오류 상태 초기화
      setError(null);
      
      // 쿨다운 활성화 및 시간 설정 (35초)
      setCooldown(true);
      setCooldownTime(35);
    } catch (err) {
      // 오류 발생 시 사용자에게 보여줄 메시지 설정
      setError('성경 구절을 불러오는 데 실패했습니다. 다시 시도해 주세요.');
      // 오류 세부 내용을 콘솔에 출력
      console.error(err);
    } finally {
      // 성공/실패 여부와 관계없이 로딩 상태 종료
      setLoading(false);
    }
  };

  /**
   * 최신 구절 가져오기 (초기 로드 시 호출)
   * API에 GET 요청을 보내 DB에 저장된 최신 구절을 불러옴
   */
  const fetchLatestBibleVerse = async () => {
    try {
      // 로딩 상태를 true로 설정하여 로딩 인디케이터 표시
      setLoading(true);
      // API에 GET 요청을 보내 최신 구절을 요청
      const response = await fetch('/api/bible');
      
      // 응답 상태가 성공(200-299)이 아닌 경우 오류 발생
      if (!response.ok) {
        throw new Error('API 요청에 실패했습니다');
      }
      
      // 응답 데이터를 JSON으로 파싱
      const data = await response.json();
      // 파싱한 구절 데이터를 상태에 저장
      setVerseData(data);
      // DB에서 가져온 구절임을 표시 (UI에 "저장된 시간"으로 표시됨)
      setIsDBVerse(true);
      
      // 데이터와 참조가 있는 경우, 해당 구절을 본 구절 목록에 이미 없을 때만 추가
      if (data && data.reference && !seenReferences.includes(data.reference)) {
        setSeenReferences(prev => [...prev, data.reference]);
      }
      
      // DB에 저장된 시간이 있는 경우, 이를 한국 시간으로 변환하여 표시
      if (data && data.createdAt) {
        const savedTime = new Date(data.createdAt); // DB 저장 시간을 Date 객체로 변환
        const adjustedDate = new Date(savedTime.getTime() - (9 * 60 * 60 * 1000));
        setVerseTimestamp(adjustedDate.toLocaleString('ko-KR', { // 한국 시간으로 변환하여 타임스탬프 설정
          timeZone: 'Asia/Seoul',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }));
      } else {
        // createdAt 필드가 없는 경우 현재 시간을 사용 (fallback)
        setVerseTimestamp(new Date().toLocaleString('ko-KR', {
          timeZone: 'Asia/Seoul',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }));
      }
      
      // 오류 상태 초기화
      setError(null);
    } catch (err) {
      // 오류 발생 시 사용자에게 보여줄 메시지 설정
      setError('성경 구절을 불러오는 데 실패했습니다. 다시 시도해 주세요.');
      // 오류 세부 내용을 콘솔에 출력
      console.error(err);
    } finally {
      // 성공/실패 여부와 관계없이 로딩 상태 종료
      setLoading(false);
    }
  };

  /**
   * 쿨다운 타이머를 관리하는 Effect 훅
   * 쿨다운이 활성화되면 1초마다 타이머를 감소시키고, 0이 되면 쿨다운 비활성화
   */
  useEffect(() => {
    let timer; // 타이머 ID를 저장할 변수
    // 쿨다운이 활성화되고 시간이 0보다 클 때 타이머 동작
    if (cooldown && cooldownTime > 0) {
      // 1초마다 실행되는 인터벌 설정
      timer = setInterval(() => {
        // 이전 시간을 기반으로 새 시간 계산
        setCooldownTime((prevTime) => {
          // 1초 이하로 남았다면 쿨다운 종료
          if (prevTime <= 1) {
            setCooldown(false); // 쿨다운 비활성화
            clearInterval(timer); // 타이머 제거
            return 0; // 0초로 설정
          }
          return prevTime - 1; // 1초 감소
        });
      }, 1000); // 1초(1000ms) 마다 실행
    }
    
    // 컴포넌트 언마운트되거나 의존성이 변경될 때 타이머 정리
    return () => {
      if (timer) clearInterval(timer); // 타이머가 존재하면 제거
    };
  }, [cooldown, cooldownTime]); // cooldown 또는 cooldownTime이 변경될 때마다 실행

  /**
   * 최근 10개 구절의 reference 로딩 Effect 훅
   */
  useEffect(() => {
    // 컴포넌트 마운트 시 최근 10개 구절의 reference 로드
    fetchRecentReferences();
  }, []); // 빈 의존성 배열로 컴포넌트 마운트 시 한 번만 실행

  /**
   * 컴포넌트 마운트 또는 최근 reference 로드 완료 시 최신 구절을 가져오는 Effect 훅
   */
  useEffect(() => {
    // 최근 reference 목록 로드가 완료된 후에만 최신 구절 로드
    if (recentReferencesLoaded) {
      fetchLatestBibleVerse();
    }
  }, [recentReferencesLoaded]); // recentReferencesLoaded가 변경될 때 실행

  // 컴포넌트 UI 반환
  return (
    // 메인 컨테이너 - 최대 너비, 자동 마진, 패딩, 배경 그라데이션, 최소 높이 설정
    <div className="max-w-5xl mx-auto py-2 px-4 bg-gradient-to-b from-slate-50 to-white min-h-[30vh]">
      {/* 헤더 영역 - 제목과 버튼을 양쪽에 배치 */}
      <div className="flex flex-wrap justify-between items-center mb-2">
        {/* 제목 영역 */}
        <div>
          {/* 메인 제목 - 크기, 폰트, 색상 등 설정 */}
          <h1 className="text-xl font-serif font-bold text-slate-800 tracking-tight">오늘의 성경 구절</h1>
          {/* 부제목 - 작은 크기와 연한 색상 */}
          <p className="text-slate-500 text-xs">매일 새로운 영감을 주는 말씀</p>
        </div>
        {/* 새 구절 요청 버튼 */}
        <button 
          onClick={fetchNewBibleVerse} // 클릭 시 새 구절 요청 함수 호출
          // 버튼 스타일 - 쿨다운 상태에 따라 다른 배경색과 커서 스타일 적용
          className={`px-3 py-1.5 text-white rounded-full transition-all duration-300 shadow-sm flex items-center gap-1.5 text-xs
            ${cooldown ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}
          `}
          disabled={loading || cooldown} // 로딩 중이거나 쿨다운 중이면 버튼 비활성화
        >
          {/* 로딩 중일 때 표시할 내용 */}
          {loading ? (
            <>
              {/* 로딩 스피너 아이콘 - 회전 애니메이션 적용 */}
              <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>불러오는 중</span> {/* 로딩 중 텍스트 */}
            </>
          ) : cooldown ? ( // 쿨다운 중일 때 표시할 내용
            <>
              {/* 시계 아이콘 */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{cooldownTime}초 후 가능</span> {/* 남은 쿨다운 시간 표시 */}
            </>
          ) : ( // 기본 상태일 때 표시할 내용
            <>
              {/* 새로고침 아이콘 */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>새로운 구절</span> {/* 버튼 텍스트 */}
            </>
          )}
        </button>
      </div>

      {/* 오류가 있을 때 표시할 내용 */}
      {error ? (
        // 오류 메시지 컨테이너 - 빨간색 배경과 테두리, 둥근 모서리
        <div className="bg-red-50 p-2 rounded-lg border border-red-200 text-red-800 my-2 text-xs flex items-center gap-1.5">
          {/* 경고 아이콘 */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>{error}</p> {/* 오류 메시지 표시 */}
        </div>
      ) : loading ? ( // 로딩 중일 때 표시할 내용
        // 로딩 인디케이터 컨테이너 - 중앙 정렬
        <div className="flex justify-center items-center h-40">
          {/* 로딩 스피너 컨테이너 */}
          <div className="relative w-12 h-12">
            {/* 펄스 애니메이션 배경 */}
            <div className="absolute top-0 left-0 right-0 bottom-0 animate-pulse bg-indigo-100 rounded-full opacity-75"></div>
            {/* 회전 애니메이션 원 */}
            <div className="absolute inset-2 animate-spin">
              <div className="h-full w-full border-3 border-t-indigo-500 border-b-indigo-300 border-l-indigo-300 border-r-indigo-300 rounded-full"></div>
            </div>
          </div>
        </div>
      ) : verseData && ( // 구절 데이터가 있을 때 표시할 내용
        // 구절 컨테이너
        <div className="relative">
          {/* 좌상단 장식 요소 - 둥근 형태의 블러 처리된 배경 */}
          <div className="absolute -top-2 -left-2 w-16 h-16 rounded-full bg-blue-50 opacity-30 blur-lg z-0"></div>
          {/* 우하단 장식 요소 - 둥근 형태의 블러 처리된 배경 */}
          <div className="absolute bottom-2 -right-2 w-16 h-16 rounded-full bg-amber-50 opacity-30 blur-lg z-0"></div>
          
          {/* 구절 카드 컨테이너 - 흰색 배경, 그림자, 둥근 모서리, 테두리 */}
          <div className="bg-white rounded-lg overflow-hidden shadow-md relative z-10 border border-slate-100">
            {/* 카드 내부 그리드 레이아웃 - 모바일에서는 1열, 태블릿/데스크톱에서는 4열 중 좌측이 1열, 우측이 3열 */}
            <div className="grid grid-cols-1 md:grid-cols-4">
              {/* 좌측 컬럼 - 그라데이션 배경 */}
              <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 p-3 text-white relative md:col-span-1">
                {/* 배경 장식 - SVG 패턴 */}
                <div className="absolute top-0 right-0 w-full h-full opacity-10">
                  <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path fill="currentColor" d="M0,0 L100,0 C60,20 40,40 20,60 L0,100 Z"></path>
                  </svg>
                </div>
                {/* 좌측 컬럼 제목 */}
                <h2 className="text-lg font-bold">오늘의 말씀</h2>
                {/* 오늘 날짜 표시 - 한국어 형식 */}
                <p className="text-white text-opacity-80 text-xs">{new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}</p>
                
                {/* 출처 표시 영역 - 반투명 흰색 배경, 둥근 모서리 */}
                <div className="mt-3 flex items-center gap-1.5 bg-white bg-opacity-20 p-1.5 rounded-lg">
                  {/* 출처 아이콘 배경 - 원형, 연한 보라색 */}
                  <div className="w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center text-violet-500 shrink-0">
                    {/* 책 아이콘 */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
                    </svg>
                  </div>
                  {/* 성경 구절 출처 표시 (예: 요한복음 3:16) */}
                  <p className="text-white text-xs font-medium">{verseData.reference}</p>
                </div>
              </div>

              {/* 우측 컬럼 - 구절 내용 (모바일에서는 전체 너비, 데스크톱에서는 3/4 너비) */}
              <div className="p-3 md:col-span-3">
                {/* 내용 그리드 - 1열, 항목 간 간격 */}
                <div className="grid grid-cols-1 gap-2">
                  {/* 성경 구절 영역 */}
                  <div>
                    {/* 구절 헤더 - 아이콘과 텍스트 배치 */}
                    <div className="flex items-center gap-1.5 mb-1">
                      {/* 구절 아이콘 배경 - 원형, 연한 황색 */}
                      <div className="w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center text-amber-500">
                        {/* 말풍선 아이콘 */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      {/* 구절 섹션 제목 */}
                      <h3 className="text-xs font-medium text-slate-600">성경 구절</h3>
                    </div>
                    {/* 구절 내용 배경 - 연한 황색, 둥근 모서리 */}
                    <div className="relative bg-amber-50 bg-opacity-50 p-2 rounded-lg">
                      {/* 성경 구절 내용 - 세리프 폰트, 여백 */}
                      <p className="text-slate-800 font-serif text-base leading-snug mx-1">{verseData.verse}</p>
                    </div>
                  </div>

                  {/* 설명 영역 */}
                  <div>
                    {/* 설명 헤더 - 아이콘과 텍스트 배치 */}
                    <div className="flex items-center gap-1.5 mb-1">
                      {/* 설명 아이콘 배경 - 원형, 연한 청록색 */}
                      <div className="w-4 h-4 rounded-full bg-teal-100 flex items-center justify-center text-teal-500">
                        {/* 정보 아이콘 */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      {/* 설명 섹션 제목 */}
                      <h3 className="text-xs font-medium text-slate-600">말씀 해설</h3>
                    </div>
                    {/* 설명 내용 - 약간의 들여쓰기(ml-6) 적용 */}
                    <p className="text-slate-700 text-sm leading-snug ml-6">{verseData.explanation}</p>
                  </div>
                </div>

                {/* 푸터 영역 - 좌우 배치 */}
                <div className="flex justify-between items-end mt-2">
                  {/* 타임스탬프 영역 - 왼쪽 정렬 */}
                  <div className="text-slate-400 text-[10px]">
                    {/* 타임스탬프 레이아웃 - 시계 아이콘과 텍스트 */}
                    <p className="flex items-center gap-1">
                      {/* 시계 아이콘 */}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {/* 시간 형식 표시 - DB에서 가져온 데이터인지 API에서 새로 생성된 것인지에 따라 다름 */}
                      {isDBVerse ? '저장된 시간:' : '구절 조회 시간:'} {verseTimestamp || '불러오는 중...'}
                    </p>
                  </div>
                  {/* 푸터 메시지 영역 - 오른쪽 정렬, 기울임꼴 */}
                  <div className="text-right text-slate-400 text-[10px] italic">
                    {/* 격려 메시지 */}
                    <p>하나님의 말씀이 당신의 하루에 빛이 되기를</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
