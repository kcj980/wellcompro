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
    // 1. 현재 페이지 내용 저장
    const originalContent = document.body.innerHTML;
    
    // 2. 인쇄할 요소 가져오기
    const printSection = document.querySelector('.print-this-section');
    
    if (printSection) {
      // 3. 인쇄할 요소만 body에 표시
      const printContent = `
        <html>
          <head>
            <title>결제 정보</title>
            <style>
              body {
                font-family: 'Noto Sans KR', sans-serif;
                background-color: #f3f8ff;
                padding: 20px;
                margin: 0;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
              .container {
                max-width: 800px;
                margin: 0 auto;
                background-color: #ebf5ff;
                border: 1px solid #90caf9;
                border-radius: 8px;
                padding: 16px;
              }
              h2 {
                font-size: 1.25rem;
                font-weight: bold;
                margin-bottom: 12px;
                padding-bottom: 8px;
                border-bottom: 1px solid #1e40af;
                color: #1e40af;
              }
              .grid {
                display: grid;
                gap: 8px;
              }
              .grid-cols-1 { grid-template-columns: 1fr; }
              .grid-cols-2 { grid-template-columns: 1fr 1fr; }
              .grid-cols-3 { grid-template-columns: 1fr 1fr 1fr; }
              .flex {
                display: flex;
                justify-content: space-between;
                align-items: center;
              }
              .bg-white {
                background-color: white;
                padding: 8px;
                border-radius: 6px;
                box-shadow: 0 1px 2px rgba(0,0,0,0.05);
              }
              .bg-blue-100 { background-color: #dbeafe; }
              .bg-blue-200 { background-color: #bfdbfe; }
              .text-xs { font-size: 0.75rem; }
              .text-sm { font-size: 0.875rem; }
              .text-base { font-size: 1rem; }
              .font-medium { font-weight: 500; }
              .font-semibold { font-weight: 600; }
              .font-bold { font-weight: 700; }
              .text-gray-500 { color: #6b7280; }
              .text-gray-700 { color: #374151; }
              .text-red-600 { color: #dc2626; }
              .text-blue-900 { color: #1e3a8a; }
              .mt-1 { margin-top: 4px; }
              .p-2 { padding: 8px; }
              .rounded-md { border-radius: 6px; }
              .space-y-2 > * + * { margin-top: 8px; }
            </style>
          </head>
          <body>
            <div class="container">
              ${printSection.innerHTML}
            </div>
          </body>
        </html>
      `;
      
      // 4. 새 창에서 인쇄
      const printWindow = window.open('', '_blank');
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // 5. 인쇄 실행
      printWindow.onload = function() {
        printWindow.focus();
        printWindow.print();
        // 인쇄 후 창 닫기 (선택 사항)
        printWindow.onafterprint = function() {
          printWindow.close();
        };
      };
    }
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
      {/* 인쇄 시 특정 섹션만 표시하는 스타일 */}
      <style jsx global>{`
        @media print {
          /* 인쇄 시 모든 요소 숨기기 */
          body * {
            display: none !important;
          }
          
          /* 인쇄할 섹션과 그 자식 요소만 표시 */
          .print-this-section,
          .print-this-section * {
            display: block !important;
          }
          
          /* 테이블, 그리드 등 레이아웃 요소는 원래 표시 방식 유지 */
          .print-this-section table {
            display: table !important;
          }
          .print-this-section tr {
            display: table-row !important;
          }
          .print-this-section td, .print-this-section th {
            display: table-cell !important;
          }
          .print-this-section div[class*="grid"] {
            display: grid !important;
          }
          .print-this-section div[class*="flex"] {
            display: flex !important;
          }
          
          /* 배경색 유지 */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          /* 페이지 여백 설정 */
          @page {
            size: auto;
            margin: 1cm;
          }
        }
      `}</style>
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
            인쇄
          </button>
        </div>
        <p className="text-sm text-gray-500 text-right mb-4 no-print">
          ※ 배경색이 인쇄되지 않을 경우 브라우저 인쇄 설정에서 '배경 그래픽' 옵션을 활성화해주세요.
        </p>
        
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
          <div ref={invoiceRef} className="print-this-section invoice-container bg-white border-2 border-blue-200 rounded-lg shadow-lg print:shadow-none print:rounded-none">
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
              <div style={{ flex: '6', border: '1px solid #93c5fd', padding: '8px', marginLeft: '4px', borderRadius: '0.25rem', backgroundColor: '#f0f8ff' }}>
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
              <div style={{ flex: '4', border: '1px solid #93c5fd', padding: '8px', marginRight: '4px', borderRadius: '0.25rem', backgroundColor: '#f0f8ff' }}>
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
              <div className="table-container mx-4">
                <table className="min-w-full divide-y divide-blue-300 border border-blue-300">
                  <thead>
                    <tr className="bg-blue-100">
                      <th className="px-1.5 py-0.5 border border-blue-300 text-sm font-medium w-[5%] t ext-center">No.</th>
                      <th className="px-1.5 py-0.5 border border-blue-300 text-sm font-medium w-[12%]">분류</th>
                      <th className="px-1.5 py-0.5 border border-blue-300 text-sm font-medium w-[48%]">상품명</th>
                      <th className="px-1.5 py-0.5 border border-blue-300 text-sm font-medium w-[7%] text-center">수량</th>
                      <th className="px-1.5 py-0.5 border border-blue-300 text-sm font-medium w-[14%] text-center">단가</th>
                      <th className="px-1.5 py-0.5 border border-blue-300 text-sm font-medium w-[14%] text-center">금액</th>
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
                          <td className="px-1.5 py-0.5 border border-blue-300 text-sm text-center">
                            {item.price && item.quantity ? 
                              Math.round(parseInt(item.price) / parseInt(item.quantity)).toLocaleString() : 
                              '-'}원
                          </td>
                          <td className="px-1.5 py-0.5 border border-blue-300 text-sm text-center">
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
                    <tr className="bg-blue-100 font-medium">
                      <td colSpan="4" className="px-1.5 py-0.5 border border-blue-300 text-right">상품 소계</td>
                      <td colSpan="2" className="px-1.5 py-0.5 border border-blue-300 text-center">
                        {estimate.calculatedValues?.productTotal?.toLocaleString() || '0'}원
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* 결제 정보 요약 - 별도 섹션으로 분리 */}
            <div className="mb-6 border border-blue-300 rounded-lg p-4 bg-blue-50 mx-4">
              <h2 className="text-xl font-bold mb-3 text-blue-800 border-b pb-2">결제 정보</h2>
              <div className="space-y-2">
                {/* 상품/부품 합계 - 그대로 유지 */}
                <div className="flex justify-between items-center bg-white p-2 rounded-md shadow-sm">
                  <span className="font-semibold text-sm text-gray-700">상품/부품 합계:</span>
                  <span className="text-right font-medium text-sm">{estimate.calculatedValues?.productTotal?.toLocaleString() || '0'}원</span>
                </div>
                
                {/* 공임비, 세팅비, 계약금 영역 */}
                {(estimate.paymentInfo?.laborCost > 0 || estimate.paymentInfo?.setupCost > 0 || estimate.paymentInfo?.deposit > 0) && (
                  <div className={`grid gap-2 ${
                    (estimate.paymentInfo?.laborCost > 0 ? 1 : 0) + 
                    (estimate.paymentInfo?.setupCost > 0 ? 1 : 0) + 
                    (estimate.paymentInfo?.deposit > 0 ? 1 : 0) === 1 ? 'grid-cols-1' : 
                    (estimate.paymentInfo?.laborCost > 0 ? 1 : 0) + 
                    (estimate.paymentInfo?.setupCost > 0 ? 1 : 0) + 
                    (estimate.paymentInfo?.deposit > 0 ? 1 : 0) === 2 ? 'grid-cols-2' : 'grid-cols-3'
                  }`}>
                    {estimate.paymentInfo?.laborCost > 0 && (
                      <div className="bg-white p-2 rounded-md shadow-sm">
                        <div className="text-xs text-gray-500">공임비</div>
                        <div className="font-medium text-sm">{estimate.paymentInfo?.laborCost?.toLocaleString()}원</div>
                      </div>
                    )}
                    
                    {estimate.paymentInfo?.setupCost > 0 && (
                      <div className="bg-white p-2 rounded-md shadow-sm">
                        <div className="text-xs text-gray-500">세팅비</div>
                        <div className="font-medium text-sm">{estimate.paymentInfo?.setupCost?.toLocaleString()}원</div>
                      </div>
                    )}
                    
                    {estimate.paymentInfo?.deposit > 0 && (
                      <div className="bg-white p-2 rounded-md shadow-sm">
                        <div className="text-xs text-gray-500">계약금</div>
                        <div className="font-medium text-sm">{estimate.paymentInfo?.deposit?.toLocaleString()}원</div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* 총 구입 금액 */}
                <div className="flex justify-between items-center bg-blue-100 p-2 rounded-md shadow-sm">
                  <span className="font-semibold text-sm text-gray-700">총 구입 금액:</span>
                  <span className="text-right font-semibold text-sm">{estimate.calculatedValues?.totalPurchase?.toLocaleString() || '0'}원</span>
                </div>
                
                {/* 할인, 부가세(VAT) 영역 */}
                {(estimate.paymentInfo?.discount > 0 || (estimate.paymentInfo?.includeVat && estimate.calculatedValues?.vatAmount > 0)) && (
                  <div className={`grid gap-2 ${
                    (estimate.paymentInfo?.discount > 0 ? 1 : 0) + 
                    (estimate.paymentInfo?.includeVat && estimate.calculatedValues?.vatAmount > 0 ? 1 : 0) === 1 ? 'grid-cols-1' : 'grid-cols-2'
                  }`}>
                    {estimate.paymentInfo?.discount > 0 && (
                      <div className="bg-white p-2 rounded-md shadow-sm">
                        <div className="text-xs text-gray-500">할인</div>
                        <div className="font-medium text-sm text-red-600">-{estimate.paymentInfo?.discount?.toLocaleString()}원</div>
                      </div>
                    )}
                    
                    {estimate.paymentInfo?.includeVat && estimate.calculatedValues?.vatAmount > 0 && (
                      <div className="bg-white p-2 rounded-md shadow-sm">
                        <div className="text-xs text-gray-500">부가세(VAT)</div>
                        <div className="font-medium text-sm">
                          {estimate.calculatedValues?.vatAmount?.toLocaleString()}원 ({estimate.paymentInfo.vatRate || 10}%)
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* 최종 결제 금액 */}
                <div className="flex justify-between items-center bg-blue-200 p-2 rounded-md shadow-sm mt-1">
                  <span className="font-bold text-sm text-blue-900">최종 결제 금액:</span>
                  <span className="text-right font-bold text-base text-blue-900">{estimate.calculatedValues?.finalPayment?.toLocaleString() || '0'}원</span>
                </div>
                
                {/* 택배비 - 작게 표시 */}
                {estimate.paymentInfo?.shippingCost > 0 && (
                  <div className="flex justify-end">
                    <div className="inline-block bg-gray-50 p-1 px-2 rounded-md">
                      <span className="text-xs text-gray-600">※택배비 별도: {estimate.paymentInfo?.shippingCost?.toLocaleString()}원※</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* 참고사항 */}
            <div className="mb-6 border border-blue-300 rounded-lg p-4 bg-blue-50 mx-4">
              <h3 className="text-xl font-bold mb-3 text-blue-800 border-b pb-2">참고사항</h3>
              <div className="bg-white p-2 rounded-md shadow-sm">
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