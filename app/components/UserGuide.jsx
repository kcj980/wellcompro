"use client";

import { useState } from 'react';
import { Tabs, Tab } from '@mui/material';
import { FaInfoCircle, FaFileInvoiceDollar, FaSearch, FaUserEdit, FaPrint } from 'react-icons/fa';

export default function UserGuide() {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">웰컴 사용 가이드</h1>
        <p className="text-lg opacity-90">견적 관리 시스템 사용법 안내</p>
      </div>

      <Tabs 
        value={activeTab} 
        onChange={handleTabChange} 
        variant="scrollable"
        scrollButtons="auto"
        className="border-b border-gray-200"
        TabIndicatorProps={{
          style: {
            backgroundColor: '#3b82f6',
          }
        }}
      >
        <Tab label="기본 사용법" icon={<FaInfoCircle />} iconPosition="start" />
        <Tab label="견적 작성" icon={<FaFileInvoiceDollar />} iconPosition="start" />
        <Tab label="검색" icon={<FaSearch />} iconPosition="start" />
        <Tab label="상세페이지" icon={<FaUserEdit />} iconPosition="start" />
        <Tab label="견적서 인쇄" icon={<FaPrint />} iconPosition="start" />
      </Tabs>

      <div className="p-6">
        {activeTab === 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">1. 상단 네비게이션 바</h2>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <ul className="list-disc pl-5 space-y-2">
                <li className="text-gray-700">
                  <span className="font-medium">왼쪽 상단 [wellcom], 오른쪽 상단 패널(임시)</span> → 사용법 페이지(메인화면)
                </li>
                <li className="text-gray-700">
                  <span className="font-medium">오른쪽 상단 [견적]</span> → 새로운 견적 추가 페이지
                </li>
                <li className="text-gray-700">
                  <span className="font-medium">오른쪽 상단 [검색]</span> → 저장된 견적데이터 검색 페이지 및 상세페이지 이동 경로
                </li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">2. 견적 작성</h2>
            <div className="bg-yellow-50 p-5 rounded-lg border-2 border-yellow-300 mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
                <span className="bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">✨</span>
                신기능! 다나와 자동 견적 가져오기
              </h3>
              
              <div className="ml-10 space-y-3">
                <p className="font-medium text-gray-800">
                  크롬 확장프로그램으로 다나와 사이트에서 <span className="bg-yellow-200 px-2 py-1 rounded">클릭 한 번</span>으로 
                  상품 정보를 자동으로 가져올 수 있습니다!
                </p>
                
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <p className="font-medium text-gray-700 mb-2">📌 사용 방법:</p>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>다나와에서 원하는 상품을 장바구니에 담기</li>
                    <li>왼쪽 상단의 <span className="font-bold text-blue-600">"WellCompro로 견적 보내기"</span> 버튼 클릭</li>
                    <li>자동으로 견적 페이지로 이동하면서 모든 상품 데이터가 입력됨</li>
                  </ol>
                </div>
                
                <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                  <p className="font-medium text-red-700">⚠️ 주의사항:</p>
                  <p className="text-gray-700">
                    견적서 작성 중에 다나와에서 상품을 추가하면, 기존 데이터에 추가되지 않고 
                    <span className="font-bold"> 새 창이 열리면서</span> 그 새 창에 다나와 상품들이 저장됩니다.
                  </p>
                </div>
                
                <p className="text-sm text-gray-600 italic">
                  * 확장 프로그램 설치 방법은 상단의 '확장 프로그램 다운로드' 버튼 아래에 안내되어 있습니다.
                </p>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
              <p className="font-medium text-blue-800">
                <FaInfoCircle className="inline mr-2" />
                우선 고객정보에 이름, 상품 정보 최소 1개는 견적을 저장하기 위한 필수 입력 정보입니다.
              </p>
            </div>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center mr-2">1</span>
                  고객정보
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 ml-9">
                  <ul className="list-disc pl-5 space-y-2">
                    <li className="text-gray-700">
                      <span className="font-medium">이름:</span> 텍스트, 필수입력사항, 나중에 검색에 사용됨
                    </li>
                    <li className="text-gray-700">
                      <span className="font-medium">핸드폰번호:</span> 숫자, 숫자 11자리가 입력되면 자동으로 "-"붙여줌 이후 추가로 더 입력가능
                    </li>
                    <li className="text-gray-700">
                      <span className="font-medium">PC번호:</span> 오늘 년도월PC 까진 자동으로 입력되어 있음. 이후 번호만 숫자로 입력
                    </li>
                    <li className="text-gray-700">
                      <span className="font-medium">계약구분, 판매형태, 구입형태, AS조건, 운영체계, 견적담당:</span> 원하는 옵션을 선택하거나 직접 입력을 통해 원하는 텍스트 입력 가능
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center mr-2">2</span>
                  상품데이터(일괄 데이터 입력)
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 ml-9">
                  <p className="text-gray-700 mb-2 italic">일괄 데이터 형식은 다나와, 견적왕 2개 지원 / 복사 하는 형식은 해당 페이지 참조</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li className="text-gray-700">
                      <span className="font-medium">일괄 데이터 입력(다나와, 견적왕):</span> 해당형식을 붙여넣기 한다음, 해당 등록 버튼을 눌리면 아래 상품 테이블에 일괄 입력 됨.
                    </li>
                    <li className="text-gray-700">
                      <span className="font-medium">일괄 입력아래, 상품테이블 위쪽에 상품 정보입력버튼과 전체 삭제 버튼이 있다.</span>
                      <ul className="list-disc pl-5 mt-1">
                        <li>전체 삭제 버튼: 아래 상품테이블에 저장되어 있는 모든 상품을 한번에 삭제한다.</li>
                        <li>상품 정보 버튼: 상품정보버튼을 눌리면 상품정보 입력창을 열었다 닫았다 할수 있다. 이 창에 직접 상품을 등록 할 수 있다. 이 때 분로, 상품명, 수량, 현금가는 필수 입력 사항이다.</li>
                      </ul>
                    </li>
                    <li className="text-gray-700">
                      <span className="font-medium text-red-600">※주의사항※</span> 현금가는 1개의 가격이아니라 1개의 가격에 수량이 곱해진 값이다. 이를 쉽게 계산하기 위해 현금가에 1개의 금액을 입력하고 오른쪽에 수량 곱하기 버튼을 눌리면 입력한 금액과 수량이 곱해진 값이 자동으로 계산되어 나타난다.
                    </li>
                    <li className="text-gray-700">
                      <span className="font-medium">상품테이블:</span> 일괄데이터입력이나, 상품정보입력창으로 입력받은 데이터가 여기에 표시된다. 행 왼쪽에 보면 수정과 삭제 버튼이 있다.
                      <ul className="list-disc pl-5 mt-1">
                        <li>삭제: 해당 행(상품)하나만 삭제한다.</li>
                        <li>수정: 수정버튼을 눌리면 위쪽에 상품정보입력창이 열리면서 해당 행의 정보가 입력되어 있다. 상품정보 입력창에서 정보를 수정한뒤 밑에 수정을 눌리면 데이터가 수정되어 저장된다.</li>
                      </ul>
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center mr-2">3</span>
                  서비스 물품
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 ml-9">
                  <ul className="list-disc pl-5 space-y-2">
                    <li className="text-gray-700">
                      <span className="font-medium">옵션 선택:</span> 마우스, 마우스패드, 키보드, 스피커 옵션을 클릭하면 아래 서비스테이블에 상품 정보가 추가된다.
                    </li>
                    <li className="text-gray-700">
                      <span className="font-medium">직접 입력:</span> 옵션에 없는 상품명을 입력하고 수량도 입력후 추가하기를 눌리면 서비스 테이블에 상품 정보가 추가된다.
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center mr-2">4</span>
                  결제 정보
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 ml-9">
                  <p className="text-gray-700 mb-3 italic">왼쪽 위부터 아래로 진행하고 오른쪽 위로 이동후 아래로 진행하는 순서로하면 실수할 부분이 줄어들 수 있다.</p>
                  
                  <h4 className="font-semibold text-gray-800 mb-2">1) 결제 정보 입력</h4>
                  <ul className="list-disc pl-5 space-y-2 mb-4">
                    <li className="text-gray-700">
                      처음엔 위에 상품테이블에 추가되어있는 상품들의 현금가 합인 상품/부품 합 금액이 보인다.(선택 안해도 됨)
                    </li>
                    <li className="text-gray-700">
                      그 왼쪽아래 공임비와 세팅비는 옵션을 선택 할 수 있고, 직접 입력도 할 수 있다.(선택 안해도 됨)
                    </li>
                    <li className="text-gray-700">
                      그 아래 절삭을 제외한 할인 금액을 입력한다.(입력 안해도 됨)
                    </li>
                    <li className="text-gray-700">
                      그럼 아래 총 구입 금액으로(상품/부품+공임비+세팅비-할인)계산된 수치가 보인다. 해당 칸에 백원↓, 천원↓, 만원↓버튼이 있다 해당 버튼을 눌리면 해당 단위에서 총 구입 금액을 절삭해준다. 절삭된 금액은 위쪽 서비스 테이블에 자동 등록된다. 만약 취소 버튼을 눌리면 서비스 품목에 등록되져 있는 절삭 상품데이터도 같이 삭제된다.
                    </li>
                    <li className="text-gray-700">
                      오른쪽으로 이동후 VAT포함 여부를 결정한다. 포함하면 포함할 %수치를 입력한다.(기본값10)
                    </li>
                    <li className="text-gray-700">
                      아래는 VAT가 포함된 최종 결제 금액 표시된다.
                    </li>
                  </ul>

                  <h4 className="font-semibold text-gray-800 mb-2">2) 배송+설치 비용 & 추가 정보</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    <li className="text-gray-700">
                      <span className="font-medium">계약금:</span> 있으면 입력
                    </li>
                    <li className="text-gray-700">
                      <span className="font-medium">배송+설치 비용:</span> 있으면 입력 (최종결제금액 미포함)
                    </li>
                    <li className="text-gray-700">
                      <span className="font-medium">결제 방법:</span> 카드, 현금 옵션을 선택 할 수도 있고, 직접 입력도 가능함 / 위쪽에vat포함을 하면 카드, vat포함을 안하면 현금으로 자동 선택되어진다. 반대로 수정도 가능하다.
                    </li>
                    <li className="text-gray-700">
                      <span className="font-medium">출고일자:</span> 달력 형식으로 입력 / 오늘날자로 기본 설정되어 있다.
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center mr-2">5</span>
                  참고사항
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 ml-9">
                  <p className="text-gray-700">소비자에겐 안보이는 정보를 따로 기록, 저장 해둘수 있는 입력창이다.</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center mr-2">6</span>
                  계약자 체크 및 저장하기
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 ml-9">
                  <ul className="list-disc pl-5 space-y-2">
                    <li className="text-gray-700">위치 상단, 하단에 둘다 위치함</li>
                    <li className="text-gray-700">해당 견적이 계약된거면 체크 아니면 체크하지 않으면된다.</li>
                    <li className="text-gray-700">위 모든 사항을 입력하거나 필수항목만 입력하고 저장하기 버튼을 눌리면 견적이 저장된다.</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">견적 수정</h3>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <ul className="list-disc pl-5 space-y-2">
                    <li className="text-gray-700">수정은 검색 페이지에서 해당 견적을 클릭한후 나타나는 상세페이지 상단 하단에 수정 버튼을 눌려 견적을 수정할 수 있다.</li>
                    <li className="text-gray-700">수정페이지로 오면 해당 견의 데이터가 다 입력되어 있다.</li>
                    <li className="text-gray-700">견적 작성법(새로운 견적 추가)에서 설명한 방식과 같은 방식으로 정보를 수정후 화면 상단과 하단에 수정하기 버튼을 눌리면 수정된 값으로 저장된다.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">3. 검색</h2>
            
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">검색 기능</h3>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">① 계약자 필터 - 상단 중앙에 위치</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li className="text-gray-700">모든견적: 계약자+비계약자 로 모든 데이터 보여준다.</li>
                    <li className="text-gray-700">계약자 견적만: 계약자 데이터만 보여준다.</li>
                    <li className="text-gray-700">비계약자 견적만: 비계약자 데이터만 보여준다.</li>
                  </ul>
                </div>
                
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">② 검색어 입력 필터</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li className="text-gray-700">상단에 검색 입력창에 [고객명, 연락처, PC번호]중 아무거나 입력하면 해당 글자가 포함된 모든 견적 검색된다.</li>
                    <li className="text-gray-700">계약자 필터도 적용된 상태에서 검색어 필터 작동함.</li>
                  </ul>
                </div>
                
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">③ 정렬</h4>
                  <p className="text-gray-700">최신순, 오래된순, 고객명 오름/내림순, 금액 오름/내림순 으로 정렬이 가능하다.</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">④ 검색된 견적 테이블</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li className="text-gray-700">원하는 견적 행을 전체중 아무데나 클릭하면 해당 견적의 상세페이지로 이동 가능</li>
                    <li className="text-gray-700">원하는 견적의 오른쪽 끝에 견적서 버튼을 눌리면 적적서 인쇄 페이지로 이동 가능</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">4. 상세페이지</h2>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-gray-700 mb-3">검색 페이지에서 접근 할 수 있다.</p>
              <p className="text-gray-700 mb-3">해당 견적의 모든 정보를 볼 수 있는 페이지다.</p>
              <p className="text-gray-700 mb-3">상단 하단에 견적서버튼, 수정, 삭제 버튼이 있다.</p>
              <ul className="list-disc pl-5 space-y-2">
                <li className="text-gray-700"><span className="font-medium">견적서버튼:</span> 견적서 페이지로 이동함</li>
                <li className="text-gray-700"><span className="font-medium">수정버튼:</span> 수정페이지로 이동함</li>
                <li className="text-gray-700"><span className="font-medium">삭제버튼:</span> 해당 견적을 영구히 삭제함</li>
              </ul>
              <p className="text-gray-700 mt-3 italic">(현재 상세 페이지 디자인은 완성하지 못했지만 일단 데이터는 다 보여줌)</p>
            </div>
          </div>
        )}

        {activeTab === 4 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">5. 견적서 인쇄</h2>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-gray-700 mb-3">검색페이지에서 해당 견적의 오른쪽 끝 견적서버튼이나, 상세페이지 상하단에있는 견적서 버튼으로 접근 가능</p>
              <p className="text-gray-700 mb-3">해당 견적의 견적서(일반소비자), 견적서(기업), 견전계약서, 납품서 총4가지의 견적을 인쇄할 수 있다.</p>
              <p className="text-gray-700 mb-3 text-red-600 font-medium">※주의사항※ 현재 견적서(일반소비자)만 완성된 상태</p>
              
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">견적서(일반소비자)</h3>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-2">문서설정 & 공지사항관리</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    <li className="text-gray-700">
                      <span className="font-medium">빈 행 추가:</span> 우선 대충 계산된 행이 초기값으로 설정되고 인쇄하기 버튼을 눌렸을 때 견적서 세로 길이가 맘에 들지 않으면 -,+버튼으로 수정 가능.
                    </li>
                    <li className="text-gray-700">
                      <span className="font-medium">공지사항 필독 추가, 인감도장 표시:</span> 체크박스로 추가 삭제 토글 형식으로 가능.
                    </li>
                    <li className="text-gray-700">
                      <span className="font-medium">공지사항 수정:</span> 버튼을 눌리면 밑에 공지사항이 적용되어 있는 텍스트 입력 창이 나온다. 원하는 문구를 첨삭하고 저장을 눌리면 모든 견적서(일반소비자)에 적용된다.
                    </li>
                  </ul>
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-yellow-800 font-medium">※주의사항※</p>
                    <p className="text-yellow-800">인쇄 버튼을 눌리면 나오는 미리보기 화면에서 배경색이 없으면 설정 더보기-배경 그래픽을 채크하면 배경색 적용 됨.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 