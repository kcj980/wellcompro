'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function ConsumerQuotePage({ params }) {
  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
        
        <button
          onClick={handlePrint}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow transition-colors"
        >
          인쇄하기
        </button>
      </div>
      
      {/* 인쇄 영역 */}
      <div ref={printRef} className="print-this-section bg-white p-6 border border-gray-300 rounded-lg shadow-sm">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">견적서</h1>
          <p className="text-gray-600 mt-2">(일반소비자용)</p>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
          <p>견적일자: {formatDate(estimate.createdAt)}</p>
        </div>
        
        <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
          <div style={{ width: '50%' }} className="border border-gray-300 rounded-lg p-4">
            <h2 className="text-lg font-bold mb-2 text-center border-b border-gray-300 pb-2">공급자</h2>
            <div className="space-y-2">
              <div className="flex">
                <span className="font-semibold w-24">상호:</span>
                <span>웰컴 시스템</span>
              </div>
              <div className="flex">
                <span className="font-semibold w-24">대표자:</span>
                <span>김선식</span>
              </div>
              <div className="flex">
                <span className="font-semibold w-24">주소:</span>
                <span>부산시 동래구 온천동 456-29</span>
              </div>
              <div className="flex">
                <span className="font-semibold w-24">연락처:</span>
                <span>051-926-6604</span>
              </div>
              <div className="flex">
                <span className="font-semibold w-24">사업자번호:</span>
                <span>607-02-70320</span>
              </div>
            </div>
          </div>
          
          <div style={{ width: '50%' }} className="border border-gray-300 rounded-lg p-4">
            <h2 className="text-lg font-bold mb-2 text-center border-b border-gray-300 pb-2">공급받는자</h2>
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
        
        <div style={{ marginBottom: '24px' }}>
          <table style={{ width: '100%' }} className="border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 p-2 text-center">No.</th>
                <th className="border border-gray-300 p-2 text-center">분류</th>
                <th className="border border-gray-300 p-2 text-center">상품명</th>
                <th className="border border-gray-300 p-2 text-center">수량</th>
                <th className="border border-gray-300 p-2 text-center">단가</th>
                <th className="border border-gray-300 p-2 text-center">금액</th>
              </tr>
            </thead>
            <tbody>
              {estimate.tableData && estimate.tableData.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-300 p-2 text-center">{index + 1}</td>
                  <td className="border border-gray-300 p-2 text-center">{item.category || '-'}</td>
                  <td className="border border-gray-300 p-2">{item.productName}</td>
                  <td className="border border-gray-300 p-2 text-center">{item.quantity}</td>
                  <td className="border border-gray-300 p-2 text-right">
                    {item.price && item.quantity ? 
                      Math.round(parseInt(item.price) / parseInt(item.quantity)).toLocaleString() : '-'}원
                  </td>
                  <td className="border border-gray-300 p-2 text-right">
                    {item.price ? parseInt(item.price).toLocaleString() : '-'}원
                  </td>
                </tr>
              ))}
              
              <tr className="bg-gray-100 font-bold">
                <td colSpan="4" className="border border-gray-300 p-2 text-right">합계</td>
                <td colSpan="2" className="border border-gray-300 p-2 text-right">
                  {estimate.calculatedValues?.productTotal?.toLocaleString()}원
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="border border-gray-300 rounded-lg p-4 mb-6 bg-gray-50">
          <h2 className="text-lg font-bold mb-2">결제 정보</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <div className="flex-1">
                <span className="font-semibold">상품/부품 합계:</span>
                <span className="ml-2">{estimate.calculatedValues?.productTotal?.toLocaleString()}원</span>
              </div>
              <div className="flex-1">
                <span className="font-semibold">공임비:</span>
                <span className="ml-2">{estimate.paymentInfo?.laborCost?.toLocaleString() || '0'}원</span>
              </div>
            </div>
            <div className="flex justify-between">
              <div className="flex-1">
                <span className="font-semibold">세팅비:</span>
                <span className="ml-2">{estimate.paymentInfo?.setupCost?.toLocaleString() || '0'}원</span>
              </div>
              <div className="flex-1">
                <span className="font-semibold">할인:</span>
                <span className="ml-2">{estimate.paymentInfo?.discount?.toLocaleString() || '0'}원</span>
              </div>
            </div>
            {estimate.paymentInfo?.includeVat && (
              <div className="flex">
                <span className="font-semibold">부가세(VAT):</span>
                <span className="ml-2">{estimate.calculatedValues?.vatAmount?.toLocaleString() || '0'}원 ({estimate.paymentInfo?.vatRate || 10}%)</span>
              </div>
            )}
            <div className="flex font-bold mt-2 pt-2 border-t border-gray-300">
              <span className="font-semibold">최종 결제 금액:</span>
              <span className="ml-2">{estimate.calculatedValues?.finalPayment?.toLocaleString()}원</span>
            </div>
            {estimate.paymentInfo?.shippingCost > 0 && (
              <div className="flex justify-end text-sm text-gray-600">
                <span>※택배비 별도: {estimate.paymentInfo?.shippingCost?.toLocaleString()}원</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
          <h2 className="text-lg font-bold mb-2">참고사항</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>본 견적서의 유효기간은 발행일로부터 7일입니다.</li>
            <li>상기 금액은 부가세가 {estimate.paymentInfo?.includeVat ? '포함된' : '포함되지 않은'} 금액입니다.</li>
            <li>상품의 사양 및 가격은 제조사의 정책에 따라 변경될 수 있습니다.</li>
            <li>계약금 입금 후 주문이 확정됩니다.</li>
            {estimate.notes && <li>{estimate.notes}</li>}
          </ul>
        </div>
      </div>
    </div>
  );
} 