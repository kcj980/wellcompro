'use client';

import { useState, useEffect } from 'react';
/**
 * BibleVerse 컴포넌트 - 성경 구절을 불러와 표시하는 컴포넌트
 * 처음 로드 시 DB에서 최신 구절을 불러오고, 새로운 구절 버튼 클릭 시 새 구절을 요청함
 */
export default function BibleVerse() {
  // 성경 구절 데이터(reference, verse, explanation)를 저장하는 상태
  const [verseData, setVerseData] = useState({
    reference: "요한복음 3:16",
    verse: "하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니 이는 그를 믿는 자마다 멸망하지 않고 영생을 얻게 하려 하심이라",
    explanation: "이 구절은 하나님의 사랑의 깊이와 예수 그리스도를 통한 구원의 선물을 보여줍니다."
  });
  // 데이터 로딩 상태를 관리하는 상태
  const [loading, setLoading] = useState(false);
  // 오류 발생 시 메시지를 저장하는 상태
  const [error, setError] = useState(null);
  // 새 구절 요청 쿨다운 활성화 상태
  const [cooldown, setCooldown] = useState(false);
  // 쿨다운 남은 시간 (초)
  const [cooldownTime, setCooldownTime] = useState(0);
  // 이미 본 성경 구절 참조를 저장하는 배열 (중복 방지용)
  const [seenReferences, setSeenReferences] = useState([]);
  // 구절을 가져온/저장된 시간 표시용 상태
  const [verseTimestamp, setVerseTimestamp] = useState(new Date().toLocaleString('ko-KR'));
  // DB에서 가져온 구절인지 여부 (true: DB에서 로드, false: API에서 새로 생성)
  const [isDBVerse, setIsDBVerse] = useState(false);
  // 최근 구절 로딩 상태
  const [recentReferencesLoaded, setRecentReferencesLoaded] = useState(true);

  /**
   * 최근 10개 구절의 reference 불러오기
   * 페이지 첫 로드 시 중복 방지를 위해 호출됨
   */
  const fetchRecentReferences = async () => {
    try {
      // API 호출이 실패할 경우를 대비해 try-catch로 감싸기
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
      setVerseTimestamp(new Date().toLocaleString('ko-KR'));
      
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
        // UTC 시간에서 9시간을 빼서 한국 시간으로 변환
        const koreanTime = new Date(savedTime.getTime() - (9 * 60 * 60 * 1000));
        setVerseTimestamp(koreanTime.toLocaleString('ko-KR'));
      } else {
        // createdAt 필드가 없는 경우 현재 시간을 사용 (fallback)
        setVerseTimestamp(new Date().toLocaleString('ko-KR'));
      }
      
      // 오류 상태 초기화
      setError(null);
    } catch (err) {
      console.error('성경 구절 불러오기 실패:', err);
      // 기본 성경 구절 표시 (API 호출 실패 시)
      setVerseData({
        reference: "요한복음 3:16",
        verse: "하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니 이는 그를 믿는 자마다 멸망하지 않고 영생을 얻게 하려 하심이라",
        explanation: "이 구절은 하나님의 사랑의 깊이와 예수 그리스도를 통한 구원의 선물을 보여줍니다."
      });
      setVerseTimestamp(new Date().toLocaleString('ko-KR'));
      setError(null); // 오류 메시지 숨기기 (기본값 표시하므로)
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
    // MongoDB가 설정되어 있으면 최근 구절 목록을 가져옴
    if (typeof window !== 'undefined') {
      try {
        fetchRecentReferences();
      } catch (error) {
        console.error('최근 구절 로드 실패:', error);
        setRecentReferencesLoaded(true); // 오류가 있어도 로드 완료로 처리
      }
    }
  }, []); // 빈 의존성 배열로 컴포넌트 마운트 시 한 번만 실행

  /**
   * 컴포넌트 마운트 또는 최근 reference 로드 완료 시 최신 구절을 가져오는 Effect 훅
   */
  useEffect(() => {
    // 최근 reference 목록 로드가 완료된 후에만 최신 구절 로드
    if (recentReferencesLoaded) {
      try {
        fetchLatestBibleVerse();
      } catch (error) {
        console.error('최신 구절 로드 실패:', error);
      }
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
          {/* 로딩 중일 때 로딩 아이콘 표시 */}
          {loading ? (
            <span className="animate-spin inline-block h-3 w-3 border-t-2 border-white rounded-full" />
          ) : (
            <span>새 구절 조회</span>
          )}
          {/* 쿨다운 시간이 0보다 크면 남은 시간 표시 */}
          {cooldown && cooldownTime > 0 && (
            <span className="ml-1 text-xs">({cooldownTime}초)</span>
          )}
        </button>
      </div>

      {/* 오류 메시지 표시 영역 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md mb-4 text-sm">
          {error}
        </div>
      )}

      {/* 구절 내용 표시 영역 - 로딩 중이 아니고 구절 데이터가 있을 때만 표시 */}
      {!loading && verseData && (
        <div className="bg-white rounded-lg border border-slate-100 p-4 shadow-sm">
          {/* 구절 참조 (출처) - 성경책 장/절 정보 */}
          <h2 className="text-lg font-serif text-slate-900 mb-3 font-semibold">{verseData.reference}</h2>
          
          {/* 구절 본문 - 성경 내용 */}
          <p className="text-base text-slate-800 mb-4 font-medium leading-relaxed">{verseData.verse}</p>
          
          {/* 구절 설명 - 해설 */}
          <p className="text-sm text-slate-600">{verseData.explanation}</p>
          
          {/* 타임스탬프 표시 - 저장 시간 또는 로드 시간 */}
          <p className="text-xs text-slate-400 mt-3">
            {isDBVerse ? '저장된 시간: ' : '구절 조회 시간: '}
            {verseTimestamp}
          </p>
        </div>
      )}
    </div>
  );
}
