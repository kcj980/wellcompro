import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import { getKoreanISOString } from '@/app/utils/dateUtils';

export async function GET() {
  let dbStatus = 'disconnected';
  
  try {
    // MongoDB 연결 시도
    await connectToDatabase();
    
    // Mongoose 연결 상태 확인
    dbStatus = mongoose.connection.readyState;
    
    // 상태 코드 문자열로 변환
    switch (dbStatus) {
      case 0: dbStatus = 'disconnected'; break;
      case 1: dbStatus = 'connected'; break;
      case 2: dbStatus = 'connecting'; break;
      case 3: dbStatus = 'disconnecting'; break;
      default: dbStatus = 'unknown';
    }
    
    // 환경 변수 확인 (보안을 위해 일부만 표시)
    const envStatus = {
      MONGODB_URI: process.env.MONGODB_URI ? '설정됨 (값 비공개)' : '설정되지 않음',
      MONGO_PASSWORD: process.env.MONGO_PASSWORD ? '설정됨 (값 비공개)' : '설정되지 않음',
      NODE_ENV: process.env.NODE_ENV
    };
    
    return NextResponse.json({
      success: true,
      status: 'online',
      timestamp: getKoreanISOString(),
      database: {
        status: dbStatus === 'connected' ? 'healthy' : 'unhealthy',
        readyState: dbStatus
      },
      environment: envStatus
    });
    
  } catch (error) {
    console.error('Status check error:', error);
    
    return NextResponse.json({
      success: false,
      status: 'online with errors',
      timestamp: getKoreanISOString(),
      database: {
        status: 'unhealthy',
        readyState: dbStatus,
        error: error.message
      }
    }, { status: 500 });
  }
}