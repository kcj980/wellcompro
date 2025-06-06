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
import { getKoreanDate, formatDateToKoreanDate } from '../utils/dateUtils';

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
    category: '', // 분류
    productName: '', // 상품명
    quantity: '', // 수량
    price: '', // 현금가
    productCode: '', // 상품코드
    distributor: '', // 총판
    reconfirm: '', // 재조사
    remarks: '', // 비고
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
   * purpose: 용도
   * asCondition: AS 조건
   * os: 운영체제 (win10, win11 등)
   * manager: 견적 담당자
   */
  const [customerInfo, setCustomerInfo] = useState({
    name: '', // 이름
    phone: '', // 핸드폰번호
    pcNumber: '', // PC번호
    contractType: '일반회원', // 계약구분
    saleType: '부품 조립형', // 판매형태
    purchaseType: '해당없음', // 구입형태
    purchaseTypeName: '', // 지인 이름
    purpose: '', // 용도
    asCondition: '본인입고조건', // AS조건
    os: 'win11', // 운영체계
    manager: '김선식', // 견적담당
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
  const [isCustomPurpose, setIsCustomPurpose] = useState(false);
  const [isCustomOs, setIsCustomOs] = useState(false);
  const [isCustomManager, setIsCustomManager] = useState(false);
  const [isCustomLaborCost, setIsCustomLaborCost] = useState(false);
  const [isCustomSetupCost, setIsCustomSetupCost] = useState(false);
  const [isCustomWarrantyFee, setIsCustomWarrantyFee] = useState(false); // 보증관리비 직접 입력 모드 상태
  const [isCustomTuningCost, setIsCustomTuningCost] = useState(false);
  const [isCustomPaymentMethod, setIsCustomPaymentMethod] = useState(false); // 결제 방법 직접 입력 모드 상태

  /**
   * 결제 정보를 관리하는 상태
   * laborCost: 공임비 (기술료)
   * setupCost: 세팅비 (OS 설치, 초기 설정 등)
   * warrantyFee: 보증관리비 (warranty fee)
   * tuningCost: 튜닝금액
   * discount: 할인 금액
   * deposit: 계약금 (선수금)
   * includeVat: 부가가치세(VAT) 포함 여부
   * vatRate: VAT 비율 (기본 10%)
   * roundingType: 금액 버림 단위 ('100': 100원 단위, '1000': 1000원 단위)
   * paymentMethod: 결제 방법 (현금, 카드 등)
   */
  const [paymentInfo, setPaymentInfo] = useState({
    laborCost: 0, // 공임비
    setupCost: 0, // 세팅비
    warrantyFee: 0, // 보증관리비
    tuningCost: 0, // 튜닝금액
    discount: 0, // 할인
    deposit: 0, // 계약금
    includeVat: true, // VAT 포함 여부 (기본 활성화)
    vatRate: 10, // VAT 비율 (기본 10%)
    roundingType: '', // 버림/올림 타입 (기본 없음)
    paymentMethod: '카드', // 결제 방법 (기본 카드)
    shippingCost: 0, // 택배비
    releaseDate: '', // 출고일자 (기본값: 없음)
  });

  /**
   * 계산된 금액 값들을 저장하는 상태
   * productTotal: 상품/부품의 합계 금액
   * totalPurchase: 총 구입 금액 (상품 합계 + 공임비 + 세팅비 + 튜닝금액 - 할인)
   * vatAmount: VAT 금액
   * finalPayment: 최종 결제 금액 (총 구입 금액 + VAT, 버림 적용)
   */
  const [calculatedValues, setCalculatedValues] = useState({
    productTotal: 0, // 상품/부품 합 금액
    totalPurchase: 0, // 총 구입 금액
    vatAmount: 0, // VAT 금액
    finalPayment: 0, // 최종 결제 금액
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
    error: null,
  });

  // 수정 모드일 경우 데이터 로딩 중임을 표시하는 상태
  const [isLoading, setIsLoading] = useState(isEditMode);

  // 참고사항을 관리하는 상태
  const [notes, setNotes] = useState('');

  // 견적설명을 관리하는 상태
  const [estimateDescription, setEstimateDescription] = useState('');

  // 견적설명 textarea 표시 여부를 관리하는 상태
  const [showDescriptionTextarea, setShowDescriptionTextarea] = useState(false);

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
  const numberToKorean = number => {
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
  const handleCustomerInfoChange = e => {
    const { name, value } = e.target;

    // 핸드폰 번호 자동 포맷팅 기능
    if (name === 'phone') {
      // 입력된 값에 이미 하이픈('-')이 있는지 확인
      if (value.includes('-')) {
        // 하이픈이 이미 있으면 그대로 저장
        setCustomerInfo(prev => ({
          ...prev,
          [name]: value,
        }));
      } else {
        // 숫자만 추출
        const numbersOnly = value.replace(/[^0-9]/g, '');

        // 11자리 숫자인 경우 자동으로 하이픈 추가
        if (numbersOnly.length === 11) {
          const formattedNumber = `${numbersOnly.substring(0, 3)}-${numbersOnly.substring(3, 7)}-${numbersOnly.substring(7, 11)}`;
          setCustomerInfo(prev => ({
            ...prev,
            [name]: formattedNumber,
          }));
        } else {
          // 11자리가 아닌 경우 그대로 저장
          setCustomerInfo(prev => ({
            ...prev,
            [name]: numbersOnly,
          }));
        }
      }
    } else {
      // 핸드폰 번호가 아닌 다른 필드는 그대로 처리
      setCustomerInfo(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // 판매 형태 버튼 클릭 시 호출되는 함수
  const handleSaleTypeSelect = value => {
    if (value === '직접입력') {
      setIsCustomSaleType(true);
      setCustomerInfo(prev => ({
        ...prev,
        saleType: '',
      }));
    } else {
      setIsCustomSaleType(false);
      setCustomerInfo(prev => ({
        ...prev,
        saleType: value,
      }));
    }
  };

  // 계약 구분 버튼 클릭 시 호출되는 함수
  const handleContractTypeSelect = value => {
    if (value === '직접입력') {
      setIsCustomContractType(true);
      setCustomerInfo(prev => ({
        ...prev,
        contractType: '',
      }));
    } else {
      setIsCustomContractType(false);
      setCustomerInfo(prev => ({
        ...prev,
        contractType: value,
      }));
    }
  };

  // AS 조건 버튼 클릭 시 호출되는 함수
  const handleAsConditionSelect = value => {
    if (value === '직접입력') {
      setIsCustomAsCondition(true);
      setCustomerInfo(prev => ({
        ...prev,
        asCondition: '',
      }));
    } else {
      setIsCustomAsCondition(false);
      setCustomerInfo(prev => ({
        ...prev,
        asCondition: value,
      }));
    }
  };

  // 용도 버튼 클릭 시 호출되는 함수
  const handlePurposeSelect = value => {
    if (value === '직접입력') {
      setIsCustomPurpose(true);
      setCustomerInfo(prev => ({
        ...prev,
        purpose: '',
      }));
    } else {
      setIsCustomPurpose(false);
      setCustomerInfo(prev => ({
        ...prev,
        purpose: value,
      }));
    }
  };

  // 구입 형태 버튼 클릭 시 호출되는 함수
  const handlePurchaseTypeSelect = value => {
    if (value === '직접입력') {
      setIsCustomPurchaseType(true);
      // 직접입력 선택 시 purchaseType 값을 빈 문자열로 설정하고 purchaseTypeName도 초기화
      setCustomerInfo({
        ...customerInfo,
        purchaseType: '', // 빈 문자열로 설정하여 지인/기존회원 입력 필드가 표시되지 않도록 함
        purchaseTypeName: '', // purchaseTypeName도 초기화
      });
    } else {
      // 직접입력이 아닌 다른 옵션을 선택할 때 isCustomPurchaseType을 false로 설정
      setIsCustomPurchaseType(false);

      setCustomerInfo({
        ...customerInfo,
        purchaseType: value,
        // 새로운 구입형태를 선택할 때 purchaseTypeName 초기화
        purchaseTypeName:
          value === '지인' || value === '기존회원' ? customerInfo.purchaseTypeName : '',
      });
    }
  };

  // 운영체제 버튼 클릭 시 호출되는 함수
  const handleOsSelect = value => {
    if (value === '직접입력') {
      setIsCustomOs(true);
      setCustomerInfo(prev => ({
        ...prev,
        os: '',
      }));
    } else {
      setIsCustomOs(false);
      setCustomerInfo(prev => ({
        ...prev,
        os: value,
      }));
    }
  };

  // 담당자 버튼 클릭 시 호출되는 함수
  const handleManagerSelect = value => {
    if (value === '직접입력') {
      setIsCustomManager(true);
      // 기존 값 유지
    } else {
      setCustomerInfo(prev => ({
        ...prev,
        manager: value,
      }));
      setIsCustomManager(false); // 직접 입력 모드 해제
    }
  };

  // 상품 정보 입력 필드 변경 시 호출되는 함수
  const handleChange = e => {
    const { name, value } = e.target;

    // 현금가(price) 필드인 경우 콤마 포맷팅 적용
    if (name === 'price') {
      // 입력값에서 콤마(,) 제거
      const numericValue = value.replace(/,/g, '');

      // 숫자와 음수 부호(-)만 입력되었는지 확인 (빈 문자열 허용)
      if (numericValue === '' || /^-?\d*$/.test(numericValue)) {
        // 음수 부호(-)만 있는 경우 그대로 유지
        let formattedValue;
        if (numericValue === '-') {
          formattedValue = '-';
        } else {
          // 숫자 형식으로 변환하여 3자리마다 콤마 추가 (화면 표시용)
          formattedValue = numericValue === '' ? '' : Number(numericValue).toLocaleString();
        }

        // 화면에 표시할 콤마가 포함된 문자열 저장
        setFormData(prev => ({
          ...prev,
          [name]: formattedValue,
        }));
      }
    } else {
      // 다른 필드는 그대로 처리
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }

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
    // 입력된 현금가와 수량 가져오기 (현금가에서 콤마 제거 후 숫자로 변환)
    const priceStr = formData.price.replace(/,/g, '');
    // '-'만 있는 경우 0으로 처리하여 계산 오류 방지
    const price = priceStr === '-' ? 0 : Number(priceStr) || 0;
    const quantity = Number(formData.quantity) || 0;

    // 수량이 0인 경우 계산하지 않음
    if (quantity === 0) {
      alert('수량이 입력되지 않았거나 0입니다.');
      return;
    }

    // 현금가와 수량을 곱한 결과 계산
    const multipliedPrice = price * quantity;

    // 계산된 값으로 현금가 업데이트 (콤마 포맷팅 적용)
    const formattedPrice = multipliedPrice.toLocaleString();

    setFormData(prev => ({
      ...prev,
      price: formattedPrice,
    }));
  };

  // 다나와 일괄 입력 텍스트가 변경될 때 호출되는 함수
  const handleBulkDataChange = e => {
    setBulkData(e.target.value);
  };

  /**
   * 다나와 형식 데이터를 처리하고 테이블에 추가하는 함수
   * 다나와 웹사이트에서 복사한 데이터를 파싱해서 테이블에 추가
   * @param {Event} e - 이벤트 객체
   */
  const handleDanawaSubmit = e => {
    e.preventDefault();
    // 줄바꿈으로 데이터 분리 후 빈 줄 제거
    const lines = bulkData.split('\n').filter(line => line.trim());

    // 각 줄을 파싱하여 상품 데이터 생성
    const newData = lines.map(line => {
      // 탭으로 구분된 데이터를 분리 (분류, 상품명, 수량, 카드최저가, 현금최저가, 카드최저가 합계, 현금최저가 합계)
      const [category, productName, quantity, cardPrice, cashPrice, cardTotal, cashTotal] =
        line.split('\t');

      // SSD 카테고리인 경우 "SSD/M.2 NVMe"로 변경
      let processedCategory = category || '';
      if (processedCategory === 'SSD') {
        processedCategory = 'SSD/M.2';
      }

      // 현금가에서 숫자만 추출하고 콤마 포맷팅 적용
      const numericPrice = cashTotal ? cashTotal.replace(/[^0-9]/g, '') : '';
      const formattedPrice = numericPrice ? Number(numericPrice).toLocaleString() : '';

      return {
        id: Date.now() + Math.random(), // 고유 ID 생성
        category: processedCategory,
        productName: productName || '',
        quantity: quantity || '',
        price: formattedPrice, // 콤마 포맷팅이 적용된 현금가
        productCode: '',
        distributor: '',
        reconfirm: '',
        remarks: '',
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
  const handleQuoteKingChange = e => {
    setQuoteKingData(e.target.value);
  };

  /**
   * 견적왕 형식 데이터를 처리하고 테이블에 추가하는 함수
   * 견적왕 프로그램에서 복사한 데이터를 파싱해서 테이블에 추가
   * @param {Event} e - 이벤트 객체
   */
  const handleQuoteKingSubmit = e => {
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
        const numericPrice = lines[i + 1].replace(/[^0-9]/g, '');
        // 콤마 포맷팅 적용
        const formattedPrice = numericPrice ? Number(numericPrice).toLocaleString() : '';

        // 세 번째 줄에서 수량 추출
        const quantity = lines[i + 2];

        // SSD 카테고리인 경우 "SSD/M.2 NVMe"로 변경
        let processedCategory = category;
        if (processedCategory === 'SSD') {
          processedCategory = 'SSD/M.2';
        }

        // 상품 데이터 생성
        newData.push({
          id: Date.now() + Math.random(), // 고유 ID 생성
          category: processedCategory,
          productName: productName,
          quantity: quantity,
          price: formattedPrice, // 콤마 포맷팅이 적용된 현금가
          productCode: '',
          distributor: '',
          reconfirm: '',
          remarks: '',
        });
      }
    }

    // 기존 테이블 데이터에 새 데이터 추가
    setTableData(prev => [...prev, ...newData]);
    // 입력 필드 초기화
    setQuoteKingData('');
  };

  // 테이블에서 항목 삭제 시 호출되는 함수
  const handleDelete = id => {
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
  const handleEdit = row => {
    // 수정할 항목의 ID 저장
    setEditingId(row.id);

    // 현재 항목 데이터로 폼 데이터 설정
    setFormData({
      category: row.category,
      productName: row.productName,
      quantity: row.quantity,
      price: row.price, // 콤마 포맷팅이 적용된 현금가
      productCode: row.productCode,
      distributor: row.distributor,
      reconfirm: row.reconfirm,
      remarks: row.remarks,
    });

    // 상품 정보 입력창이 보이도록 설정
    setShowForm(true);
  };

  /**
   * 상품 정보 폼 제출 시 호출되는 함수 (신규 추가 또는 수정)
   * 수정 모드이면 기존 항목 업데이트, 아니면 새 항목 추가
   * @param {Event} e - 이벤트 객체
   */
  const handleSubmit = e => {
    e.preventDefault();

    // 현금가는 이미 콤마 포맷팅이 적용되어 있으므로 그대로 사용
    const dataToSubmit = formData;

    if (editingId) {
      // 수정 모드: 기존 항목 업데이트
      setTableData(prev =>
        prev.map(item => (item.id === editingId ? { ...dataToSubmit, id: editingId } : item))
      );
      // 수정 모드 종료
      setEditingId(null);
    } else {
      // 새로운 항목 추가 모드
      // 임시 ID 생성 - 'temp-' 접두사를 붙여 MongoDB ObjectId와 구분되게 함
      setTableData(prev => [...prev, { ...dataToSubmit, id: `temp-${Date.now()}` }]);
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
      remarks: '',
    });

    // textarea 높이 초기화
    document.querySelectorAll('textarea').forEach(textarea => {
      textarea.style.height = '42px'; // min-h-[42px]와 동일한 높이로 초기화
    });
  };

  /**
   * 상품/부품의 총 금액을 계산하는 함수
   * 테이블에 있는 모든 상품의 현금가 합계 계산
   * @returns {number} 상품 합계 금액
   */
  const calculateProductTotal = () => {
    // 모든 상품의 현금가를 합산 (콤마 제거 후 숫자로 변환)
    const total = tableData.reduce((sum, item) => {
      // 현금가에서 콤마 제거 후 숫자로 변환
      const priceStr = String(item.price).replace(/,/g, '');
      // '-'만 있는 경우 0으로 처리
      const price = priceStr === '-' ? 0 : Number(priceStr) || 0;
      return sum + price; // 수량을 곱하지 않고 현금가만 더함 (이미 곱해진 금액으로 가정)
    }, 0);
    return total;
  };

  /**
   * 버림 적용 시 버려진 값을 계산하는 함수
   * @param {string} roundingType - 버림 유형 ('100down', '1000down', '10000down')
   * @param {number} total - 버림 적용 전 금액
   * @returns {number} 버려진 금액
   */
  const calculateDiscardedAmount = (roundingType, total) => {
    let roundedTotal = total;

    if (roundingType === '100down') {
      roundedTotal = Math.floor(total / 100) * 100;
      return total - roundedTotal;
    } else if (roundingType === '1000down') {
      roundedTotal = Math.floor(total / 1000) * 1000;
      return total - roundedTotal;
    } else if (roundingType === '10000down') {
      roundedTotal = Math.floor(total / 10000) * 10000;
      return total - roundedTotal;
    }

    return 0;
  };

  /**
   * 총 구입 금액 계산 함수
   * 상품 합계 + 공임비 + 세팅비 + 보증관리비 + 튜닝금액 - 할인
   * @returns {number} 총 구입 금액
   */
  const calculateTotalPurchase = () => {
    const productTotal = calculateProductTotal();
    // 숫자 값 필드 사용 (없으면 기존 방식으로 fallback)
    const laborCost =
      paymentInfo.laborCost !== undefined
        ? paymentInfo.laborCost
        : Number(paymentInfo.laborCost) || 0;
    const setupCost =
      paymentInfo.setupCost !== undefined
        ? paymentInfo.setupCost
        : Number(paymentInfo.setupCost) || 0;
    const warrantyFee =
      paymentInfo.warrantyFee !== undefined
        ? paymentInfo.warrantyFee
        : Number(paymentInfo.warrantyFee) || 0;
    const tuningCost =
      paymentInfo.tuningCost !== undefined
        ? paymentInfo.tuningCost
        : Number(paymentInfo.tuningCost) || 0;
    const discount =
      paymentInfo.discount !== undefined ? paymentInfo.discount : Number(paymentInfo.discount) || 0;

    let total = productTotal + laborCost + setupCost + warrantyFee + tuningCost - discount;

    // 버림 적용 (100원, 1000원 또는 10000원 단위)
    if (paymentInfo.roundingType === '100down') {
      total = Math.floor(total / 100) * 100;
    } else if (paymentInfo.roundingType === '1000down') {
      total = Math.floor(total / 1000) * 1000;
    } else if (paymentInfo.roundingType === '10000down') {
      total = Math.floor(total / 10000) * 10000;
    }

    return total;
  };

  /**
   * VAT 금액 계산 함수
   * includeVat가 true일 경우 vatRate에 따라 VAT 계산
   * @param {number} totalPurchase - VAT를 계산할 기준 금액
   * @returns {number} 계산된 VAT 금액
   */
  const calculateVatAmount = totalPurchase => {
    // VAT 포함 옵션이 비활성화된 경우 0 반환
    if (!paymentInfo.includeVat) return 0;
    // VAT 계산 (총 구입 금액 * VAT 비율 / 100)
    const vatRate =
      paymentInfo.vatRate !== undefined ? paymentInfo.vatRate : Number(paymentInfo.vatRate) || 0;
    return Math.floor((totalPurchase * vatRate) / 100);
  };

  /**
   * 최종 결제 금액 계산 함수 (VAT 적용)
   * 총 구입 금액에 VAT를 더함
   * @returns {number} 최종 결제 금액
   */
  const calculateFinalPayment = () => {
    let total = calculateTotalPurchase();
    const vatAmount = calculateVatAmount(total);
    total += vatAmount;

    // 버림 로직은 calculateTotalPurchase로 이동

    return total;
  };

  // 결제 정보 변경 시 호출되는 함수
  const handlePaymentInfoChange = e => {
    const { name, value, type, checked } = e.target;
    let processedValue;

    // 체크박스의 경우 checked 속성 사용
    if (type === 'checkbox') {
      processedValue = checked;

      // VAT 포함 체크박스가 변경될 때 결제방법 자동 설정
      if (name === 'includeVat') {
        setPaymentInfo(prev => ({
          ...prev,
          [name]: processedValue,
          // 체크하면 카드, 체크 해제하면 현금으로 설정
          paymentMethod: checked ? '카드' : '현금',
        }));
        return; // 여기서 함수 종료 (아래 코드 실행 방지)
      }
    }
    // 금액 입력 필드의 경우 콤마 제거 후 숫자만 유지
    else if (
      [
        'laborCost',
        'setupCost',
        'warrantyFee',
        'tuningCost',
        'discount',
        'deposit',
        'shippingCost',
      ].includes(name)
    ) {
      // 콤마 제거하고 숫자만 추출
      const numericValue = value.replace(/,/g, '').replace(/[^0-9]/g, '');

      // 빈 문자열이거나 유효한 숫자가 아니면 0으로 설정
      processedValue = numericValue === '' ? 0 : parseInt(numericValue, 10);
    } else {
      processedValue = value;
    }

    // 상태 업데이트
    setPaymentInfo(prev => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  // 참고사항 변경 시 호출되는 함수
  const handleNotesChange = e => {
    setNotes(e.target.value);
  };

  // 견적설명 변경 핸들러
  const handleDescriptionChange = e => {
    setEstimateDescription(e.target.value);
  };

  // 견적설명 textarea 표시/숨김 토글 핸들러
  const toggleDescriptionTextarea = () => {
    setShowDescriptionTextarea(prev => !prev);
  };

  const handleLaborCostSelect = value => {
    setPaymentInfo(prev => ({
      ...prev,
      laborCost: value, // 숫자 값으로 저장
    }));
    // 직접 입력 모드 해제
    setIsCustomLaborCost(false);
  };

  // 세팅비 선택 버튼 클릭 시 호출되는 함수
  const handleSetupCostSelect = value => {
    setPaymentInfo(prev => ({
      ...prev,
      setupCost: value, // 숫자 값으로 저장
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
      finalPayment,
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
          error: '고객 이름을 입력해주세요.',
        });
        //alert('고객 이름을 입력해주세요.');
        return;
      }

      if (tableData.length === 0) {
        setSaveStatus({
          loading: false,
          success: false,
          error: '최소 하나 이상의 상품을 추가해주세요.',
        });
        //alert('최소 하나 이상의 상품을 추가해주세요.');
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
        paymentInfo: {
          ...paymentInfo,
          // 문자열로 저장된 금액 필드들을 숫자로 변환
          laborCost: Number(paymentInfo.laborCost || 0),
          setupCost: Number(paymentInfo.setupCost || 0),
          warrantyFee: Number(paymentInfo.warrantyFee || 0),
          discount: Number(paymentInfo.discount || 0),
          deposit: Number(paymentInfo.deposit || 0),
          shippingCost: Number(paymentInfo.shippingCost || 0),
          vatRate: Number(paymentInfo.vatRate || 0),
          // includeVat는 반드시 불리언 값으로 저장
          includeVat: Boolean(paymentInfo.includeVat),
        },
        calculatedValues,
        notes,
        estimateDescription, // 견적설명 추가
        isContractor, // 계약자 여부 추가
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
        cache: 'no-store',
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
        error: null,
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
        error: `저장 오류: ${error.message}`,
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

            // 직접입력 필드 상태 설정
            // 계약구분 직접입력 확인
            if (
              data.estimate.customerInfo?.contractType &&
              data.estimate.customerInfo.contractType !== '일반회원'
            ) {
              setIsCustomContractType(true);
            }

            // 판매형태 직접입력 확인
            const defaultSaleTypes = ['부품 조립형', '본인설치', '해당없음'];
            if (
              data.estimate.customerInfo?.saleType &&
              !defaultSaleTypes.includes(data.estimate.customerInfo.saleType)
            ) {
              setIsCustomSaleType(true);
            }

            // 구입형태 직접입력 확인
            const defaultPurchaseTypes = ['지인', '기존회원', '해당없음'];
            if (
              data.estimate.customerInfo?.purchaseType &&
              !defaultPurchaseTypes.includes(data.estimate.customerInfo.purchaseType)
            ) {
              setIsCustomPurchaseType(true);
            }

            // AS조건 직접입력 확인
            if (
              data.estimate.customerInfo?.asCondition &&
              data.estimate.customerInfo.asCondition !== '본인입고조건'
            ) {
              setIsCustomAsCondition(true);
            }

            // 용도 직접입력 확인
            const defaultPurposes = ['게임', '문서작업', '영상/이미지편집'];
            if (
              data.estimate.customerInfo?.purpose &&
              !defaultPurposes.includes(data.estimate.customerInfo.purpose)
            ) {
              setIsCustomPurpose(true);
            }

            // 운영체계 직접입력 확인
            const defaultOsList = ['win10', 'win11'];
            if (
              data.estimate.customerInfo?.os &&
              !defaultOsList.includes(data.estimate.customerInfo.os)
            ) {
              setIsCustomOs(true);
            }

            // 견적담당 직접입력 확인
            const defaultManagers = ['김선식', '소성옥'];
            if (
              data.estimate.customerInfo?.manager &&
              !defaultManagers.includes(data.estimate.customerInfo.manager)
            ) {
              setIsCustomManager(true);
            }

            // 상품 데이터에 고유 ID가 없는 경우를 대비해 클라이언트 ID 생성하여 추가
            const productsWithClientId = (data.estimate.tableData || []).map(item => {
              // 현금가에 콤마 포맷팅 적용
              const price = item.price
                ? Number(String(item.price).replace(/,/g, '')).toLocaleString()
                : '';

              // MongoDB의 _id가 있으면 그대로 id로 사용, 없으면 새로운 ID 생성
              return {
                ...item,
                id: item._id || item.id || `imported-${Date.now()}-${Math.random()}`,
                price: price, // 콤마 포맷팅이 적용된 현금가
              };
            });

            setTableData(productsWithClientId);

            // paymentInfo 설정 - releaseDate가 없으면 오늘 날짜로 설정
            const estimatePaymentInfo = data.estimate.paymentInfo || {};

            // MongoDB에서 가져온 날짜를 YYYY-MM-DD 형식으로 변환
            let formattedReleaseDate = '';
            if (estimatePaymentInfo.releaseDate) {
              const date = new Date(estimatePaymentInfo.releaseDate);
              formattedReleaseDate = formatDateToKoreanDate(date);
            }

            setPaymentInfo({
              ...estimatePaymentInfo,
              releaseDate: formattedReleaseDate,
            });

            // 결제 방법이 '카드' 또는 '현금'인 경우 직접 입력 모드가 아니도록 설정
            if (
              estimatePaymentInfo.paymentMethod === '카드' ||
              estimatePaymentInfo.paymentMethod === '현금'
            ) {
              setIsCustomPaymentMethod(false);
            } else if (estimatePaymentInfo.paymentMethod) {
              // 결제 방법이 있지만 '카드'나 '현금'이 아닌 경우 직접 입력 모드로 설정
              setIsCustomPaymentMethod(true);
            }

            setCalculatedValues(
              data.estimate.calculatedValues || {
                productTotal: 0,
                totalPurchase: 0,
                vatAmount: 0,
                finalPayment: 0,
              }
            );

            // 참고사항 로드
            setNotes(data.estimate.notes || '');

            // 계약자 여부 로드
            setIsContractor(data.estimate.isContractor || false);

            // 서비스 물품 데이터 로드
            if (data.estimate.serviceData && Array.isArray(data.estimate.serviceData)) {
              const serviceItemsWithClientId = data.estimate.serviceData.map(item => ({
                ...item,
                id: item._id || item.id || `service-${Date.now()}-${Math.random()}`,
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

              // 보증관리비가 기본값(3만원, 5만원) 중 하나인지 체크
              const customWarrantyFee = ![30000, 50000].includes(
                parseInt(data.estimate.paymentInfo.warrantyFee)
              );
              setIsCustomWarrantyFee(customWarrantyFee);

              // 튜닝금액이 있으면 튜닝 모드 활성화
              if (
                data.estimate.paymentInfo.tuningCost &&
                data.estimate.paymentInfo.tuningCost > 0
              ) {
                setIsCustomTuningCost(true);
              }
            }

            // 참고사항 설정
            setNotes(data.estimate.notes || '');

            // 견적설명 설정
            setEstimateDescription(data.estimate.estimateDescription || '');
          }
        } catch (error) {
          console.error('견적 데이터 로딩 오류:', error);
          setSaveStatus({
            loading: false,
            success: false,
            error: '견적 데이터를 불러오는데 실패했습니다.',
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

  // paymentInfo 또는 tableData가 변경될 때마다 계산된 금액 업데이트
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
  const handleContractorChange = e => {
    const isChecked = e.target.checked;

    // 체크 해제 시 확인 대화상자 표시
    if (!isChecked && isContractor) {
      if (confirm('계약자를 해지 하겠습니까?')) {
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
          remarks: '',
        },
      ]);
    }
  };

  // 서비스 물품 삭제 함수
  const handleDeleteServiceItem = id => {
    setServiceData(prev => prev.filter(item => item.id !== id));
  };

  // 서비스 물품 비고 변경 함수
  const handleServiceRemarkChange = (id, value) => {
    setServiceData(prev => prev.map(item => (item.id === id ? { ...item, remarks: value } : item)));
  };

  // 서비스 물품 상품명 변경 함수
  const handleProductNameChange = (id, value) => {
    setServiceData(prev =>
      prev.map(item => (item.id === id ? { ...item, productName: value } : item))
    );
  };

  // 서비스 물품 수량 변경 함수
  const handleQuantityChange = (id, value) => {
    const newQuantity = parseInt(value) || 1;
    setServiceData(prev =>
      prev.map(item => (item.id === id ? { ...item, quantity: newQuantity } : item))
    );
  };

  // 결제 방법 선택 핸들러
  const handlePaymentMethodSelect = value => {
    setIsCustomPaymentMethod(value === 'custom');
    if (value !== 'custom') {
      setPaymentInfo(prev => ({ ...prev, paymentMethod: value }));
    } else {
      setPaymentInfo(prev => ({ ...prev, paymentMethod: '' }));
    }
  };

  // 컴포넌트 마운트 시 PC 번호 디폴트 값 설정
  useEffect(() => {
    // 수정 모드가 아닐 때만 디폴트 값 설정
    if (!isEditMode) {
      const now = new Date();
      const year = now.getFullYear().toString().slice(-2); // 년도의 마지막 두 자리
      const month = (now.getMonth() + 1).toString().padStart(2, '0'); // 월 (01-12 형식)
      const defaultPcNumber = `${year}${month}PC`;

      setCustomerInfo(prev => ({
        ...prev,
        pcNumber: defaultPcNumber,
      }));
    }
  }, [isEditMode]); // 수정 모드 변경 시에만 실행

  /**
   * 테이블의 모든 상품 데이터를 삭제하는 함수
   * 사용자에게 확인 대화상자를 표시하고 확인 시 모든 데이터 삭제
   */
  const handleDeleteAllProducts = () => {
    // 테이블에 데이터가 없으면 경고 메시지 표시
    if (tableData.length === 0) {
      alert('삭제할 상품 데이터가 없습니다.');
      return;
    }

    // 삭제 확인 대화상자 표시
    if (window.confirm('모든 상품 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      // 테이블 데이터 초기화
      setTableData([]);
      console.log('모든 상품 데이터가 삭제되었습니다.');
    }
  };

  // 직접입력 버튼 클릭 핸들러 분리
  const handleCustomPurchaseType = () => {
    handlePurchaseTypeSelect('직접입력');
  };

  // 다나와 크롬 확장 프로그램에서 데이터 수신을 위한 이벤트 리스너
  useEffect(() => {
    // 다나와 확장 프로그램에서 전송된 데이터를 처리하는 함수
    const handleDanawaExtensionData = event => {
      // 메시지 타입 확인
      if (event.data && event.data.type === 'DANAWA_ESTIMATE_DATA') {
        const products = event.data.products;

        if (products && products.length > 0) {
          // 다나와 확장 프로그램에서 받은 데이터를 테이블에 추가
          const newData = products.map(product => {
            // SSD 카테고리인 경우 "SSD/M.2"로 변경
            let processedCategory = product.category || '';
            if (processedCategory === 'SSD') {
              processedCategory = 'SSD/M.2';
            }

            // 가격 포맷팅 (콤마 추가)
            const formattedPrice = product.price ? Number(product.price).toLocaleString() : '';

            return {
              id: Date.now() + Math.random(), // 고유 ID 생성
              category: processedCategory,
              productName: product.productName || '',
              quantity: product.quantity || 1,
              price: formattedPrice,
              productCode: '',
              distributor: '',
              reconfirm: '',
              remarks: '',
            };
          });

          // 기존 테이블 데이터에 새 데이터 추가
          setTableData(prev => [...prev, ...newData]);

          // 성공 메시지 표시
          alert(`다나와에서 ${products.length}개 상품 정보를 가져왔습니다.`);
        }
      }
    };

    // 이벤트 리스너 등록
    window.addEventListener('message', handleDanawaExtensionData);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('message', handleDanawaExtensionData);
    };
  }, []);

  // 튜닝 버튼 클릭 시 호출되는 함수
  const handleTuningCostToggle = () => {
    const newState = !isCustomTuningCost;
    setIsCustomTuningCost(newState);

    if (newState) {
      // 튜닝 모드 활성화 - 기존 값이 없을 때만 초기화
      if (!paymentInfo.tuningCost) {
        setPaymentInfo(prev => ({ ...prev, tuningCost: '' }));
      }
      // 기존 값이 있으면 유지 (아무것도 하지 않음)
    } else {
      // 튜닝 모드 비활성화 - 입력 값을 0으로 초기화
      setPaymentInfo(prev => ({ ...prev, tuningCost: 0 }));
    }
  };

  // JSX 렌더링 시작
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* 페이지 제목 영역 */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? '견적서 수정' : '견적서 작성'}
        </h1>

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
              {isEditMode
                ? '견적이 성공적으로 수정되었습니다.'
                : '견적이 성공적으로 저장되었습니다.'}
              {isEditMode && ' 곧 상세 페이지로 이동합니다...'}
            </div>
          )}
          {saveStatus.error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {saveStatus.error}
            </div>
          )}

          {/* 여기부터 기존 폼 코드 */}
          <div className="flex flex-col rounded-lg shadow md:flex-row w-full gap-2 bg-[#f3f6de] p-2">
            {/* 고객 정보 섹션 */}
            <div className="w-full md:w-2/3">
              <div className="bg-white shadow rounded-lg p-3">
                <h2 className="text-xl font-semibold mb-1">고객 정보</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">PC번호</label>
                    <input
                      type="text"
                      name="pcNumber"
                      value={customerInfo.pcNumber}
                      onChange={handleCustomerInfoChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="PC번호를 입력하세요"
                    />
                  </div>

                  {/* 계약구분 */}
                  <div className="mb-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">계약구분</label>
                    <div className="flex flex-col space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleContractTypeSelect('일반회원')}
                          className={`px-3 py-1 rounded-md text-sm ${
                            customerInfo.contractType === '일반회원' && !isCustomContractType
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          일반회원
                        </button>
                        <button
                          type="button"
                          onClick={() => handleContractTypeSelect('직접입력')}
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

                  {/* 판매형태 */}
                  <div className="mb-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">판매형태</label>
                    <div className="flex flex-col space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {['부품 조립형', '본인설치', '해당없음'].map(type => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => handleSaleTypeSelect(type)}
                            className={`px-3 py-1 rounded-md text-sm ${
                              customerInfo.saleType === type && !isCustomSaleType
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => handleSaleTypeSelect('직접입력')}
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

                  {/* 구입형태 */}
                  <div className="mb-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">구입형태</label>
                    <div className="flex flex-col space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handlePurchaseTypeSelect('지인')}
                          className={`px-3 py-1 rounded-md text-sm ${
                            customerInfo.purchaseType === '지인' && !isCustomPurchaseType
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          지인
                        </button>
                        {/* 기존회원 버튼 */}
                        <button
                          type="button"
                          onClick={() => handlePurchaseTypeSelect('기존회원')}
                          className={`px-3 py-1 rounded-md text-sm ${
                            customerInfo.purchaseType === '기존회원' && !isCustomPurchaseType
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          기존회원
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePurchaseTypeSelect('해당없음')}
                          className={`px-3 py-1 rounded-md text-sm ${
                            customerInfo.purchaseType === '해당없음' && !isCustomPurchaseType
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          해당없음
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePurchaseTypeSelect('직접입력')}
                          className={`px-3 py-1 rounded-md text-sm ${
                            isCustomPurchaseType
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          직접입력
                        </button>
                      </div>

                      {/* 지인 이름 입력 필드 */}
                      {customerInfo.purchaseType === '지인' && !isCustomPurchaseType && (
                        <input
                          type="text"
                          name="purchaseTypeName"
                          value={customerInfo.purchaseTypeName || ''}
                          onChange={handleCustomerInfoChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="지인 이름을 입력하세요"
                        />
                      )}

                      {/* 기존회원 이름 입력 필드 추가 */}
                      {customerInfo.purchaseType === '기존회원' && !isCustomPurchaseType && (
                        <input
                          type="text"
                          name="purchaseTypeName"
                          value={customerInfo.purchaseTypeName || ''}
                          onChange={handleCustomerInfoChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="기존회원 이름을 입력하세요(선택)"
                        />
                      )}

                      {/* 직접 입력 필드 */}
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

                  {/* 용도 */}
                  <div className="mb-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">용도</label>
                    <div className="flex flex-col space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handlePurposeSelect('게임')}
                          className={`px-3 py-1 rounded-md text-sm ${
                            customerInfo.purpose === '게임' && !isCustomPurpose
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          게임
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePurposeSelect('문서작업')}
                          className={`px-3 py-1 rounded-md text-sm ${
                            customerInfo.purpose === '문서작업' && !isCustomPurpose
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          문서작업
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePurposeSelect('영상/이미지편집')}
                          className={`px-3 py-1 rounded-md text-sm ${
                            customerInfo.purpose === '영상/이미지편집' && !isCustomPurpose
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          영상/이미지편집
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePurposeSelect('직접입력')}
                          className={`px-3 py-1 rounded-md text-sm ${
                            isCustomPurpose
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          직접입력
                        </button>
                      </div>
                      {isCustomPurpose && (
                        <input
                          type="text"
                          name="purpose"
                          value={customerInfo.purpose}
                          onChange={handleCustomerInfoChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="용도를 입력하세요"
                        />
                      )}
                    </div>
                  </div>

                  {/* AS 조건 */}
                  <div className="mb-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">AS조건</label>
                    <div className="flex flex-col space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleAsConditionSelect('본인입고조건')}
                          className={`px-3 py-1 rounded-md text-sm ${
                            customerInfo.asCondition === '본인입고조건' && !isCustomAsCondition
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          본인입고조건
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAsConditionSelect('직접입력')}
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

                  {/* 운영체계 */}
                  <div className="mb-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">운영체계</label>
                    <div className="flex flex-col space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleOsSelect('win10')}
                          className={`px-3 py-1 rounded-md text-sm ${
                            customerInfo.os === 'win10' && !isCustomOs
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
                            customerInfo.os === 'win11' && !isCustomOs
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          win11
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOsSelect('직접입력')}
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

                  {/* 견적담당 - 직접입력 옵션 제거 */}
                  <div className="mb-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">견적담당</label>
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
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 참고사항 섹션 */}
            <div className="w-full md:w-1/3">
              <div className="bg-white shadow rounded-lg p-3">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">참고사항</h2>
                <div className="text-sm text-gray-500 mb-3">
                  * 참고사항은 내부용으로 견적서에는 표시되지 않습니다.
                </div>
                <textarea
                  value={notes}
                  onChange={handleNotesChange}
                  className="w-full h-64 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="견적에 대한 참고사항을 입력하세요. (선택사항)"
                ></textarea>
              </div>
            </div>
          </div>

          {/* 상품데이터 섹션 */}
          <div className="flex flex-wrap rounded-lg shadoww-full bg-[#d9e7d3] mt-2">
            {/* 첫 번째 문단 : 상품 정보 입력창 토글 버튼*/}
            <div className="w-full md:w-[30%] p-2">
              {/* 상품 정보 입력창 토글 버튼 */}
              <div className="mb-2 flex items-center">
                <button
                  type="button"
                  onClick={() => setShowForm(!showForm)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                >
                  개별 상품 정보 입력창 {showForm ? '-' : '+'}
                </button>
                {/* 전체 삭제 버튼 추가 */}
                <button
                  type="button"
                  onClick={handleDeleteAllProducts}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 ml-2"
                >
                  상품 전체 삭제
                </button>
              </div>

              {/* 기존 개별 입력 폼 */}
              {showForm && (
                <div className="bg-white rounded-lg shadow p-2 mb-2">
                  <h2 className="text-xl font-semibold mb-2">
                    {editingId ? '상품 정보 수정' : '상품 정보 입력'}
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-1">
                    {/* 분류 */}
                    <div className="flex items-center gap-1">
                      <label className="w-20 text-sm font-bold text-gray-700">분류</label>
                      <textarea
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 resize-none overflow-hidden min-h-[42px]"
                        required
                        placeholder="분류를 입력하세요"
                        rows={1}
                      />
                    </div>

                    {/* 상품명 */}
                    <div className="flex items-center gap-1">
                      <label className="w-20 text-sm font-bold text-gray-700">상품명</label>
                      <textarea
                        name="productName"
                        value={formData.productName}
                        onChange={handleChange}
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 resize-none overflow-hidden min-h-[42px]"
                        required
                        placeholder="상품명을 입력하세요"
                        rows={1}
                      />
                    </div>

                    {/* 수량 */}
                    <div className="flex items-center gap-1">
                      <label className="w-20 text-sm font-bold text-gray-700">수량</label>
                      <textarea
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 resize-none overflow-hidden min-h-[42px]"
                        required
                        placeholder="수량을 입력하세요"
                        rows={1}
                      />
                    </div>

                    {/* 현금가 */}
                    <div className="flex items-center gap-1">
                      <label className="w-20 text-sm font-bold text-gray-700">현금가</label>
                      <div className="flex-1 flex items-center gap-2">
                        <textarea
                          name="price"
                          value={formData.price}
                          onChange={handleChange}
                          className="flex-1 border border-gray-300 rounded-md px-3 py-2 resize-none overflow-hidden min-h-[42px]"
                          required
                          placeholder="현금가를 입력하세요"
                          rows={1}
                        />
                        <button
                          type="button"
                          onClick={multiplyPriceByQuantity}
                          className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 whitespace-nowrap text-sm"
                        >
                          수량 곱
                        </button>
                      </div>
                    </div>

                    {/* 상품코드 */}
                    <div className="flex items-center gap-1">
                      <label className="w-20 text-sm font-bold text-gray-700">상품코드</label>
                      <textarea
                        name="productCode"
                        value={formData.productCode}
                        onChange={handleChange}
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 resize-none overflow-hidden min-h-[42px]"
                        placeholder="상품코드를 입력하세요"
                        rows={1}
                      />
                    </div>

                    {/* 총판 */}
                    <div className="flex items-center gap-1">
                      <label className="w-20 text-sm font-bold text-gray-700">총판</label>
                      <textarea
                        name="distributor"
                        value={formData.distributor}
                        onChange={handleChange}
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 resize-none overflow-hidden min-h-[42px]"
                        placeholder="총판을 입력하세요"
                        rows={1}
                      />
                    </div>

                    {/* 재조사 */}
                    <div className="flex items-center gap-1">
                      <label className="w-20 text-sm font-bold text-gray-700">재조사</label>
                      <textarea
                        name="reconfirm"
                        value={formData.reconfirm}
                        onChange={handleChange}
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 resize-none overflow-hidden min-h-[42px]"
                        placeholder="재조사 여부를 입력하세요"
                        rows={1}
                      />
                    </div>

                    {/* 비고 */}
                    <div className="flex items-center gap-1">
                      <label className="w-20 text-sm font-bold text-gray-700">비고</label>
                      <textarea
                        name="remarks"
                        value={formData.remarks}
                        onChange={handleChange}
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 resize-none overflow-hidden min-h-[42px]"
                        placeholder="비고를 입력하세요"
                        rows={1}
                      />
                    </div>

                    {/* 버튼 영역 */}
                    <div className="flex justify-end gap-2 mt-6">
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
                              remarks: '',
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
                        {editingId ? '수정' : '추가'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* 일괄 데이터 입력 폼 */}
              <div className="bg-white rounded-lg shadow p-2">
                <h2 className="text-xl font-semibold mb-4">일괄 데이터 입력</h2>
                <div className="grid grid-cols-1 gap-2">
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
                  <div className="border-t border-gray-300 pt-2">
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
            </div>
            {/* 두 번째 문단: 테이블 */}
            <div className="w-full md:w-[70%] p-2">
              <div className="w-full">
                <div className="bg-white rounded-lg shadow">
                  <div className="max-w-full">
                    <table className="w-full table-fixed divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="w-[12%] px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider overflow-hidden">
                            <div className="truncate">작업</div>
                          </th>
                          <th className="w-[11%] px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider overflow-hidden">
                            <div className="truncate">분류</div>
                          </th>
                          <th className="w-[33%] px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider overflow-hidden">
                            <div className="truncate">상품명</div>
                          </th>
                          <th className="w-[5%] px-1 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider overflow-hidden">
                            <div className="truncate">수량</div>
                          </th>
                          <th className="w-[12%] px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider overflow-hidden">
                            <div className="truncate text-right">현금가</div>
                          </th>
                          <th className="w-[12%] px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider overflow-hidden">
                            <div className="truncate">상품코드</div>
                          </th>
                          <th className="w-[8%] px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider overflow-hidden">
                            <div className="truncate">총판</div>
                          </th>
                          <th className="w-[8%] px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider overflow-hidden">
                            <div className="truncate">재조사</div>
                          </th>
                          <th className="w-[9%] px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider overflow-hidden">
                            <div className="truncate">비고</div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {tableData.map(row => (
                          <tr key={row.id}>
                            <td className="px-1 py-2">
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
                            <td className="px-1 py-2">
                              <div className="text-sm text-gray-900 break-all whitespace-pre-line overflow-hidden">
                                {row.category}
                              </div>
                            </td>
                            <td className="px-1 py-2">
                              <div className="text-sm text-gray-900 break-all whitespace-pre-line overflow-hidden">
                                {row.productName}
                              </div>
                            </td>
                            <td className="px-1 py-2">
                              <div className="text-sm text-center text-gray-900 break-all whitespace-pre-line overflow-hidden">
                                {row.quantity}
                              </div>
                            </td>
                            <td className="px-1 py-2 text-right">
                              {' '}
                              {/* 오른쪽 정렬 추가 */}
                              <div className="text-sm text-gray-900 break-all whitespace-pre-line overflow-hidden">
                                {row.price}
                              </div>
                            </td>
                            <td className="px-1 py-2">
                              <div className="text-sm text-gray-900 break-all whitespace-pre-line overflow-hidden">
                                {row.productCode}
                              </div>
                            </td>
                            <td className="px-1 py-2">
                              <div className="text-sm text-gray-900 break-all whitespace-pre-line overflow-hidden">
                                {row.distributor}
                              </div>
                            </td>
                            <td className="px-1 py-2">
                              <div className="text-sm text-gray-900 break-all whitespace-pre-line overflow-hidden">
                                {row.reconfirm}
                              </div>
                            </td>
                            <td className="px-1 py-2">
                              <div className="text-sm text-gray-900 break-all whitespace-pre-line overflow-hidden">
                                {row.remarks}
                              </div>
                            </td>
                          </tr>
                        ))}
                        {/* 현금가 합계 행 추가 */}
                        {tableData.length > 0 && (
                          <tr className="bg-blue-50">
                            <td
                              colSpan="3"
                              className="px-4 py-3 text-right font-medium text-gray-700"
                            >
                              현금가 합계:
                            </td>
                            <td className="px-4 py-3 text-left font-bold text-blue-700" colSpan="6">
                              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{' '}
                              {calculatedValues.productTotal.toLocaleString()}원
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 서비스 물품 섹션 */}
          <div className="rounded-lg shadow p-2 mt-2 bg-[#ffe1e6]">
            <h2 className="text-xl font-semibold mb-2">서비스 물품</h2>

            <div className="flex flex-wrap">
              {/* 첫 번째 문단 */}
              <div className="w-full md:w-1/3 px-1">
                {/* 서비스 물품 선택 버튼 */}
                <div className="flex flex-wrap gap-2 pb-2">
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

                {/* 서비스 물품 직접 입력 폼 */}
                <div className="mb-4 p-4 border border-gray-200 rounded-md bg-gray-50">
                  <h3 className="text-md font-medium mb-3">직접 입력</h3>
                  <div className="flex gap-3 items-end">
                    <div className="flex-[2]">
                      {/* 상품명 영역을 50%로 설정 */}
                      <label className="block text-sm font-medium text-gray-700 mb-1">상품명</label>
                      <input
                        type="text"
                        id="custom-product-name"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="서비스 상품명 입력"
                      />
                    </div>
                    <div className="flex-[1]">
                      {/* 개수 영역을 25%로 설정 */}
                      <label className="block text-sm font-medium text-gray-700 mb-1">개수</label>
                      <input
                        type="number"
                        id="custom-quantity"
                        min="1"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="개수 입력"
                      />
                    </div>
                    <div className="flex-[1]">
                      {/* 추가하기 버튼을 25%로 설정 */}
                      <button
                        type="button"
                        onClick={() => {
                          const productName = document.getElementById('custom-product-name').value;
                          const quantity =
                            parseInt(document.getElementById('custom-quantity').value) || 1;

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
              </div>

              {/* 두 번째 문단 */}
              <div className="w-full md:w-2/3 px-2">
                <div className="max-w-full border border-gray-200">
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
                        serviceData.map(item => (
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
                                onChange={e => handleProductNameChange(item.id, e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-4 py-4">
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={e => handleQuantityChange(item.id, e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-4 py-4">
                              <input
                                type="text"
                                value={item.remarks}
                                onChange={e => handleServiceRemarkChange(item.id, e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="비고를 입력하세요"
                              />
                            </td>
                          </tr>
                        ))
                      )}
                      {/* 현금가 합계 행 추가 */}
                      {serviceData.length > 0 && (
                        <tr className="bg-blue-50">
                          <td
                            colSpan="2"
                            className="px-4 py-3 text-right font-medium text-gray-700"
                          >
                            서비스 물품 개수:
                          </td>
                          <td colSpan="2" className="px-4 py-3 text-left font-bold text-blue-700">
                            총{' '}
                            {serviceData.reduce(
                              (total, item) => total + parseInt(item.quantity || 1),
                              0
                            )}
                            개
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* 서비스 물품 선택 버튼 */}
            <div className="mb-4"></div>

            {/* 서비스 물품 테이블 */}
          </div>

          {/* 테이블 끝난 후 결제 정보 섹션 */}
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">결제 정보</h2>

            {/* 금액 계산 흐름을 명확히 보여주는 레이아웃으로 변경 */}
            <div className="grid grid-cols-1 gap-6">
              {/* 금액 계산 과정 섹션 */}

              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div
                  className="flex justify-between items-center p-3 bg-white rounded-md border border-gray-200 mb-2"
                  style={{ width: '100%' }}
                >
                  <label className="text-sm font-medium text-gray-700">상품/부품 합 금액</label>
                  <div className="text-lg font-semibold text-gray-900">
                    {calculatedValues.productTotal.toLocaleString()}원
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                  {/* 왼쪽 컬럼: 기본 금액 입력 */}
                  <div className="space-y-1">
                    {/* 공임비(제작/조립비) */}
                    <div className="p-2 bg-white rounded-md border border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        공임비(제작/조립비) <span className="text-green-600">+</span>
                      </label>
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {[10000, 20000, 30000, 40000, 50000].map(cost => (
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
                              {cost / 10000}만원
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
                          <button
                            type="button"
                            onClick={handleTuningCostToggle}
                            className={`px-3 py-1 rounded-md text-sm ${
                              isCustomTuningCost
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            튜닝
                          </button>
                        </div>
                        {isCustomLaborCost && (
                          <input
                            type="text"
                            name="laborCost"
                            value={
                              paymentInfo.laborCost ? paymentInfo.laborCost.toLocaleString() : ''
                            }
                            onChange={handlePaymentInfoChange}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="공임비를 입력하세요"
                          />
                        )}
                        {isCustomTuningCost && (
                          <div className="mt-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              튜닝금액 <span className="text-green-600">+</span>
                            </label>
                            <input
                              type="text"
                              name="tuningCost"
                              value={
                                paymentInfo.tuningCost
                                  ? paymentInfo.tuningCost.toLocaleString()
                                  : ''
                              }
                              onChange={handlePaymentInfoChange}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="튜닝금액 입력"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 세팅비(SW) */}
                    <div className="p-2 bg-white rounded-md border border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        세팅비(SW) <span className="text-green-600">+</span>
                      </label>
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {[10000, 20000, 30000, 40000, 50000].map(cost => (
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
                              {cost / 10000}만원
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
                            type="text"
                            name="setupCost"
                            value={
                              paymentInfo.setupCost ? paymentInfo.setupCost.toLocaleString() : ''
                            }
                            onChange={handlePaymentInfoChange}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="세팅비를 입력하세요"
                          />
                        )}
                      </div>
                    </div>

                    {/* 보증관리비(warranty fee) */}
                    <div className="p-2 bg-white rounded-md border border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        보증관리비 <span className="text-green-600">+</span>
                      </label>
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {[30000, 50000].map(cost => (
                            <button
                              key={cost}
                              type="button"
                              onClick={() => {
                                setIsCustomWarrantyFee(false);
                                setPaymentInfo(prev => ({ ...prev, warrantyFee: cost }));
                              }}
                              className={`px-3 py-1 rounded-md text-sm ${
                                paymentInfo.warrantyFee === cost && !isCustomWarrantyFee
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {cost / 10000}만원
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              setIsCustomWarrantyFee(true);
                              setPaymentInfo(prev => ({ ...prev, warrantyFee: 0 }));
                            }}
                            className={`px-3 py-1 rounded-md text-sm ${
                              isCustomWarrantyFee
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            직접입력
                          </button>
                        </div>
                        {isCustomWarrantyFee && (
                          <input
                            type="text"
                            name="warrantyFee"
                            value={
                              paymentInfo.warrantyFee
                                ? paymentInfo.warrantyFee.toLocaleString()
                                : ''
                            }
                            onChange={handlePaymentInfoChange}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="보증관리비를 입력하세요"
                          />
                        )}
                      </div>
                    </div>

                    {/* 할인 */}
                    <div className="p-2 bg-white rounded-md border border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        할인 <span className="text-red-600">-</span>
                      </label>
                      <div className="flex flex-col items-start gap-2">
                        <input
                          type="text"
                          name="discount"
                          value={paymentInfo.discount ? paymentInfo.discount.toLocaleString() : ''}
                          onChange={handlePaymentInfoChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="할인 금액을 입력하세요"
                        />
                        <span className="text-sm text-gray-700 whitespace-nowrap">
                          {numberToKorean(paymentInfo.discount || 0)}
                        </span>
                      </div>
                    </div>

                    {/* 총 구입 금액 */}
                    <div className="p-3 bg-white rounded-md border border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        총 구입 금액{' '}
                        <span className="text-xs text-gray-500">
                          (상품/부품+공임비+세팅비+보증관리비+튜닝비-할인)
                        </span>
                      </label>
                      <div className="flex justify-between items-center">
                        <div className="text-lg font-semibold text-gray-900">
                          {calculatedValues.totalPurchase.toLocaleString()}원
                        </div>

                        {/* 버림 옵션 버튼 그룹 */}
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              // 현재 총 구입 금액 계산
                              const productTotal = calculateProductTotal();
                              const laborCost =
                                paymentInfo.laborCost !== undefined
                                  ? paymentInfo.laborCost
                                  : parseInt(paymentInfo.laborCost) || 0;
                              const setupCost =
                                paymentInfo.setupCost !== undefined
                                  ? paymentInfo.setupCost
                                  : parseInt(paymentInfo.setupCost) || 0;
                              const warrantyFee =
                                paymentInfo.warrantyFee !== undefined
                                  ? paymentInfo.warrantyFee
                                  : parseInt(paymentInfo.warrantyFee) || 0;
                              const tuningCost =
                                paymentInfo.tuningCost !== undefined
                                  ? paymentInfo.tuningCost
                                  : parseInt(paymentInfo.tuningCost) || 0;
                              const discount =
                                paymentInfo.discount !== undefined
                                  ? paymentInfo.discount
                                  : parseInt(paymentInfo.discount) || 0;
                              const totalBeforeRounding =
                                productTotal +
                                laborCost +
                                setupCost +
                                warrantyFee +
                                tuningCost -
                                discount;

                              // 버림 적용
                              const roundingType = '100down';
                              setPaymentInfo(prev => ({ ...prev, roundingType }));

                              // 버려진 금액 계산
                              const discardedAmount = calculateDiscardedAmount(
                                roundingType,
                                totalBeforeRounding
                              );

                              // 버려진 금액이 있으면 서비스 물품에 추가
                              if (discardedAmount > 0) {
                                handleAddServiceItem(`끝자리DC -${discardedAmount}원`, 1);
                              }
                            }}
                            className={`px-2 py-1 rounded-md text-xs ${
                              paymentInfo.roundingType === '100down'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                            title="백자리 버림"
                          >
                            백원↓
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              // 현재 총 구입 금액 계산
                              const productTotal = calculateProductTotal();
                              const laborCost =
                                paymentInfo.laborCost !== undefined
                                  ? paymentInfo.laborCost
                                  : parseInt(paymentInfo.laborCost) || 0;
                              const setupCost =
                                paymentInfo.setupCost !== undefined
                                  ? paymentInfo.setupCost
                                  : parseInt(paymentInfo.setupCost) || 0;
                              const warrantyFee =
                                paymentInfo.warrantyFee !== undefined
                                  ? paymentInfo.warrantyFee
                                  : parseInt(paymentInfo.warrantyFee) || 0;
                              const tuningCost =
                                paymentInfo.tuningCost !== undefined
                                  ? paymentInfo.tuningCost
                                  : parseInt(paymentInfo.tuningCost) || 0;
                              const discount =
                                paymentInfo.discount !== undefined
                                  ? paymentInfo.discount
                                  : parseInt(paymentInfo.discount) || 0;
                              const totalBeforeRounding =
                                productTotal +
                                laborCost +
                                setupCost +
                                warrantyFee +
                                tuningCost -
                                discount;

                              // 버림 적용
                              const roundingType = '1000down';
                              setPaymentInfo(prev => ({ ...prev, roundingType }));

                              // 버려진 금액 계산
                              const discardedAmount = calculateDiscardedAmount(
                                roundingType,
                                totalBeforeRounding
                              );

                              // 버려진 금액이 있으면 서비스 물품에 추가
                              if (discardedAmount > 0) {
                                handleAddServiceItem(`끝자리DC -${discardedAmount}원`, 1);
                              }
                            }}
                            className={`px-2 py-1 rounded-md text-xs ${
                              paymentInfo.roundingType === '1000down'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                            title="천자리 버림"
                          >
                            천원↓
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              // 현재 총 구입 금액 계산
                              const productTotal = calculateProductTotal();
                              const laborCost =
                                paymentInfo.laborCost !== undefined
                                  ? paymentInfo.laborCost
                                  : parseInt(paymentInfo.laborCost) || 0;
                              const setupCost =
                                paymentInfo.setupCost !== undefined
                                  ? paymentInfo.setupCost
                                  : parseInt(paymentInfo.setupCost) || 0;
                              const warrantyFee =
                                paymentInfo.warrantyFee !== undefined
                                  ? paymentInfo.warrantyFee
                                  : parseInt(paymentInfo.warrantyFee) || 0;
                              const tuningCost =
                                paymentInfo.tuningCost !== undefined
                                  ? paymentInfo.tuningCost
                                  : parseInt(paymentInfo.tuningCost) || 0;
                              const discount =
                                paymentInfo.discount !== undefined
                                  ? paymentInfo.discount
                                  : parseInt(paymentInfo.discount) || 0;
                              const totalBeforeRounding =
                                productTotal +
                                laborCost +
                                setupCost +
                                warrantyFee +
                                tuningCost -
                                discount;

                              // 버림 적용
                              const roundingType = '10000down';
                              setPaymentInfo(prev => ({ ...prev, roundingType }));

                              // 버려진 금액 계산
                              const discardedAmount = calculateDiscardedAmount(
                                roundingType,
                                totalBeforeRounding
                              );

                              // 버려진 금액이 있으면 서비스 물품에 추가
                              if (discardedAmount > 0) {
                                handleAddServiceItem(`끝자리DC -${discardedAmount}원`, 1);
                              }
                            }}
                            className={`px-2 py-1 rounded-md text-xs ${
                              paymentInfo.roundingType === '10000down'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                            title="만자리 버림"
                          >
                            만원↓
                          </button>
                          {paymentInfo.roundingType && (
                            <button
                              type="button"
                              onClick={() => {
                                // roundingType 초기화
                                setPaymentInfo(prev => ({ ...prev, roundingType: '' }));

                                // "끝자리버림" 항목 삭제
                                setServiceData(prev =>
                                  prev.filter(item => !item.productName.startsWith('끝자리DC'))
                                );
                              }}
                              className="px-2 py-1 rounded-md text-xs bg-gray-200 text-gray-700 hover:bg-gray-300"
                              title="버림 취소"
                            >
                              취소
                            </button>
                          )}
                        </div>
                      </div>
                      {paymentInfo.roundingType && (
                        <div className="mt-2 text-xs text-gray-500">
                          {paymentInfo.roundingType === '100down' && '백원 단위 버림 적용됨'}
                          {paymentInfo.roundingType === '1000down' && '천원 단위 버림 적용됨'}
                          {paymentInfo.roundingType === '10000down' && '만원 단위 버림 적용됨'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 오른쪽 컬럼: 계산 결과 및 옵션 */}
                  <div className="flex flex-col-reverse">
                    {/* 최종 결제 금액 */}
                    <div className="p-4 bg-blue-50 rounded-md border border-blue-200 mt-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        최종 결제 금액{' '}
                        <span className="text-xs text-gray-500">(총 구입 금액 + VAT)</span>
                      </label>
                      <div className="text-lg font-bold text-blue-600">
                        {calculatedValues.finalPayment.toLocaleString()}원
                      </div>
                    </div>

                    {/* VAT 설정 */}
                    <div className="p-4 bg-white rounded-md border border-gray-200">
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-sm font-medium text-gray-700">
                          VAT 설정 <span className="text-green-600">+</span>
                        </label>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            name="includeVat"
                            checked={paymentInfo.includeVat}
                            onChange={handlePaymentInfoChange}
                            className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label className="ml-1 block text-sm text-gray-900">VAT 포함</label>
                        </div>
                      </div>
                      {paymentInfo.includeVat && (
                        <div className="flex items-center gap-1 mt-1">
                          <div className="flex items-center flex-1">
                            <input
                              type="number"
                              name="vatRate"
                              value={paymentInfo.vatRate}
                              onChange={handlePaymentInfoChange}
                              className="w-16 border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              min="0"
                              max="100"
                            />
                            <span className="text-sm text-gray-700 ml-1">%</span>
                          </div>
                          <div className="text-sm text-gray-700 font-medium">
                            = {calculatedValues.vatAmount.toLocaleString()}원
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 추가 결제 정보 섹션 */}
              <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                <h3 className="text-base font-medium text-gray-800 mb-2">
                  배송+설치 비용 & 추가 정보
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* 계약금 */}
                  <div className="p-2 bg-white rounded-md border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-1">계약금</label>
                    <div className="flex flex-col items-start gap-1">
                      <input
                        type="text"
                        name="deposit"
                        value={paymentInfo.deposit ? paymentInfo.deposit.toLocaleString() : ''}
                        onChange={handlePaymentInfoChange}
                        className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="계약금을 입력하세요"
                      />
                      <span className="text-xs text-gray-700 whitespace-nowrap">
                        {numberToKorean(paymentInfo.deposit || 0)}
                      </span>
                    </div>
                  </div>

                  {/* 배송+설치 비용 */}
                  <div className="p-2 bg-white rounded-md border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      배송+설치 비용{' '}
                      <span className="text-xs text-gray-500">(최종결제금액 미포함)</span>
                    </label>
                    <div className="flex flex-col items-start gap-1">
                      <input
                        type="text"
                        name="shippingCost"
                        value={
                          paymentInfo.shippingCost ? paymentInfo.shippingCost.toLocaleString() : ''
                        }
                        onChange={handlePaymentInfoChange}
                        className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="배송+설치 비용을 입력하세요"
                      />
                      <span className="text-xs text-gray-700 whitespace-nowrap">
                        {numberToKorean(paymentInfo.shippingCost || 0)}
                      </span>
                    </div>
                  </div>

                  {/* 결제 방법 및 출고일자 */}
                  <div className="p-2 bg-white rounded-md border border-gray-200">
                    <div className="space-y-2">
                      {/* 결제 방법 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          결제 방법
                        </label>
                        <div className="flex flex-wrap gap-1">
                          <button
                            type="button"
                            onClick={() => handlePaymentMethodSelect('카드')}
                            className={`px-2 py-1 rounded-md text-xs ${
                              paymentInfo.paymentMethod === '카드' && !isCustomPaymentMethod
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            카드
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePaymentMethodSelect('카드결제 DC')}
                            className={`px-2 py-1 rounded-md text-xs ${
                              paymentInfo.paymentMethod === '카드결제 DC' && !isCustomPaymentMethod
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            카드결제 DC
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePaymentMethodSelect('현금')}
                            className={`px-2 py-1 rounded-md text-xs ${
                              paymentInfo.paymentMethod === '현금' && !isCustomPaymentMethod
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            현금
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePaymentMethodSelect('custom')}
                            className={`px-2 py-1 rounded-md text-xs ${
                              isCustomPaymentMethod
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            직접입력
                          </button>
                        </div>
                        {isCustomPaymentMethod && (
                          <input
                            type="text"
                            name="paymentMethod"
                            value={paymentInfo.paymentMethod}
                            onChange={handlePaymentInfoChange}
                            className="w-full mt-1 border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="결제 방법을 입력하세요"
                          />
                        )}
                      </div>

                      {/* 출고일자 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          출고일자
                        </label>
                        <input
                          type="date"
                          name="releaseDate"
                          value={paymentInfo.releaseDate}
                          onChange={handlePaymentInfoChange}
                          className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
            saveStatus.loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
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

      {/* 견적설명 버튼 - 화면 오른쪽 하단에 고정 */}
      <button
        type="button"
        onClick={toggleDescriptionTextarea}
        className="fixed bottom-8 right-8 z-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg"
        title="견적설명 작성"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      </button>

      {/* 견적설명 textarea 모달 */}
      {showDescriptionTextarea && (
        <div className="fixed bottom-8 right-20 z-50">
          <div className="bg-white rounded-lg shadow-xl w-96 p-4 relative">
            <button
              type="button"
              onClick={toggleDescriptionTextarea}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <h3 className="text-md font-medium text-gray-900 mb-2">견적설명 작성</h3>
            <textarea
              value={estimateDescription}
              onChange={handleDescriptionChange}
              className="w-full h-48 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="견적에 대한 설명을 작성하세요...(엔터로 내용 구별)"
            ></textarea>
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={toggleDescriptionTextarea}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
