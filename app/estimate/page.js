'use client';
/**
 * 견적서 작성 및 수정 페이지
 * 
 * 이 페이지는 고객 정보, 상품 목록, 결제 정보 등을 입력하고 관리하는 기능을 제공합니다.
 * 주요 기능:
 * 1. 새 견적서 작성 및 기존 견적서 수정 (URL 파라미터 id 여부에 따라 결정)
 * 2. 고객 정보 입력 및 관리 (이름, 전화번호, 계약 유형 등)
 * 3. 상품 정보 입력 - 개별 추가 또는 다나와/견적왕 형식의 일괄 데이터 입력 지원
 * 4. 상품 목록 표시, 수정, 삭제 기능
 * 5. 결제 정보 관리 (공임비, 세팅비, 할인, VAT 등)
 * 6. 최종 금액 자동 계산 (상품 총액, VAT, 최종 결제 금액 등)
 * 7. 데이터베이스에 견적 저장 및 업데이트
 * 
 * URL에 id 파라미터가 있으면 해당 견적을 수정하는 모드로 작동하며,
 * 없으면 새로운 견적을 작성하는 모드로 작동합니다.
 */
import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// 메인 컴포넌트
export default function Estimate() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <EstimateContent />
    </Suspense>
  );
}

// 견적서 작성 및 수정 페이지 컴포넌트
function EstimateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // URL에서 견적 ID를 가져와 수정 모드 여부 결정
  const estimateId = searchParams.get('id');
  const isEditMode = !!estimateId;

  /**
   * 상품 정보 입력 폼의 상태
   * category: 상품 분류 (CPU, 메모리 등)
   * productName: 상품명
   * quantity: 수량
   * price: 현금가 (단가)
   * productCode: 상품코드 (선택사항)
   * distributor: 총판 정보 (선택사항)
   * reconfirm: 재조사 필요 여부 (선택사항)
   * remarks: 추가 비고 (선택사항)
   */
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

  /**
   * 고객 정보를 관리하는 상태
   * name: 고객 이름 (필수 항목)
   * phone: 연락처
   * pcNumber: PC 번호
   * contractType: 계약 구분 (기본값: 일반회원)
   * saleType: 판매 형태 (기본값: 부품 조립형)
   * purchaseType: 구입 형태 (지인, 해당없음 등)
   * purchaseTypeName: 지인 이름 (purchaseType이 '지인'일 경우)
   * asCondition: AS 조건
   * os: 운영체제 (win10, win11 등)
   * manager: 견적 담당자
   */
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

  // 상품 입력 폼 표시 여부 (토글 가능)
  const [showForm, setShowForm] = useState(false);

  // 다나와 일괄 입력 데이터
  const [bulkData, setBulkData] = useState('');
  
  /**
   * 테이블에 표시될 모든 상품 데이터 배열
   * 각 항목은 formData와 동일한 구조에 id가 추가됨
   */
  const [tableData, setTableData] = useState([]);

  // 현재 수정 중인 상품 항목의 ID (null이면 새 항목 추가 모드)
  const [editingId, setEditingId] = useState(null);

  /**
   * 고객정보 필드들의 직접입력 모드 상태
   * true일 경우 해당 필드는 직접 입력 모드로 전환
   */
  const [isCustomSaleType, setIsCustomSaleType] = useState(false);
  const [isCustomContractType, setIsCustomContractType] = useState(false);
  const [isCustomAsCondition, setIsCustomAsCondition] = useState(false);
  const [isCustomPurchaseType, setIsCustomPurchaseType] = useState(false);
  const [isCustomOs, setIsCustomOs] = useState(false);
  const [isCustomManager, setIsCustomManager] = useState(false);
  const [isCustomLaborCost, setIsCustomLaborCost] = useState(false);
  const [isCustomSetupCost, setIsCustomSetupCost] = useState(false);

  /**
   * 결제 정보를 관리하는 상태
   * laborCost: 공임비 (기술료)
   * setupCost: 세팅비 (OS 설치, 초기 설정 등)
   * discount: 할인 금액
   * deposit: 계약금 (선수금)
   * includeVat: 부가가치세(VAT) 포함 여부
   * vatRate: VAT 비율 (기본 10%)
   * roundingType: 금액 버림 단위 ('100': 100원 단위, '1000': 1000원 단위)
   * paymentMethod: 결제 방법 (현금, 카드 등)
   */
  const [paymentInfo, setPaymentInfo] = useState({
    laborCost: 0,         // 공임비
    setupCost: 0,         // 세팅비
    discount: 0,          // 할인
    deposit: 0,           // 계약금
    includeVat: true,     // VAT 포함 여부 (기본 활성화)
    vatRate: 10,          // VAT 비율 (기본 10%)
    roundingType: '',     // 버림/올림 타입 (기본 없음)
    paymentMethod: '',     // 결제 방법
    shippingCost: 0        // 택배비
  });

  /**
   * 계산된 금액 값들을 저장하는 상태
   * productTotal: 상품/부품의 합계 금액
   * totalPurchase: 총 구입 금액 (상품 합계 + 공임비 + 세팅비 - 할인)
   * vatAmount: VAT 금액
   * finalPayment: 최종 결제 금액 (총 구입 금액 + VAT, 버림 적용)
   */
  const [calculatedValues, setCalculatedValues] = useState({
    productTotal: 0,      // 상품/부품 합 금액
    totalPurchase: 0,     // 총 구입 금액
    vatAmount: 0,         // VAT 금액
    finalPayment: 0       // 최종 결제 금액
  });

  /**
   * 견적 저장 처리 상태
   * loading: 저장 작업 진행 중 여부
   * success: 저장 성공 여부
   * error: 저장 중 발생한 오류 메시지
   */
  const [saveStatus, setSaveStatus] = useState({
    loading: false,
    success: false,
    error: null
  });

  // 수정 모드일 경우 데이터 로딩 중임을 표시하는 상태
  const [isLoading, setIsLoading] = useState(isEditMode);

  // 참고사항을 관리하는 상태
  const [notes, setNotes] = useState('');

  // 계약자 여부를 관리하는 상태
  const [isContractor, setIsContractor] = useState(false);

  // 서비스 물품 데이터를 관리하는 상태
  const [serviceData, setServiceData] = useState([]);

  /**
   * 숫자를 한글 금액 표기로 변환하는 함수
   * 예: 10000 -> 일만원, 1250000 -> 일백이십오만원
   * @param {number} number - 변환할 숫자
   * @returns {string} 한글로 변환된 금액 문자열
   */
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

  // 고객 정보 입력 필드 변경 시 호출되는 함수
  const handleCustomerInfoChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 판매 형태 버튼 클릭 시 호출되는 함수
  const handleSaleTypeSelect = (value) => {
    setCustomerInfo(prev => ({
      ...prev,
      saleType: value
    }));
    setIsCustomSaleType(false); // 직접 입력 모드 해제
  };

  // 계약 구분 버튼 클릭 시 호출되는 함수
  const handleContractTypeSelect = (value) => {
    setCustomerInfo(prev => ({
      ...prev,
      contractType: value
    }));
    setIsCustomContractType(false); // 직접 입력 모드 해제
  };

  // AS 조건 버튼 클릭 시 호출되는 함수
  const handleAsConditionSelect = (value) => {
    setCustomerInfo(prev => ({
      ...prev,
      asCondition: value
    }));
    setIsCustomAsCondition(false); // 직접 입력 모드 해제
  };

  // 구입 형태 버튼 클릭 시 호출되는 함수
  const handlePurchaseTypeSelect = (value) => {
    setCustomerInfo(prev => ({
      ...prev,
      purchaseType: value,
      purchaseTypeName: '' // 지인이 아닌 경우 이름 초기화
    }));
    setIsCustomPurchaseType(false); // 직접 입력 모드 해제
  };

  // 운영체제 버튼 클릭 시 호출되는 함수
  const handleOsSelect = (value) => {
    setCustomerInfo(prev => ({
      ...prev,
      os: value
    }));
    setIsCustomOs(false); // 직접 입력 모드 해제
  };

  // 담당자 버튼 클릭 시 호출되는 함수
  const handleManagerSelect = (value) => {
    setCustomerInfo(prev => ({
      ...prev,
      manager: value
    }));
    setIsCustomManager(false); // 직접 입력 모드 해제
  };

  // 상품 정보 입력 필드 변경 시 호출되는 함수
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // textarea 높이 자동 조절 - 내용이 길어지면 높이가 자동으로 늘어남
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  /**
   * 현금가에 수량을 곱하는 계산 함수
   * 상품 정보 입력 시 단가에 수량을 곱해 총액을 계산
   * 수량이 없거나 0인 경우 경고 메시지 표시
   */
  const multiplyPriceByQuantity = () => {
    // 입력된 현금가와 수량 가져오기
    const price = parseInt(formData.price) || 0;
    const quantity = parseInt(formData.quantity) || 0;
    
    // 수량이 0인 경우 계산하지 않음
    if (quantity === 0) {
      alert('수량이 입력되지 않았거나 0입니다.');
      return;
    }
    
    // 현금가와 수량을 곱한 결과 계산
    const multipliedPrice = price * quantity;
    
    // 계산된 값으로 현금가 업데이트
    setFormData(prev => ({
      ...prev,
      price: multipliedPrice.toString()
    }));
  };

  // 다나와 일괄 입력 텍스트가 변경될 때 호출되는 함수
  const handleBulkDataChange = (e) => {
    setBulkData(e.target.value);
  };

  /**
   * 다나와 형식 데이터를 처리하고 테이블에 추가하는 함수
   * 다나와 웹사이트에서 복사한 데이터를 파싱해서 테이블에 추가
   * @param {Event} e - 이벤트 객체
   */
  const handleDanawaSubmit = (e) => {
    e.preventDefault();
    // 줄바꿈으로 데이터 분리 후 빈 줄 제거
    const lines = bulkData.split('\n').filter(line => line.trim());
    
    // 각 줄을 파싱하여 상품 데이터 생성
    const newData = lines.map(line => {
      // 탭으로 구분된 데이터를 분리 (분류, 상품명, 수량, 카드최저가, 현금최저가, 카드최저가 합계, 현금최저가 합계)
      const [category, productName, quantity, cardPrice, cashPrice, cardTotal, cashTotal] = line.split('\t');
      
      // SSD 카테고리인 경우 "SSD/M.2 NVMe"로 변경
      let processedCategory = category || '';
      if (processedCategory === "SSD") {
        processedCategory = "SSD/M.2";
      }
      
      return {
        id: Date.now() + Math.random(), // 고유 ID 생성
        category: processedCategory,
        productName: productName || '',
        quantity: quantity || '',
        price: cashTotal ? cashTotal.replace(/[^0-9]/g, '') : '', // 현금최저가 합계에서 숫자만 추출
        productCode: '',
        distributor: '',
        reconfirm: '',
        remarks: ''
      };
    });

    // 기존 테이블 데이터에 새 데이터 추가
    setTableData(prev => [...prev, ...newData]);
    // 입력 필드 초기화
    setBulkData('');
  };

  // 견적왕 일괄 입력 데이터를 관리하는 상태
  const [quoteKingData, setQuoteKingData] = useState('');

  // 견적왕 일괄 입력 텍스트가 변경될 때 호출되는 함수
  const handleQuoteKingChange = (e) => {
    setQuoteKingData(e.target.value);
  };

  /**
   * 견적왕 형식 데이터를 처리하고 테이블에 추가하는 함수
   * 견적왕 프로그램에서 복사한 데이터를 파싱해서 테이블에 추가
   * @param {Event} e - 이벤트 객체
   */
  const handleQuoteKingSubmit = (e) => {
    e.preventDefault();
    // 줄바꿈으로 데이터 분리 후 빈 줄 제거
    const lines = quoteKingData.split('\n').filter(line => line.trim());
    const newData = [];
    
    // 4줄씩 하나의 항목으로 처리 (견적왕 형식에 맞춤)
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

        // SSD 카테고리인 경우 "SSD/M.2 NVMe"로 변경
        let processedCategory = category;
        if (processedCategory === "SSD") {
          processedCategory = "SSD/M.2";
        }

        // 상품 데이터 생성
        newData.push({
          id: Date.now() + Math.random(), // 고유 ID 생성
          category: processedCategory,
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

    // 기존 테이블 데이터에 새 데이터 추가
    setTableData(prev => [...prev, ...newData]);
    // 입력 필드 초기화
    setQuoteKingData('');
  };

  // 테이블에서 항목 삭제 시 호출되는 함수
  const handleDelete = (id) => {
    // 삭제 확인 대화상자 표시
    if (window.confirm('정말 삭제하시겠습니까?')) {
      console.log('삭제할 항목 ID:', id);
      console.log('삭제 전 테이블 데이터:', tableData);
      
      // 해당 ID를 제외한 나머지 항목으로 테이블 데이터 업데이트
      setTableData(prev => {
        const filteredData = prev.filter(item => item.id !== id);
        console.log('삭제 후 테이블 데이터:', filteredData);
        return filteredData;
      });
    }
  };

  /**
   * 테이블 항목 수정 버튼 클릭 시 호출되는 함수
   * 선택한 항목의 데이터를 입력 폼에 채우고 수정 모드 활성화
   * @param {Object} row - 수정할 상품 데이터 객체
   */
  const handleEdit = (row) => {
    // 수정할 항목의 ID 저장
    setEditingId(row.id);
    // 현재 항목 데이터로 폼 데이터 설정
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
    // 상품 정보 입력창이 보이도록 설정
    setShowForm(true);
  };

  /**
   * 상품 정보 폼 제출 시 호출되는 함수 (신규 추가 또는 수정)
   * 수정 모드이면 기존 항목 업데이트, 아니면 새 항목 추가
   * @param {Event} e - 이벤트 객체
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      // 수정 모드: 기존 항목 업데이트
      setTableData(prev => prev.map(item => 
        item.id === editingId ? { ...formData, id: editingId } : item
      ));
      // 수정 모드 종료
      setEditingId(null);
    } else {
      // 새로운 항목 추가 모드
      // 임시 ID 생성 - 'temp-' 접두사를 붙여 MongoDB ObjectId와 구분되게 함
      setTableData(prev => [...prev, { ...formData, id: `temp-${Date.now()}` }]);
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

  /**
   * 상품/부품의 총 금액을 계산하는 함수
   * 테이블에 있는 모든 상품의 현금가 합계 계산
   * @returns {number} 상품 합계 금액
   */
  const calculateProductTotal = () => {
    // 모든 상품의 현금가를 합산
    const total = tableData.reduce((sum, item) => {
      const price = parseInt(item.price) || 0;
      return sum + price;  // 수량을 곱하지 않고 현금가만 더함 (이미 곱해진 금액으로 가정)
    }, 0);
    return total;
  };

  /**
   * 총 구입 금액 계산 함수 (상품/부품 + 공임비 + 세팅비 - 할인)
   * @returns {number} 총 구입 금액
   */
  const calculateTotalPurchase = () => {
    const productTotal = calculateProductTotal();
    const laborCost = parseInt(paymentInfo.laborCost) || 0;
    const setupCost = parseInt(paymentInfo.setupCost) || 0;
    const discount = parseInt(paymentInfo.discount) || 0;
    
    return productTotal + laborCost + setupCost - discount;
  };

  /**
   * VAT 금액 계산 함수
   * includeVat가 true일 경우 vatRate에 따라 VAT 계산
   * @param {number} totalPurchase - VAT를 계산할 기준 금액
   * @returns {number} 계산된 VAT 금액
   */
  const calculateVatAmount = (totalPurchase) => {
    // VAT 포함 옵션이 비활성화된 경우 0 반환
    if (!paymentInfo.includeVat) return 0;
    // VAT 계산 (총 구입 금액 * VAT 비율 / 100)
    const vatRate = parseInt(paymentInfo.vatRate) || 0;
    return Math.floor(totalPurchase * vatRate / 100);
  };

  /**
   * 최종 결제 금액 계산 함수 (VAT 및 버림/올림 적용)
   * 총 구입 금액에 VAT를 더하고 필요시 100원/1000원 단위 버림/올림 적용
   * @returns {number} 최종 결제 금액
   */
  const calculateFinalPayment = () => {
    let total = calculateTotalPurchase();
    const vatAmount = calculateVatAmount(total);
    total += vatAmount;
    
    // 버림/올림 적용 (100원 또는 1000원 단위)
    if (paymentInfo.roundingType === '100down') {
      total = Math.floor(total / 100) * 100;
    } else if (paymentInfo.roundingType === '1000down') {
      total = Math.floor(total / 1000) * 1000;
    } else if (paymentInfo.roundingType === '100up') {
      total = Math.ceil(total / 100) * 100;
    } else if (paymentInfo.roundingType === '1000up') {
      total = Math.ceil(total / 1000) * 1000;
    }
    
    return total;
  };

  // 결제 정보 변경 시 호출되는 함수
  const handlePaymentInfoChange = (e) => {
    const { name, value } = e.target;
    setPaymentInfo(prev => ({
      ...prev,
      [name]: name === 'includeVat' ? e.target.checked : value
    }));
  };

  // 참고사항 변경 시 호출되는 함수
  const handleNotesChange = (e) => {
    setNotes(e.target.value);
  };

  // 공임비 선택 버튼 클릭 시 호출되는 함수
  const handleLaborCostSelect = (value) => {
    setPaymentInfo(prev => ({
      ...prev,
      laborCost: value
    }));
    // 직접 입력 모드 해제
    setIsCustomLaborCost(false);
  };

  // 세팅비 선택 버튼 클릭 시 호출되는 함수
  const handleSetupCostSelect = (value) => {
    setPaymentInfo(prev => ({
      ...prev,
      setupCost: value
    }));
    // 직접 입력 모드 해제
    setIsCustomSetupCost(false);
  };

  /**
   * 모든 계산된 금액 값들을 업데이트하는 함수
   * 상품 목록이나 결제 정보 변경 시 호출되어 금액 다시 계산
   */
  const updateCalculatedValues = () => {
    const productTotal = calculateProductTotal();
    const totalPurchase = calculateTotalPurchase();
    const vatAmount = calculateVatAmount(totalPurchase);
    const finalPayment = calculateFinalPayment();

    // 계산된 값들을 상태에 저장
    setCalculatedValues({
      productTotal,
      totalPurchase,
      vatAmount,
      finalPayment
    });
  };

  /**
   * 견적을 MongoDB에 저장하는 함수
   * 수정 모드이면 PUT 요청으로 업데이트, 아니면 POST 요청으로 생성
   * 저장 성공 시 수정 모드이면 상세 페이지로 리다이렉트
   */
  const saveEstimate = async () => {
    try {
      // 저장 중 상태로 설정
      setSaveStatus({ loading: true, success: false, error: null });

      // 필수 데이터 검증
      if (!customerInfo.name) {
        setSaveStatus({ 
          loading: false, 
          success: false, 
          error: '고객 이름을 입력해주세요.' 
        });
        alert('고객 이름을 입력해주세요.');
        return;
      }

      if (tableData.length === 0) {
        setSaveStatus({ 
          loading: false, 
          success: false, 
          error: '최소 하나 이상의 상품을 추가해주세요.' 
        });
        alert('최소 하나 이상의 상품을 추가해주세요.');
        return;
      }

      // MongoDB에 저장할 테이블 데이터 정리
      // 클라이언트 ID를 MongoDB _id로 변환하거나 제거하여 서버에서 처리할 수 있게 함
      const processedTableData = tableData.map(item => {
        // 클라이언트에서 생성된 ID는 제거하고 MongoDB가 자동으로 생성하도록 함
        const { id, ...rest } = item;
        
        // MongoDB ObjectId 형식(24자 hex 문자열)인 경우에만 _id로 설정
        if (id && typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id)) {
          return { ...rest, _id: id };
        }
        
        // 그 외의 경우는 ID 제거하고 MongoDB가 생성하도록 함
        return rest;
      });
      
      // 서비스 물품 데이터 정리
      const processedServiceData = serviceData.map(item => {
        const { id, ...rest } = item;
        
        if (id && typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id)) {
          return { ...rest, _id: id };
        }
        
        return rest;
      });
      
      // MongoDB에 저장할 데이터 구성
      const estimateData = {
        customerInfo,
        tableData: processedTableData,
        serviceData: processedServiceData, // 서비스 물품 데이터 추가
        paymentInfo,
        calculatedValues,
        notes,
        isContractor // 계약자 여부 추가
      };

      console.log('Sending data to server:', estimateData);

      // API를 통해 데이터 저장 요청 (수정 모드인 경우 PUT, 아닌 경우 POST)
      const url = isEditMode ? `/api/estimates/${estimateId}` : '/api/estimates';
      const method = isEditMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
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

      // 수정 모드인 경우 상세 페이지로 리다이렉트, 아닌 경우 성공 메시지 표시 후 초기화
      if (isEditMode) {
        // 1.5초 후 상세 페이지로 리다이렉트
        setTimeout(() => {
          router.push(`/estimate/${estimateId}`);
        }, 1500);
      } else {
        // 성공 메시지 표시 후 1.5초 후 검색 페이지로 리다이렉트
        setTimeout(() => {
          router.push('/search');
        }, 1500);
      }

    } catch (error) {
      console.error('Error saving estimate:', error);
      setSaveStatus({ 
        loading: false, 
        success: false, 
        error: `저장 오류: ${error.message}` 
      });
      alert(`저장 오류: ${error.message}`);
    }
  };

  // 견적 데이터 불러오기 (수정 모드일 때)
  useEffect(() => {
    // 수정 모드인 경우에만 데이터 로딩
    if (isEditMode) {
      /**
       * 견적 데이터를 API에서 가져오는 비동기 함수
       * ID를 기반으로 기존 견적 데이터를 조회하고 폼에 채움
       */
      const fetchEstimateData = async () => {
        try {
          setIsLoading(true);
          // API에서 견적 데이터 요청
          const response = await fetch(`/api/estimates/${estimateId}`);
          
          if (!response.ok) {
            throw new Error('견적 데이터를 불러오는데 실패했습니다.');
          }
          
          const data = await response.json();
          
          // 견적 데이터가 성공적으로 로드된 경우 폼에 데이터 채우기
          if (data.success && data.estimate) {
            // 견적 데이터 설정 (고객 정보, 상품 목록, 결제 정보 등)
            setCustomerInfo(data.estimate.customerInfo || defaultCustomerInfo);
            
            // 상품 데이터에 고유 ID가 없는 경우를 대비해 클라이언트 ID 생성하여 추가
            const productsWithClientId = (data.estimate.tableData || []).map(item => {
              // MongoDB의 _id가 있으면 그대로 id로 사용, 없으면 새로운 ID 생성
              return {
                ...item,
                id: item._id || item.id || `imported-${Date.now()}-${Math.random()}`
              };
            });
            
            setTableData(productsWithClientId);
            setPaymentInfo(data.estimate.paymentInfo || defaultPaymentInfo);
            setCalculatedValues(data.estimate.calculatedValues || {
              productTotal: 0,
              totalPurchase: 0,
              vatAmount: 0,
              finalPayment: 0
            });
            
            // 참고사항 로드
            setNotes(data.estimate.notes || '');
            
            // 계약자 여부 로드
            setIsContractor(data.estimate.isContractor || false);
            
            // 서비스 물품 데이터 로드
            if (data.estimate.serviceData && Array.isArray(data.estimate.serviceData)) {
              const serviceItemsWithClientId = data.estimate.serviceData.map(item => ({
                ...item,
                id: item._id || item.id || `service-${Date.now()}-${Math.random()}`
              }));
              setServiceData(serviceItemsWithClientId);
            }
            
            // 공임비, 세팅비의 직접 입력 상태 설정
            if (data.estimate.paymentInfo) {
              // 공임비가 기본값 중 하나인지 체크
              const customLaborCost = ![10000, 20000, 30000, 40000, 50000].includes(
                parseInt(data.estimate.paymentInfo.laborCost)
              );
              setIsCustomLaborCost(customLaborCost);
              
              // 세팅비가 기본값 중 하나인지 체크
              const customSetupCost = ![10000, 20000, 30000, 40000, 50000].includes(
                parseInt(data.estimate.paymentInfo.setupCost)
              );
              setIsCustomSetupCost(customSetupCost);
            }
          }
        } catch (error) {
          console.error('견적 데이터 로딩 오류:', error);
          setSaveStatus({
            loading: false,
            success: false,
            error: '견적 데이터를 불러오는데 실패했습니다.'
          });
        } finally {
          // 로딩 상태 종료
          setIsLoading(false);
        }
      };
      
      // 데이터 로딩 함수 호출
      fetchEstimateData();
    }
  }, [estimateId, isEditMode]);

  /**
   * 결제 정보나 상품 목록이 변경될 때마다 계산된 값 업데이트
   * 상품 목록이 변경되거나 결제 관련 설정이 변경될 때 자동으로 금액 다시 계산
   */
  useEffect(() => {
    updateCalculatedValues();
  }, [paymentInfo, tableData]);

  // 오류 상태가 변경될 때 alert로 표시하는 효과
  useEffect(() => {
    if (saveStatus.error) {
      // 페이지 최상단으로 스크롤
      window.scrollTo(0, 0);
    }
  }, [saveStatus.error]);

  // 계약자 체크박스 상태 변경 처리 함수
  const handleContractorChange = (e) => {
    const isChecked = e.target.checked;
    
    // 체크 해제 시 확인 대화상자 표시
    if (!isChecked && isContractor) {
      if (confirm("계약자를 해지 하겠습니까?")) {
        setIsContractor(false);
      }
    } else {
      setIsContractor(isChecked);
    }
  };

  // 서비스 물품 추가 함수
  const handleAddServiceItem = (productName, customQuantity = 1) => {
    // 이미 존재하는지 확인
    const existingItem = serviceData.find(item => item.productName === productName);
    
    if (existingItem) {
      // 이미 존재하면 수량만 증가
      setServiceData(prev => 
        prev.map(item => 
          item.productName === productName 
            ? { ...item, quantity: item.quantity + customQuantity } 
            : item
        )
      );
    } else {
      // 새로운 항목 추가
      setServiceData(prev => [
        ...prev, 
        {
          id: Date.now() + Math.random(),
          productName,
          quantity: customQuantity,
          remarks: ''
        }
      ]);
    }
  };

  // 서비스 물품 삭제 함수
  const handleDeleteServiceItem = (id) => {
    setServiceData(prev => prev.filter(item => item.id !== id));
  };

  // 서비스 물품 비고 변경 함수
  const handleServiceRemarkChange = (id, value) => {
    setServiceData(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, remarks: value } 
          : item
      )
    );
  };

  // 서비스 물품 상품명 변경 함수
  const handleProductNameChange = (id, value) => {
    setServiceData(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, productName: value } 
          : item
      )
    );
  };

  // 서비스 물품 수량 변경 함수
  const handleQuantityChange = (id, value) => {
    const newQuantity = parseInt(value) || 1;
    setServiceData(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, quantity: newQuantity } 
          : item
      )
    );
  };

  // JSX 렌더링 시작
  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* 페이지 제목 영역 */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? '견적서 수정' : '견적서 작성'}
        </h1>
      </div>

      {/* 로딩 중일 때 표시되는 로딩 스피너 */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <svg
            className="animate-spin h-10 w-10 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="ml-2 text-lg text-gray-700">견적 데이터 불러오는 중...</span>
        </div>
      ) : (
        <>
          {/* 성공/오류 메시지 알림 영역 */}
          {saveStatus.success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {isEditMode ? '견적이 성공적으로 수정되었습니다.' : '견적이 성공적으로 저장되었습니다.'}
              {isEditMode && ' 곧 상세 페이지로 이동합니다...'}
            </div>
          )}
          {saveStatus.error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {saveStatus.error}
            </div>
          )}

          {/* 여기부터 기존 폼 코드 */}
          <div className="bg-white rounded-lg shadow p-6">
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
                    PC견적-&gt;견적공유-&gt;견적인쇄 <br />
                    [분류/상품명/수량/카드최저가/현금 최저가/카드최저가 합계/현금최저가 합계]
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
                    PC견적-&gt;견적갭쳐 <br />
                    [번호/분류/이미지/제품명/판매가/수량/합계]
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
                  <div className="flex items-center gap-2">
                    <textarea
                name="price"
                value={formData.price}
                onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 resize-none overflow-hidden min-h-[42px]"
                required
                placeholder="현금가를 입력하세요"
                      rows={1}
                    />
                    <button
                      type="button"
                      onClick={multiplyPriceByQuantity}
                      className="bg-blue-600 text-white px-2 py-2 rounded-md hover:bg-blue-700 whitespace-nowrap text-sm"
                    >
                      수량 곱하기
                    </button>
                  </div>
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
                    공임비(제작/조립비)
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
                    세팅비(SW)
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    배송+설비 비용(최종결재금액 포함X)
                  </label>
                  <div className="flex flex-col items-start gap-2">
                    <input
                      type="number"
                      name="shippingCost"
                      value={paymentInfo.shippingCost}
                      onChange={handlePaymentInfoChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="배송+설비 비용를 입력하세요"
                    />
                    <span className="text-sm text-gray-700 whitespace-nowrap">
                      {numberToKorean(parseInt(paymentInfo.shippingCost) || 0)}
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
                    onClick={() => setPaymentInfo(prev => ({ ...prev, roundingType: '100down' }))}
                    className={`px-3 py-2 rounded-md text-sm ${
                      paymentInfo.roundingType === '100down'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    100 버림
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentInfo(prev => ({ ...prev, roundingType: '1000down' }))}
                    className={`px-3 py-2 rounded-md text-sm ${
                      paymentInfo.roundingType === '1000down'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    1000 버림
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentInfo(prev => ({ ...prev, roundingType: '100up' }))}
                    className={`px-3 py-2 rounded-md text-sm ${
                      paymentInfo.roundingType === '100up'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    100 올림
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentInfo(prev => ({ ...prev, roundingType: '1000up' }))}
                    className={`px-3 py-2 rounded-md text-sm ${
                      paymentInfo.roundingType === '1000up'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    1000 올림
                  </button>
                  {paymentInfo.roundingType && (
                    <button
                      type="button"
                      onClick={() => setPaymentInfo(prev => ({ ...prev, roundingType: '' }))}
                      className="px-3 py-2 rounded-md text-sm bg-gray-200 text-gray-700 hover:bg-gray-300"
                    >
                      버림/올림 취소
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
              </div>
            </div>
          </div>

          {/* 서비스 물품 섹션 */}
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">서비스 물품</h2>
            
            {/* 서비스 물품 선택 버튼 */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleAddServiceItem('마우스')}
                  className="px-4 py-2 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200"
                >
                  마우스
                </button>
                <button
                  type="button"
                  onClick={() => handleAddServiceItem('마우스패드')}
                  className="px-4 py-2 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200"
                >
                  마우스패드
                </button>
                <button
                  type="button"
                  onClick={() => handleAddServiceItem('키보드')}
                  className="px-4 py-2 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200"
                >
                  키보드
                </button>
                <button
                  type="button"
                  onClick={() => handleAddServiceItem('스피커')}
                  className="px-4 py-2 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200"
                >
                  스피커
                </button>
              </div>
            </div>
            
            {/* 서비스 물품 직접 입력 폼 */}
            <div className="mb-4 p-4 border border-gray-200 rounded-md bg-gray-50">
              <h3 className="text-md font-medium mb-3">직접 입력</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">상품명</label>
                  <input
                    type="text"
                    id="custom-product-name"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="상품명 입력"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">개수</label>
                  <input
                    type="number"
                    id="custom-quantity"
                    min="1"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="개수 입력"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => {
                      const productName = document.getElementById('custom-product-name').value;
                      const quantity = parseInt(document.getElementById('custom-quantity').value) || 1;
                      
                      if (productName.trim()) {
                        // 새 서비스 물품 추가
                        handleAddServiceItem(productName, quantity);
                        
                        // 입력 필드 초기화
                        document.getElementById('custom-product-name').value = '';
                        document.getElementById('custom-quantity').value = '';
                      } else {
                        alert('상품명을 입력해주세요.');
                      }
                    }}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    추가하기
                  </button>
                </div>
              </div>
            </div>
            
            {/* 서비스 물품 테이블 */}
            <div className="max-w-full">
              <table className="w-full table-fixed divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="w-[10%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      작업
                    </th>
                    <th className="w-[40%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상품명
                    </th>
                    <th className="w-[15%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      개수
                    </th>
                    <th className="w-[35%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      비고
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {serviceData.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-4 py-4 text-center text-sm text-gray-500">
                        서비스 물품이 없습니다. 위 버튼을 클릭하여 추가하세요.
                      </td>
                    </tr>
                  ) : (
                    serviceData.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => handleDeleteServiceItem(item.id)}
                            className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                          >
                            삭제
                          </button>
                        </td>
                        <td className="px-4 py-4">
                          <input
                            type="text"
                            value={item.productName}
                            onChange={(e) => handleProductNameChange(item.id, e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <input
                            type="text"
                            value={item.remarks}
                            onChange={(e) => handleServiceRemarkChange(item.id, e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="비고를 입력하세요"
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 참고사항 섹션 */}
          <div className="mt-6 bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              참고사항
            </h2>
            <div className="text-sm text-gray-500 mb-3">
              * 참고사항은 내부용으로 견적서에는 표시되지 않습니다.
            </div>
            <textarea
              value={notes}
              onChange={handleNotesChange}
              className="w-full h-32 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="견적에 대한 참고사항을 입력하세요. (선택사항)"
            ></textarea>
          </div>
        </>
      )}

      {/* 저장하기/수정하기 버튼 영역 */}
      <div className="mt-8 flex justify-center items-center gap-4">
        {/* 계약자 체크박스 */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="contractor-checkbox"
            checked={isContractor}
            onChange={handleContractorChange}
            className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <label htmlFor="contractor-checkbox" className="ml-2 text-gray-700 font-medium">
            계약자
          </label>
        </div>

        <button
          type="button"
          onClick={saveEstimate}
          disabled={saveStatus.loading}
          className={`px-6 py-3 rounded-md text-white text-lg ${
            saveStatus.loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {saveStatus.loading ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              저장중...
            </span>
          ) : isEditMode ? (
            '수정하기'
          ) : (
            '저장하기'
          )}
        </button>
      </div>
    </div>
  );
}
  