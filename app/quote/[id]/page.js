'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';

export default function InvoicePage({ params }) {
  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const invoiceRef = useRef(null);
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
        console.log('Loaded estimate for invoice:', data);
        
        if (!data.success || !data.estimate) {
          throw new Error(data.message || '견적을 찾을 수 없습니다.');
        }
        
        setEstimate(data.estimate);
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
  
  // 날짜 형식 변환 함수
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}년 ${month}월 ${day}일`;
  };
  
  // 홈으로 돌아가기
  const handleBackClick = () => {
    router.back();
  };
  
  // 인쇄 함수
  const handlePrint = () => {
    window.print();
  };
  
  // 금액을 한글로 변환하는 함수
  const numberToKorean = (number) => {
    if (isNaN(number) || number === 0) return '영원';
    
    const units = ['', '만', '억', '조'];
    const digits = ['영', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
    const decimals = ['', '십', '백', '천'];
    
    const numStr = number.toString();
    let result = '';
    
    // 큰 단위부터 처리 (조, 억, 만)
    for (let i = 0; i < numStr.length; i++) {
      const digit = parseInt(numStr[i]);
      
      // 현재 자릿수 계산
      const unitIndex = Math.floor((numStr.length - 1 - i) / 4);
      const decimalIndex = (numStr.length - 1 - i) % 4;
      
      if (digit !== 0) {
        // 일의 자리가 아닌 경우 '일'은 생략
        if (digit === 1 && decimalIndex !== 0) {
          result += decimals[decimalIndex];
        } else {
          result += digits[digit] + decimals[decimalIndex];
        }
      }
      
      // 단위 추가 (만, 억, 조)
      if (decimalIndex === 0 && digit !== 0) {
        result += units[unitIndex];
      }
    }
    
    return result + '원';
  };

  return (

    <div className="min-h-screen bg-gray-100 py-8 px-4 print:p-0 print:bg-white">
      <div className="max-w-4xl mx-auto print:max-w-none print:mx-0">
        {/* 뒤로 가기 버튼과 인쇄 버튼 */}
        <div className="flex justify-between items-center mb-6 no-print">
          <button
            onClick={handleBackClick}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            이전 페이지로 돌아가기
          </button>
          <button
            onClick={handlePrint}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            인쇄하기
          </button>
        </div>
        
        {/* 로딩 상태 표시 */}
        {loading && (
          <div className="flex justify-center py-10 no-print">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        {/* 에러 표시 */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 no-print">
            <strong className="font-bold">오류! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {/* 견적서 내용 */}
        {!loading && !error && estimate && (
          <div ref={invoiceRef} className="invoice-container bg-white border-2 border-blue-200 rounded-lg shadow-lg print:shadow-none print:rounded-none">
            {/* 견적서 헤더 */}
            <div className="relative pt-6 px-4 mb-6">
              {/* 임시 로고 (빨간 동그라미) */}
              <div className="absolute left-4 top-8 w-16 h-16 rounded-full bg-red-600 flex items-center justify-center" style={{ top: '10px' }}>
                <span className="text-white font-bold">LOGO</span>
              </div>
              
              {/* 견적서 제목 */}
              <h1 
                className="text-3xl font-bold text-center mx-auto" 
                style={{ letterSpacing: '0.5em' }}
              >
                견 적 서
              </h1>
              
              {/* 견적일자 */}
              <p className="absolute right-4 top-10 text-gray-600 text-sm" style={{ letterSpacing: '-0.09em', top: '31px' }}>
                견적일자: {formatDate(estimate.createdAt)}
              </p>
            </div>
            
            {/* 공급자/공급받는자 정보 */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              {/* 공급자 정보 (회사 정보) */}
              <div style={{ flex: '1', border: '1px solid #93c5fd', padding: '8px', marginLeft: '10px', borderRadius: '0.25rem', backgroundColor: '#f0f8ff' }}>
                <h2 className="text-lg font-bold mb-1 text-center border-b border-blue-200 pb-1">공급자</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1px' }}>
                  <div className="flex">
                    <span className="font-semibold w-24">상호명:</span>
                    <span>웰컴 시스템</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold w-24">대표자:</span>
                    <span>김선식</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold w-24">사업자번호:</span>
                    <span>607-02-70320</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold w-24">주소:</span>
                    <span>부산시 동래구 온천동 456-29</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold w-24">전화번호:</span>
                    <span>051-926-6604 (대표전화)</span>
                  </div>
                </div>
              </div>
              
              {/* 공급받는자 정보 (고객 정보) */}
              <div style={{ flex: '1', border: '1px solid #93c5fd', padding: '8px', marginRight: '10px', borderRadius: '0.25rem', backgroundColor: '#f0f8ff' }}>
                <h2 className="text-lg font-bold mb-1 text-center border-b border-blue-200 pb-1">공급받는자</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1px' }}>
                  <div className="flex">
                    <span className="font-semibold w-24">성함:</span>
                    <span>{estimate.customerInfo?.name || '-'}</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold w-24">연락처:</span>
                    <span>{estimate.customerInfo?.phone || '-'}</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold w-24">PC번호:</span>
                    <span>{estimate.customerInfo?.pcNumber || '-'}</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold w-24">AS조건:</span>
                    <span>{estimate.customerInfo?.asCondition || '-'}</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold w-24">견적담당:</span>
                    <span>{estimate.customerInfo?.manager || '-'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 상품 목록 */}
            <div className="mb-6">
              <div className="table-container">
                <table className="min-w-full divide-y divide-blue-300 border border-blue-300">
                  <thead>
                    <tr className="bg-blue-100">
                      <th className="px-1.5 py-0.5 border border-blue-300 text-sm font-medium w-[5%]">No.</th>
                      <th className="px-1.5 py-0.5 border border-blue-300 text-sm font-medium w-[12%]">분류</th>
                      <th className="px-1.5 py-0.5 border border-blue-300 text-sm font-medium w-[48%]">상품명</th>
                      <th className="px-1.5 py-0.5 border border-blue-300 text-sm font-medium w-[7%]">수량</th>
                      <th className="px-1.5 py-0.5 border border-blue-300 text-sm font-medium w-[14%]">단가</th>
                      <th className="px-1.5 py-0.5 border border-blue-300 text-sm font-medium w-[14%]">금액</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {estimate.tableData?.map((item, index) => (
                      <>
                        <tr key={`product-${index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                          <td className="px-1.5 py-0.5 border border-blue-300 text-sm text-center">{index + 1}</td>
                          <td className="px-1.5 py-0.5 border border-blue-300 text-sm">{item.category || '-'}</td>
                          <td className="px-1.5 py-0.5 border border-blue-300 text-sm">{item.productName || '-'}</td>
                          <td className="px-1.5 py-0.5 border border-blue-300 text-sm text-center">{item.quantity || '-'}</td>
                          <td className="px-1.5 py-0.5 border border-blue-300 text-sm text-right">
                            {item.price && item.quantity ? 
                              Math.round(parseInt(item.price) / parseInt(item.quantity)).toLocaleString() : 
                              '-'}원
                          </td>
                          <td className="px-1.5 py-0.5 border border-blue-300 text-sm text-right">
                            {item.price ? parseInt(item.price).toLocaleString() : '-'}원
                          </td>
                        </tr>
                        {/* 비고가 있는 경우에만 표시 */}
                        {item.remarks && (
                          <tr key={`remarks-${index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                            <td colSpan="6" className="px-1.5 py-0.5 border border-blue-300 text-sm bg-blue-50">
                              <span className="font-medium">비고: </span>{item.remarks}
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                    
                    {/* 상품 합계만 표시 */}
                    <tr className="bg-blue-100 font-bold">
                      <td colSpan="4" className="px-1.5 py-0.5 border border-blue-300 text-right">상품 소계</td>
                      <td colSpan="2" className="px-1.5 py-0.5 border border-blue-300 text-right">
                        {estimate.calculatedValues?.productTotal?.toLocaleString() || '0'}원
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* 결제 정보 요약 - 별도 섹션으로 분리 */}
            <div className="mb-6 border border-blue-300 rounded-lg p-5 bg-blue-50">
              <h2 className="text-xl font-bold mb-4">결제 정보</h2>
              <div className="payment-info-grid">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium text-sm">상품/부품 합계:</span>
                  <span className="text-right text-sm">{estimate.calculatedValues?.productTotal?.toLocaleString() || '0'}원</span>
                </div>
                
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium text-sm">공임비:</span>
                  <span className="text-right text-sm">{estimate.paymentInfo?.laborCost?.toLocaleString() || '0'}원</span>
                </div>
                
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium text-sm">세팅비:</span>
                  <span className="text-right text-sm">{estimate.paymentInfo?.setupCost?.toLocaleString() || '0'}원</span>
                </div>
                
                {/* 할인이 있을 경우에만 표시 */}
                {estimate.paymentInfo?.discount > 0 && (
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-medium text-sm">할인:</span>
                    <span className="text-right text-sm">-{estimate.paymentInfo?.discount?.toLocaleString()}원</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium text-sm">총 구입 금액:</span>
                  <span className="text-right font-semibold text-sm">{estimate.calculatedValues?.totalPurchase?.toLocaleString() || '0'}원</span>
                </div>
                
                {/* 계약금이 있을 경우에만 표시 */}
                {estimate.paymentInfo?.deposit > 0 && (
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-medium text-sm">계약금:</span>
                    <span className="text-right text-sm">{estimate.paymentInfo?.deposit?.toLocaleString()}원</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium text-sm">부가세(VAT):</span>
                  <span className="text-right text-sm">
                    {estimate.paymentInfo?.includeVat ? 
                      `${estimate.calculatedValues?.vatAmount?.toLocaleString() || '0'}원 (${estimate.paymentInfo.vatRate || 10}%)` : 
                      '별도'}
                  </span>
                </div>
                
                <div className="col-span-2 flex justify-between items-center pt-2">
                  <span className="font-bold text-base">최종 결제 금액:</span>
                  <span className="text-right font-bold text-base text-blue-600">{estimate.calculatedValues?.finalPayment?.toLocaleString() || '0'}원</span>
                </div>
              </div>
            </div>
            
            {/* 참고사항 */}
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-2">참고사항</h3>
              <div className="border border-blue-300 p-4 rounded bg-blue-50">
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>본 견적서의 유효기간은 견적일로부터 7일입니다.</li>
                  <li>상기 견적은 제품 수급 상황에 따라 변동될 수 있습니다.</li>
                  <li>모든 가격은 부가세 {estimate.paymentInfo?.includeVat ? '포함' : '별도'} 금액입니다.</li>
                  <li>계약금 입금 후 주문이 확정됩니다.</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 