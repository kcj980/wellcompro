export default function Home() {
  return (
    <main>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">사용법</h1>
        
        {/* 2개 컬럼 레이아웃 컨테이너 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* 첫 번째 컬럼 */}
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">1. 견적 작성</h2>
              <div className="ml-4 space-y-2">
                <p className="text-gray-600">① 견적 작성 페이지 접속 방법:</p>
                <ul className="ml-6 list-disc text-gray-600">
                  <li>오른쪽 상단 '견적' 버튼 클릭</li>
                  <li>또는 검색 페이지 하단 '견적 작성하기' 버튼 클릭</li>
                </ul>

                <p className="text-gray-600 mt-4">② 기본 정보 입력 (*표시는 필수입력):</p>
                <ul className="ml-6 list-disc text-gray-600">
                  <li>고객 정보: 이름*, 핸드폰번호, PC번호</li>
                  <li>계약 정보: 계약구분, 판매형태, 구입형태, AS조건, 운영체계, 견적담당</li>
                </ul>

                <p className="text-gray-600 mt-4">③ 상품 정보 입력*:</p>
                <ul className="ml-6 list-disc text-gray-600">
                  <li>일괄 데이터 입력: 다나와, 견적왕 지원</li>
                  <li>개별 입력: "상품 정보 입력창+" 버튼으로 추가</li>
                  <li>필수 항목: 분류, 상품명, 수량, 현금가</li>
                  <li>수량 2개 이상: 1개 가격 입력 후 수량 곱하기 버튼으로 자동 계산</li>
                </ul>

                <p className="text-gray-600 mt-4">④ 결제 정보 입력:</p>
                <ul className="ml-6 list-disc text-gray-600">
                  <li>공임비, 세팅비, 할인, 계약금 입력</li>
                  <li>택배비: 최종 금액과 별도 표시</li>
                  <li>VAT 포함 여부 설정</li>
                  <li>백-천자리 올림/내림 설정</li>
                  <li>결제 방법 선택</li>
                </ul>

                <p className="text-gray-600 mt-4">⑤ 참고사항 입력 (선택, 내부관리용)</p>
                <p className="text-gray-600">⑥ '저장하기' 버튼 클릭 → 1.5초 후 검색 페이지로 이동</p>
              </div>
            </section>
          </div>
          
          {/* 두 번째 컬럼 */}
          <div className="space-y-8">
          <section>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">2. 견적 조회</h2>
              <div className="ml-4 space-y-2 text-gray-600">
                <p>① 오른쪽 상단 '검색' 버튼 클릭</p>
                <p>② 검색창에 고객명/연락처/PC번호 중 입력</p>
                <p>③ 검색된 견적 클릭 시 상세페이지로 이동</p>
              </div>
            </section>
            <section>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">3. 견적 수정</h2>
              <div className="ml-4 space-y-2 text-gray-600">
                <p>① 상세 페이지에서 '수정' 버튼 클릭</p>
                <p>② 필요한 정보 수정</p>
                <p>③ '수정하기' 버튼 클릭하여 완료</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">4. 견적 삭제</h2>
              <div className="ml-4 space-y-2 text-gray-600">
                <p>① 상세 페이지에서 '삭제' 버튼 클릭</p>
                <p>② 확인 후 삭제 완료</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">5. 견적서 출력</h2>
              <div className="ml-4 space-y-2">
                <p className="text-gray-600">방법 1: 검색 페이지에서</p>
                <ul className="ml-6 list-disc text-gray-600">
                  <li>검색된 견적 오른쪽 '견적서' 버튼 클릭</li>
                  <li>오른쪽 상단 인쇄 버튼 클릭</li>
                </ul>

                <p className="text-gray-600 mt-4">방법 2: 상세 페이지에서</p>
                <ul className="ml-6 list-disc text-gray-600">
                  <li>상단 프린터 버튼 클릭</li>
                  <li>오른쪽 상단 인쇄 버튼 클릭</li>
                </ul>
              </div>
            </section>
          </div>
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">수정사항</h2>
              <div className="ml-4 space-y-2 text-gray-600">
                <ul className="list-disc ml-6">
                  <li>엑셀 내보내기 기능 삭제</li>
                  <li>다나와 일괄입력 데이터 형식 수정</li>
                  <li>분류에 SSD인 경우 "SSD/M.2 NVMe"로 변경 후 저장</li>
                  <li>택배비를 배송+설치 비용으로 변경</li>
                  <li>계약자 여부 체크박스 추가 (저장/수정하기 옆)</li>
                  <li>판매형태 직접입력 기능 수정 완료</li>
                  <li>서비스물품 추가 입력칸 생성 및 DB 저장 완료</li>
                  <li>상세페이지에 계약자 확인, 서비스 상품 추가</li>
                  <li>견적서 메인페이지 추가
                    <ul className="list-disc ml-6 mt-2">
                      <li>견적서(일반소비자), 견적서(기업), 납품서 버튼 추가</li>
                      <li>버튼 클릭 시 해당 견적서 페이지로 이동 후 인쇄 페이지 표시</li>
                    </ul>
                  </li>
                  <li>견적서(일반소비자) 변경사항
                    <ul className="list-disc ml-6 mt-2">
                      <li>상호 로고 추가</li>
                      <li>공급자와 공급받는자 위치 변경 및 테이블 형식으로 변경하여 공간 절약</li>
                      <li>상품데이터에서 단가 제거</li>
                      <li>결제 정보를 표 형식으로 변경하여 공간 절약</li>
                      <li>서비스 물품 추가</li>
                    </ul>
                  </li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
