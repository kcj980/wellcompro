'use client';
import { useState, useEffect } from 'react';

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

  // 고객 정보를 관리하는 상태
  const [customerInfo, setCustomerInfo] = useState({
    name: '',           // 이름
    phone: '',         // 핸드폰번호
    pcNumber: '',      // PC번호
    contractType: '일반회원',   // 계약구분
    saleType: '부품 조립형',      // 판매형태
    purchaseType: '해당없음',  // 구입형태
    purchaseTypeName: '', // 지인 이름
    asCondition: '본인입고조건',   // AS조건
    os: 'win11',            // 운영체계
    manager: '김선식'        // 견적담당
  });

  // 입력 폼 표시 여부를 관리하는 상태
  const [showForm, setShowForm] = useState(false);

  // 다나와 일괄 입력 데이터를 관리하는 상태
  const [bulkData, setBulkData] = useState('');
  // 테이블에 표시될 모든 데이터를 관리하는 상태
  const [tableData, setTableData] = useState([]);
  // 현재 수정 중인 항목의 ID를 관리하는 상태
  const [editingId, setEditingId] = useState(null);

  // 고객정보 직접입력 모드 상태들들
  const [isCustomSaleType, setIsCustomSaleType] = useState(false);
  const [isCustomContractType, setIsCustomContractType] = useState(false);
  const [isCustomAsCondition, setIsCustomAsCondition] = useState(false);
  const [isCustomPurchaseType, setIsCustomPurchaseType] = useState(false);
  const [isCustomOs, setIsCustomOs] = useState(false);
  const [isCustomManager, setIsCustomManager] = useState(false);
  const [isCustomLaborCost, setIsCustomLaborCost] = useState(false);
  const [isCustomSetupCost, setIsCustomSetupCost] = useState(false);

  // 결제 정보를 관리하는 상태
  const [paymentInfo, setPaymentInfo] = useState({
    laborCost: 0,         // 공임비
    setupCost: 0,         // 세팅비
    discount: 0,          // 할인
    deposit: 0,           // 계약금
    includeVat: false,    // VAT 포함 여부
    vatRate: 10,          // VAT 비율 (기본 10%)
    roundingType: '',     // 버림 타입 ('100', '1000', 또는 '')
    paymentMethod: ''     // 결제 방법
  });

  // 모든 계산된 값들을 저장하는 상태
  const [calculatedValues, setCalculatedValues] = useState({
    productTotal: 0,      // 상품/부품 합 금액
    totalPurchase: 0,     // 총 구입 금액
    vatAmount: 0,         // VAT 금액
    finalPayment: 0       // 최종 결제 금액
  });

  // 저장 처리 상태를 관리하는 상태
  const [saveStatus, setSaveStatus] = useState({
    loading: false,
    success: false,
    error: null
  });

  // 숫자를 한글로 변환하는 함수
  const numberToKorean = (number) => {
    const units = ['', '만', '억', '조'];
    const smallUnits = ['', '십', '백', '천'];
    const nums = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    if (number === 0) return '0원';

    let result = '';
    let unitIndex = 0;

    while (number > 0) {
      let part = number % 10000;
      let partResult = '';
      let smallUnitIndex = 0;

      while (part > 0) {
        const digit = part % 10;
        if (digit > 0) {
          partResult = nums[digit] + smallUnits[smallUnitIndex] + partResult;
        }
        smallUnitIndex++;
        part = Math.floor(part / 10);
      }

      if (partResult) {
        result = partResult + units[unitIndex] + result;
      }

      unitIndex++;
      number = Math.floor(number / 10000);
    }

    return result + '원';
  };

  // 고객 정보 입력값 변경 처리 함수
  const handleCustomerInfoChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));

    // 판매형태가 변경되었고, 값이 있다면 직접입력 모드를 해제
    if (name === 'saleType' && value) {
      setIsCustomSaleType(false);
    }
  };

  // 고객정보 각 필드별 선택 처리 함수들
  const handleSaleTypeSelect = (value) => {
    setCustomerInfo(prev => ({
      ...prev,
      saleType: value
    }));
    setIsCustomSaleType(false);
  };

  const handleContractTypeSelect = (value) => {
    setCustomerInfo(prev => ({
      ...prev,
      contractType: value
    }));
    setIsCustomContractType(false);
  };

  const handleAsConditionSelect = (value) => {
    setCustomerInfo(prev => ({
      ...prev,
      asCondition: value
    }));
    setIsCustomAsCondition(false);
  };

  const handlePurchaseTypeSelect = (value) => {
    setCustomerInfo(prev => ({
      ...prev,
      purchaseType: value,
      purchaseTypeName: '' // 지인이 아닌 경우 이름 초기화
    }));
    setIsCustomPurchaseType(false);
  };

  const handleOsSelect = (value) => {
    setCustomerInfo(prev => ({
      ...prev,
      os: value
    }));
    setIsCustomOs(false);
  };

  const handleManagerSelect = (value) => {
    setCustomerInfo(prev => ({
      ...prev,
      manager: value
    }));
    setIsCustomManager(false);
  };

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

  // 상품/부품 합계 계산 함수
  const calculateProductTotal = () => {
    const total = tableData.reduce((sum, item) => {
      const price = parseInt(item.price) || 0;
      return sum + price;  // 수량을 곱하지 않고 현금가만 더함
    }, 0);
    return total;
  };

  // 총 구입 금액 계산 함수
  const calculateTotalPurchase = () => {
    const productTotal = calculateProductTotal();
    const laborCost = parseInt(paymentInfo.laborCost) || 0;
    const setupCost = parseInt(paymentInfo.setupCost) || 0;
    const discount = parseInt(paymentInfo.discount) || 0;
    
    return productTotal + laborCost + setupCost - discount;
  };

  // VAT 금액 계산 함수
  const calculateVatAmount = (totalPurchase) => {
    if (!paymentInfo.includeVat) return 0;
    const vatRate = parseInt(paymentInfo.vatRate) || 0;
    return Math.floor(totalPurchase * vatRate / 100);
  };

  // 최종 결제 금액 계산 함수 (VAT 및 버림 적용)
  const calculateFinalPayment = () => {
    let total = calculateTotalPurchase();
    const vatAmount = calculateVatAmount(total);
    total += vatAmount;
    
    // 버림 적용
    if (paymentInfo.roundingType === '100') {
      total = Math.floor(total / 100) * 100;
    } else if (paymentInfo.roundingType === '1000') {
      total = Math.floor(total / 1000) * 1000;
    }
    
    return total;
  };

  // 결제 정보 변경 처리 함수
  const handlePaymentInfoChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPaymentInfo(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // 공임비 선택 처리 함수
  const handleLaborCostSelect = (value) => {
    setPaymentInfo(prev => ({
      ...prev,
      laborCost: value
    }));
    setIsCustomLaborCost(false);
  };

  // 세팅비 선택 처리 함수
  const handleSetupCostSelect = (value) => {
    setPaymentInfo(prev => ({
      ...prev,
      setupCost: value
    }));
    setIsCustomSetupCost(false);
  };

  // 모든 계산된 값들을 업데이트하는 함수
  const updateCalculatedValues = () => {
    const productTotal = calculateProductTotal();
    const totalPurchase = calculateTotalPurchase();
    const vatAmount = calculateVatAmount(totalPurchase);
    const finalPayment = calculateFinalPayment();

    setCalculatedValues({
      productTotal,
      totalPurchase,
      vatAmount,
      finalPayment
    });
  };

  // 견적을 MongoDB에 저장하는 함수
  const saveEstimate = async () => {
    try {
      // 저장 중 상태로 설정
      setSaveStatus({ loading: true, success: false, error: null });

      // 부족한 데이터 검증
      if (!customerInfo.name) {
        setSaveStatus({ 
          loading: false, 
          success: false, 
          error: '고객 이름을 입력해주세요.' 
        });
        return;
      }

      if (tableData.length === 0) {
        setSaveStatus({ 
          loading: false, 
          success: false, 
          error: '최소 하나 이상의 상품을 추가해주세요.' 
        });
        return;
      }

      // MongoDB에 저장할 데이터 구성
      const estimateData = {
        customerInfo,
        tableData,
        paymentInfo,
        calculatedValues
      };

      console.log('Sending data to server:', estimateData);

      // API를 통해 데이터 저장 요청
      const response = await fetch('/api/estimates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(estimateData),
        cache: 'no-store'
      });

      // 응답이 JSON이 아닐 경우를 대비한 처리
      let result;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        const text = await response.text();
        result = { message: text || '응답 형식 오류' };
      }

      if (!response.ok) {
        throw new Error(result.message || `서버 오류: ${response.status}`);
      }

      console.log('Save success:', result);

      // 성공 상태로 설정
      setSaveStatus({ 
        loading: false, 
        success: true, 
        error: null 
      });

      // 3초 후 성공 메시지 초기화
      setTimeout(() => {
        setSaveStatus(prev => ({ ...prev, success: false }));
      }, 3000);

    } catch (error) {
      console.error('Error saving estimate:', error);
      setSaveStatus({ 
        loading: false, 
        success: false, 
        error: `저장 오류: ${error.message}` 
      });
    }
  };

  // 결제 정보가 변경될 때마다 계산된 값들을 업데이트
  useEffect(() => {
    updateCalculatedValues();
  }, [paymentInfo, tableData]);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 상태 알림 메시지 */}
        {saveStatus.error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">오류! </strong>
            <span className="block sm:inline">{saveStatus.error}</span>
          </div>
        )}
        
        {saveStatus.success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">성공! </strong>
            <span className="block sm:inline">견적이 성공적으로 저장되었습니다.</span>
          </div>
        )}

        {/* 고객 정보 입력 섹션 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">고객 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이름
              </label>
              <input
                type="text"
                name="name"
                value={customerInfo.name}
                onChange={handleCustomerInfoChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="이름을 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                핸드폰번호
              </label>
              <input
                type="tel"
                name="phone"
                value={customerInfo.phone}
                onChange={handleCustomerInfoChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="핸드폰번호를 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PC번호
              </label>
              <input
                type="text"
                name="pcNumber"
                value={customerInfo.pcNumber}
                onChange={handleCustomerInfoChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="PC번호를 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                계약구분
              </label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleContractTypeSelect('일반회원')}
                    className={`px-3 py-1 rounded-md text-sm ${
                      customerInfo.contractType === '일반회원'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    일반회원
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomContractType(true);
                      setCustomerInfo(prev => ({ ...prev, contractType: '' }));
                    }}
                    className={`px-3 py-1 rounded-md text-sm ${
                      isCustomContractType
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    직접입력
                  </button>
                </div>
                {isCustomContractType && (
                  <input
                    type="text"
                    name="contractType"
                    value={customerInfo.contractType}
                    onChange={handleCustomerInfoChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="계약구분을 입력하세요"
                  />
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                판매형태
              </label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {['부품 조립형', '본인설치', '해당없음'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleSaleTypeSelect(type)}
                      className={`px-3 py-1 rounded-md text-sm ${
                        customerInfo.saleType === type
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomSaleType(true);
                      setCustomerInfo(prev => ({ ...prev, saleType: '' }));
                    }}
                    className={`px-3 py-1 rounded-md text-sm ${
                      isCustomSaleType
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    직접입력
                  </button>
                </div>
                {isCustomSaleType && (
                  <input
                    type="text"
                    name="saleType"
                    value={customerInfo.saleType}
                    onChange={handleCustomerInfoChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="판매형태를 입력하세요"
                  />
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                구입형태
              </label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handlePurchaseTypeSelect('지인')}
                    className={`px-3 py-1 rounded-md text-sm ${
                      customerInfo.purchaseType === '지인'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    지인
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePurchaseTypeSelect('해당없음')}
                    className={`px-3 py-1 rounded-md text-sm ${
                      customerInfo.purchaseType === '해당없음'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    해당없음
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomPurchaseType(true);
                      setCustomerInfo(prev => ({ ...prev, purchaseType: '' }));
                    }}
                    className={`px-3 py-1 rounded-md text-sm ${
                      isCustomPurchaseType
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    직접입력
                  </button>
                </div>
                {customerInfo.purchaseType === '지인' && (
                  <input
                    type="text"
                    name="purchaseTypeName"
                    value={customerInfo.purchaseTypeName}
                    onChange={handleCustomerInfoChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="지인 이름을 입력하세요"
                  />
                )}
                {isCustomPurchaseType && (
                  <input
                    type="text"
                    name="purchaseType"
                    value={customerInfo.purchaseType}
                    onChange={handleCustomerInfoChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="구입형태를 입력하세요"
                  />
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                AS조건
              </label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleAsConditionSelect('본인입고조건')}
                    className={`px-3 py-1 rounded-md text-sm ${
                      customerInfo.asCondition === '본인입고조건'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    본인입고조건
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomAsCondition(true);
                      setCustomerInfo(prev => ({ ...prev, asCondition: '' }));
                    }}
                    className={`px-3 py-1 rounded-md text-sm ${
                      isCustomAsCondition
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    직접입력
                  </button>
                </div>
                {isCustomAsCondition && (
                  <input
                    type="text"
                    name="asCondition"
                    value={customerInfo.asCondition}
                    onChange={handleCustomerInfoChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="AS조건을 입력하세요"
                  />
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                운영체계
              </label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleOsSelect('win10')}
                    className={`px-3 py-1 rounded-md text-sm ${
                      customerInfo.os === 'win10'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    win10
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOsSelect('win11')}
                    className={`px-3 py-1 rounded-md text-sm ${
                      customerInfo.os === 'win11'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    win11
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomOs(true);
                      setCustomerInfo(prev => ({ ...prev, os: '' }));
                    }}
                    className={`px-3 py-1 rounded-md text-sm ${
                      isCustomOs
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    직접입력
                  </button>
                </div>
                {isCustomOs && (
                  <input
                    type="text"
                    name="os"
                    value={customerInfo.os}
                    onChange={handleCustomerInfoChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="운영체계를 입력하세요"
                  />
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                견적담당
              </label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleManagerSelect('김선식')}
                    className={`px-3 py-1 rounded-md text-sm ${
                      customerInfo.manager === '김선식'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    김선식
                  </button>
                  <button
                    type="button"
                    onClick={() => handleManagerSelect('소성옥')}
                    className={`px-3 py-1 rounded-md text-sm ${
                      customerInfo.manager === '소성옥'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    소성옥
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomManager(true);
                      setCustomerInfo(prev => ({ ...prev, manager: '' }));
                    }}
                    className={`px-3 py-1 rounded-md text-sm ${
                      isCustomManager
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    직접입력
                  </button>
                </div>
                {isCustomManager && (
                  <input
                    type="text"
                    name="manager"
                    value={customerInfo.manager}
                    onChange={handleCustomerInfoChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="견적담당을 입력하세요"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

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
                    rows={1}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[42px] resize-none overflow-hidden"
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
                    rows={1}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[42px] resize-none overflow-hidden"
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

        {/* 상품 정보 입력창 토글 버튼 */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          >
            상품 정보 입력창 {showForm ? '-' : '+'}
          </button>
        </div>

        {/* 기존 개별 입력 폼 */}
        {showForm && (
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
        )}

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

        {/* 테이블 끝난 후 결제 정보 섹션 */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">결제 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 금액 정보 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  상품/부품 합 금액
                </label>
                <div className="text-lg font-semibold text-gray-900">
                  {calculatedValues.productTotal.toLocaleString()}원
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  공임비
                </label>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {[10000, 20000, 30000, 40000, 50000].map((cost) => (
                      <button
                        key={cost}
                        type="button"
                        onClick={() => handleLaborCostSelect(cost)}
                        className={`px-3 py-1 rounded-md text-sm ${
                          paymentInfo.laborCost === cost && !isCustomLaborCost
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {(cost / 10000)}만원
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomLaborCost(true);
                        setPaymentInfo(prev => ({ ...prev, laborCost: '' }));
                      }}
                      className={`px-3 py-1 rounded-md text-sm ${
                        isCustomLaborCost
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      직접입력
                    </button>
                  </div>
                  {isCustomLaborCost && (
                    <input
                      type="number"
                      name="laborCost"
                      value={paymentInfo.laborCost}
                      onChange={handlePaymentInfoChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="공임비를 입력하세요"
                    />
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  세팅비
                </label>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {[10000, 20000, 30000, 40000, 50000].map((cost) => (
                      <button
                        key={cost}
                        type="button"
                        onClick={() => handleSetupCostSelect(cost)}
                        className={`px-3 py-1 rounded-md text-sm ${
                          paymentInfo.setupCost === cost && !isCustomSetupCost
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {(cost / 10000)}만원
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomSetupCost(true);
                        setPaymentInfo(prev => ({ ...prev, setupCost: '' }));
                      }}
                      className={`px-3 py-1 rounded-md text-sm ${
                        isCustomSetupCost
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      직접입력
                    </button>
                  </div>
                  {isCustomSetupCost && (
                    <input
                      type="number"
                      name="setupCost"
                      value={paymentInfo.setupCost}
                      onChange={handlePaymentInfoChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="세팅비를 입력하세요"
                    />
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  할인
                </label>
                <div className="flex flex-col items-start gap-2">
                  <input
                    type="number"
                    name="discount"
                    value={paymentInfo.discount}
                    onChange={handlePaymentInfoChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="할인 금액을 입력하세요"
                  />
                  <span className="text-sm text-gray-700 whitespace-nowrap">
                    {numberToKorean(parseInt(paymentInfo.discount) || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* 계약금 및 VAT 정보 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  총 구입 금액 (상품/부품+공임비+세팅비-할인)
                </label>
                <div className="text-lg font-semibold text-gray-900">
                  {calculatedValues.totalPurchase.toLocaleString()}원
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  계약금
                </label>
                <div className="flex flex-col items-start gap-2">
                  <input
                    type="number"
                    name="deposit"
                    value={paymentInfo.deposit}
                    onChange={handlePaymentInfoChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="계약금을 입력하세요"
                  />
                  <span className="text-sm text-gray-700 whitespace-nowrap">
                    {numberToKorean(parseInt(paymentInfo.deposit) || 0)}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="includeVat"
                    checked={paymentInfo.includeVat}
                    onChange={handlePaymentInfoChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    VAT 포함
                  </label>
                </div>
                {paymentInfo.includeVat && (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      name="vatRate"
                      value={paymentInfo.vatRate}
                      onChange={handlePaymentInfoChange}
                      className="w-20 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      max="100"
                    />
                    <span className="text-sm text-gray-700">%</span>
                    <span className="text-sm text-gray-700">
                      ({calculatedValues.vatAmount.toLocaleString()}원)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 최종 결제 금액 및 버림 옵션 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  최종 결제 금액
                </label>
                <div className="text-xl font-bold text-blue-600">
                  {calculatedValues.finalPayment.toLocaleString()}원
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentInfo(prev => ({ ...prev, roundingType: '100' }))}
                  className={`px-3 py-2 rounded-md text-sm ${
                    paymentInfo.roundingType === '100'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  100 버림
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentInfo(prev => ({ ...prev, roundingType: '1000' }))}
                  className={`px-3 py-2 rounded-md text-sm ${
                    paymentInfo.roundingType === '1000'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  1000 버림
                </button>
                {paymentInfo.roundingType && (
                  <button
                    type="button"
                    onClick={() => setPaymentInfo(prev => ({ ...prev, roundingType: '' }))}
                    className="px-3 py-2 rounded-md text-sm bg-gray-200 text-gray-700 hover:bg-gray-300"
                  >
                    버림 취소
                  </button>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  결제 방법
                </label>
                <input
                  type="text"
                  name="paymentMethod"
                  value={paymentInfo.paymentMethod}
                  onChange={handlePaymentInfoChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="결제 방법을 입력하세요"
                />
              </div>

              {/* 저장 버튼 추가 */}
              <div className="mt-6">
                <button
                  type="button"
                  onClick={saveEstimate}
                  disabled={saveStatus.loading}
                  className={`w-full px-4 py-3 rounded-md text-white font-medium ${
                    saveStatus.loading
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {saveStatus.loading ? '저장 중...' : '견적 저장하기'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
  