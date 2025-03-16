import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Bible from '@/models/Bible';
import { getKoreanISOString } from '@/app/utils/dateUtils';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 기존 GET 방식 유지 (하위 호환성) - 최신 구절 반환하도록 수정
export async function GET(request) {
  try {
    // URL 파라미터 확인
    const { searchParams } = new URL(request.url);
    const getReferences = searchParams.get('references');
    
    // references 파라미터가 있으면 최근 10개 reference만 반환
    if (getReferences === 'recent') {
      return getRecentReferences();
    }
    
    // DB에서 최신 구절 가져오기 시도
    const latestVerse = await getLatestBibleVerse();
    
    // 최신 구절이 있으면 반환, 없으면 새 구절 생성
    if (latestVerse) {
      console.log('최신 성경 구절을 DB에서 불러왔습니다:', latestVerse.reference);
      return NextResponse.json(latestVerse);
    } else {
      console.log('저장된 구절이 없어 새 구절을 생성합니다.');
      return generateBibleVerse([]);
    }
  } catch (error) {
    console.error('Latest verse fetch error:', error);
    // DB 조회 실패 시 새 구절 생성으로 폴백
    return generateBibleVerse([]);
  }
}

// 최근 10개 구절 reference만 가져오는 함수
async function getRecentReferences() {
  try {
    // DB 연결
    await connectToDatabase();
    
    // 최신 10개 구절만 가져오기 (reference 필드만)
    const recentVerses = await Bible.find({}, { reference: 1, _id: 0 })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()
      .exec();
    
    // reference 배열로 변환
    const references = recentVerses.map(verse => verse.reference);
    
    console.log(`최근 ${references.length}개 구절 reference를 가져왔습니다:`, references);
    
    return NextResponse.json({ references });
  } catch (error) {
    console.error('Recent references fetch error:', error);
    return NextResponse.json({ references: [] }, { status: 500 });
  }
}

// 새로운 POST 방식 처리 (제외할 구절 목록 받기)
export async function POST(request) {
  try {
    const body = await request.json();
    const excludeReferences = body.excludeReferences || [];
    
    // 새 구절 요청 플래그가 있는지 확인
    const forceNew = body.forceNew || false;
    
    // 새 구절 요청이 아니고 excludeReferences가 비어있으면 최신 구절 반환
    if (!forceNew && excludeReferences.length === 0) {
      const latestVerse = await getLatestBibleVerse();
      if (latestVerse) {
        console.log('최신 성경 구절을 DB에서 불러왔습니다:', latestVerse.reference);
        return NextResponse.json(latestVerse);
      }
    }
    
    return generateBibleVerse(excludeReferences);
  } catch (error) {
    console.error('Bible API POST error:', error);
    return NextResponse.json(
      { error: '성경 구절을 가져오는 데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// DB에서 최신 성경 구절 가져오기
async function getLatestBibleVerse() {
  try {
    // DB 연결
    await connectToDatabase();
    
    // 최신순으로 정렬하여 첫 번째 구절 가져오기
    const latestVerse = await Bible.findOne().sort({ createdAt: -1 }).exec();
    
    return latestVerse;
  } catch (error) {
    console.error('Error fetching latest Bible verse:', error);
    return null;
  }
}

// 성경 구절 생성 함수 (GET, POST 모두 사용)
async function generateBibleVerse(excludeReferences = []) {
  try {
    // 제외할 구절 목록 문자열로 변환
    const excludeList = excludeReferences.length > 0 
      ? `다음 구절들은 제외해주세요: ${excludeReferences.join(', ')}.` 
      : '';

    const prompt = `
    의미있는 성경구절을 랜덤하게 하나 선택해서 다음 포맷으로 알려주세요:
    
    1. 출처: [책 이름 장:절]
    2. 구절 내용: [성경 구절 내용]
    3. 설명: [한국어로 이 구절이 우리 삶에 주는 의미에 대한 간단한 설명]
    
    ${excludeList}
    
    JSON 형식으로 아래와 같이 응답해주세요:
    {
      "reference": "출처 정보",
      "verse": "성경 구절 내용",
      "explanation": "한국어로 설명"
    }
    `;
    //console.log(prompt);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: '당신은 성경에 대한 지식이 풍부한 도우미입니다. 무작위로 의미있는 성경 구절을 하나 선택하고 그 의미를 설명해주세요.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    
    // Parse the JSON response
    let jsonData;
    try {
      // Try to parse the direct response
      jsonData = JSON.parse(content);
    } catch (e) {
      // If direct parsing fails, try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse OpenAI response as JSON');
      }
    }
    
    // 성경 구절을 MongoDB에 저장
    try {
      // DB 연결
      await connectToDatabase();
      
      // 한국 시간으로 현재 시간 가져오기
      const koreanTime = new Date(getKoreanISOString());
      
      // 새 성경 구절 데이터 생성
      await Bible.create({
        reference: jsonData.reference,
        verse: jsonData.verse,
        explanation: jsonData.explanation,
        createdAt: koreanTime
      });
      
      console.log(`성경 구절 저장 완료: ${jsonData.reference}`);
    } catch (dbError) {
      // DB 저장 오류는 로그로만 남기고 API 응답에는 영향을 주지 않음
      console.error('성경 구절 DB 저장 오류:', dbError);
    }

    return NextResponse.json(jsonData);
  } catch (error) {
    console.error('Bible API error:', error);
    return NextResponse.json(
      { error: '성경 구절을 가져오는 데 실패했습니다.' },
      { status: 500 }
    );
  }
} 