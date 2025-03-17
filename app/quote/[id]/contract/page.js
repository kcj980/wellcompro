'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function ContractQuotePage({ params }) {
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

  // 부가세 계산 (10%)
  const subtotal = estimate.totalAmount ? Math.round(estimate.totalAmount / 1.1) : 0;
  const vat = estimate.totalAmount ? estimate.totalAmount - subtotal : 0;

  // 계약 번호 생성
  const contractNumber = `WCP-${new Date().getFullYear()}-${id.substring(0, 6)}`;

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
          <h1 className="text-3xl font-bold">견적 계약서</h1>
          <p className="text-gray-600 mt-2">계약번호: {contractNumber}</p>
        </div>

        <div className="flex justify-end mb-4">
          <p>계약일자: {formatDate(estimate.createdAt)}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="border border-gray-300 rounded-lg p-4">
            <h2 className="text-lg font-bold mb-2 text-center border-b border-gray-300 pb-2">
              공급자 (갑)
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
              공급받는자 (을)
            </h2>
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
          <h2 className="text-lg font-bold mb-3">제1조 (계약의 목적)</h2>
          <p className="mb-4 pl-4">
            본 계약은 갑이 을에게 아래와 같은 제품 및 서비스를 제공하고, 을은 이에 대한 대금을
            지급함에 있어 제반 사항을 정함을 목적으로 한다.
          </p>

          <table className="w-full border-collapse border border-gray-300 mb-6">
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
                      {Math.round(item.unitPrice / 1.1).toLocaleString()}원
                    </td>
                    <td className="border border-gray-300 p-2 text-right">
                      {Math.round((item.quantity * item.unitPrice) / 1.1).toLocaleString()}원
                    </td>
                  </tr>
                ))}

              <tr className="bg-gray-100">
                <td colSpan="4" className="border border-gray-300 p-2 text-right font-semibold">
                  소계
                </td>
                <td colSpan="2" className="border border-gray-300 p-2 text-right font-semibold">
                  {subtotal.toLocaleString()}원
                </td>
              </tr>
              <tr className="bg-gray-100">
                <td colSpan="4" className="border border-gray-300 p-2 text-right font-semibold">
                  부가세(10%)
                </td>
                <td colSpan="2" className="border border-gray-300 p-2 text-right font-semibold">
                  {vat.toLocaleString()}원
                </td>
              </tr>
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

          <h2 className="text-lg font-bold mb-3">제2조 (계약금액 및 지급조건)</h2>
          <div className="pl-4 mb-4 space-y-2">
            <p>1. 계약금액: 금 {estimate.totalAmount?.toLocaleString()}원정 (부가세 포함)</p>
            <p>2. 지급조건:</p>
            <ul className="list-disc pl-8">
              <li>
                계약금: 계약 체결 시 50% ({Math.round(estimate.totalAmount * 0.5).toLocaleString()}
                원)
              </li>
              <li>
                잔금: 납품 완료 시 50% ({Math.round(estimate.totalAmount * 0.5).toLocaleString()}원)
              </li>
            </ul>
            <p>
              3. 입금계좌: {estimate.bankAccount || '국민은행 123-456-789012 (예금주: 웰컴프로)'}
            </p>
          </div>

          <h2 className="text-lg font-bold mb-3">제3조 (납품 및 검수)</h2>
          <div className="pl-4 mb-4 space-y-2">
            <p>1. 납품기한: 계약금 입금일로부터 {estimate.deliveryPeriod || '30'}일 이내</p>
            <p>2. 납품장소: {estimate.client?.address || '계약자가 지정한 장소'}</p>
            <p>3. 검수방법: 납품 완료 후 7일 이내에 을이 제품의 품질 및 수량을 검수한다.</p>
          </div>

          <h2 className="text-lg font-bold mb-3">제4조 (계약의 변경 및 해지)</h2>
          <p className="pl-4 mb-4">
            본 계약의 내용을 변경하거나 해지하고자 할 경우에는 상호 협의하에 서면으로 진행한다. 단,
            일방적인 계약 해지 시에는 위약금이 발생할 수 있다.
          </p>

          <h2 className="text-lg font-bold mb-3">제5조 (분쟁해결)</h2>
          <p className="pl-4 mb-4">
            본 계약과 관련하여 분쟁이 발생할 경우, 양 당사자는 상호 협의하여 해결하며, 협의가
            이루어지지 않을 경우 갑의 소재지를 관할하는 법원의 판결에 따른다.
          </p>

          <h2 className="text-lg font-bold mb-3">제6조 (기타사항)</h2>
          <p className="pl-4 mb-4">본 계약에 명시되지 않은 사항은 관련 법규 및 상관례에 따른다.</p>
        </div>

        <div className="mt-8">
          <p className="text-center mb-6">
            위와 같이 계약을 체결하고 이를 증명하기 위하여 계약서 2부를 작성하여 갑과 을이 각각 서명
            날인 후 1부씩 보관한다.
          </p>

          <p className="text-center mb-6">{formatDate(new Date())}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-10">
            <div className="text-center">
              <p className="font-bold mb-2">갑: {estimate.supplier?.companyName || '웰컴프로'}</p>
              <p className="mb-2">대표자: {estimate.supplier?.representative || '대표자'}</p>
              <p className="mb-10">(인)</p>
            </div>

            <div className="text-center">
              <p className="font-bold mb-2">을: {estimate.client?.companyName || '-'}</p>
              <p className="mb-2">대표자: {estimate.client?.representative || '-'}</p>
              <p className="mb-10">(인)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
