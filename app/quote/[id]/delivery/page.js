'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function DeliveryNotePage({ params }) {
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

  if (loading) {
    return <div className="container mx-auto p-6 text-center">데이터를 불러오는 중...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-6 text-center text-red-500">{error}</div>;
  }

  if (!estimate) {
    return <div className="container mx-auto p-6 text-center">견적 정보를 찾을 수 없습니다.</div>;
  }

  // 납품서 번호 생성
  const deliveryNumber = `WCP-DEL-${new Date().getFullYear()}-${id.substring(0, 6)}`;

  // 오늘 날짜를 납품일로 설정
  const deliveryDate = formatDate(new Date());

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
      <div
        ref={printRef}
        className="print-this-section bg-white p-6 border border-gray-300 rounded-lg shadow-sm"
      >
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">납품서</h1>
          <p className="text-gray-600 mt-2">납품번호: {deliveryNumber}</p>
        </div>

        <div className="flex justify-end mb-4">
          <p>납품일자: {deliveryDate}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="border border-gray-300 rounded-lg p-4">
            <h2 className="text-lg font-bold mb-2 text-center border-b border-gray-300 pb-2">
              공급자
            </h2>
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
            <h2 className="text-lg font-bold mb-2 text-center border-b border-gray-300 pb-2">
              공급받는자
            </h2>
            <div className="space-y-2">
              {estimate.client?.companyName ? (
                <>
                  <div className="flex">
                    <span className="font-semibold w-24">상호:</span>
                    <span>{estimate.client.companyName}</span>
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
                    <span className="font-semibold w-24">담당자:</span>
                    <span>{estimate.client?.contactPerson || '-'}</span>
                  </div>
                </>
              ) : (
                <div className="flex">
                  <span className="font-semibold w-24">성함:</span>
                  <span>{estimate.client?.name || '-'}</span>
                </div>
              )}
              <div className="flex">
                <span className="font-semibold w-24">주소:</span>
                <span>{estimate.client?.address || '-'}</span>
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
              {estimate.items &&
                estimate.items.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-300 p-2 text-center">{index + 1}</td>
                    <td className="border border-gray-300 p-2 text-center">
                      {item.category || '-'}
                    </td>
                    <td className="border border-gray-300 p-2">{item.name}</td>
                    <td className="border border-gray-300 p-2 text-center">{item.quantity}</td>
                    <td className="border border-gray-300 p-2 text-right">
                      {item.unitPrice?.toLocaleString()}원
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {(item.quantity * item.unitPrice)?.toLocaleString()}원
                    </td>
                  </tr>
                ))}

              <tr className="bg-gray-100 font-bold">
                <td colSpan="4" className="border border-gray-300 p-2 text-right">
                  합계
                </td>
                <td colSpan="2" className="border border-gray-300 p-2 text-right">
                  {estimate.totalAmount?.toLocaleString()}원
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="border border-gray-300 rounded-lg p-4 mb-6 bg-gray-50">
          <h2 className="text-lg font-bold mb-2">납품 확인</h2>
          <div className="space-y-2">
            <div className="flex">
              <span className="font-semibold w-24">납품장소:</span>
              <span>{estimate.client?.address || '-'}</span>
            </div>
            <div className="flex">
              <span className="font-semibold w-24">납품일자:</span>
              <span>{deliveryDate}</span>
            </div>
            <div className="flex">
              <span className="font-semibold w-24">참고사항:</span>
              <span>{estimate.notes || '특이사항 없음'}</span>
            </div>
          </div>
        </div>

        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 mb-6">
          <h2 className="text-lg font-bold mb-2">확인사항</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>상기와 같이 물품을 정상적으로 납품하였음을 확인합니다.</li>
            <li>물품 수령 후 이상이 있을 경우 3일 이내에 연락 바랍니다.</li>
            <li>납품된 물품의 하자보증 기간은 납품일로부터 1년입니다.</li>
          </ul>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="text-center">
            <p className="font-bold mb-2">공급자</p>
            <p className="mb-2">{estimate.supplier?.companyName || '웰컴프로'}</p>
            <p className="mb-2">담당자: {estimate.supplier?.contactPerson || '-'}</p>
            <p className="mb-10">(인)</p>
          </div>

          <div className="text-center">
            <p className="font-bold mb-2">인수자</p>
            <p className="mb-2">{estimate.client?.companyName || estimate.client?.name || '-'}</p>
            <p className="mb-2">담당자: {estimate.client?.contactPerson || '-'}</p>
            <p className="mb-10">(인)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
