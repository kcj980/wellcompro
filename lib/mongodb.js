import mongoose from 'mongoose'; // mongoose 라이브러리 가져오기 - MongoDB와 상호작용하기 위한 ODM(Object Data Modeling) 도구

const MONGODB_URI = process.env.MONGODB_URI; // 환경변수에서 MongoDB 연결 문자열 가져오기
const MONGO_PASSWORD = process.env.MONGO_PASSWORD; // 환경변수에서 MongoDB 비밀번호 가져오기

if (!MONGODB_URI) {
  // MongoDB URI가 없으면 오류 발생시키기
  throw new Error('MongoDB URI가 없습니다. .env.local 파일에 MONGODB_URI를 설정해주세요.');
}

if (!MONGO_PASSWORD) {
  // MongoDB 비밀번호가 없으면 오류 발생시키기
  throw new Error('MongoDB 비밀번호가 없습니다. .env.local 파일에 MONGO_PASSWORD를 설정해주세요.');
}

/**
 * 전역 변수에 mongoose 연결을 캐싱합니다.
 * Next.js에서 핫 리로드로 인해 여러 연결이 생성되는 것을 방지합니다.
 */
let cached = global.mongoose; // 글로벌 객체에서 mongoose 캐시 가져오기

if (!cached) {
  // 캐시가 없으면 초기화하기
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    // 이미 연결된 경우 기존 연결 반환
    console.log('기존 MongoDB 연결을 사용합니다.');
    return cached.conn;
  }

  if (!cached.promise) {
    // 진행 중인 연결 시도가 없을 경우 새 연결 시도
    const opts = {
      bufferCommands: false, // 오프라인 상태에서 명령 버퍼링 비활성화
      serverSelectionTimeoutMS: 5000, // 서버 선택 타임아웃 5초
      connectTimeoutMS: 10000, // 초기 연결 타임아웃 10초
      socketTimeoutMS: 45000, // 소켓 동작 타임아웃 45초
    };

    try {
      // MONGODB_URI에서 ${MONGO_PASSWORD} 부분을 실제 비밀번호로 대체
      const uri = MONGODB_URI.replace('${MONGO_PASSWORD}', MONGO_PASSWORD);
      console.log('MongoDB에 연결 시도...', uri.replace(MONGO_PASSWORD, 'XXXXX')); // 비밀번호 마스킹하여 출력

      // mongoose.connect()는 Promise를 반환하므로 캐시에 저장
      cached.promise = mongoose.connect(uri, opts).then(mongoose => {
        console.log('MongoDB 연결 성공!');
        return mongoose;
      });
    } catch (error) {
      // 연결 문자열 처리 중 발생한 오류 처리
      console.error('MongoDB 연결 문자열 처리 중 오류:', error);
      throw error;
    }
  }

  try {
    // Promise가 해결될 때까지 기다리고 연결 객체 저장
    cached.conn = await cached.promise;
  } catch (e) {
    // 연결 실패 시 promise 초기화하고 오류 발생
    cached.promise = null;
    console.error('MongoDB 연결 오류:', e);
    throw new Error(`MongoDB 연결 실패: ${e.message}`);
  }

  // 연결 객체 반환
  return cached.conn;
}

export default connectToDatabase; // 다른 파일에서 이 함수를 사용할 수 있도록 내보내기
