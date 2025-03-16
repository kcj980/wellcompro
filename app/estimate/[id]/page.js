'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EstimateDetail({ params }) {
  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
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
        console.log('Loaded estimate:', data);
        
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
  
  // 목록 페이지로 돌아가는 함수
  const handleBackClick = () => {
    router.push('/search');
  };
  
  // 날짜 형식 변환 함수(견적 생성, 수정일)
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };
    // 날짜 형식 변환 함수(출고일자)
    const formatDateRelease = (dateString) => {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    };
  
  // 견적 페이지로 이동하여 수정하는 함수
  const handleEditClick = () => {
    // 수정 페이지로 이동하면서 id 파라미터를 전달
    router.push(`/estimate?id=${id}`);
  };
  
  // 견적서 페이지로 이동하는 함수
  const handleQuoteClick = () => {
    // 견적서 페이지로 이동
    router.push(`/quote/${id}`);
  };
  
  // 견적 삭제 함수
  const handleDeleteClick = async () => {
    if (!window.confirm('정말로 이 견적을 삭제하시겠습니까?')) {
      return;
    }
    
    try {
      setLoading(true);
      
      // API를 통해 견적 삭제 요청
      const response = await fetch(`/api/estimates/${id}`, {
        method: 'DELETE',
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error(`서버 오류: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || '견적 삭제 중 오류가 발생했습니다.');
      }
      
      alert('견적이 성공적으로 삭제되었습니다.');
      router.push('/search');
    } catch (err) {
      console.error('Error deleting estimate:', err);
      alert(`견적 삭제 중 오류가 발생했습니다: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 뒤로 가기 및 작업 버튼 */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handleBackClick}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            목록으로 돌아가기
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={handleQuoteClick}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 flex items-center"
              disabled={loading || error}
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              견적서
            </button>
            <button
              onClick={handleEditClick}
              className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600"
              disabled={loading || error}
            >
              수정
            </button>
            <button
              onClick={handleDeleteClick}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
              disabled={loading || error}
            >
              삭제
            </button>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold mb-6">견적 상세 정보</h1>
        
        {/* 로딩 상태 표시 */}
        {loading && (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        {/* 에러 표시 */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">오류! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {/* 견적 데이터가 있을 때만 표시 */}
        {!loading && !error && estimate && (
          <div className="space-y-6">
            {/* 고객 정보 섹션 */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <h2 className="text-xl font-semibold mr-2">고객 정보</h2>
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${estimate.isContractor ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {estimate.isContractor ? '계약자' : '비계약자'}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">이름</div>
                  <div className="mt-1">{estimate.customerInfo?.name || '-'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">핸드폰번호</div>
                  <div className="mt-1">{estimate.customerInfo?.phone || '-'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">PC번호</div>
                  <div className="mt-1">{estimate.customerInfo?.pcNumber || '-'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">계약구분</div>
                  <div className="mt-1">{estimate.customerInfo?.contractType || '-'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">판매형태</div>
                  <div className="mt-1">{estimate.customerInfo?.saleType || '-'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">구입형태</div>
                  <div className="mt-1">
                    {estimate.customerInfo?.purchaseType || '-'}
                    {estimate.customerInfo?.purchaseType === '지인' ? estimate.customerInfo?.purchaseTypeName && (
                      <span className="ml-1">({estimate.customerInfo.purchaseTypeName})</span>
                    ) : (
                      estimate.customerInfo?.purchaseTypeName && (
                      <span className="ml-1">({estimate.customerInfo.purchaseTypeName})</span>)
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">용도</div>
                  <div className="mt-1">{estimate.customerInfo?.purpose || '-'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">AS조건</div>
                  <div className="mt-1">{estimate.customerInfo?.asCondition || '-'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">운영체계</div>
                  <div className="mt-1">{estimate.customerInfo?.os || '-'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">견적담당</div>
                  <div className="mt-1">{estimate.customerInfo?.manager || '-'}</div>
                </div>
              </div>
            </div>

            {/* 견적설명 섹션 */}
            {estimate.estimateDescription && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">견적설명<span className="text-sm text-gray-500 ml-1">(견적서에 포함되는 내용)</span></h2>
                <div className="whitespace-pre-wrap text-gray-700">{estimate.estimateDescription}</div>
              </div>
            )}
            
            {/* 참고사항 섹션 */}
            {estimate.notes && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">참고사항<span className="text-sm text-gray-500 ml-1">(견적서에 포함되지 않는 내용)</span></h2>
                <div className="whitespace-pre-wrap text-gray-700">{estimate.notes}</div>
              </div>
            )}

            {/* 상품 목록 섹션 */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6 pb-0">
                <h2 className="text-xl font-semibold mb-4">상품 목록</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">분류</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상품명</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">수량</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">현금가</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상품코드</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">총판</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">재조사</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">비고</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {estimate.tableData?.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.productName || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.price ? `${Number(String(item.price).replace(/,/g, '')).toLocaleString()}원` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.productCode || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.distributor || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.reconfirm || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.remarks || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* 결제 정보 섹션 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">결제 정보</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <div className="text-sm font-medium text-gray-500">상품/부품 합 금액</div>
                  <div className="mt-1 text-lg font-semibold">
                    {estimate.calculatedValues?.productTotal?.toLocaleString() || 0}원
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">공임비</div>
                  <div className="mt-1">{estimate.paymentInfo?.laborCost?.toLocaleString() || 0}원</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">튜닝비</div>
                  <div className="mt-1">{estimate.paymentInfo?.tuningCost?.toLocaleString() || 0}원</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">세팅비</div>
                  <div className="mt-1">{estimate.paymentInfo?.setupCost?.toLocaleString() || 0}원</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">할인</div>
                  <div className="mt-1">{estimate.paymentInfo?.discount?.toLocaleString() || 0}원</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">총 구입 금액</div>
                  <div className="mt-1 text-lg font-semibold">
                    {estimate.calculatedValues?.totalPurchase?.toLocaleString() || 0}원
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">계약금</div>
                  <div className="mt-1">{estimate.paymentInfo?.deposit?.toLocaleString() || 0}원</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">택배비</div>
                  <div className="mt-1">{estimate.paymentInfo?.shippingCost?.toLocaleString() || 0}원</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">VAT 정보</div>
                  <div className="mt-1">
                    {estimate.paymentInfo?.includeVat ? (
                      <span>
                        VAT {estimate.paymentInfo.vatRate || 10}% 포함 (
                        {estimate.calculatedValues?.vatAmount?.toLocaleString() || 0}원)
                      </span>
                    ) : (
                      <span>VAT 미포함</span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">버림 설정</div>
                  <div className="mt-1">
                    {estimate.paymentInfo?.roundingType === '100down' ? '100원 단위 버림' :
                     estimate.paymentInfo?.roundingType === '1000down' ? '1,000원 단위 버림' :
                     estimate.paymentInfo?.roundingType === '10000down' ? '10,000원 단위 버림' : '버림 없음'}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">결제 방법</div>
                  <div className="mt-1">{estimate.paymentInfo?.paymentMethod || '-'}</div>
                </div>

                {/* 출고일자 표시 */}
                {estimate.paymentInfo?.releaseDate && (
                  <div>
                    <div className="text-sm font-medium text-gray-500">출고일자</div>
                    <div className="mt-1">{formatDateRelease(estimate.paymentInfo.releaseDate)}</div>
                  </div>
                )}

              </div>
            </div>
            
            {/* 서비스 물품 섹션 */}
            {estimate.serviceData && estimate.serviceData.length > 0 && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6 pb-0">
                  <h2 className="text-xl font-semibold mb-4">서비스 물품</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상품명</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">수량</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">비고</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {estimate.serviceData.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.productName || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.remarks || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            
            {/* 최종 금액 및 생성일 섹션 */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col md:flex-row justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-500">최종 결제 금액</div>
                  <div className="mt-1 text-2xl font-bold text-blue-600">
                    {estimate.calculatedValues?.finalPayment?.toLocaleString() || 0}원
                  </div>
                </div>
                <div className="mt-4 md:mt-0 text-right">
                  <div className="text-sm font-medium text-gray-500">견적 생성일</div>
                  <div className="mt-1">{formatDate(estimate.createdAt)}</div>
                  {estimate.updatedAt && estimate.updatedAt !== estimate.createdAt && (
                    <>
                      <div className="text-sm font-medium text-gray-500 mt-2">최종 수정일</div>
                      <div className="mt-1">{formatDate(estimate.updatedAt)}</div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 뒤로 가기 및 작업 버튼 */}
        <div className="flex justify-between items-center pt-3 mb-6">
          <button
            onClick={handleBackClick}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            목록으로 돌아가기
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={handleQuoteClick}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 flex items-center"
              disabled={loading || error}
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              견적서
            </button>
            <button
              onClick={handleEditClick}
              className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600"
              disabled={loading || error}
            >
              수정
            </button>
            <button
              onClick={handleDeleteClick}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
              disabled={loading || error}
            >
              삭제
            </button>
          </div>
        </div>
        
      </div>
      
    </div>
  );
} 