import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 기존 GET 방식 유지 (하위 호환성)
export async function GET() {
  return generateBibleVerse([]);
}

// 새로운 POST 방식 처리 (제외할 구절 목록 받기)
export async function POST(request) {
  try {
    const body = await request.json();
    const excludeReferences = body.excludeReferences || [];
    
    return generateBibleVerse(excludeReferences);
  } catch (error) {
    console.error('Bible API POST error:', error);
    return NextResponse.json(
      { error: '성경 구절을 가져오는 데 실패했습니다.' },
      { status: 500 }
    );
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

    return NextResponse.json(jsonData);
  } catch (error) {
    console.error('Bible API error:', error);
    return NextResponse.json(
      { error: '성경 구절을 가져오는 데 실패했습니다.' },
      { status: 500 }
    );
  }
} 