'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ConsumerQuotePage({ params }) {
  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNotes, setShowNotes] = useState(false);
  const [showStamp, setShowStamp] = useState(true);
  const [showDescription, setShowDescription] = useState(false);
  //const [printTriggered, setPrintTriggered] = useState(false); //자동인쇄 주석처리
  const [showNotesEditor, setShowNotesEditor] = useState(false);
  const [notesContent, setNotesContent] = useState('');
  const [noticeItems, setNoticeItems] = useState([]);
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);
  const [announcementError, setAnnouncementError] = useState(null);
  const [rowEmptyAdd, setRowEmptyAdd] = useState(0); // 빈 행 추가를 위한 상태 변수 추가
  const router = useRouter();
  const printRef = useRef(null);
  const { id } = params;

  // A4 세로 크기와 인쇄 영역 크기 차이에 따라 빈 행 수 자동 계산
  useEffect(() => {
    // 데이터가 로드되고 인쇄 영역이 렌더링된 후에 계산
    if (!loading && estimate && printRef.current) {
      // 약간의 지연을 두어 렌더링이 완료된 후 계산
      const timer = setTimeout(() => {
        const a4Height = 1150; // A4 세로 크기 (픽셀) 임의로 조정
        const printSectionHeight = printRef.current.offsetHeight; // 인쇄 영역의 높이

        console.log('인쇄 영역 높이:', printSectionHeight, 'px');

        // A4 크기와 인쇄 영역 크기의 차이 계산
        const heightDifference = a4Height - printSectionHeight;

        // 차이가 양수일 경우, 26으로 나눈 몫을 계산하여 빈 행 수 설정
        if (heightDifference > 0) {
          const emptyRowsNeeded = Math.round(heightDifference / 27); // 26px을 한 행의 높이로 가정
          console.log('필요한 빈 행 수:', emptyRowsNeeded);
          setRowEmptyAdd(emptyRowsNeeded);
        }
      }, 500); // 0.5초 지연

      return () => clearTimeout(timer);
    }
  }, [loading, estimate]);

  // 견적 데이터를 불러오는 함수
  useEffect(() => {
    const fetchEstimate = async () => {
      try {
        setLoading(true);

        // API를 통해 견적 데이터 불러오기
        const response = await fetch(`/api/estimates/${id}`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(`서버 오류: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success || !data.estimate) {
          throw new Error(data.message || '견적을 찾을 수 없습니다.');
        }

        setEstimate(data.estimate);
        console.log(data.estimate);
        setError(null);
      } catch (err) {
        console.error('Error fetching estimate:', err);
        setError(`데이터를 불러오는 중 오류가 발생했습니다: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEstimate();
    }
  }, [id]);

  // 공지사항을 불러오는 함수
  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        // API를 통해 공지사항 데이터 불러오기
        const response = await fetch('/api/quote/consumer', {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(`서버 오류: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.announcement) {
          // 줄바꿈을 기준으로 공지사항을 배열로 변환
          const items = data.announcement
            .split('\n')
            .filter(line => line.trim() !== '')
            .map(line => line.trim());

          setNoticeItems(items);
        }
      } catch (err) {
        console.error('Error fetching announcement:', err);
        // 기본 공지사항 설정
        setNoticeItems([
          '본 견적서는 수급상황에 따라, 금액과 부품이 대체/변동 될 수 있습니다.',
          '상품의 사양 및 가격은 제조사의 정책에 따라 변경될 수 있습니다.',
          '계약금 입금 후 주문이 확정됩니다.',
        ]);
      }
    };

    fetchAnnouncement();
  }, []);

  // 날짜 형식 변환 함수
  const formatDate = dateString => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}년 ${month}월 ${day}일`;
  };

  // 인쇄 함수
  const handlePrint = () => {
    window.print();
  };

  // 페이지 로드 후 자동 인쇄 기능
  // useEffect(() => {
  //   if (estimate && !loading && !error && !printTriggered) {
  //     // 데이터가 로드되고 에러가 없을 때 약간의 지연 후 인쇄 실행
  //     const timer = setTimeout(() => {
  //       handlePrint();
  //       setPrintTriggered(true);
  //     }, 500); // 0.5초 지연 후 인쇄 실행

  //     return () => clearTimeout(timer);
  //   }
  // }, [estimate, loading, error, printTriggered]);

  // 공지사항 수정 처리 함수 추가
  const handleNotesContentChange = e => {
    setNotesContent(e.target.value);
  };

  // 공지사항 저장 함수 추가
  const saveNotesContent = async () => {
    if (!notesContent.trim()) {
      return;
    }

    try {
      setSavingAnnouncement(true);
      setAnnouncementError(null);

      // 줄바꿈을 기준으로 텍스트를 분리하여 배열로 변환
      const newNoticeItems = notesContent
        .split('\n')
        .filter(line => line.trim() !== '') // 빈 줄 제거
        .map(line => line.trim());

      // API를 통해 공지사항 저장
      const response = await fetch('/api/quote/consumer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          announcement: notesContent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '공지사항 저장 중 오류가 발생했습니다.');
      }

      const data = await response.json();

      if (data.success) {
        setNoticeItems(newNoticeItems);
        setShowNotesEditor(false);
      } else {
        throw new Error(data.message || '공지사항 저장 중 오류가 발생했습니다.');
      }
    } catch (err) {
      console.error('Error saving announcement:', err);
      setAnnouncementError(err.message);
    } finally {
      setSavingAnnouncement(false);
    }
  };

  // 숫자를 한글로 변환하는 함수 추가
  const numberToKorean = number => {
    const units = ['', '만', '억', '조'];
    const digits = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
    const decimals = ['', '십', '백', '천'];

    // 0인 경우 처리
    if (number === 0) return '영원';

    // 숫자를 문자열로 변환
    let numStr = number.toString();

    // 결과 저장 변수
    let result = '';

    // 4자리씩 끊어서 처리
    const chunk = 4;
    const numLength = numStr.length;
    const chunks = Math.ceil(numLength / chunk);

    for (let i = 0; i < chunks; i++) {
      const start = Math.max(0, numLength - (i + 1) * chunk);
      const end = numLength - i * chunk;
      const part = numStr.substring(start, end);

      let partResult = '';
      for (let j = 0; j < part.length; j++) {
        const digit = parseInt(part[j]);
        if (digit !== 0) {
          partResult += digits[digit] + decimals[part.length - j - 1];
        }
      }

      if (partResult) {
        result = partResult + units[i] + result;
      }
    }

    return result + '원';
  };

  if (loading) {
    return (
      <div style={{ width: '800px', margin: '0 auto', padding: '24px', textAlign: 'center' }}>
        데이터를 불러오는 중...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          width: '800px',
          margin: '0 auto',
          padding: '24px',
          textAlign: 'center',
          color: '#ef4444',
        }}
      >
        {error}
      </div>
    );
  }

  if (!estimate) {
    return (
      <div style={{ width: '800px', margin: '0 auto', padding: '24px', textAlign: 'center' }}>
        견적 정보를 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <div style={{ width: '800px', margin: '0 auto', padding: '24px' }}>
      {/* 인쇄 스타일 */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-this-section,
          .print-this-section * {
            visibility: visible;
          }
          .print-this-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* 상단 컨트롤 패널 - 재디자인 */}
      <div className="no-print mb-6">
        {/* 뒤로가기 및 주요 컨트롤 */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-800 font-medium transition-colors px-3 py-2 rounded-md hover:bg-gray-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            돌아가기
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg shadow transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z"
                clipRule="evenodd"
              />
            </svg>
            인쇄하기
          </button>
        </div>

        {/* 설정 컨트롤 패널 */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 왼쪽 컨트롤 그룹 */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">문서 설정</h3>

              {/* 빈 행 추가 컨트롤 */}
              <div className="flex items-center">
                <span className="text-gray-700 text-sm w-28">빈 행 추가:</span>
                <div className="flex items-center">
                  <button
                    onClick={() => setRowEmptyAdd(prev => Math.max(0, prev - 1))}
                    className="bg-gray-100 text-gray-700 px-2 py-1 rounded-l-md hover:bg-gray-200 transition-colors border border-gray-300"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  <span className="bg-white px-3 py-1 border-t border-b border-gray-300 min-w-[2rem] text-center">
                    {rowEmptyAdd}
                  </span>
                  <button
                    onClick={() => setRowEmptyAdd(prev => prev + 1)}
                    className="bg-gray-100 text-gray-700 px-2 py-1 rounded-r-md hover:bg-gray-200 transition-colors border border-gray-300"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* 체크박스 옵션들 */}
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showNotes}
                  onChange={e => setShowNotes(e.target.checked)}
                  className="form-checkbox h-5 w-5 text-sky-500 rounded border-gray-300 focus:ring-sky-500"
                />
                <span className="ml-2 text-gray-700 text-sm">공지사항 필독 추가</span>
              </label>

              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showDescription}
                  onChange={e => setShowDescription(e.target.checked)}
                  className="form-checkbox h-5 w-5 text-sky-500 rounded border-gray-300 focus:ring-sky-500"
                />
                <span className="ml-2 text-gray-700 text-sm">견적상담 표시</span>
              </label>

              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showStamp}
                  onChange={e => setShowStamp(e.target.checked)}
                  className="form-checkbox h-5 w-5 text-sky-500 rounded border-gray-300 focus:ring-sky-500"
                />
                <span className="ml-2 text-gray-700 text-sm">인감도장 표시</span>
              </label>
            </div>

            {/* 오른쪽 컨트롤 그룹 */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">공지사항 관리</h3>

              <button
                onClick={() => {
                  setShowNotesEditor(!showNotesEditor);
                  if (!showNotesEditor) {
                    setNotesContent(noticeItems.join('\n'));
                  }
                }}
                className="flex items-center bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm w-full"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                공지사항 수정
              </button>

              <div className="text-xs text-gray-500 italic">
                공지사항을 수정하려면 위 버튼을 클릭하세요.
              </div>

              {/* finalPayment 금액 수정 인풋 추가 */}
              <div className="mt-4 pt-3 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">금액 수정</h3>
                <div className="flex items-center">
                  <span className="text-gray-700 text-sm mr-2">총액:</span>
                  <input
                    type="number"
                    value={estimate.calculatedValues?.finalPayment || 0}
                    onChange={e => {
                      const newValue = parseInt(e.target.value, 10) || 0;
                      setEstimate(prev => ({
                        ...prev,
                        calculatedValues: {
                          ...prev.calculatedValues,
                          finalPayment: newValue,
                        },
                      }));
                    }}
                    className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="text-xs text-gray-500 italic mt-1">
                  수정한 금액은 견적서에 즉시 반영되지만 저장되지는 않습니다.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 공지사항 수정 에디터 */}
      {showNotesEditor && (
        <div className="mb-6 no-print">
          <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">공지사항 편집</h3>
            <textarea
              value={notesContent}
              onChange={handleNotesContentChange}
              className="w-full h-32 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="공지사항을 입력하세요. 각 줄은 별도의 항목으로 표시됩니다."
            ></textarea>
            {announcementError && (
              <div className="text-red-500 text-sm mt-1">{announcementError}</div>
            )}
            <div className="flex justify-end mt-2 space-x-2">
              <button
                onClick={() => setShowNotesEditor(false)}
                disabled={savingAnnouncement}
                className={`bg-gray-500 text-white px-3 py-1.5 rounded-md text-sm hover:bg-gray-600 transition-colors ${
                  savingAnnouncement ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                취소
              </button>
              <button
                onClick={saveNotesContent}
                disabled={savingAnnouncement}
                className={`bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-blue-700 transition-colors ${
                  savingAnnouncement ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {savingAnnouncement ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 인쇄 영역 */}
      <div
        ref={printRef}
        className="print-this-section bg-white p-2.5 pt-2.5 pb-2.5 px-4.5 border-2 border-sky-300 rounded-lg shadow-sm"
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ width: '200px', paddingBottom: '10px' }}>
            <Image
              src="/wellcomlogopro.png"
              alt="웰컴 시스템 로고"
              width={200}
              height={80}
              style={{ objectFit: 'contain' }}
            />
          </div>
          <div className="text-center" style={{ flex: 1 }}>
            <h1 className="text-4xl font-extrabold text-black tracking-extra-widetitle">
              견 적 서
            </h1>
          </div>
          <div style={{ width: '200px', textAlign: 'right', paddingBottom: '40px' }}>
            <p className="text-gray-700 tracking-tighter">
              견적일자: {formatDate(estimate.createdAt)}
            </p>
            {/* 출고일자 표시 */}
            {estimate.paymentInfo?.releaseDate ? (
              <p style={{ lineHeight: '1' }} className="text-gray-700 tracking-tighter">
                출고일자: {formatDate(estimate.paymentInfo.releaseDate)}
              </p>
            ) : (
              <p style={{ lineHeight: '1' }} className="text-gray-700 tracking-tighter">
                출고일자:
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </p>
            )}
          </div>
        </div>
        {/* 고객 정보 and 공급자 정보 */}
        <div className="flex gap-2 mb-2" style={{ width: '100%' }}>
          <div
            style={{ width: '50%', height: 'auto' }}
            className="border border-sky-200 rounded-lg flex bg-sky-50"
          >
            <table style={{ width: '100%' }} className="m-1">
              <tbody>
                <tr style={{ lineHeight: '18px' }}>
                  <td
                    style={{ width: '25%' }}
                    className="text-left text-black font-semibold tracking-extra-widetitler"
                  >
                    성 명
                  </td>
                  <td style={{ width: '75%' }} className="text-left text-black font-semibold">
                    {estimate.customerInfo?.name || ''}
                  </td>
                </tr>
                <tr style={{ lineHeight: '18px' }}>
                  <td
                    style={{ width: '25%' }}
                    className="text-left text-black font-semibold tracking-wide"
                  >
                    연 락 처
                  </td>
                  <td style={{ width: '75%' }} className="text-left text-black font-semibold">
                    {estimate.customerInfo?.phone || ''}
                  </td>
                </tr>
                <tr style={{ lineHeight: '18px' }}>
                  <td
                    style={{ width: '25%' }}
                    className="text-left text-black font-semibold tracking-wider"
                  >
                    PC 번호
                  </td>
                  <td style={{ width: '75%' }} className="text-left text-black font-semibold">
                    {estimate.customerInfo?.pcNumber || ''}
                  </td>
                </tr>
                <tr style={{ lineHeight: '18px' }}>
                  <td
                    style={{ width: '25%' }}
                    className="text-left text-black font-semibold tracking-wider"
                  >
                    AS 조건
                  </td>
                  <td style={{ width: '75%' }} className="text-left text-black font-semibold">
                    {estimate.customerInfo?.asCondition || ''}
                  </td>
                </tr>
                <tr style={{ lineHeight: '18px' }}>
                  <td
                    style={{ width: '25%' }}
                    className="text-left text-black font-semibold tracking-tight"
                  >
                    견적담당
                  </td>
                  <td style={{ width: '75%' }} className="text-left text-black font-semibold">
                    {estimate.customerInfo?.manager || ''}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div
            style={{ width: '50%', height: 'auto' }}
            className="border border-sky-200 rounded-lg flex bg-sky-50"
          >
            <table style={{ width: '100%' }} className="m-1">
              <tbody>
                <tr style={{ lineHeight: '18px' }}>
                  <td
                    className="text-center text-black font-semibold border-r border-sky-200 tracking-extra-wide pr-1"
                    rowSpan="4"
                    style={{ writingMode: 'vertical-rl' }}
                  >
                    공 급 자
                  </td>
                  <td
                    style={{ width: '25%' }}
                    className="text-left text-black font-semibold pl-1 tracking-tighter"
                  >
                    등록번호
                  </td>
                  <td
                    style={{ width: '37%' }}
                    className="text-left text-black font-semibold tracking-wide"
                  >
                    607-02-70320
                  </td>
                  <td
                    style={{ width: '38%' }}
                    className="text-center text-left text-black font-semibold border-l border-sky-200 relative"
                    rowSpan="2"
                  >
                    김 선 식
                    <span style={{ fontSize: '0.6rem' }}> &nbsp;&nbsp;&nbsp;&nbsp;(인)</span>
                    <span className="relative inline-block">
                      {showStamp && (
                        <div
                          className="absolute"
                          style={{
                            top: '-34px',
                            left: '-36px',
                            width: '60px',
                            height: '60px',
                            zIndex: 10,
                          }}
                        >
                          <Image
                            src="/stamp.png"
                            alt="인감도장"
                            width={60}
                            height={60}
                            style={{
                              transform: 'rotate(0deg)',
                              objectFit: 'contain',
                            }}
                          />
                        </div>
                      )}
                    </span>
                  </td>
                </tr>
                <tr style={{ lineHeight: '18px' }}>
                  <td
                    style={{ width: '25%' }}
                    className="text-left text-black font-semibold pl-1 tracking-extra-widetitler"
                  >
                    상 호
                  </td>
                  <td
                    style={{ width: '37%' }}
                    className="text-left text-black font-semibold tracking-wider"
                  >
                    웰컴 시스템
                  </td>
                </tr>
                <tr style={{ lineHeight: '18px' }}>
                  <td
                    style={{ width: '25%' }}
                    className="text-left text-black font-semibold pl-1 tracking-extra-widetitler"
                  >
                    주 소
                  </td>
                  <td
                    style={{ width: '40%' }}
                    className="text-left text-black font-semibold"
                    colSpan="2"
                  >
                    부산시 동래구 온천장로 20 <br />
                    부산컴퓨터도매상가 209호
                  </td>
                </tr>
                <tr style={{ lineHeight: '18px' }}>
                  <td
                    style={{ width: '25%' }}
                    className="text-left text-black font-semibold pl-1 tracking-tighter"
                  >
                    전화번호
                  </td>
                  <td
                    style={{ width: '40%' }}
                    className="text-left text-black font-semibold"
                    colSpan="2"
                  >
                    051-926-6604, 010-8781-8871
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 금액을 한글로 표시 */}

        <div className="border-2 border-sky-500 rounded-lg bg-sky-300 p-5 mb-2">
          <div className="text-center text-lg font-bold text-black tracking-wider">
            {estimate.calculatedValues?.finalPayment
              ? `총 액: ${numberToKorean(estimate.calculatedValues.finalPayment)} (${estimate.calculatedValues.finalPayment.toLocaleString()}원) ${estimate.paymentInfo?.includeVat ? 'V.A.T포함' : 'V.A.T별도'}`
              : ''}
          </div>
        </div>

        {/* 상품 목록 */}
        <div style={{ marginBottom: '7px' }}>
          <table style={{ width: '100%' }} className="border-collapse border border-sky-200">
            <thead className="bg-sky-100">
              <tr>
                <th
                  className="border border-sky-200 text-center text-black"
                  style={{ width: '1%' }}
                >
                  No.
                </th>
                {/* <th
                  className="border border-sky-200 text-center text-black"
                  style={{ width: '12%' }}
                >
                  분 &nbsp;&nbsp;류
                </th> */}
                <th
                  className="border border-sky-200 text-center text-black"
                  style={{ width: '88%' }}
                >
                  내
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;용
                </th>
                <th
                  className="border border-sky-200 text-center text-black"
                  style={{ width: '10%' }}
                >
                  수 량
                </th>
              </tr>
            </thead>
            <tbody>
              {/* 부품 상품 목록 */}
              {estimate.tableData && (
                <tr className="bg-white">
                  <td colSpan="3" className="border border-sky-200 text-center font-bold">
                    부품 상품 목록
                  </td>
                </tr>
              )}
              {estimate.tableData &&
                estimate.tableData.map((item, index) => (
                  <tr key={index} className="bg-white">
                    <td className="border border-sky-200 text-center">{index + 1}</td>
                    {/* <td className="border border-sky-200 text-center">{item.category || '-'}</td> */}
                    <td className="border border-sky-200">{item.productName}</td>
                    <td className="border border-sky-200 text-center">{item.quantity}</td>
                  </tr>
                ))}

              {/* 서비스 상품 목록 */}
              {estimate.serviceData &&
                estimate.serviceData.length > 0 &&
                estimate.serviceData.filter(item => !item.productName.includes('끝자리DC')).length >
                  0 && (
                  <>
                    <tr className="bg-white">
                      <td colSpan="3" className="border border-sky-200 text-center font-bold">
                        &nbsp;
                      </td>
                    </tr>
                    <tr className="bg-white">
                      <td colSpan="3" className="border border-sky-200 text-center font-bold">
                        서비스 상품 목록
                      </td>
                    </tr>
                    {estimate.serviceData
                      .filter(item => !item.productName.includes('끝자리DC'))
                      .map((item, index) => (
                        <tr key={index} className="bg-white">
                          <td className="border border-sky-200 text-center">{index + 1}</td>
                          <td className="border border-sky-200">{item.productName}</td>
                          <td className="border border-sky-200 text-center">{item.quantity}</td>
                        </tr>
                      ))}
                  </>
                )}

              {/* 기타 목록 */}
              {(estimate.paymentInfo?.laborCost > 0 ||
                estimate.paymentInfo?.tuningCost > 0 ||
                estimate.paymentInfo?.setupCost > 0 ||
                estimate.paymentInfo?.shippingCost > 0) && (
                <>
                  <tr className="bg-white">
                    <td colSpan="3" className="border border-sky-200 text-center font-bold">
                      &nbsp;
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td colSpan="3" className="border border-sky-200 text-center font-bold">
                      기타
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td className="border border-sky-200 text-center">1</td>
                    <td className="border border-sky-200">
                      {[
                        estimate.paymentInfo?.laborCost > 0 ? `공임비` : '',
                        estimate.paymentInfo?.tuningCost > 0 ? `튜닝비` : '',
                        estimate.paymentInfo?.setupCost > 0 ? `세팅비` : '',
                        estimate.paymentInfo?.shippingCost > 0 ? `배송비` : '',
                      ]
                        .filter(Boolean)
                        .join(', ')}
                    </td>
                    <td className="border border-sky-200 text-center">1</td>
                  </tr>
                </>
              )}

              {/* 빈 행 추가 */}
              {Array.from({ length: rowEmptyAdd }).map((_, index) => (
                <tr key={`empty-${index}`} className="bg-white">
                  <td className="border border-sky-200 text-center"></td>
                  {/* <td className="border border-sky-200 text-center"></td> */}
                  <td className="border border-sky-200">&nbsp;</td>
                  <td className="border border-sky-200 text-center"></td>
                </tr>
              ))}

              <tr className="bg-sky-100 font-bold">
                <td colSpan="3" className="border border-sky-200 text-right p-1 text-black">
                  금액 합계 : {estimate.calculatedValues?.finalPayment?.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 견적상담 표시 */}
        {showDescription && estimate.estimateDescription && (
          <div className="border border-sky-200 rounded-lg mb-2 mt-1 bg-sky-50 p-1">
            <div className="flex items-center">
              <span className="text-sm font-bold text-blue-800 mr-2">견적상담</span>
              <div className="flex-1 text-gray-700 text-sm p-1 bg-white border border-sky-200 rounded-md">
                <div className="flex flex-wrap gap-x-4">
                  {estimate.estimateDescription
                    .split('\n')
                    .filter(line => line.trim() !== '')
                    .map((line, index) => (
                      <span key={index}>· {line}</span>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 공지사항 - 체크박스가 체크되었을 때만 표시 */}
        {showNotes && (
          <div className="border border-sky-200 rounded-lg p-1 bg-sky-50">
            <div className="flex items-center">
              <span className="text-sm font-bold text-blue-800 mr-2">※공지사항 필독※</span>
              <div className="flex-1 flex flex-wrap gap-x-4 text-xs text-black p-1 bg-white border border-sky-200 rounded-md">
                {noticeItems.map((item, index) => (
                  <span key={index}>· {item}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 뒤로가기 및 주요 컨트롤 */}
      <div className="flex justify-between items-center pt-3 mb-4">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-800 font-medium transition-colors px-3 py-2 rounded-md hover:bg-gray-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          돌아가기
        </button>

        <button
          onClick={handlePrint}
          className="flex items-center bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg shadow transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z"
              clipRule="evenodd"
            />
          </svg>
          인쇄하기
        </button>
      </div>
    </div>
  );
}
