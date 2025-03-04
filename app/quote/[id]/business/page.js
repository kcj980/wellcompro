'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function BusinessQuotePage({ params }) {
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
    return <div className="container mx-auto p-6 text-center">데이터를 불러오는 중...</div>;
  }
  
  if (error) {
    return <div className="container mx-auto p-6 text-center text-red-500">{error}</div>;
  }
  
  if (!estimate) {
    return <div className="container mx-auto p-6 text-center">견적 정보를 찾을 수 없습니다.</div>;
  }

  // 부가세 계산 (10%)
  const subtotal = estimate.totalAmount ? Math.round(estimate.totalAmount / 1.1) : 0;
  const vat = estimate.totalAmount ? estimate.totalAmount - subtotal : 0;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-4 flex justify-between items-center print:hidden">
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
          <p className="text-gray-600 mt-2">(기업용)</p>
        </div>
        
        <div className="flex justify-end mb-4">
          <p>견적일자: {formatDate(estimate.createdAt)}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="border border-gray-300 rounded-lg p-4">
            <h2 className="text-lg font-bold mb-2 text-center border-b border-gray-300 pb-2">공급자</h2>
            <div className="space-y-2">
              <div className="flex">
                <span className="font-semibold w-24">상호:</span>
                <span>{estimate.supplier?.companyName || '웰컴프로'}</span>
              </div>
              <div className="flex">
                <span className="font-semibold w-24">대표자:</span>
                <span>{estimate.supplier?.representative || '-'}</span>
              </div>
              <div className="flex">
                <span className="font-semibold w-24">사업자번호:</span>
                <span>{estimate.supplier?.businessNumber || '-'}</span>
              </div>
              <div className="flex">
                <span className="font-semibold w-24">주소:</span>
                <span>{estimate.supplier?.address || '-'}</span>
              </div>
              <div className="flex">
                <span className="font-semibold w-24">연락처:</span>
                <span>{estimate.supplier?.phone || '-'}</span>
              </div>
              <div className="flex">
                <span className="font-semibold w-24">이메일:</span>
                <span>{estimate.supplier?.email || '-'}</span>
              </div>
            </div>
          </div>
          
          <div className="border border-gray-300 rounded-lg p-4">
            <h2 className="text-lg font-bold mb-2 text-center border-b border-gray-300 pb-2">공급받는자</h2>
            <div className="space-y-2">
              <div className="flex">
                <span className="font-semibold w-24">상호:</span>
                <span>{estimate.client?.companyName || '-'}</span>
              </div>
              <div className="flex">
                <span className="font-semibold w-24">대표자:</span>
                <span>{estimate.client?.representative || '-'}</span>
              </div>
              <div className="flex">
                <span className="font-semibold w-24">사업자번호:</span>
                <span>{estimate.client?.businessNumber || '-'}</span>
              </div>
              <div className="flex">
                <span className="font-semibold w-24">주소:</span>
                <span>{estimate.client?.address || '-'}</span>
              </div>
              <div className="flex">
                <span className="font-semibold w-24">담당자:</span>
                <span>{estimate.client?.contactPerson || '-'}</span>
              </div>
              <div className="flex">
                <span className="font-semibold w-24">연락처:</span>
                <span>{estimate.client?.phone || '-'}</span>
              </div>
              <div className="flex">
                <span className="font-semibold w-24">이메일:</span>
                <span>{estimate.client?.email || '-'}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <table className="w-full border-collapse border border-gray-300">
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
              {estimate.items && estimate.items.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-300 p-2 text-center">{index + 1}</td>
                  <td className="border border-gray-300 p-2 text-center">{item.category || '-'}</td>
                  <td className="border border-gray-300 p-2">{item.name}</td>
                  <td className="border border-gray-300 p-2 text-center">{item.quantity}</td>
                  <td className="border border-gray-300 p-2 text-right">{Math.round(item.unitPrice / 1.1).toLocaleString()}원</td>
                  <td className="border border-gray-300 p-2 text-right">{Math.round((item.quantity * item.unitPrice) / 1.1).toLocaleString()}원</td>
                </tr>
              ))}
              
              <tr className="bg-gray-100">
                <td colSpan="4" className="border border-gray-300 p-2 text-right font-semibold">소계</td>
                <td colSpan="2" className="border border-gray-300 p-2 text-right font-semibold">
                  {subtotal.toLocaleString()}원
                </td>
              </tr>
              <tr className="bg-gray-100">
                <td colSpan="4" className="border border-gray-300 p-2 text-right font-semibold">부가세(10%)</td>
                <td colSpan="2" className="border border-gray-300 p-2 text-right font-semibold">
                  {vat.toLocaleString()}원
                </td>
              </tr>
              <tr className="bg-gray-100 font-bold">
                <td colSpan="4" className="border border-gray-300 p-2 text-right">합계</td>
                <td colSpan="2" className="border border-gray-300 p-2 text-right">
                  {estimate.totalAmount?.toLocaleString()}원
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="border border-gray-300 rounded-lg p-4 mb-6 bg-gray-50">
          <h2 className="text-lg font-bold mb-2">결제 정보</h2>
          <div className="space-y-2">
            <div className="flex">
              <span className="font-semibold w-24">결제 방법:</span>
              <span>{estimate.paymentMethod || '계좌이체'}</span>
            </div>
            <div className="flex">
              <span className="font-semibold w-24">계좌 정보:</span>
              <span>{estimate.bankAccount || '국민은행 123-456-789012 (예금주: 웰컴프로)'}</span>
            </div>
            <div className="flex">
              <span className="font-semibold w-24">견적 유효기간:</span>
              <span>견적일로부터 30일</span>
            </div>
          </div>
        </div>
        
        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
          <h2 className="text-lg font-bold mb-2">참고사항</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>본 견적서의 유효기간은 발행일로부터 30일입니다.</li>
            <li>상기 금액은 부가가치세(10%)가 포함된 금액입니다.</li>
            <li>상품의 사양 및 가격은 제조사의 정책에 따라 변경될 수 있습니다.</li>
            <li>대금 지급 조건: 계약금 50%, 잔금 50%(납품 완료 후)</li>
            <li>문의사항은 담당자에게 연락 바랍니다.</li>
          </ul>
        </div>
        
        <div className="mt-8 text-right">
          <div className="inline-block text-center">
            <p className="mb-10">{estimate.supplier?.companyName || '웰컴프로'}</p>
            <p className="font-bold">{estimate.supplier?.representative || '대표자'} (인)</p>
          </div>
        </div>
      </div>
    </div>
  );
} 