'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ConsumerQuotePage({ params }) {
  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNotes, setShowNotes] = useState(true);
  const [showStamp, setShowStamp] = useState(true);
  const [printTriggered, setPrintTriggered] = useState(false);
  const [showNotesEditor, setShowNotesEditor] = useState(false);
  const [notesContent, setNotesContent] = useState('');
  const [noticeItems, setNoticeItems] = useState([]);
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);
  const [announcementError, setAnnouncementError] = useState(null);
  const router = useRouter();
  const printRef = useRef(null);
  const { id } = params;
  
  // 견적 데이터를 불러오는 함수
  useEffect(() => {
    const fetchEstimate = async () => {
      try {
        setLoading(true);
        
        // API를 통해 견적 데이터 불러오기
        const response = await fetch(`/api/estimates/${id}`, {
          cache: 'no-store'
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
          cache: 'no-store'
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
          '계약금 입금 후 주문이 확정됩니다.'
        ]);
      }
    };
    
    fetchAnnouncement();
  }, []);
  
  // 날짜 형식 변환 함수
  const formatDate = (dateString) => {
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
  useEffect(() => {
    if (estimate && !loading && !error && !printTriggered) {
      // 데이터가 로드되고 에러가 없을 때 약간의 지연 후 인쇄 실행
      const timer = setTimeout(() => {
        handlePrint();
        setPrintTriggered(true);
      }, 500); // 0.5초 지연 후 인쇄 실행
      
      return () => clearTimeout(timer);
    }
  }, [estimate, loading, error, printTriggered]);
  
  // 공지사항 수정 처리 함수 추가
  const handleNotesContentChange = (e) => {
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
          announcement: notesContent
        })
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
  
  if (loading) {
    return <div style={{ width: '800px', margin: '0 auto', padding: '24px', textAlign: 'center' }}>데이터를 불러오는 중...</div>;
  }
  
  if (error) {
    return <div style={{ width: '800px', margin: '0 auto', padding: '24px', textAlign: 'center', color: '#ef4444' }}>{error}</div>;
  }
  
  if (!estimate) {
    return <div style={{ width: '800px', margin: '0 auto', padding: '24px', textAlign: 'center' }}>견적 정보를 찾을 수 없습니다.</div>;
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

      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="no-print">
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-800 font-medium"
        >
          ← 돌아가기
        </button>
        
        <div className="flex items-center">
          {/* 공지사항 수정 버튼 추가 */}
          <button
            onClick={() => {
              setShowNotesEditor(!showNotesEditor);
              if (!showNotesEditor) {
                setNotesContent(noticeItems.join('\n'));
              }
            }}
            className="bg-blue-600 text-white px-2 py-1 rounded-md hover:bg-blue-700 mr-4 text-sm"
          >
            공지사항수정+
          </button>
          
          <label className="flex items-center cursor-pointer mr-4">
            <input 
              type="checkbox" 
              checked={showNotes} 
              onChange={(e) => setShowNotes(e.target.checked)}
              className="form-checkbox h-5 w-5 text-sky-500 rounded border-gray-300 focus:ring-sky-500"
            />
            <span className="ml-2 text-gray-700">공지사항 필독 추가</span>
          </label>
          
          <label className="flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={showStamp} 
              onChange={(e) => setShowStamp(e.target.checked)}
              className="form-checkbox h-5 w-5 text-sky-500 rounded border-gray-300 focus:ring-sky-500"
            />
            <span className="ml-2 text-gray-700">인감도장 표시</span>
          </label>
          
          <button
            onClick={handlePrint}
            className="bg-sky-400 hover:bg-sky-500 text-white font-semibold py-2 px-4 rounded-lg shadow transition-colors"
          >
            인쇄하기
          </button>
        </div>
      </div>
      
      {/* 공지사항 수정 에디터 - 체크박스 아래에 위치 */}
      {showNotesEditor && (
        <div className="mb-4 no-print">
          <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
            <textarea
              value={notesContent}
              onChange={handleNotesContentChange}
              className="w-full h-32 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="공지사항을 입력하세요. 각 줄은 별도의 항목으로 표시됩니다."
            ></textarea>
            {announcementError && (
              <div className="text-red-500 text-sm mt-1">{announcementError}</div>
            )}
            <div className="flex justify-end mt-2">
              <button
                onClick={saveNotesContent}
                disabled={savingAnnouncement}
                className={`bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 ${
                  savingAnnouncement ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {savingAnnouncement ? '저장 중...' : '저장'}
              </button>
              <button
                onClick={() => setShowNotesEditor(false)}
                disabled={savingAnnouncement}
                className={`bg-gray-500 text-white px-3 py-1 rounded-md text-sm hover:bg-gray-600 ml-2 ${
                  savingAnnouncement ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 인쇄 영역 */}
      <div ref={printRef} className="print-this-section bg-white p-2.5 pt-2.5 pb-2.5 px-4.5 border-2 border-sky-300 rounded-lg shadow-sm">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ width: '200px', paddingBottom: '10px'}}>
            <Image 
              src="/wellcomlogopro.png" 
              alt="웰컴 시스템 로고" 
              width={200} 
              height={80} 
              style={{ objectFit: 'contain' }}
            />
          </div>
          <div className="text-center" style={{ flex: 1 }}>
            <h1 className="text-4xl font-extrabold text-black tracking-extra-widetitle">견 적 서</h1>
          </div>
          <div style={{ width: '200px', textAlign: 'right', paddingBottom: '40px' }}>
            <p className="text-gray-700 tracking-tighter">견적일자: {formatDate(estimate.createdAt)}</p>
            {/* 출고일자 표시 */}
            {estimate.paymentInfo?.releaseDate ? (
                <p style={{ lineHeight: '1' }} className="text-gray-700 tracking-tighter">출고일자: {formatDate(estimate.paymentInfo.releaseDate)}</p>
            ) : (
                <p style={{ lineHeight: '1' }} className="text-gray-700 tracking-tighter">출고일자: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>
            )}
          </div>
        </div>

        <div className="flex gap-2 mb-2" style={{ width: '100%' }}>
          <div style={{ width: '50%', height: 'auto' }}className="border border-sky-200 rounded-lg flex bg-sky-50">
            <table style={{ width: '100%' }} className="m-1">
              <tbody>
                <tr style={{ lineHeight: '18px' }}>
                  <td style={{ width: '25%' }} className="text-left text-black font-semibold tracking-extra-widetitler">성 명</td>
                  <td style={{ width: '75%' }} className="text-left text-black font-semibold">
                    {estimate.customerInfo?.name || ''}
                  </td>
                </tr>
                <tr style={{ lineHeight: '18px' }}>
                  <td style={{ width: '25%' }} className="text-left text-black font-semibold tracking-wide">연 락 처</td>
                  <td style={{ width: '75%' }} className="text-left text-black font-semibold">
                    {estimate.customerInfo?.phone || ''}
                  </td>
                </tr>
                <tr style={{ lineHeight: '18px' }}>
                  <td style={{ width: '25%' }} className="text-left text-black font-semibold tracking-wider">PC 번호</td>
                  <td style={{ width: '75%' }} className="text-left text-black font-semibold">
                    {estimate.customerInfo?.pcNumber || ''}
                  </td>
                </tr>
                <tr style={{ lineHeight: '18px' }}>
                  <td style={{ width: '25%' }} className="text-left text-black font-semibold tracking-wider">AS 조건</td>
                  <td style={{ width: '75%' }} className="text-left text-black font-semibold">
                    {estimate.customerInfo?.asCondition || ''}
                  </td>
                </tr>
                <tr style={{ lineHeight: '18px' }}>
                  <td style={{ width: '25%' }} className="text-left text-black font-semibold tracking-tight">견적담당</td>
                  <td style={{ width: '75%' }} className="text-left text-black font-semibold">
                    {estimate.customerInfo?.manager || ''}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div style={{ width: '50%', height: 'auto' }}className="border border-sky-200 rounded-lg flex bg-sky-50">
            <table style={{ width: '100%' }} className="m-1">
              <tbody>
                <tr style={{ lineHeight: '18px' }}>
                  <td className="text-center text-black font-semibold border-r border-sky-200 tracking-extra-wide pr-1" rowSpan="4" style={{ writingMode: 'vertical-rl'}}>공 급 자</td>
                  <td style={{ width: '25%' }} className="text-left text-black font-semibold pl-1 tracking-tighter">등록번호</td>
                  <td style={{ width: '37%' }} className="text-left text-black font-semibold tracking-wide">607-02-70320</td>
                  <td style={{ width: '38%' }} className="text-center text-left text-black font-semibold border-l border-sky-200 relative" rowSpan="2">
                    김 선 식<span style={{ fontSize: '0.6rem' }}> &nbsp;&nbsp;&nbsp;&nbsp;(인)</span>
                    <span className="relative inline-block">
                      {showStamp && (
                        <div className="absolute" style={{ 
                          top: '-34px', 
                          left: '-36px', 
                          width: '60px', 
                          height: '60px',
                          zIndex: 10
                        }}>
                          <Image
                            src="/stamp.png"
                            alt="인감도장"
                            width={60}
                            height={60}
                            style={{ 
                              transform: 'rotate(0deg)',
                              objectFit: 'contain'
                            }}
                          />
                        </div>
                      )}
                    </span>
                  </td>
                </tr>
                <tr style={{ lineHeight: '18px' }}>
                  <td style={{ width: '25%' }} className="text-left text-black font-semibold pl-1 tracking-extra-widetitler">상 호</td>
                  <td style={{ width: '37%' }} className="text-left text-black font-semibold tracking-wider">웰컴 시스템</td>
                  
                </tr>
                <tr style={{ lineHeight: '18px' }}>
                  <td style={{ width: '25%' }} className="text-left text-black font-semibold pl-1 tracking-extra-widetitler">주 소</td>
                  <td style={{ width: '40%' }} className="text-left text-black font-semibold" colSpan="2">부산시 동래구 온천장로 20 <br/>부산컴퓨터도매상가 209호</td>
                </tr>
                <tr style={{ lineHeight: '18px' }}>
                  <td style={{ width: '25%' }} className="text-left text-black font-semibold pl-1 tracking-tighter">전화번호</td>
                  <td style={{ width: '40%' }} className="text-left text-black font-semibold" colSpan="2">051-926-6604, 010-8781-8871</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div style={{ marginBottom: '7px' }}>
          <table style={{ width: '100%' }} className="border-collapse border border-sky-200">
            <thead className="bg-sky-100">
              <tr>
                <th className="border border-sky-200 text-center text-black" style={{ width: '1%' }}>No.</th>
                <th className="border border-sky-200 text-center text-black" style={{ width: '12%' }}>분 &nbsp;&nbsp;류</th>
                <th className="border border-sky-200 text-center text-black" style={{ width: '53%' }}>상 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;품 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;명</th>
                <th className="border border-sky-200 text-center text-black" style={{ width: '6%' }}>수량</th>
                <th className="border border-sky-200 text-center text-black" style={{ width: '13%' }}>단 &nbsp;&nbsp;가</th>
                <th className="border border-sky-200 text-center text-black" style={{ width: '13%' }}>금 &nbsp;&nbsp;액</th>
              </tr>
            </thead>
            <tbody>
              {estimate.tableData && estimate.tableData.map((item, index) => (
                <tr key={index} className="bg-white">
                  <td className="border border-sky-200 text-center">{index + 1}</td>
                  <td className="border border-sky-200 text-center">{item.category || '-'}</td>
                  <td className="border border-sky-200">{item.productName}</td>
                  <td className="border border-sky-200 text-center">{item.quantity}</td>
                  <td className="border border-sky-200 text-right pr-1">
                    {item.price && item.quantity ? 
                      Math.round(Number(String(item.price).replace(/,/g, '')) / parseInt(item.quantity)).toLocaleString() : '-'}
                  </td>
                  <td className="border border-sky-200 text-right pr-1">
                    {item.price ? Number(String(item.price).replace(/,/g, '')).toLocaleString() : '-'}
                  </td>
                </tr>
              ))}
              
              <tr className="bg-sky-100 font-bold">
                <td colSpan="4" className="border border-sky-200 text-right p-1 text-black" style={{ padding: '0' }}>부품 금액 합계</td>
                <td colSpan="2" className="border border-sky-200 text-right p-1 text-black">
                  {estimate.calculatedValues?.productTotal?.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* 서비스 상품 데이터 표시 */}
        {estimate.serviceData && estimate.serviceData.length > 0 && (
          <div className="border border-sky-200 rounded-lg mb-1 bg-sky-50" style={{ padding: '2px' }}>
            <div className="flex items-center">
              <h2 className="text-lg font-bold text-blue-800 mx-2">서비스 상품</h2>
              <div className="flex flex-wrap gap-1">
                {estimate.serviceData.map((item, index) => (
                  <div key={index} className="bg-white px-3 py-1 rounded-full border border-sky-200 text-sm">
                    {item.productName}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* 이곳에 결제 정보 표시 */}
        <div className="border border-sky-200 rounded-lg px-2 mb-2 bg-sky-50">
          <div className="flex justify-between items-center mb-1 mt-1">
            <h2 className="text-lg font-bold text-blue-800 ml-1">결제 정보</h2>
            <div className="border border-sky-200 rounded-md p-1 bg-sky-350 flex justify-between" style={{ width: '84%' }}>
              <span className="font-semibold text-black">상품/부품 합계:</span>
              <span className="font-bold text-black">{estimate.calculatedValues?.productTotal?.toLocaleString() || '0'}원</span>
            </div>
          </div>
          <div className="space-y-1">
            {/* 공임비(제작/조립비), 세팅비(SW), 할인 한 줄에 표시 */}
            <div className="flex gap-1">
              <div className="border border-sky-200 rounded-md p-1 bg-white flex-1 flex justify-between">
                <span className="font-semibold text-black">공임비(제작/조립비):</span>
                <span>{estimate.paymentInfo?.laborCost ? `${estimate.paymentInfo.laborCost.toLocaleString()}원` : ''}</span>
              </div>
              <div className="border border-sky-200 rounded-md p-1 bg-white flex-1 flex justify-between">
                <span className="font-semibold text-black">세팅비(SW):</span>
                <span>{estimate.paymentInfo?.setupCost ? `${estimate.paymentInfo.setupCost.toLocaleString()}원` : ''}</span>
              </div>
              {estimate.paymentInfo?.discount > 0 && (
                <div className="border border-sky-200 rounded-md p-1 bg-white flex-[0.5] flex justify-between">
                  <span className="font-semibold text-black">할인:</span>
                  <span>-{estimate.paymentInfo?.discount?.toLocaleString()}원</span>
                </div>
              )}
            </div>
            
            {/* 총 구입 금액과 계약금을 한 줄에 표시 */}
            <div className="flex gap-1">
              {estimate.paymentInfo?.deposit > 0 && (
                <div className="border border-sky-200 rounded-md p-1 bg-white flex-1 flex justify-between items-center">
                  <span className="font-semibold text-black">계약금:</span>
                  <span>{estimate.paymentInfo?.deposit?.toLocaleString()}원</span>
                </div>
              )}
              <div className="border border-sky-400 rounded-md p-2 bg-sky-350 flex-[1.6] flex justify-between items-center">
                <span className="font-semibold text-black">총 구입금액<span className="text-xs">
                  {estimate.paymentInfo?.discount > 0 ? "(공임+세팅-할인)" : "(공임+세팅)"}
                </span>:</span>
                <span className="font-semibold text-black">{estimate.calculatedValues?.totalPurchase?.toLocaleString() || '0'}원</span>
              </div>
            </div>

            <div className="flex gap-1 items-center">
                {/* 부가세(VAT) 표시 */}
                {estimate.paymentInfo?.includeVat && (
                    <div className="border border-sky-200 rounded-md p-2 bg-white flex-1 flex justify-between items-center">
                        <span className="font-semibold text-black">부가세(VAT):</span>
                        <span>{estimate.calculatedValues?.vatAmount?.toLocaleString() || '0'}원 ({estimate.paymentInfo?.vatRate || 10}%)</span>
                    </div>
                )}
                
                {/* 최종 결제 금액 */}
                <div className="border-2 border-sky-500 rounded-md p-3 bg-sky-450 from-sky-100 to-sky-200 flex-[1.6] flex justify-between items-center font-bold shadow-md relative overflow-hidden">
                    <div className="absolute inset-0 bg-sky-500 opacity-10 rounded"></div>
                    <span className="text-lg text-blue-900 z-10 font-bold">
                      {estimate.paymentInfo?.includeVat ? "최종 결제금액(VAT포함):" : "최종 결제금액:"}
                    </span>
                    <span className="text-xl text-blue-900 z-10 font-bold">{estimate.calculatedValues?.finalPayment?.toLocaleString() || '0'}원</span>
                </div>
            </div>
            
            {/* 결제 방식 안내 및 배송+설치 - 값이 있을 때는 금액 표시, 없을 때는 안내 메시지 표시 */}
            <div className="flex justify-between">
              <div className="border border-sky-400 rounded-md p-1 mb-1 bg-white inline-flex text-sm">
                {estimate.paymentInfo?.paymentMethod ? (
                  <>
                    <span className="font-semibold text-black whitespace-pre">결제 방식: </span>
                    <span className="font-semibold text-black">{estimate.paymentInfo.paymentMethod}</span>
                  </>
                ) : (
                  <span className="font-semibold text-black">결제방식: 현금 / 카드</span>
                )}
              </div>

              <div className="border border-sky-400 rounded-md p-1 mb-1 bg-white inline-flex text-sm">
                {estimate.paymentInfo?.shippingCost > 0 ? (
                  <>
                    <span className="font-semibold text-black whitespace-pre">※ 배송+설치 별도 추가: </span>
                    <span className="font-semibold text-black">{estimate.paymentInfo?.shippingCost?.toLocaleString()}원 ※</span>
                  </>
                ) : (
                  <span className="font-semibold text-black">※ 배송+설치 비용은 별도 부과됩니다 ※</span>
                )}
              </div>
            </div> 
          </div>
        </div>
        
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
    </div>
  );
} 