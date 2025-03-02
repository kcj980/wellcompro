'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchPage() {
  const [estimates, setEstimates] = useState([]);
  const [filteredEstimates, setFilteredEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');
  
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [estimatesPerPage] = useState(10); // 페이지당 표시할 견적 수
  
  const router = useRouter();
  
  useEffect(() => {
    fetchEstimates();
  }, [sortOption]); // 정렬 옵션이 변경될 때마다 데이터를 다시 불러옴
  
  // 검색어가 변경될 때마다 필터링
  useEffect(() => {
    filterEstimates();
    setCurrentPage(1); // 검색어가 변경되면 첫 페이지로 이동
  }, [searchTerm, estimates]);
  
  // 견적 목록을 불러오는 함수
  const fetchEstimates = async () => {
    try {
      setLoading(true);
      // 정렬 옵션을 쿼리 파라미터로 전달
      const response = await fetch(`/api/estimates?sort=${sortOption}`, {
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error(`서버 오류: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Loaded estimates:', data);
      
      if (!data.success) {
        throw new Error(data.message || '견적 목록을 불러오는데 실패했습니다.');
      }
      
      setEstimates(data.estimates || []);
      setFilteredEstimates(data.estimates || []); // 초기에는 필터링 없이 모든 데이터 표시
      setError(null);
    } catch (err) {
      console.error('Error fetching estimates:', err);
      setError(`데이터를 불러오는 중 오류가 발생했습니다: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // 검색어에 따른 견적 필터링 함수
  const filterEstimates = () => {
    if (!searchTerm.trim()) {
      setFilteredEstimates(estimates); // 검색어가 없으면 모든 견적 표시
      return;
    }
    
    const lowercasedTerm = searchTerm.toLowerCase();
    
    // 이름 또는 전화번호로 필터링
    const filtered = estimates.filter(estimate => {
      const name = estimate.customerInfo?.name?.toLowerCase() || '';
      const phone = estimate.customerInfo?.phone?.toLowerCase() || '';
      const pcNumber = estimate.customerInfo?.pcNumber?.toLowerCase() || '';
      
      return name.includes(lowercasedTerm) || 
             phone.includes(lowercasedTerm) || 
             pcNumber.includes(lowercasedTerm);
    });
    
    setFilteredEstimates(filtered);
  };
  
  // 견적 상세 페이지로 이동하는 함수
  const handleEstimateClick = (id) => {
    router.push(`/estimate/${id}`);
  };
  
  // 날짜 형식 변환 함수
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };
  
  // 정렬 옵션 변경 핸들러
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };
  
  // 검색어 변경 핸들러
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // 검색 폼 제출 핸들러 (사용자가 Enter 키를 눌렀을 때)
  const handleSearchSubmit = (e) => {
    e.preventDefault(); // 폼 기본 제출 동작 방지
    filterEstimates();
  };
  
  // 페이지 변경 핸들러
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  // 현재 페이지에 표시할 견적 계산
  const indexOfLastEstimate = currentPage * estimatesPerPage;
  const indexOfFirstEstimate = indexOfLastEstimate - estimatesPerPage;
  const currentEstimates = filteredEstimates.slice(indexOfFirstEstimate, indexOfLastEstimate);
  
  // 총 페이지 수 계산
  const totalPages = Math.ceil(filteredEstimates.length / estimatesPerPage);

  // 페이지네이션 버튼 렌더링
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5; // 한 번에 표시할 최대 페이지 버튼 수
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);
    
    // 표시되는 버튼 수가 최대값보다 작으면 시작 페이지 조정
    if (endPage - startPage + 1 < maxVisibleButtons && totalPages > maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }
    
    // 이전 페이지 버튼
    if (currentPage > 1) {
      buttons.push(
        <button
          key="prev"
          onClick={() => handlePageChange(currentPage - 1)}
          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
        >
          <span className="sr-only">이전</span>
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      );
    }
    
    // 첫 페이지 버튼 (시작 페이지가 1보다 크면 표시)
    if (startPage > 1) {
      buttons.push(
        <button
          key="1"
          onClick={() => handlePageChange(1)}
          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
            currentPage === 1 ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          1
        </button>
      );
      
      // 첫 페이지와 시작 페이지 사이에 간격이 있으면 ...을 표시
      if (startPage > 2) {
        buttons.push(
          <span
            key="ellipsis1"
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
          >
            ...
          </span>
        );
      }
    }
    
    // 페이지 버튼
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
            currentPage === i ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          {i}
        </button>
      );
    }
    
    // 마지막 페이지 버튼 (끝 페이지가 총 페이지 수보다 작으면 표시)
    if (endPage < totalPages) {
      // 끝 페이지와 마지막 페이지 사이에 간격이 있으면 ...을 표시
      if (endPage < totalPages - 1) {
        buttons.push(
          <span
            key="ellipsis2"
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
          >
            ...
          </span>
        );
      }
      
      buttons.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
            currentPage === totalPages ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          {totalPages}
        </button>
      );
    }
    
    // 다음 페이지 버튼
    if (currentPage < totalPages) {
      buttons.push(
        <button
          key="next"
          onClick={() => handlePageChange(currentPage + 1)}
          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
        >
          <span className="sr-only">다음</span>
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      );
    }
    
    return buttons;
  };

  // CSV 파일로 내보내기 함수
  const exportToCSV = () => {
    if (filteredEstimates.length === 0) {
      alert('내보낼 데이터가 없습니다.');
      return;
    }
    
    // CSV 헤더 생성
    const headers = [
      '고객명',
      '핸드폰번호',
      'PC번호',
      '계약구분',
      '판매형태',
      '구입형태',
      'AS조건',
      '운영체계',
      '견적담당',
      '상품 수',
      '최종 금액',
      '생성일'
    ];
    
    // CSV 데이터 행 생성
    const rows = filteredEstimates.map(estimate => [
      estimate.customerInfo?.name || '',
      estimate.customerInfo?.phone || '',
      estimate.customerInfo?.pcNumber || '',
      estimate.customerInfo?.contractType || '',
      estimate.customerInfo?.saleType || '',
      estimate.customerInfo?.purchaseType || '',
      estimate.customerInfo?.asCondition || '',
      estimate.customerInfo?.os || '',
      estimate.customerInfo?.manager || '',
      estimate.tableData?.length || 0,
      estimate.calculatedValues?.finalPayment || 0,
      formatDate(estimate.createdAt)
    ]);
    
    // CSV 데이터 생성
    let csvContent = headers.join(',') + '\n';
    
    rows.forEach(row => {
      // 각 필드의 값에 쉼표가 있으면 쌍따옴표로 묶기
      const formattedRow = row.map(field => {
        const str = String(field);
        return str.includes(',') ? `"${str}"` : str;
      });
      
      csvContent += formattedRow.join(',') + '\n';
    });
    
    // UTF-8 BOM 추가 (Excel에서 한글 인코딩 문제 방지)
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // 다운로드 링크 생성
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `견적목록_${formatDate(new Date())}.csv`);
    document.body.appendChild(link);
    
    // 다운로드 링크 클릭
    link.click();
    
    // 클린업
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  // Excel로 내보내기 함수 (더 자세한 정보 포함)
  const exportToExcel = () => {
    if (filteredEstimates.length === 0) {
      alert('내보낼 데이터가 없습니다.');
      return;
    }
    
    // CSV 헤더 생성 (Excel용으로 더 많은 정보 포함)
    const headers = [
      '고객명',
      '핸드폰번호',
      'PC번호',
      '계약구분',
      '판매형태',
      '구입형태',
      'AS조건',
      '운영체계',
      '견적담당',
      '상품 합계',
      '공임비',
      '세팅비',
      '할인',
      '총 구입금액',
      '계약금',
      'VAT 포함 여부',
      'VAT 비율',
      'VAT 금액',
      '최종 금액',
      '견적 생성일',
      '최종 수정일'
    ];
    
    // CSV 데이터 행 생성 (더 상세한 정보)
    const rows = filteredEstimates.map(estimate => [
      estimate.customerInfo?.name || '',
      estimate.customerInfo?.phone || '',
      estimate.customerInfo?.pcNumber || '',
      estimate.customerInfo?.contractType || '',
      estimate.customerInfo?.saleType || '',
      estimate.customerInfo?.purchaseType || '',
      estimate.customerInfo?.asCondition || '',
      estimate.customerInfo?.os || '',
      estimate.customerInfo?.manager || '',
      estimate.calculatedValues?.productTotal || 0,
      estimate.paymentInfo?.laborCost || 0,
      estimate.paymentInfo?.setupCost || 0,
      estimate.paymentInfo?.discount || 0,
      estimate.calculatedValues?.totalPurchase || 0,
      estimate.paymentInfo?.deposit || 0,
      estimate.paymentInfo?.includeVat ? 'O' : 'X',
      estimate.paymentInfo?.vatRate || 0,
      estimate.calculatedValues?.vatAmount || 0,
      estimate.calculatedValues?.finalPayment || 0,
      formatDate(estimate.createdAt),
      estimate.updatedAt ? formatDate(estimate.updatedAt) : ''
    ]);
    
    // CSV 데이터 생성
    let csvContent = headers.join(',') + '\n';
    
    rows.forEach(row => {
      // 각 필드의 값에 쉼표가 있으면 쌍따옴표로 묶기
      const formattedRow = row.map(field => {
        const str = String(field);
        return str.includes(',') ? `"${str}"` : str;
      });
      
      csvContent += formattedRow.join(',') + '\n';
    });
    
    // UTF-8 BOM 추가 (Excel에서 한글 인코딩 문제 방지)
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // 다운로드 링크 생성
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `견적목록_상세_${formatDate(new Date())}.csv`);
    document.body.appendChild(link);
    
    // 다운로드 링크 클릭
    link.click();
    
    // 클린업
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <h1 className="text-2xl font-bold">견적 목록</h1>
            
            {/* 내보내기 버튼 */}
            {filteredEstimates.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={exportToCSV}
                  className="bg-green-600 text-white px-3 py-2 text-sm rounded-md hover:bg-green-700 flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  CSV 내보내기
                </button>
                
                <button
                  onClick={exportToExcel}
                  className="bg-blue-600 text-white px-3 py-2 text-sm rounded-md hover:bg-blue-700 flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  상세 내보내기
                </button>
              </div>
            )}
          </div>
          
          {/* 검색 및 정렬 컨트롤 */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            {/* 검색 폼 */}
            <form 
              onSubmit={handleSearchSubmit} 
              className="w-full md:w-auto flex-grow max-w-md"
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder="고객명, 연락처, PC번호로 검색"
                  className="block w-full py-2 px-3 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                <button
                  type="submit"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>
            
            {/* 정렬 선택 */}
            <div className="flex items-center">
              <label htmlFor="sort" className="mr-2 text-sm font-medium text-gray-700">정렬:</label>
              <select
                id="sort"
                value={sortOption}
                onChange={handleSortChange}
                className="block w-40 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="newest">최신순</option>
                <option value="oldest">오래된순</option>
                <option value="nameAsc">고객명 오름차순</option>
                <option value="nameDesc">고객명 내림차순</option>
                <option value="priceAsc">금액 오름차순</option>
                <option value="priceDesc">금액 내림차순</option>
              </select>
            </div>
          </div>
        </div>
        
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
        
        {/* 견적 목록이 비어있는 경우 */}
        {!loading && !error && filteredEstimates.length === 0 && (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            {searchTerm ? (
              <p className="text-gray-500">검색 결과가 없습니다. 다른 검색어를 입력해 주세요.</p>
            ) : (
              <p className="text-gray-500">저장된 견적이 없습니다.</p>
            )}
            <button
              onClick={() => router.push('/estimate')}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              견적 작성하기
            </button>
          </div>
        )}
        
        {/* 견적 목록 표시 */}
        {!loading && !error && filteredEstimates.length > 0 && (
          <>
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <span className="text-sm text-gray-600">
                  총 <span className="font-medium">{filteredEstimates.length}</span>개의 견적이 있습니다.
                  {searchTerm && (
                    <span className="ml-1">
                      (검색어: "<span className="font-medium">{searchTerm}</span>")
                    </span>
                  )}
                </span>
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      고객명
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      연락처
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      총 금액
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      생성일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      견적담당
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentEstimates.map((estimate) => (
                    <tr 
                      key={estimate._id}
                      onClick={() => handleEstimateClick(estimate._id)}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {estimate.customerInfo?.name || '이름 없음'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {estimate.customerInfo?.phone || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {estimate.calculatedValues?.finalPayment?.toLocaleString() || 0}원
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(estimate.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {estimate.customerInfo?.manager || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="mt-4 flex justify-center">
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  {renderPaginationButtons()}
                </nav>
              </div>
            )}
          </>
        )}
        
        {/* 새 견적 작성 버튼 */}
        {!loading && filteredEstimates.length > 0 && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => router.push('/estimate')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              새 견적 작성
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
