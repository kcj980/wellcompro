import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Quote from '@/models/Quote';

// GET 요청을 처리하는 함수 (공지사항 조회)
export async function GET(request) {
  try {
    console.log('공지사항 조회 API 요청 수신');
    
    // DB 연결
    console.log('MongoDB에 연결 시도...');
    await connectToDatabase();
    console.log('MongoDB 연결 완료');
    
    // 소비자용 견적서 공지사항 조회
    let quote = await Quote.findOne({ type: 'consumer' });
    
    // 데이터가 없으면 기본값으로 생성
    if (!quote) {
      console.log('소비자용 견적서 공지사항이 없어 기본값으로 생성합니다.');
      quote = await Quote.create({
        type: 'consumer',
        announcement: '본 견적서는 수급상황에 따라, 금액과 부품이 대체/변동 될 수 있습니다.\n상품의 사양 및 가격은 제조사의 정책에 따라 변경될 수 있습니다.\n계약금 입금 후 주문이 확정됩니다.'
      });
    }
    
    console.log('공지사항 조회 완료:', quote);
    
    // 성공 응답 반환
    return NextResponse.json({ 
      success: true, 
      announcement: quote.announcement
    });
    
  } catch (error) {
    console.error('Error fetching announcement:', error);
    
    // 에러 응답 반환
    return NextResponse.json({ 
      success: false, 
      message: '공지사항 조회 중 오류가 발생했습니다.',
      error: error.message 
    }, { status: 500 });
  }
}

// POST 요청을 처리하는 함수 (공지사항 저장)
export async function POST(request) {
  try {
    console.log('공지사항 저장 API 요청 수신');
    
    // DB 연결
    console.log('MongoDB에 연결 시도...');
    await connectToDatabase();
    console.log('MongoDB 연결 완료');
    
    // 요청 본문에서 데이터 가져오기
    const data = await request.json();
    
    // 데이터 유효성 검사
    if (!data.announcement) {
      console.error('데이터 유효성 검사 실패:', { data });
      return NextResponse.json({ 
        success: false, 
        message: '공지사항 내용은 필수입니다.' 
      }, { status: 400 });
    }
    
    console.log('데이터 유효성 검사 완료');
    
    // 소비자용 견적서 공지사항 조회
    let quote = await Quote.findOne({ type: 'consumer' });
    
    // 데이터가 있으면 업데이트, 없으면 생성
    if (quote) {
      console.log('기존 공지사항을 업데이트합니다.');
      quote.announcement = data.announcement;
      quote.updatedAt = new Date();
      await quote.save();
    } else {
      console.log('새 공지사항을 생성합니다.');
      quote = await Quote.create({
        type: 'consumer',
        announcement: data.announcement
      });
    }
    
    console.log('공지사항 저장 완료:', quote);
    
    // 성공 응답 반환
    return NextResponse.json({ 
      success: true, 
      message: '공지사항이 성공적으로 저장되었습니다.',
      announcement: quote.announcement
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error saving announcement:', error);
    
    // 에러 응답 반환
    return NextResponse.json({ 
      success: false, 
      message: '공지사항 저장 중 오류가 발생했습니다.',
      error: error.message 
    }, { status: 500 });
  }
} 