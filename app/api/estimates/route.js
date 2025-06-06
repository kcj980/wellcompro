import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Estimate from '@/models/Estimate';

// POST 요청을 처리하는 함수 (견적 저장)
export async function POST(request) {
  try {
    console.log('견적 저장 API 요청 수신');

    // DB 연결
    console.log('MongoDB에 연결 시도...');
    await connectToDatabase();
    console.log('MongoDB 연결 완료');

    // 요청 본문에서 데이터 가져오기
    const data = await request.json();

    // 데이터 유효성 검사
    if (!data.customerInfo || !data.tableData) {
      console.error('데이터 유효성 검사 실패:', { data });
      return NextResponse.json(
        {
          success: false,
          message: '고객 정보와 상품 데이터는 필수입니다.',
        },
        { status: 400 }
      );
    }

    if (!data.customerInfo.name) {
      console.error('고객 이름 누락:', { customerInfo: data.customerInfo });
      return NextResponse.json(
        {
          success: false,
          message: '고객 이름은 필수입니다.',
        },
        { status: 400 }
      );
    }

    if (data.tableData.length === 0) {
      console.error('상품 데이터 누락');
      return NextResponse.json(
        {
          success: false,
          message: '최소 하나 이상의 상품이 필요합니다.',
        },
        { status: 400 }
      );
    }

    console.log('데이터 유효성 검사 완료');

    // 새 견적 생성
    console.log('견적 데이터 저장 시도...');
    console.log(
      '저장할 데이터:',
      JSON.stringify(
        {
          customerInfo: data.customerInfo,
          tableDataCount: data.tableData.length,
          paymentInfo: data.paymentInfo,
          calculatedValues: data.calculatedValues,
          notes: data.notes,
          hasNotes: !!data.notes,
        },
        null,
        2
      )
    );

    const estimate = await Estimate.create(data);
    console.log('견적 저장 완료:', estimate._id);
    console.log('저장된 견적의 notes 필드:', estimate.notes);

    // 성공 응답 반환
    return NextResponse.json(
      {
        success: true,
        message: '견적이 성공적으로 저장되었습니다.',
        estimateId: estimate._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving estimate:', error);

    // Mongoose 유효성 검사 오류 확인
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(field => ({
        field,
        message: error.errors[field].message,
      }));

      return NextResponse.json(
        {
          success: false,
          message: '데이터 유효성 검사에 실패했습니다.',
          validationErrors,
        },
        { status: 400 }
      );
    }

    // MongoDB 중복 키 오류 확인
    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: '중복된 데이터가 존재합니다.',
          duplicatedFields: error.keyPattern,
        },
        { status: 409 }
      );
    }

    // 기타 오류
    return NextResponse.json(
      {
        success: false,
        message: '견적 저장 중 오류가 발생했습니다.',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// GET 요청을 처리하는 함수 (모든 견적 조회)
export async function GET(request) {
  try {
    console.log('견적 목록 조회 API 요청 수신');

    // 쿼리 파라미터 가져오기
    const { searchParams } = new URL(request.url);
    const sortParam = searchParams.get('sort');

    // DB 연결
    console.log('(api/estimates/route.js)MongoDB에 연결 시도...');
    await connectToDatabase();
    console.log('(api/estimates/route.js)MongoDB 연결 완료');

    // 정렬 옵션 결정
    let sortOption = { createdAt: -1 }; // 기본값: 최신순

    if (sortParam === 'oldest') {
      sortOption = { createdAt: 1 }; // 오래된순
    } else if (sortParam === 'nameAsc') {
      sortOption = { 'customerInfo.name': 1 }; // 이름 오름차순
    } else if (sortParam === 'nameDesc') {
      sortOption = { 'customerInfo.name': -1 }; // 이름 내림차순
    } else if (sortParam === 'priceAsc') {
      sortOption = { 'calculatedValues.finalPayment': 1 }; // 가격 오름차순
    } else if (sortParam === 'priceDesc') {
      sortOption = { 'calculatedValues.finalPayment': -1 }; // 가격 내림차순
    }

    console.log(`정렬 옵션: ${JSON.stringify(sortOption)}`);

    // 모든 견적 가져오기 (지정된 정렬 방식으로)
    const estimates = await Estimate.find({}).sort(sortOption);
    console.log(`${estimates.length}개의 견적을 조회했습니다.`);

    // 성공 응답 반환
    return NextResponse.json({
      success: true,
      estimates,
    });
  } catch (error) {
    console.error('Error fetching estimates:', error);

    // 에러 응답 반환
    return NextResponse.json(
      {
        success: false,
        message: '견적 조회 중 오류가 발생했습니다.',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
