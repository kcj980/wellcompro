'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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
          className="bg-sky-400 hover:bg-sky-500 text-white font-semibold py-2 px-4 rounded-lg shadow transition-colors"
        >
          인쇄하기
        </button>
      </div>
      
      {/* 인쇄 영역 */}
      <div ref={printRef} className="print-this-section bg-white p-2.5 pt-2.5 pb-2.5 px-4.5 border-2 border-sky-300 rounded-lg shadow-sm">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
          <div style={{ width: '200px' }}>
            <Image 
              src="/wellcomlogo.png" 
              alt="웰컴 시스템 로고" 
              width={200} 
              height={80} 
              style={{ objectFit: 'contain' }}
            />
          </div>
          <div className="text-center" style={{ flex: 1 }}>
            <h1 className="text-3xl font-bold text-black tracking-extra-widetitle">견 적 서</h1>
          </div>
          <div style={{ width: '200px', textAlign: 'right', paddingBottom: '50px' }}>
            <p className="text-gray-700 tracking-tighter">견적일자: {formatDate(estimate.createdAt)}</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '24px', marginBottom: '5px' }}>
          <div className="flex justify-between mb-1 w-full">
            <div style={{ width: '45%', height: '125px' }} className="border border-sky-200 rounded-lg bg-sky-50">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <h2 className="text-lg font-bold text-black border-r border-sky-200 tracking-extra-wide" style={{ writingMode: 'vertical-rl', marginRight: '10px', paddingTop: '1px' }}>공급받는자</h2>
                <div className="space-y-1" style={{ margin: '0', padding: '0' }}>
                  <div className="flex" style={{ margin: '0' }}>
                      <span className="font-semibold w-24 text-black">성함:</span>
                      <span className="font-semibold text-black">{estimate.customerInfo?.name || '-'}</span>
                  </div>
                  <div className="flex" style={{ margin: '0' }}>
                      <span className="font-semibold w-24 text-black">연락처:</span>
                      <span className="font-semibold text-black">{estimate.customerInfo?.phone || '-'}</span>
                  </div>
                  <div className="flex" style={{ margin: '0' }}>
                      <span className="font-semibold w-24 text-black">PC번호:</span>
                      <span className="font-semibold text-black">{estimate.customerInfo?.pcNumber || '-'}</span>
                  </div>
                  <div className="flex" style={{ margin: '0' }}>
                      <span className="font-semibold w-24 text-black">AS조건:</span>
                      <span className="font-semibold text-black">{estimate.customerInfo?.asCondition || '-'}</span>
                  </div>
                  <div className="flex" style={{ margin: '0' }}>
                      <span className="font-semibold w-24 text-black">견적담당:</span>
                      <span className="font-semibold text-black">{estimate.customerInfo?.manager || '-'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{ width: '54%', height: '125px' }} className="border border-sky-200 rounded-lg bg-sky-50">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <h2 className="text-lg font-bold text-black border-r border-sky-200 tracking-extra-wide2" style={{ writingMode: 'vertical-rl', marginRight: '10px', paddingTop: '12.5px' }}>공급자</h2>
                <div className="space-y-1" style={{ margin: '0', padding: '0' }}>
                  <div className="flex" style={{ margin: '0' }}>
                    <span className="font-semibold w-24 text-black">상호:</span>
                    <span className="font-semibold text-black">웰컴 시스템</span>
                  </div>
                  <div className="flex" style={{ margin: '0' }}>
                    <span className="font-semibold w-24 text-black">대표자:</span>
                    <span className="font-semibold text-black">김선식</span>
                  </div>
                  <div className="flex" style={{ margin: '0' }}>
                    <span className="font-semibold w-24 text-black">사업자번호:</span>
                    <span className="font-semibold text-black">607-02-70320</span>
                  </div>
                  <div className="flex" style={{ margin: '0' }}>
                    <span className="font-semibold w-24 text-black">주소:</span>
                    <span className="font-semibold text-black">부산시 동래구 온천동 456-29</span>
                  </div>
                  <div className="flex" style={{ margin: '0' }}>
                    <span className="font-semibold w-24 text-black">연락처:</span>
                    <span className="font-semibold text-black">051-926-6604</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div style={{ marginBottom: '7px' }}>
          <table style={{ width: '100%' }} className="border-collapse border border-sky-200">
            <thead className="bg-sky-100">
              <tr>
                <th className="border border-sky-200 text-center text-black" style={{ width: '1%' }}>No.</th>
                <th className="border border-sky-200 text-center text-black" style={{ width: '12%' }}>분류</th>
                <th className="border border-sky-200 text-center text-black" style={{ width: '51%' }}>상품명</th>
                <th className="border border-sky-200 text-center text-black" style={{ width: '6%' }}>수량</th>
                <th className="border border-sky-200 text-center text-black" style={{ width: '14%' }}>단가</th>
                <th className="border border-sky-200 text-center text-black" style={{ width: '14%' }}>금액</th>
              </tr>
            </thead>
            <tbody>
              {estimate.tableData && estimate.tableData.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-sky-50'}>
                  <td className="border border-sky-200 text-center">{index + 1}</td>
                  <td className="border border-sky-200 text-center">{item.category || '-'}</td>
                  <td className="border border-sky-200">{item.productName}</td>
                  <td className="border border-sky-200 text-center">{item.quantity}</td>
                  <td className="border border-sky-200 text-right">
                    {item.price && item.quantity ? 
                      Math.round(parseInt(item.price) / parseInt(item.quantity)).toLocaleString() : '-'}원
                  </td>
                  <td className="border border-sky-200 text-right">
                    {item.price ? parseInt(item.price).toLocaleString() : '-'}원
                  </td>
                </tr>
              ))}
              
              <tr className="bg-sky-200 font-bold">
                <td colSpan="4" className="border border-sky-200 text-right p-1 text-black" style={{ padding: '0' }}>합계</td>
                <td colSpan="2" className="border border-sky-200 text-right p-1 text-black">
                  {estimate.calculatedValues?.productTotal?.toLocaleString()}원
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* 서비스 상품 데이터 표시 */}
        {estimate.serviceData && estimate.serviceData.length > 0 && (
          <div className="border border-sky-200 rounded-lg p-2 mb-1 bg-sky-50">
            <div className="flex items-center">
              <h2 className="text-lg font-bold text-black mr-4">서비스 상품</h2>
              <div className="flex flex-wrap gap-2">
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
        <div className="border border-sky-200 rounded-lg px-2 mb-6 bg-sky-50">
          <h2 className="text-lg font-bold mb-1 mt-1 text-black">결제 정보</h2>
          <div className="space-y-1">
            {/* 상품/부품 합계 */}
            <div className="border border-sky-200 rounded-md p-1 bg-white flex justify-between">
              <span className="font-semibold text-black">상품/부품 합계:</span>
              <span>{estimate.calculatedValues?.productTotal?.toLocaleString() || '0'}원</span>
            </div>
            
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
                <div className="border border-sky-200 rounded-md p-1 bg-white flex-1 flex justify-between">
                  <span className="font-semibold text-black">계약금:</span>
                  <span>{estimate.paymentInfo?.deposit?.toLocaleString()}원</span>
                </div>
              )}
              <div className="border border-sky-200 rounded-md p-1 bg-white flex-[1.6] flex justify-between">
                <span className="font-semibold text-black">총 구입 금액:</span>
                <span>{estimate.calculatedValues?.totalPurchase?.toLocaleString() || '0'}원</span>
              </div>
            </div>

            <div className="flex gap-1">
                {/* 부가세(VAT) 표시 */}
                {estimate.paymentInfo?.includeVat && (
                    <div className="border border-sky-200 rounded-md p-1 bg-white flex-1 flex justify-between">
                        <span className="font-semibold text-black">부가세(VAT):</span>
                        <span>{estimate.calculatedValues?.vatAmount?.toLocaleString() || '0'}원 ({estimate.paymentInfo?.vatRate || 10}%)</span>
                    </div>
                )}
                
                {/* 최종 결제 금액 */}
                <div className="border border-sky-200 rounded-md p-1 bg-sky-100 flex-[1.6] flex justify-between font-bold">
                    <span className="text-black">최종 결제 금액:</span>
                    <span className="text-black">{estimate.calculatedValues?.finalPayment?.toLocaleString() || '0'}원</span>
                </div>
            </div>
            
            
            
            {/* 배송+설치 - 값이 있을 때는 금액 표시, 없을 때는 안내 메시지 표시 */}
            <div className="flex justify-end">
              <div className="border border-sky-400 rounded-md p-1 mb-1 bg-white inline-flex text-sm">
                {estimate.paymentInfo?.shippingCost > 0 ? (
                  <>
                    <span className="font-semibold text-black whitespace-pre">※배송+설치 별도 추가: </span>
                    <span className="font-semibold text-black">{estimate.paymentInfo?.shippingCost?.toLocaleString()}원※</span>
                  </>
                ) : (
                  <span className="font-semibold text-black">※배송+설치 비용은 별도 부과됩니다※</span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="border border-sky-200 rounded-lg p-4 bg-sky-50">
          <h2 className="text-lg font-bold mb-2 text-black border-b border-sky-200 pb-2">참고사항</h2>
          <ul className="list-disc pl-5 space-y-1 text-black">
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