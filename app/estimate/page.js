'use client';
import { useState } from 'react';

export default function Estimate() {
  // 입력 폼의 상태를 관리하는 객체
  const [formData, setFormData] = useState({
    category: '',      // 분류
    productName: '',   // 상품명
    quantity: '',      // 수량
    price: '',         // 현금가
    productCode: '',   // 상품코드
    distributor: '',   // 총판
    reconfirm: '',     // 재조사
    remarks: ''        // 비고
  });

  // 다나와 일괄 입력 데이터를 관리하는 상태
  const [bulkData, setBulkData] = useState('');
  // 테이블에 표시될 모든 데이터를 관리하는 상태
  const [tableData, setTableData] = useState([]);
  // 현재 수정 중인 항목의 ID를 관리하는 상태
  const [editingId, setEditingId] = useState(null);

  // 입력 폼의 값이 변경될 때 실행되는 함수
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // textarea 높이 자동 조절
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  // 다나와 일괄 입력 텍스트가 변경될 때 실행되는 함수
  const handleBulkDataChange = (e) => {
    setBulkData(e.target.value);
  };

  // 다나와 형식 데이터를 처리하고 테이블에 추가하는 함수
  const handleDanawaSubmit = (e) => {
    e.preventDefault();
    const lines = bulkData.split('\n').filter(line => line.trim());
    
    const newData = lines.map(line => {
      // 탭으로 구분된 데이터를 분리 (분류, 상품명1, 상품명2, 수량, 카드가격, 현금가격)
      const [category, productName1, productName2, quantity, cardPrice, cashPrice] = line.split('\t');
      return {
        id: Date.now() + Math.random(),
        category: category || '',
        productName: productName1 || '',
        quantity: quantity || '',
        price: cashPrice ? cashPrice.replace(/[^0-9]/g, '') : '', // 숫자만 추출
        productCode: '',
        distributor: '',
        reconfirm: '',
        remarks: ''
      };
    });

    setTableData(prev => [...prev, ...newData]);
    setBulkData('');
  };

  // 견적왕 일괄 입력 데이터를 관리하는 상태
  const [quoteKingData, setQuoteKingData] = useState('');

  // 견적왕 일괄 입력 텍스트가 변경될 때 실행되는 함수
  const handleQuoteKingChange = (e) => {
    setQuoteKingData(e.target.value);
  };

  // 견적왕 형식 데이터를 처리하고 테이블에 추가하는 함수
  const handleQuoteKingSubmit = (e) => {
    e.preventDefault();
    const lines = quoteKingData.split('\n').filter(line => line.trim());
    const newData = [];
    
    // 4줄씩 하나의 항목으로 처리
    for (let i = 0; i < lines.length; i += 4) {
      if (i + 3 < lines.length) {
        // 첫 번째 줄에서 번호, 분류, 상품명 추출
        const firstLine = lines[i].split('\t');
        const category = firstLine[1] || '';
        const productName = firstLine[3] || '';
        
        // 두 번째 줄에서 현금가 추출 (숫자만)
        const price = lines[i + 1].replace(/[^0-9]/g, '');
        
        // 세 번째 줄에서 수량 추출
        const quantity = lines[i + 2];

        newData.push({
          id: Date.now() + Math.random(),
          category: category,
          productName: productName,
          quantity: quantity,
          price: price,
          productCode: '',
          distributor: '',
          reconfirm: '',
          remarks: ''
        });
      }
    }

    setTableData(prev => [...prev, ...newData]);
    setQuoteKingData('');
  };

  // 테이블에서 항목을 삭제하는 함수
  const handleDelete = (id) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      setTableData(prev => prev.filter(item => item.id !== id));
    }
  };

  // 테이블 항목의 수정을 시작하는 함수
  const handleEdit = (row) => {
    setEditingId(row.id);
    setFormData({
      category: row.category,
      productName: row.productName,
      quantity: row.quantity,
      price: row.price,
      productCode: row.productCode,
      distributor: row.distributor,
      reconfirm: row.reconfirm,
      remarks: row.remarks
    });
  };

  // 폼 제출을 처리하는 함수 (새로운 항목 추가 또는 기존 항목 수정)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      // 수정 모드: 기존 항목 업데이트
      setTableData(prev => prev.map(item => 
        item.id === editingId ? { ...formData, id: editingId } : item
      ));
      setEditingId(null);
    } else {
      // 새로운 항목 추가 모드
      setTableData(prev => [...prev, { ...formData, id: Date.now() }]);
    }

    // 폼 초기화
    setFormData({
      category: '',
      productName: '',
      quantity: '',
      price: '',
      productCode: '',
      distributor: '',
      reconfirm: '',
      remarks: ''
    });

    // textarea 높이 초기화
    document.querySelectorAll('textarea').forEach(textarea => {
      textarea.style.height = '42px';  // min-h-[42px]와 동일한 높이로 초기화
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 일괄 입력 섹션 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">일괄 데이터 입력</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 다나와 입력 폼 */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">다나와 형식</h3>
              <form onSubmit={handleDanawaSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    데이터 입력 (분류, 상품명, 상품명, 수량, 카드가격, 현금가격 순서)
                  </label>
                  <textarea
                    value={bulkData}
                    onChange={handleBulkDataChange}
                    rows={10}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="다나와 데이터를 붙여넣으세요..."
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    다나와 등록
                  </button>
                </div>
              </form>
            </div>

            {/* 견적왕 입력 폼 */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">견적왕 형식</h3>
              <form onSubmit={handleQuoteKingSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    데이터 입력 (번호/분류/상품명/현금가/수량/현금가합계 순서)
                  </label>
                  <textarea
                    value={quoteKingData}
                    onChange={handleQuoteKingChange}
                    rows={10}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="견적왕 데이터를 붙여넣으세요..."
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                  >
                    견적왕 등록
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* 기존 개별 입력 폼 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? '상품 정보 수정' : '상품 정보 입력'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                분류
              </label>
              <textarea
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 resize-none overflow-hidden min-h-[42px]"
                required
                placeholder="분류를 입력하세요"
                rows={1}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                상품명
              </label>
              <textarea
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 resize-none overflow-hidden min-h-[42px]"
                required
                placeholder="상품명을 입력하세요"
                rows={1}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                수량
              </label>
              <textarea
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 resize-none overflow-hidden min-h-[42px]"
                required
                placeholder="수량을 입력하세요"
                rows={1}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                현금가
              </label>
              <textarea
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 resize-none overflow-hidden min-h-[42px]"
                required
                placeholder="현금가를 입력하세요"
                rows={1}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                상품코드
              </label>
              <textarea
                name="productCode"
                value={formData.productCode}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 resize-none overflow-hidden min-h-[42px]"
                required
                placeholder="상품코드를 입력하세요"
                rows={1}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                총판
              </label>
              <textarea
                name="distributor"
                value={formData.distributor}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 resize-none overflow-hidden min-h-[42px]"
                required
                placeholder="총판을 입력하세요"
                rows={1}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                재조사
              </label>
              <textarea
                name="reconfirm"
                value={formData.reconfirm}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 resize-none overflow-hidden min-h-[42px]"
                required
                placeholder="재조사 여부를 입력하세요"
                rows={1}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                비고
              </label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 resize-none overflow-hidden min-h-[42px]"
                placeholder="비고를 입력하세요"
                rows={1}
              />
            </div>

            <div className="lg:col-span-4 flex justify-end gap-2">
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setFormData({
                      category: '',
                      productName: '',
                      quantity: '',
                      price: '',
                      productCode: '',
                      distributor: '',
                      reconfirm: '',
                      remarks: ''
                    });
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                >
                  취소
                </button>
              )}
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                {editingId ? '수정' : '입력'}
              </button>
            </div>
          </form>
        </div>

        {/* 테이블 */}
        <div className="bg-white rounded-lg shadow">
          <div className="max-w-full">
            <table className="w-full table-fixed divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-[10%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider overflow-hidden">
                    <div className="truncate">작업</div>
                  </th>
                  <th className="w-[12%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider overflow-hidden">
                    <div className="truncate">분류</div>
                  </th>
                  <th className="w-[25%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider overflow-hidden">
                    <div className="truncate">상품명</div>
                  </th>
                  <th className="w-[8%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider overflow-hidden">
                    <div className="truncate">수량</div>
                  </th>
                  <th className="w-[12%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider overflow-hidden">
                    <div className="truncate">현금가</div>
                  </th>
                  <th className="w-[12%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider overflow-hidden">
                    <div className="truncate">상품코드</div>
                  </th>
                  <th className="w-[8%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider overflow-hidden">
                    <div className="truncate">총판</div>
                  </th>
                  <th className="w-[8%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider overflow-hidden">
                    <div className="truncate">재조사</div>
                  </th>
                  <th className="w-[15%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider overflow-hidden">
                    <div className="truncate">비고</div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tableData.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-4">
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(row)}
                          className="bg-yellow-500 text-white px-1.5 py-0.5 rounded text-xs hover:bg-yellow-600 min-w-[32px]"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(row.id)}
                          className="bg-red-500 text-white px-1.5 py-0.5 rounded text-xs hover:bg-red-600 min-w-[32px]"
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900 break-all whitespace-pre-line overflow-hidden">{row.category}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900 break-all whitespace-pre-line overflow-hidden">{row.productName}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900 break-all whitespace-pre-line overflow-hidden">{row.quantity}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900 break-all whitespace-pre-line overflow-hidden">{row.price}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900 break-all whitespace-pre-line overflow-hidden">{row.productCode}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900 break-all whitespace-pre-line overflow-hidden">{row.distributor}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900 break-all whitespace-pre-line overflow-hidden">{row.reconfirm}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900 break-all whitespace-pre-line overflow-hidden">{row.remarks}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
  