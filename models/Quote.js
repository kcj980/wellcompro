import mongoose from 'mongoose';

// Quote 스키마 정의
const QuoteSchema = new mongoose.Schema({
  // 견적서 타입 (consumer, business 등)
  type: {
    type: String,
    required: [true, '견적서 타입은 필수입니다.'],
    enum: ['consumer', 'business', 'contract', 'delivery'], // 허용되는 타입 목록
    default: 'consumer',
  },

  // 공지사항 내용
  announcement: {
    type: String,
    default:
      '본 견적서는 수급상황에 따라, 금액과 부품이 대체/변동 될 수 있습니다.\n상품의 사양 및 가격은 제조사의 정책에 따라 변경될 수 있습니다.\n계약금 입금 후 주문이 확정됩니다.',
  },

  // 생성 및 수정 시간
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// mongoose.models 객체에 QuoteSchema가 있으면 그것을 사용하고, 없으면 새로 만듭니다.
export default mongoose.models.Quote || mongoose.model('Quote', QuoteSchema);
