import mongoose from 'mongoose';

/**
 * 성경 구절 스키마
 * 클라이언트에서 표시된 성경 구절을 저장하는 데 사용됩니다.
 */
const BibleSchema = new mongoose.Schema({
  // 성경 구절 출처 (예: "요한복음 3:16")
  reference: {
    type: String,
    required: [true, '구절 출처는 필수입니다.'],
    index: true,
  },

  // 성경 구절 내용
  verse: {
    type: String,
    required: [true, '구절 내용은 필수입니다.'],
  },

  // 구절에 대한 설명
  explanation: {
    type: String,
    required: [true, '구절 설명은 필수입니다.'],
  },

  // 생성 시간 (한국 시간 기준)
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// mongoose.models 객체에 BibleSchema가 있으면 그것을 사용하고, 없으면 새로 만듭니다.
export default mongoose.models.Bible || mongoose.model('Bible', BibleSchema);
