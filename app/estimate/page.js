'use client';
import { useState } from 'react';

export default function Estimate() {
  const [formData, setFormData] = useState({
    category: '',
    productName: '',
    quantity: '',
    price: '',
    productCode: '',
    distributor: '',
    reconfirm: '',
    remarks: ''
  });

  const [bulkData, setBulkData] = useState('');
  const [tableData, setTableData] = useState([]);

  const distributors = ['JNP', '패밀리', '랜드', '바이트', '엔탑', '탑', '미라클'];
  const categories = ['컴퓨터 부품', '주변기기', '소프트웨어', '기타'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBulkDataChange = (e) => {
    setBulkData(e.target.value);
  };

  const handleDanawaSubmit = (e) => {
    e.preventDefault();
    const lines = bulkData.split('\n').filter(line => line.trim());
    
    const newData = lines.map(line => {
      const [category, productName1, productName2, quantity, cardPrice, cashPrice] = line.split('\t');
      return {
        id: Date.now() + Math.random(),
        category: category || '',
        productName: productName1 || '',
        quantity: quantity || '',
        price: cashPrice ? cashPrice.replace(/[^0-9]/g, '') : '',
        productCode: '',
        distributor: '',
        reconfirm: '',
        remarks: ''
      };
    });

    setTableData(prev => [...prev, ...newData]);
    setBulkData('');
  };

  const [quoteKingData, setQuoteKingData] = useState('');

  const handleQuoteKingChange = (e) => {
    setQuoteKingData(e.target.value);
  };

  const handleQuoteKingSubmit = (e) => {
    e.preventDefault();
    const lines = quoteKingData.split('\n').filter(line => line.trim());
    const newData = [];
    
    for (let i = 0; i < lines.length; i += 4) {
      if (i + 3 < lines.length) {
        // 첫 번째 줄에서 번호, 분류, 상품명 추출
        const firstLine = lines[i].split('\t');
        const category = firstLine[1] || '';
        const productName = firstLine[3] || '';
        
        // 두 번째 줄에서 현금가 추출
        const price = lines[i + 1].replace(/[^0-9]/g, '');
        
        // 세 번째 줄에서 수량 추출
        const quantity = lines[i + 2];

        // 네 번째 줄은 현금가합계이므로 무시

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

  const handleSubmit = (e) => {
    e.preventDefault();
    setTableData(prev => [...prev, { ...formData, id: Date.now() }]);
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
          <h2 className="text-xl font-semibold mb-4">상품 정보 입력</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                분류
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
                placeholder="분류를 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                상품명
              </label>
              <input
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
                placeholder="상품명을 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                수량
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
                placeholder="수량을 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                현금가
              </label>
              <input
                type="text"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
                placeholder="현금가를 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                상품코드
              </label>
              <input
                type="text"
                name="productCode"
                value={formData.productCode}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
                placeholder="상품코드를 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                총판
              </label>
              <input
                type="text"
                name="distributor"
                value={formData.distributor}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
                placeholder="총판을 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                재조사
              </label>
              <input
                type="text"
                name="reconfirm"
                value={formData.reconfirm}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
                placeholder="재조사 여부를 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                비고
              </label>
              <input
                type="text"
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="비고를 입력하세요"
              />
            </div>

            <div className="lg:col-span-4 flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                입력
              </button>
            </div>
          </form>
        </div>

        {/* 테이블 */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
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
              {tableData.map((row) => (
                <tr key={row.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.productName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.price}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.productCode}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.distributor}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.reconfirm}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
  