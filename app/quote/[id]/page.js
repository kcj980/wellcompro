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
    <>
      <Head>
        <style jsx global>{`
          @media print {
            .no-print {
              display: none !important;
            }
            @page {
              size: A4;
              margin: 10mm;
            }
            body {
              padding: 0;
              margin: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        `}</style>
      </Head>
      <div className="min-h-screen bg-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
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
            <div ref={invoiceRef} className="bg-white border-2 border-gray-300 p-8 rounded-lg shadow-lg">
              {/* 견적서 헤더 */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">견 적 서</h1>
                <p className="text-gray-600">견적일자: {formatDate(estimate.createdAt)}</p>
              </div>
              
              {/* 공급자/공급받는자 정보 */}
              <div className="flex flex-col md:flex-row justify-between mb-8 gap-6">
                {/* 공급자 정보 (회사 정보) */}
                <div className="flex-1 border border-gray-300 p-4 rounded">
                  <h2 className="text-lg font-bold mb-3 text-center border-b pb-2">공급자</h2>
                  <div className="space-y-2">
                    <div className="flex">
                      <span className="font-semibold w-24">상호명:</span>
                      <span>웰컴프로</span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold w-24">대표자:</span>
                      <span>000</span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold w-24">사업자번호:</span>
                      <span>000-00-00000</span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold w-24">주소:</span>
                      <span>서울시 00구 00로 00</span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold w-24">전화번호:</span>
                      <span>02-000-0000</span>
                    </div>
                  </div>
                </div>
                
                {/* 공급받는자 정보 (고객 정보) */}
                <div className="flex-1 border border-gray-300 p-4 rounded">
                  <h2 className="text-lg font-bold mb-3 text-center border-b pb-2">공급받는자</h2>
                  <div className="space-y-2">
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
                      <span className="font-semibold w-24">계약구분:</span>
                      <span>{estimate.customerInfo?.contractType || '-'}</span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold w-24">판매형태:</span>
                      <span>{estimate.customerInfo?.saleType || '-'}</span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold w-24">구입형태:</span>
                      <span>
                        {estimate.customerInfo?.purchaseType || '-'}
                        {estimate.customerInfo?.purchaseType === '지인' && estimate.customerInfo?.purchaseTypeName && (
                          <span className="ml-1">({estimate.customerInfo.purchaseTypeName})</span>
                        )}
                      </span>
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
                <h2 className="text-xl font-bold mb-4">상세 내역</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-4 py-2 border border-gray-300 text-sm font-medium">No.</th>
                        <th className="px-4 py-2 border border-gray-300 text-sm font-medium">분류</th>
                        <th className="px-4 py-2 border border-gray-300 text-sm font-medium">상품명</th>
                        <th className="px-4 py-2 border border-gray-300 text-sm font-medium">수량</th>
                        <th className="px-4 py-2 border border-gray-300 text-sm font-medium">단가</th>
                        <th className="px-4 py-2 border border-gray-300 text-sm font-medium">금액</th>
                        <th className="px-4 py-2 border border-gray-300 text-sm font-medium">비고</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {estimate.tableData?.map((item, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-2 border border-gray-300 text-sm text-center">{index + 1}</td>
                          <td className="px-4 py-2 border border-gray-300 text-sm">{item.category || '-'}</td>
                          <td className="px-4 py-2 border border-gray-300 text-sm">{item.productName || '-'}</td>
                          <td className="px-4 py-2 border border-gray-300 text-sm text-center">{item.quantity || '-'}</td>
                          <td className="px-4 py-2 border border-gray-300 text-sm text-right">
                            {item.price && item.quantity ? 
                              Math.round(parseInt(item.price) / parseInt(item.quantity)).toLocaleString() : 
                              '-'}
                          </td>
                          <td className="px-4 py-2 border border-gray-300 text-sm text-right">
                            {item.price ? parseInt(item.price).toLocaleString() : '-'}
                          </td>
                          <td className="px-4 py-2 border border-gray-300 text-sm">{item.remarks || '-'}</td>
                        </tr>
                      ))}
                      
                      {/* 상품 합계만 표시 */}
                      <tr className="bg-gray-100 font-bold">
                        <td colSpan="5" className="px-4 py-2 border border-gray-300 text-right">상품/부품 합계</td>
                        <td className="px-4 py-2 border border-gray-300 text-right">
                          {estimate.calculatedValues?.productTotal?.toLocaleString() || '0'}
                        </td>
                        <td colSpan="2" className="px-4 py-2 border border-gray-300"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* 결제 정보 요약 - 별도 섹션으로 분리 */}
              <div className="mb-6 border border-gray-300 rounded-lg p-5 bg-gray-50">
                <h2 className="text-xl font-bold mb-4">결제 정보</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-medium">상품/부품 합계:</span>
                    <span className="text-right">{estimate.calculatedValues?.productTotal?.toLocaleString() || '0'}원</span>
                  </div>
                  
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-medium">공임비:</span>
                    <span className="text-right">{estimate.paymentInfo?.laborCost?.toLocaleString() || '0'}원</span>
                  </div>
                  
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-medium">세팅비:</span>
                    <span className="text-right">{estimate.paymentInfo?.setupCost?.toLocaleString() || '0'}원</span>
                  </div>
                  
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-medium">할인:</span>
                    <span className="text-right">-{estimate.paymentInfo?.discount?.toLocaleString() || '0'}원</span>
                  </div>
                  
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-medium">총 구입 금액:</span>
                    <span className="text-right font-semibold">{estimate.calculatedValues?.totalPurchase?.toLocaleString() || '0'}원</span>
                  </div>
                  
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-medium">계약금:</span>
                    <span className="text-right">{estimate.paymentInfo?.deposit?.toLocaleString() || '0'}원</span>
                  </div>
                  
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-medium">부가세(VAT):</span>
                    <span className="text-right">
                      {estimate.paymentInfo?.includeVat ? 
                        `${estimate.calculatedValues?.vatAmount?.toLocaleString() || '0'}원 (${estimate.paymentInfo.vatRate || 10}%)` : 
                        '별도'}
                    </span>
                  </div>
                  
                  <div className="col-span-2 flex justify-between items-center pt-2">
                    <span className="font-bold text-lg">최종 결제 금액:</span>
                    <span className="text-right font-bold text-lg text-blue-600">{estimate.calculatedValues?.finalPayment?.toLocaleString() || '0'}원</span>
                  </div>
                </div>
              </div>
              
              {/* 참고사항 */}
              <div className="mb-8">
                <h3 className="text-lg font-bold mb-2">참고사항</h3>
                <div className="border border-gray-300 p-4 rounded bg-gray-50">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>본 견적서의 유효기간은 견적일로부터 7일입니다.</li>
                    <li>상기 견적은 제품 수급 상황에 따라 변동될 수 있습니다.</li>
                    <li>모든 가격은 부가세 {estimate.paymentInfo?.includeVat ? '포함' : '별도'} 금액입니다.</li>
                    <li>계약금 입금 후 주문이 확정됩니다.</li>
                  </ul>
                </div>
              </div>
              
              {/* 회사 서명 */}
              <div className="text-center mt-12">
                <div className="inline-block border-t-2 border-gray-800 pt-2">
                  <h3 className="text-xl font-bold">웰컴프로</h3>
                  <p className="mt-1">대표: 000</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 