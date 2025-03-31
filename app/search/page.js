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
  // 계약자 필터링 옵션 추가
  const [contractorFilter, setContractorFilter] = useState('all'); // 'all', 'contractor', 'non-contractor'

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [estimatesPerPage] = useState(10); // 페이지당 표시할 견적 수

  const router = useRouter();

  useEffect(() => {
    fetchEstimates();
  }, [sortOption]); // 정렬 옵션이 변경될 때마다 데이터를 다시 불러옴

  // 검색어나 계약자 필터가 변경될 때마다 필터링
  useEffect(() => {
    filterEstimates();
    setCurrentPage(1); // 검색어나 필터가 변경되면 첫 페이지로 이동
  }, [searchTerm, estimates, contractorFilter]);

  // 견적 목록을 불러오는 함수
  const fetchEstimates = async () => {
    try {
      setLoading(true);
      // 정렬 옵션을 쿼리 파라미터로 전달
      const response = await fetch(`/api/estimates?sort=${sortOption}`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`서버 오류: ${response.status}`);
      }

      const data = await response.json();

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
    // 먼저 계약자 필터 적용
    let filtered = [...estimates];

    // 계약자 필터 적용
    if (contractorFilter === 'contractor') {
      filtered = filtered.filter(estimate => estimate.isContractor === true);
    } else if (contractorFilter === 'non-contractor') {
      filtered = filtered.filter(estimate => estimate.isContractor === false);
    }

    // 검색어 필터 적용
    if (searchTerm.trim()) {
      const lowercasedTerm = searchTerm.toLowerCase();

      // 이름 또는 전화번호로 필터링
      filtered = filtered.filter(estimate => {
        const name = estimate.customerInfo?.name?.toLowerCase() || '';
        const phone = estimate.customerInfo?.phone?.toLowerCase() || '';
        const pcNumber = estimate.customerInfo?.pcNumber?.toLowerCase() || '';

        return (
          name.includes(lowercasedTerm) ||
          phone.includes(lowercasedTerm) ||
          pcNumber.includes(lowercasedTerm)
        );
      });
    }

    setFilteredEstimates(filtered);
  };

  // 견적 상세 페이지로 이동하는 함수
  const handleEstimateClick = id => {
    router.push(`/estimate/${id}`);
  };

  // 견적서 페이지로 이동하는 함수
  const handleQuoteClick = (id, e) => {
    e.stopPropagation(); // 상위 요소의 클릭 이벤트 전파 방지
    router.push(`/quote/${id}`);
  };

  // 날짜 형식 변환 함수
  const formatDate = dateString => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  // 정렬 옵션 변경 핸들러
  const handleSortChange = e => {
    setSortOption(e.target.value);
  };

  // 검색어 변경 핸들러
  const handleSearchChange = e => {
    setSearchTerm(e.target.value);
  };

  // 검색 폼 제출 핸들러 (사용자가 Enter 키를 눌렀을 때)
  const handleSearchSubmit = e => {
    e.preventDefault(); // 폼 기본 제출 동작 방지
    filterEstimates();
  };

  // 페이지 변경 핸들러
  const handlePageChange = pageNumber => {
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
          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-sky-300 bg-white text-sm font-medium text-sky-600 hover:bg-sky-50"
        >
          <span className="sr-only">이전</span>
          <svg
            className="h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
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
          className={`relative inline-flex items-center px-4 py-2 border border-sky-300 bg-white text-sm font-medium ${
            currentPage === 1 ? 'text-white bg-sky-500' : 'text-sky-700 hover:bg-sky-50'
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
            className="relative inline-flex items-center px-4 py-2 border border-sky-300 bg-white text-sm font-medium text-sky-700"
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
          className={`relative inline-flex items-center px-4 py-2 border border-sky-300 text-sm font-medium ${
            currentPage === i
              ? 'z-10 bg-sky-500 border-sky-500 text-white'
              : 'bg-white text-sky-700 hover:bg-sky-50'
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
            className="relative inline-flex items-center px-4 py-2 border border-sky-300 bg-white text-sm font-medium text-sky-700"
          >
            ...
          </span>
        );
      }

      buttons.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className={`relative inline-flex items-center px-4 py-2 border border-sky-300 bg-white text-sm font-medium ${
            currentPage === totalPages ? 'text-white bg-sky-500' : 'text-sky-700 hover:bg-sky-50'
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
          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-sky-300 bg-white text-sm font-medium text-sky-600 hover:bg-sky-50"
        >
          <span className="sr-only">다음</span>
          <svg
            className="h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      );
    }

    return buttons;
  };

  // 계약자 필터 변경 핸들러 추가
  const handleContractorFilterChange = filter => {
    setContractorFilter(filter);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <svg
                className="w-8 h-8 mr-2 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
              견적 목록
            </h1>

            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/quote/statement')}
                className="bg-green-500 text-white px-5 py-2.5 rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center shadow-md"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
                거래명세표인쇄
              </button>

              <button
                onClick={() => router.push('/estimate')}
                className="bg-blue-500 text-white px-5 py-2.5 rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center shadow-md"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                새 견적 작성
              </button>
            </div>
          </div>

          {/* 검색 및 필터링 섹션 */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* 검색 폼 */}
              <form onSubmit={handleSearchSubmit} className="flex-grow">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="고객명, 연락처, PC번호로 검색"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                  <button
                    type="submit"
                    className="absolute inset-y-0 right-0 px-4 text-blue-500 font-medium"
                  >
                    검색
                  </button>
                </div>
              </form>

              {/* 정렬 선택 */}
              <div className="flex items-center min-w-[200px]">
                <label htmlFor="sort" className="text-sm font-medium text-gray-700 w-11">
                  정렬:
                </label>
                <select
                  id="sort"
                  value={sortOption}
                  onChange={handleSortChange}
                  className="block w-full py-3 px-4 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm"
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

            <div className="flex flex-wrap items-center justify-between mt-4">
              {/* 계약자 필터 버튼 그룹 */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-700 mr-2">필터:</span>
                <button
                  onClick={() => handleContractorFilterChange('all')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    contractorFilter === 'all'
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  모든 견적
                </button>
                <button
                  onClick={() => handleContractorFilterChange('contractor')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    contractorFilter === 'contractor'
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  계약자 견적만
                </button>
                <button
                  onClick={() => handleContractorFilterChange('non-contractor')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    contractorFilter === 'non-contractor'
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  비계약자 견적만
                </button>
              </div>

              {/* 색상 설명 추가 - 필터 행 오른쪽 끝에 배치 */}
              <div className="flex items-center border border-gray-300 rounded-lg bg-white p-2 gap-3 mt-2 lg:mt-0">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-[#85fd85] rounded mr-1"></div>
                  <span className="text-sm text-gray-700">계약자</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-[#fdcc94] rounded mr-1"></div>
                  <span className="text-sm text-gray-700">비계약자</span>
                </div>
              </div>
            </div>
          </div>

          {/* 로딩 상태 표시 */}
          {loading && (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          )}

          {/* 에러 표시 */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-lg mb-6">
              <div className="flex">
                <svg
                  className="h-6 w-6 text-red-400 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="font-bold">오류가 발생했습니다</p>
                  <p>{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* 견적 목록이 비어있는 경우 */}
          {!loading && !error && filteredEstimates.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <svg
                className="h-16 w-16 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              {searchTerm ? (
                <p className="text-gray-600 text-lg mb-4">
                  검색 결과가 없습니다. 다른 검색어를 입력해 주세요.
                </p>
              ) : (
                <p className="text-gray-600 text-lg mb-4">저장된 견적이 없습니다.</p>
              )}
              <button
                onClick={() => router.push('/estimate')}
                className="mt-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-md"
              >
                견적 작성하기
              </button>
            </div>
          )}

          {/* 견적 목록 표시 */}
          {!loading && !error && filteredEstimates.length > 0 && (
            <>
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                  <span className="text-sm text-gray-700 font-medium">
                    총{' '}
                    <span className="font-bold text-gray-800 text-lg">
                      {filteredEstimates.length}
                    </span>
                    개의 견적이 있습니다.
                    {searchTerm && (
                      <span className="ml-1">
                        (검색어: "<span className="font-bold">{searchTerm}</span>")
                      </span>
                    )}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 table-fixed">
                    <colgroup>
                      <col width="20%" />
                      <col width="23%" />
                      <col width="10%" />
                      <col width="13%" />
                      <col width="12%" />
                      <col width="12%" />
                      <col width="10%" />
                    </colgroup>
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider text-center">
                          고객명
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider text-center">
                          구입형태
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider text-center">
                          PC번호
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider text-center">
                          핸드폰번호
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider text-right">
                          총 금액
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider text-center">
                          생성일
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                          견적서
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentEstimates.map(estimate => (
                        <tr
                          key={estimate._id}
                          onClick={() => handleEstimateClick(estimate._id)}
                          className={`cursor-pointer transition-colors duration-150 ${
                            estimate.isContractor
                              ? 'bg-[#ebfee6] hover:bg-[#85fd85]' // 계약자인 경우 연한 녹색
                              : 'bg-[#fdecd7] hover:bg-[#fdcc94]' // 비계약자인 경우 연한 주황색
                          }`}
                        >
                          <td className="px-3 py-2 text-sm font-medium text-gray-800 break-words text-center">
                            {estimate.customerInfo?.name || '-'}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-600 break-words text-center">
                            {estimate.customerInfo?.purchaseType === '지인' &&
                            estimate.customerInfo?.purchaseTypeName
                              ? `지인(${estimate.customerInfo.purchaseTypeName})`
                              : estimate.customerInfo?.purchaseType || '-'}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-600 break-words text-center">
                            {estimate.customerInfo?.pcNumber || '-'}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-600 break-words text-center">
                            {estimate.customerInfo?.phone || '-'}
                          </td>
                          <td className="px-3 py-2 text-sm font-medium text-gray-800 break-words text-right">
                            {estimate.calculatedValues?.finalPayment?.toLocaleString() || 0}원
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-600 break-words text-center">
                            {formatDate(estimate.createdAt)}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button
                              onClick={e => handleQuoteClick(estimate._id, e)}
                              className="bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-blue-600 transition-colors duration-200 inline-flex items-center shadow-sm"
                            >
                              <svg
                                className="w-3.5 h-3.5 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                                />
                              </svg>
                              견적서
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="mt-6 flex justify-center">
                  <nav
                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                    aria-label="Pagination"
                  >
                    {renderPaginationButtons()}
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
