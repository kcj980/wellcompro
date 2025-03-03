import mongoose from 'mongoose';

// 모델이 이미 컴파일되었는지 확인
const EstimateSchema = new mongoose.Schema({
  // 고객 정보
  customerInfo: {
    name: String,           // 이름
    phone: String,          // 핸드폰번호
    pcNumber: String,       // PC번호
    contractType: String,   // 계약구분
    saleType: String,      // 판매형태
    purchaseType: String,  // 구입형태
    purchaseTypeName: String, // 지인 이름
    asCondition: String,   // AS조건
    os: String,            // 운영체계
    manager: String        // 견적담당
  },
  
  // 상품 데이터
  tableData: [{
    category: String,      // 분류
    productName: String,   // 상품명
    quantity: String,      // 수량
    price: String,         // 현금가
    productCode: String,   // 상품코드
    distributor: String,   // 총판
    reconfirm: String,     // 재조사
    remarks: String        // 비고
  }],
  
  // 결제 정보
  paymentInfo: {
    laborCost: Number,         // 공임비
    setupCost: Number,         // 세팅비
    discount: Number,          // 할인
    deposit: Number,           // 계약금
    includeVat: Boolean,       // VAT 포함 여부
    vatRate: Number,           // VAT 비율
    roundingType: String,      // 버림 타입
    paymentMethod: String,     // 결제 방법
    shippingCost: Number       // 택배비
  },
  
  // 계산된 값들
  calculatedValues: {
    productTotal: Number,      // 상품/부품 합 금액
    totalPurchase: Number,     // 총 구입 금액
    vatAmount: Number,         // VAT 금액
    finalPayment: Number       // 최종 결제 금액
  },
  
  // 참고사항
  notes: String,
  
  // 생성 및 수정 시간
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// mongoose.models 객체에 EstimateSchema가 있으면 그것을 사용하고, 없으면 새로 만듭니다.
export default mongoose.models.Estimate || mongoose.model('Estimate', EstimateSchema); 