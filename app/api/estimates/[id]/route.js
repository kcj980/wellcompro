import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Estimate from '@/models/Estimate';

// 견적 ID로 특정 견적 조회
export async function GET(request, { params }) {
  try {
    // DB 연결
    await connectToDatabase();
    
    const { id } = params;
    
    // ID로 견적 찾기
    const estimate = await Estimate.findById(id);
    
    // 견적이 없는 경우
    if (!estimate) {
      return NextResponse.json({ 
        success: false, 
        message: '견적을 찾을 수 없습니다.'
      }, { status: 404 });
    }
    
    // 성공 응답 반환
    return NextResponse.json({ 
      success: true, 
      estimate 
    });
    
  } catch (error) {
    console.error('Error fetching estimate:', error);
    
    // 에러 응답 반환
    return NextResponse.json({ 
      success: false, 
      message: '견적 조회 중 오류가 발생했습니다.',
      error: error.message 
    }, { status: 500 });
  }
}

// 견적 ID로 특정 견적 삭제
export async function DELETE(request, { params }) {
  try {
    // DB 연결
    await connectToDatabase();
    
    const { id } = params;
    
    // ID로 견적 찾아서 삭제
    const deletedEstimate = await Estimate.findByIdAndDelete(id);
    
    // 견적이 없는 경우
    if (!deletedEstimate) {
      return NextResponse.json({ 
        success: false, 
        message: '삭제할 견적을 찾을 수 없습니다.'
      }, { status: 404 });
    }
    
    // 성공 응답 반환
    return NextResponse.json({ 
      success: true, 
      message: '견적이 성공적으로 삭제되었습니다.'
    });
    
  } catch (error) {
    console.error('Error deleting estimate:', error);
    
    // 에러 응답 반환
    return NextResponse.json({ 
      success: false, 
      message: '견적 삭제 중 오류가 발생했습니다.',
      error: error.message 
    }, { status: 500 });
  }
}

// 견적 ID로 특정 견적 업데이트
export async function PUT(request, { params }) {
  try {
    // DB 연결
    await connectToDatabase();
    
    const { id } = params;
    const data = await request.json();
    
    // 업데이트 전 견적 확인
    const existingEstimate = await Estimate.findById(id);
    
    // 견적이 없는 경우
    if (!existingEstimate) {
      return NextResponse.json({ 
        success: false, 
        message: '업데이트할 견적을 찾을 수 없습니다.'
      }, { status: 404 });
    }
    
    // 수정 시간 업데이트
    data.updatedAt = Date.now();
    
    // ID로 견적 찾아서 업데이트
    const updatedEstimate = await Estimate.findByIdAndUpdate(
      id, 
      data,
      { new: true, runValidators: true }
    );
    
    // 성공 응답 반환
    return NextResponse.json({ 
      success: true, 
      message: '견적이 성공적으로 업데이트되었습니다.',
      estimate: updatedEstimate
    });
    
  } catch (error) {
    console.error('Error updating estimate:', error);
    
    // 에러 응답 반환
    return NextResponse.json({ 
      success: false, 
      message: '견적 업데이트 중 오류가 발생했습니다.',
      error: error.message 
    }, { status: 500 });
  }
} 