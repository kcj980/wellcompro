'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';

export default function InvoicePage({ params }) {
  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const invoiceRef = useRef(null);
  const { id } = params;
  
  // 견적 데이터를 불러오는 함수
  useEffect(() => {
    const fetchEstimate = async () => {
      try {
        setLoading(true);
        
        // API를 통해 견적 데이터 불러오기
        const response = await fetch(`/api/estimates/${id}`, {
          cache: 'no-store'
        });
        
        if (!response.ok) {
          throw new Error(`서버 오류: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Loaded estimate for invoice:', data);
        
        if (!data.success || !data.estimate) {
          throw new Error(data.message || '견적을 찾을 수 없습니다.');
        }
        
        setEstimate(data.estimate);
        setError(null);
      } catch (err) {
        console.error('Error fetching estimate:', err);
        setError(`데이터를 불러오는 중 오류가 발생했습니다: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchEstimate();
    }
  }, [id]);
  
  // 날짜 형식 변환 함수
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}년 ${month}월 ${day}일`;
  };
  
  // 홈으로 돌아가기
  const handleBackClick = () => {
    router.back();
  };
  
  // 인쇄 함수
  const handlePrint = () => {
    const content = document.querySelector('.print-this-section');
    
    if (content) {
      // 인쇄할 요소만 표시하는 HTML 생성
      const printContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>견적서 인쇄</title>
            <style>
              /* 기본 스타일 */
              body {
                font-family: 'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif;
                margin: 0;
                padding: 10px;
                background-color: #ffffff;
                color: #333333;
              }
              
              /* 테이블 스타일 */
              table {
                width: 670px !important;
                margin-left: -15px !important;
                border-collapse: collapse !important;
                border: 1px solid #93c5fd !important;
              }
              
              /* 테이블 열 너비 설정 */
              table th:nth-child(1), table td:nth-child(1) {
                width: 4% !important; /* No. */
              }
              
              table th:nth-child(2), table td:nth-child(2) {
                width: 13% !important; /* 분류 */
              }
              
              table th:nth-child(3), table td:nth-child(3) {
                width: 50% !important; /* 상품명 */
              }
              
              table th:nth-child(4), table td:nth-child(4) {
                width: 7% !important; /* 수량 */
              }
              
              table th:nth-child(5), table td:nth-child(5) {
                width: 13% !important; /* 단가 */
              }
              
              table th:nth-child(6), table td:nth-child(6) {
                width: 13% !important; /* 금액 */
              }
              
              th, td {
                border: 1px solid #93c5fd !important;
                padding: 2px 6px;
                font-size: 0.875rem;
              }
              
              thead tr {
                background-color: #dbeafe !important;
              }
              
              tbody tr:nth-child(even) {
                background-color: #f0f7ff !important;
              }
              
              tbody tr:nth-child(odd) {
                background-color: #ffffff !important;
              }
              
              .text-center {
                text-align: center;
              }
              
              .text-right {
                text-align: right !important;
              }
              
              /* 컨테이너 스타일 */
              .bg-blue-50, .bg-blue-50-print {
                background-color: #f0f7ff !important;
              }
              
              .bg-blue-100, .bg-blue-100-print {
                background-color: #dbeafe !important;
              }
              
              .bg-white, .bg-white-print {
                background-color: #ffffff !important;
              }
              
              /* 테두리 스타일 */
              .border, .border-print {
                border-width: 1px !important;
                border-style: solid !important;
              }
              
              .border-blue-300, .border-blue-300-print {
                border-color: #93c5fd !important;
              }
              
              .rounded-lg, .rounded-lg-print {
                border-radius: 0.5rem !important;
              }
              
              /* 레이아웃 스타일 */
              .flex {
                display: flex !important;
              }
              
              .grid {
                display: grid;
              }
              
              .grid-cols-1 {
                grid-template-columns: repeat(1, minmax(0, 1fr));
              }
              
              .grid-cols-2 {
                grid-template-columns: repeat(2, minmax(0, 1fr));
              }
              
              .font-semibold {
                font-weight: 600;
              }
              
              .font-bold {
                font-weight: 700;
              }
              
              .justify-between {
                display: flex !important;
                justify-content: space-between !important;
              }
              
              /* 여백 스타일 */
              .mx-4 {
                margin-left: 1rem;
                margin-right: 1rem;
              }
              
              .mb-1 {
                margin-bottom: 0.25rem;
              }
              
              .mb-2 {
                margin-bottom: 0.5rem;
              }
              
              .mb-3 {
                margin-bottom: 0.75rem;
              }
              
              .mb-4 {
                margin-bottom: 1rem;
              }
              
              .mb-6 {
                margin-bottom: 1.5rem;
              }
              
              .mt-4 {
                margin-top: 1rem;
              }
              
              .p-2 {
                padding: 0.5rem;
              }
              
              .p-4 {
                padding: 1rem;
              }
              
              .pt-2 {
                padding-top: 0.5rem;
              }
              
              .pb-2 {
                padding-bottom: 0.5rem;
              }
              
              /* 테두리 스타일 */
              .border-t {
                border-top-width: 1px !important;
                border-top-style: solid !important;
              }
              
              .border-b {
                border-bottom-width: 1px !important;
                border-bottom-style: solid !important;
              }
              
              /* 추가적인 레이아웃 스타일 */
              .gap-4 {
                gap: 1rem;
              }
              
              /* 미디어 쿼리를 사용하여 2열 레이아웃 구현 */
              @media (min-width: 768px) {
                .md\\:grid-cols-2 {
                  grid-template-columns: repeat(2, minmax(0, 1fr));
                }
              }
              
              /* 인쇄 설정 */
              @page {
                size: auto;
                margin: 1cm;
              }
              
              /* 결제 정보와 참고사항 섹션 스타일 */
              .payment-info-container, .reference-container {
                border: 1px solid #93c5fd !important;
                border-radius: 0.5rem !important;
                padding: 1rem !important;
                background-color: #f0f7ff !important;
                margin-left: 0.25rem !important;
                margin-right: 0.25rem !important;
                margin-bottom: 1.25rem !important; /* 마진 증가 */
                margin-top: 1rem !important; /* 마진 추가 */
              }
              
              /* 참고사항 컨테이너 특별 스타일 */
              .reference-container {
                padding: 0.75rem !important; /* 패딩 줄임 */
                margin-bottom: 3px !important; /* 아래 마진 3px으로 설정 */
              }
              
              /* 참고사항 제목 스타일 */
              .reference-container h3 {
                margin-top: 0 !important;
                margin-bottom: 0.1875rem !important; /* 3px */
                font-size: 1.25rem !important;
                font-weight: bold !important;
                color: #1e40af !important; /* text-blue-800 */
                border-bottom: 1px solid #93c5fd !important;
                padding-bottom: 0.25rem !important;
              }
              
              /* 마진 클래스 명시적으로 정의 */
              .mb-5 {
                margin-bottom: 1.25rem !important;
              }
              
              .mx-1 {
                margin-left: 0.25rem !important;
                margin-right: 0.25rem !important;
              }
              
              .px-4 {
                padding-left: 1rem !important;
                padding-right: 1rem !important;
              }
              
              .pb-0 {
                padding-bottom: 0 !important;
              }
              
              .pt-3 {
                padding-top: 0.75rem !important;
              }
              
              /* 결제 정보 스타일 */
              .bg-blue-200, .bg-blue-200-print {
                background-color: #bfdbfe !important;
              }
              
              .bg-gray-50, .bg-gray-50-print {
                background-color: #f9fafb !important;
              }
              
              .text-blue-900, .text-blue-900-print {
                color: #1e3a8a !important;
              }
              
              .text-gray-600, .text-gray-600-print {
                color: #4b5563 !important;
              }
              
              .rounded-md, .rounded-md-print {
                border-radius: 0.375rem !important;
              }
              
              .shadow-sm, .shadow-sm-print {
                box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
              }
              
              .space-y-1 > * + * {
                margin-top: 0.25rem !important;
              }
              
              .list-disc {
                list-style-type: disc !important;
                padding-left: 1.25rem !important;
              }
              
              .inline-block {
                display: inline-block !important;
              }
              
              .mt-1 {
                margin-top: 0.25rem !important;
              }
              
              .px-2 {
                padding-left: 0.5rem !important;
                padding-right: 0.5rem !important;
              }
              
              .text-xs {
                font-size: 0.75rem !important;
              }
              
              .text-sm {
                font-size: 0.875rem !important;
              }
              
              .text-base {
                font-size: 1rem !important;
              }
              
              .items-center {
                align-items: center !important;
              }
              
              /* 테두리 추가 스타일 */
              .border-b {
                border-bottom-width: 1px !important;
                border-bottom-style: solid !important;
              }
              
              .border-blue-200 {
                border-color: #bfdbfe !important;
              }
              
              /* 마진 추가 스타일 */
              .mb-3 {
                margin-bottom: 0.75rem !important;
              }
              
              .space-y-2 > * + * {
                margin-top: 0.5rem !important;
              }
              
              /* 패딩 추가 스타일 */
              .p-1 {
                padding: 0.25rem !important;
              }
              
              .p-2 {
                padding: 0.5rem !important;
              }
              
              .pb-2 {
                padding-bottom: 0.5rem !important;
              }
              
              /* 정렬 클래스 */
              .justify-end {
                display: flex !important;
                justify-content: flex-end !important;
              }
              
              .justify-between {
                display: flex !important;
                justify-content: space-between !important;
              }
              
              .text-right {
                text-align: right !important;
              }
              
              .items-center {
                align-items: center !important;
              }
              
              /* 헤더 스타일 향상 */
              .invoice-header {
                display: flex !important;
                flex-direction: row !important;
                justify-content: space-between !important;
                align-items: center !important;
                width: 100% !important;
                margin-bottom: 1rem !important;
              }
              
              .invoice-title-container {
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                flex: 1 !important;
              }
              
              .logo-container {
                display: flex !important;
                align-items: center !important;
                width: 33% !important;
              }
              
              .date-container {
                display: flex !important;
                justify-content: flex-end !important;
                align-items: center !important;
                width: 33% !important;
                text-align: right !important;
              }
              
              /* 로고 이미지 스타일 */
              .logo {
                max-height: 50px !important;
                max-width: 100px !important;
                object-fit: contain !important;
              }
              
              /* 헤더 컨테이너 */
              .header-container {
                position: relative !important;
                padding-top: 5px !important; /* 상단 패딩 5px로 설정 */
                margin-bottom: 15px !important; /* 하단 마진 15px로 설정 */
              }
              
              /* 견적서 제목 요소 */
              .title-element {
                margin-top: 5px !important; /* 상단 마진 5px로 설정 */
                margin-bottom: 15px !important; /* 하단 마진 15px로 설정 */
              }
              
              /* 견적일자 요소 */
              .date-element {
                position: absolute !important;
                top: 0px !important; /* -5px에서 0px로 변경 (5px 더 낮춤) */
                right: 15px !important;
                text-align: right !important;
                font-size: 14px !important;
                display: block !important;
                visibility: visible !important;
                z-index: 999 !important;
              }
              
              @media print {
                .date-element {
                  position: absolute !important;
                  top: 0px !important; /* -5px에서 0px로 변경 (5px 더 낮춤) */
                  right: 15px !important;
                  display: block !important;
                  visibility: visible !important;
                  z-index: 999 !important;
                }
              }
              
              /* 공급자/공급받는자 제목 스타일 */
              div[style*="flex: 6"] h2, 
              div[style*="flex: 4"] h2 {
                font-size: 1.125rem !important;
                font-weight: bold !important;
                margin-top: 0px !important; /* 상단 마진 0px로 변경 */
                margin-bottom: 0.25rem !important;
                text-align: center !important;
                border-bottom: 1px solid #bfdbfe !important;
                padding-bottom: 0.25rem !important;
              }
              
              /* 공급자/공급받는자 키-값 스타일 */
              .flex .font-semibold.w-24 {
                width: 6rem !important;
                min-width: 6rem !important;
                display: inline-block !important;
                font-weight: 600 !important;
                text-align: left !important;
              }
              
              .flex {
                display: flex !important;
                align-items: center !important;
                line-height: 1.5 !important;
                margin-bottom: 0.125rem !important;
              }
              
              /* 테이블 합계 행 스타일 */
              .bg-blue-100.font-medium td {
                font-weight: 700 !important; /* bold 처리 */
                font-size: 0.9rem !important; /* 글자 크기 약간 크게 */
              }
              
              /* 결제 정보 제목 스타일 */
              .mb-6.border.border-blue-300.rounded-lg.p-4.bg-blue-50 h2 {
                margin-top: 0px !important;
              }
              
              /* 결제 정보 섹션 내부 요소 스타일 강화 */
              .payment-info-container > h2 {
                margin-top: 0px !important;
                margin-bottom: 0.75rem !important;
              }
              
              .payment-info-container > div {
                margin-top: 0 !important;
              }
              
              .payment-info-container > div > div {
                margin-top: 0.25rem !important;
                margin-bottom: 0.25rem !important;
              }
              
              .payment-info-container .bg-white {
                margin-bottom: 0.25rem !important;
              }
              
              /* 인쇄 시 비용 항목 가로 배치 */
              .payment-info-container .grid {
                display: flex !important;
                flex-direction: row !important;
                flex-wrap: nowrap !important;
                gap: 0.5rem !important;
                justify-content: flex-start !important;
              }
              
              .payment-info-container .bg-blue-200 {
                margin-top: 0.5rem !important;
                margin-bottom: 0.25rem !important;
              }
              
              .payment-info-container .flex.justify-end {
                margin-top: 0.25rem !important;
              }
              
              /* 인쇄 시 할인/부가세 항목 가로 너비 강화 */
              .payment-info-container div[class*="grid"] div.bg-white {
                width: 100% !important;
                box-sizing: border-box !important;
              }
              
              /* 인쇄 시 할인/부가세 그리드 레이아웃 강화 */
              .payment-info-container div[class*="grid-cols-1"] {
                display: grid !important;
                grid-template-columns: 1fr !important;
                width: 100% !important;
              }
              
              .payment-info-container div[class*="grid-cols-2"] {
                display: grid !important;
                grid-template-columns: 1fr 1fr !important;
                width: 100% !important;
              }

              /* 테이블 열 정렬 스타일 */
              table th:nth-child(1), table td:nth-child(1),
              table th:nth-child(2), table td:nth-child(2),
              table th:nth-child(4), table td:nth-child(4),
              table th:nth-child(5), table td:nth-child(5),
              table th:nth-child(6), table td:nth-child(6) {
                text-align: center !important;
              }

              /* 테이블 합계 행 특별 스타일 */
              table tbody tr.bg-blue-100.font-medium td[colspan="4"] {
                text-align: right !important;
                font-weight: bold !important;
              }
              
              table tbody tr.bg-blue-100.font-medium td[colspan="2"] {
                text-align: center !important;
                font-weight: bold !important;
              }
            </style>
          </head>
          <body>
            <!-- 인쇄 콘텐츠 시작 -->
            <div style="background-color: #ffffff; padding: 10px; border: 2px solid #93c5fd; border-radius: 8px;">
              ${content.innerHTML}
            </div>
            <!-- 인쇄 콘텐츠 끝 -->
          </body>
        </html>
      `;
      
      // 새 창에서 인쇄
      const printWindow = window.open('', '_blank');
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // 인쇄 실행
      printWindow.onload = function() {
        // DOM이 로드된 후 추가 스타일 적용
        const paymentInfoContainers = printWindow.document.querySelectorAll('.mb-5.border.border-blue-300.rounded-lg.px-4.pb-0.pt-3.bg-blue-50.mx-1, .mb-6.border.border-blue-300.rounded-lg.p-4.bg-blue-50.mx-1, .mb-6.border.border-blue-300.rounded-lg.p-4.bg-blue-50.mx-4');
        paymentInfoContainers.forEach(container => {
          container.classList.add('payment-info-container');
          
          // 마진 및 패딩 명시적 적용
          container.style.marginBottom = '1.25rem';
          container.style.marginTop = '1rem';
          container.style.marginLeft = '0.25rem';
          container.style.marginRight = '0.25rem';
          container.style.paddingLeft = '1rem';
          container.style.paddingRight = '1rem';
          container.style.paddingBottom = '0';
          container.style.paddingTop = '0.75rem';
          
          // 결제 정보 타이틀 스타일 적용
          const paymentTitle = container.querySelector('h2, h3');
          if (paymentTitle) {
            paymentTitle.style.marginTop = '0px';
            paymentTitle.style.marginBottom = '0.75rem';
            paymentTitle.style.fontSize = '1.25rem';
            paymentTitle.style.fontWeight = 'bold';
            paymentTitle.style.color = '#1e40af'; // text-blue-800
            paymentTitle.style.borderBottom = '1px solid #93c5fd';
            paymentTitle.style.paddingBottom = '0.5rem';
          }
          
          // 결제 정보 내 모든 요소들 선택
          const contentDiv = container.querySelector('div.space-y-2');
          if (contentDiv) {
            contentDiv.style.marginTop = '0';
            
            // 모든 직계 자식 div 요소에 마진 적용
            const directChildDivs = contentDiv.querySelectorAll(':scope > div');
            directChildDivs.forEach((div, index) => {
              // 첫번째 자식 요소는 위 마진 없음
              if (index === 0) {
                div.style.marginTop = '0';
              } else {
                div.style.marginTop = '0.5rem';
              }
              div.style.marginBottom = '0.25rem';
            });
            
            // 상품/부품 합계 박스
            const productTotalBox = contentDiv.querySelector('div.flex.justify-between.items-center.bg-white');
            if (productTotalBox) {
              productTotalBox.style.marginTop = '0';
              productTotalBox.style.marginBottom = '0.5rem';
              productTotalBox.style.padding = '0.5rem';
              productTotalBox.style.backgroundColor = '#ffffff';
              productTotalBox.style.borderRadius = '0.375rem';
            }
            
            // 공임비, 세팅비, 계약금 그리드
            const costGrid = contentDiv.querySelector('.grid');
            if (costGrid) {
              costGrid.style.display = 'flex'; // 그리드에서 플렉스로 변경
              costGrid.style.flexDirection = 'row';
              costGrid.style.flexWrap = 'nowrap';
              costGrid.style.justifyContent = 'flex-start';
              costGrid.style.marginTop = '0.5rem';
              costGrid.style.marginBottom = '0.5rem';
              costGrid.style.gap = '0.5rem';
              
              // 그리드 내부 항목들에 마진과 너비 적용
              const gridItems = costGrid.querySelectorAll('div.bg-white, div.flex.justify-between');
              gridItems.forEach(item => {
                item.style.margin = '0.25rem 0';
                item.style.padding = '0.5rem';
                item.style.borderRadius = '0.375rem';
                item.style.flex = '1'; // 동일한 너비로 설정
                item.style.minWidth = 'fit-content'; // 내용에 맞는 최소 너비
                item.style.maxWidth = '33%'; // 최대 너비 제한
              });
            }
            
            // 할인 및 부가세 그리드 (두 번째 그리드)
            const discountVatGrids = contentDiv.querySelectorAll('div[class*="grid"]');
            if (discountVatGrids.length > 1) {
              const discountVatGrid = discountVatGrids[1]; // 두 번째 그리드
              if (discountVatGrid) {
                discountVatGrid.style.display = 'grid';
                discountVatGrid.style.width = '100%';
                discountVatGrid.style.marginTop = '0.5rem';
                discountVatGrid.style.marginBottom = '0.5rem';
                discountVatGrid.style.gap = '0.5rem';
                
                // 그리드 레이아웃 명시적 설정
                if (discountVatGrid.classList.contains('grid-cols-1')) {
                  discountVatGrid.style.gridTemplateColumns = '1fr';
                } else if (discountVatGrid.classList.contains('grid-cols-2')) {
                  discountVatGrid.style.gridTemplateColumns = '1fr 1fr';
                }
                
                // 그리드 내부 항목들에 마진과 너비 적용
                const discountVatItems = discountVatGrid.querySelectorAll('div.bg-white');
                discountVatItems.forEach(item => {
                  item.style.margin = '0.25rem 0';
                  item.style.padding = '0.5rem';
                  item.style.borderRadius = '0.375rem';
                  item.style.width = '100%'; // 가로 전체 너비로 설정
                  item.style.boxSizing = 'border-box';
                  item.style.minWidth = '100%'; // 최소 너비 강제 설정
                  item.style.maxWidth = '100%'; // 최대 너비 강제 설정
                });
              }
            }
            
            // 부가세 영역
            const vatContainer = contentDiv.querySelector('div.bg-gray-50');
            if (vatContainer) {
              vatContainer.style.marginTop = '0.5rem';
              vatContainer.style.marginBottom = '0.5rem';
              vatContainer.style.padding = '0.5rem';
              vatContainer.style.backgroundColor = '#f9fafb';
              vatContainer.style.borderRadius = '0.375rem';
            }
            
            // 최종 결제 금액
            const finalPayment = contentDiv.querySelector('.bg-blue-200, .flex.justify-between.items-center.bg-blue-200');
            if (finalPayment) {
              finalPayment.style.marginTop = '0.75rem';
              finalPayment.style.marginBottom = '0.25rem';
              finalPayment.style.padding = '0.5rem';
              finalPayment.style.backgroundColor = '#bfdbfe';
              finalPayment.style.borderRadius = '0.375rem';
              finalPayment.style.fontWeight = 'bold';
            }
            
            // 택배비 영역
            const shippingCost = contentDiv.querySelector('.flex.justify-end');
            if (shippingCost) {
              shippingCost.style.marginTop = '0.25rem';
              shippingCost.style.display = 'flex';
              shippingCost.style.justifyContent = 'flex-end';
              
              const shippingBox = shippingCost.querySelector('.inline-block');
              if (shippingBox) {
                shippingBox.style.backgroundColor = '#f9fafb';
                shippingBox.style.padding = '0.25rem 0.5rem';
                shippingBox.style.borderRadius = '0.375rem';
              }
            }
          }
          
          // 결제 정보 내 요소들 스타일 적용 (기존 코드)
          const blueBoxes = container.querySelectorAll('.bg-blue-200');
          blueBoxes.forEach(box => {
            box.style.backgroundColor = '#bfdbfe';
            box.style.borderRadius = '0.375rem';
            box.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
            box.style.padding = '0.5rem';
            box.style.margin = '0.25rem 0';
            box.style.border = '1px solid #93c5fd';
          });
          
          // 흰색 배경 박스 스타일 적용
          const whiteBoxes = container.querySelectorAll('.bg-white');
          whiteBoxes.forEach(box => {
            box.style.backgroundColor = '#ffffff';
            box.style.borderRadius = '0.375rem';
            box.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
            box.style.padding = '0.5rem';
          });
          
          // 목록 스타일 적용
          const lists = container.querySelectorAll('.list-disc');
          lists.forEach(list => {
            list.style.listStyleType = 'disc';
            list.style.paddingLeft = '1.25rem';
          });
        });
        
        // 참고사항 섹션 스타일 적용
        const referenceContainers = printWindow.document.querySelectorAll('.mb-6.border.border-blue-300.rounded-lg.p-4.bg-blue-50.mx-1');
        referenceContainers.forEach(container => {
          container.classList.add('reference-container');
          
          // 패딩과 마진 직접 적용
          container.style.padding = '0.75rem'; // 패딩 줄임
          container.style.marginBottom = '3px'; // 아래 마진 3px
          
          // 참고사항 제목(h3) 스타일 적용
          const referenceTitle = container.querySelector('h3');
          if (referenceTitle) {
            referenceTitle.style.marginTop = '0px';
            referenceTitle.style.marginBottom = '3px'; // 아래 마진 3px
            referenceTitle.style.fontSize = '1.25rem';
            referenceTitle.style.fontWeight = 'bold';
            referenceTitle.style.color = '#1e40af'; // text-blue-800
            referenceTitle.style.borderBottom = '1px solid #93c5fd';
            referenceTitle.style.paddingBottom = '0.25rem';
          }
          
          // 결제 정보 제목(h2) 스타일 적용
          const paymentTitle = container.querySelector('h2');
          if (paymentTitle) {
            paymentTitle.style.marginTop = '0px';
            paymentTitle.style.fontSize = '1.25rem';
            paymentTitle.style.fontWeight = 'bold';
            paymentTitle.style.marginBottom = '0.75rem';
            paymentTitle.style.color = '#1e40af'; // text-blue-800
            paymentTitle.style.borderBottom = '1px solid #93c5fd';
            paymentTitle.style.paddingBottom = '0.5rem';
          }
          
          // 흰색 배경 박스 스타일 적용
          const whiteBoxes = container.querySelectorAll('.bg-white');
          whiteBoxes.forEach(box => {
            box.style.backgroundColor = '#ffffff';
            box.style.borderRadius = '0.375rem';
            box.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
            box.style.padding = '0.5rem';
          });
          
          // 목록 스타일 적용
          const lists = container.querySelectorAll('.list-disc');
          lists.forEach(list => {
            list.style.listStyleType = 'disc';
            list.style.paddingLeft = '1.25rem';
          });
        });
        
        // 테이블 스타일 추가 적용
        const tables = printWindow.document.querySelectorAll('table');
        tables.forEach(table => {
          table.style.borderCollapse = 'collapse';
          table.style.border = '1px solid #93c5fd';
          table.style.width = '670px'; // 테이블 가로 크기 지정
          table.style.marginLeft = '-15px'; // 테이블을 왼쪽으로 15px 이동
          table.style.tableLayout = 'fixed'; // 고정 테이블 레이아웃 적용
          
          // 테이블 헤더에 열 너비 적용
          const headerCells = table.querySelectorAll('thead th');
          if (headerCells.length >= 6) {
            // 각 열의 너비 설정
            headerCells[0].style.width = '4%';  // No.
            headerCells[1].style.width = '13%'; // 분류
            headerCells[2].style.width = '50%'; // 상품명
            headerCells[3].style.width = '7%';  // 수량
            headerCells[4].style.width = '13%'; // 단가
            headerCells[5].style.width = '13%'; // 금액
          }
          
          // 테이블 셀에 스타일 적용
          const cells = table.querySelectorAll('th, td');
          cells.forEach(cell => {
            cell.style.border = '1px solid #93c5fd';
            cell.style.padding = '2px 6px';
          });
          
          // 특정 열에 가운데 정렬 적용
          const alignCenterColumns = [0, 1, 3, 4, 5]; // 1번, 2번(분류), 4번, 5번, 6번 열
          alignCenterColumns.forEach(colIndex => {
            const thCells = table.querySelectorAll(`thead th:nth-child(${colIndex + 1})`);
            const tdCells = table.querySelectorAll(`tbody td:nth-child(${colIndex + 1})`);
            
            thCells.forEach(cell => {
              cell.style.textAlign = 'center';
            });
            
            tdCells.forEach(cell => {
              cell.style.textAlign = 'center';
            });
          });
          
          // 헤더 행 스타일
          const headerRows = table.querySelectorAll('thead tr');
          headerRows.forEach(row => {
            row.style.backgroundColor = '#dbeafe';
          });
          
          // 상품/부품 합계 행 스타일 적용
          const totalRow = table.querySelector('tbody tr.bg-blue-100.font-medium');
          if (totalRow) {
            totalRow.style.backgroundColor = '#dbeafe'; // 배경색 설정
            
            const totalCells = totalRow.querySelectorAll('td');
            totalCells.forEach((cell, idx) => {
              cell.style.fontWeight = '700'; // bold 설정
              cell.style.fontSize = '0.9rem'; // 글자 크기 설정
              
              // 첫 번째 셀(상품/부품 합계 텍스트가 있는 셀)
              if (idx === 0) {
                cell.style.textAlign = 'right'; // 오른쪽 정렬
              }
              
              // 두 번째 셀(합계 금액이 있는 셀)
              if (idx === 1) {
                cell.style.textAlign = 'center'; // 가운데 정렬
              }
            });
          }
          
          // 짝수/홀수 행 스타일
          const bodyRows = table.querySelectorAll('tbody tr');
          bodyRows.forEach((row, index) => {
            row.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f0f7ff';
          });
        });
        
        // 택시비 별도 텍스트 오른쪽 정렬 적용
        const taxiNoteElements = printWindow.document.querySelectorAll('.flex.justify-end');
        taxiNoteElements.forEach(element => {
          element.style.display = 'flex';
          element.style.justifyContent = 'flex-end';
          element.style.width = '100%';
          element.style.textAlign = 'right';
        });
        
        // 헤더 스타일 적용
        const headerContainers = printWindow.document.querySelectorAll('.relative, .flex.justify-between, .flex.items-center');
        headerContainers.forEach(header => {
          if (header.querySelector('h1')) {
            // 헤더 컨테이너 스타일
            header.classList.add('header-container');
            header.style.margin = "0";
            header.style.padding = "0";
            header.style.position = 'relative';
            
            // 견적서 제목 스타일 (가운데 정렬)
            const title = header.querySelector('h1');
            if (title) {
              title.classList.add('title-element');
              title.style.display = 'block';
              title.style.width = '100%';
              title.style.textAlign = 'center';
              title.style.margin = '5px auto 15px'; // 상단 마진 5px, 하단 마진 15px로 설정
              title.style.padding = '0';
              title.style.fontSize = '24px';
              title.style.fontWeight = 'bold';
              title.style.letterSpacing = '0.5em';
            }
            
            // 견적일자 스타일 (오른쪽 맨 위에 배치)
            const dateElement = header.querySelector('p');
            if (dateElement) {
              dateElement.classList.add('date-element');
              dateElement.style.position = 'absolute';
              dateElement.style.top = '0px'; // -5px에서 0px로 변경 (5px 더 낮춤)
              dateElement.style.right = '15px';
              dateElement.style.textAlign = 'right';
              dateElement.style.margin = '0';
              dateElement.style.padding = '0';
              dateElement.style.fontSize = '14px';
              dateElement.style.color = '#4b5563';
              dateElement.style.fontWeight = 'normal';
              dateElement.style.display = 'block';
              dateElement.style.visibility = 'visible';
              dateElement.style.zIndex = '999';
            }
          }
        });
        
        // 공급자/공급받는자 컨테이너 스타일 적용
        const supplierReceiverContainer = printWindow.document.querySelector('div[style*="display: flex"][style*="gap: 10px"]');
        if (supplierReceiverContainer) {
          supplierReceiverContainer.style.display = 'flex';
          supplierReceiverContainer.style.gap = '10px';
          supplierReceiverContainer.style.marginTop = '5px'; // 상단 마진 5px 추가
          supplierReceiverContainer.style.marginBottom = '20px';
          supplierReceiverContainer.style.width = '100%';
          
          // 공급자 및 공급받는자 박스 스타일 적용
          const boxes = supplierReceiverContainer.querySelectorAll('div[style*="border: 1px solid"]');
          boxes.forEach(box => {
            box.style.border = '1px solid #93c5fd';
            box.style.padding = '8px';
            box.style.borderRadius = '0.25rem';
            
            // 공급자/공급받는자 제목(h2) 스타일 적용
            const title = box.querySelector('h2');
            if (title) {
              title.style.fontSize = '1.125rem';
              title.style.fontWeight = 'bold';
              title.style.marginTop = '0px'; // 상단 마진 0px로 변경
              title.style.marginBottom = '0.25rem';
              title.style.textAlign = 'center';
              title.style.borderBottom = '1px solid #bfdbfe';
              title.style.paddingBottom = '0.25rem';
            }
            
            // 키-값 쌍 스타일 적용
            const infoRows = box.querySelectorAll('.flex');
            infoRows.forEach(row => {
              row.style.display = 'flex';
              row.style.alignItems = 'center';
              row.style.marginBottom = '2px';
              row.style.lineHeight = '1.5';
              
              // 키(라벨) 스타일 적용
              const keyLabel = row.querySelector('.font-semibold.w-24');
              if (keyLabel) {
                keyLabel.style.width = '6rem';
                keyLabel.style.minWidth = '6rem';
                keyLabel.style.display = 'inline-block';
                keyLabel.style.fontWeight = '600';
                keyLabel.style.textAlign = 'left';
              }
              
              // 값 스타일 적용
              const valueLabel = row.querySelector('span:not(.font-semibold)');
              if (valueLabel) {
                valueLabel.style.display = 'inline-block';
                valueLabel.style.flex = '1';
              }
            });
          });
        }
        
        printWindow.focus();
        printWindow.print();
        // 인쇄 후 창 닫기
        printWindow.onafterprint = function() {
          printWindow.close();
        };
      };
    }
  };
  
  // 금액을 한글로 변환하는 함수
  const numberToKorean = (number) => {
    if (isNaN(number) || number === 0) return '영원';
    
    const units = ['', '만', '억', '조'];
    const digits = ['영', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
    const decimals = ['', '십', '백', '천'];
    
    const numStr = number.toString();
    let result = '';
    
    // 큰 단위부터 처리 (조, 억, 만)
    for (let i = 0; i < numStr.length; i++) {
      const digit = parseInt(numStr[i]);
      
      // 현재 자릿수 계산
      const unitIndex = Math.floor((numStr.length - 1 - i) / 4);
      const decimalIndex = (numStr.length - 1 - i) % 4;
      
      if (digit !== 0) {
        // 일의 자리가 아닌 경우 '일'은 생략
        if (digit === 1 && decimalIndex !== 0) {
          result += decimals[decimalIndex];
        } else {
          result += digits[digit] + decimals[decimalIndex];
        }
      }
      
      // 단위 추가 (만, 억, 조)
      if (decimalIndex === 0 && digit !== 0) {
        result += units[unitIndex];
      }
    }
    
    return result + '원';
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 print:p-0 print:bg-white">
      {/* 인쇄 시 특정 섹션만 표시하는 스타일 */}
      <style jsx global>{`
        @media print {
          /* 인쇄 시 모든 요소 숨기기 */
          body * {
            display: none !important;
          }
          
          /* 인쇄할 섹션과 그 자식 요소만 표시 */
          .print-this-section,
          .print-this-section * {
            display: block !important;
          }
          
          /* 테이블, 그리드 등 레이아웃 요소는 원래 표시 방식 유지 */
          .print-this-section table {
            display: table !important;
          }
          .print-this-section tr {
            display: table-row !important;
          }
          .print-this-section td, .print-this-section th {
            display: table-cell !important;
          }
          .print-this-section div[class*="grid"] {
            display: grid !important;
          }
          .print-this-section div[class*="flex"] {
            display: flex !important;
          }
          
          /* 배경색 유지 */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          /* 페이지 여백 설정 */
          @page {
            size: auto;
            margin: 1cm;
          }
        }
      `}</style>
      <div className="max-w-4xl mx-auto print:max-w-none print:mx-0">
        {/* 뒤로 가기 버튼과 인쇄 버튼 */}
        <div className="flex justify-between items-center mb-6 no-print">
          <button
            onClick={handleBackClick}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            이전 페이지로 돌아가기
          </button>
          <button
            onClick={handlePrint}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            인쇄
          </button>
        </div>
        <p className="text-sm text-gray-500 text-right mb-4 no-print">
          ※ 배경색이 인쇄되지 않을 경우 브라우저 인쇄 설정에서 '배경 그래픽' 옵션을 활성화해주세요.
        </p>
        
        {/* 로딩 상태 표시 */}
        {loading && (
          <div className="flex justify-center py-10 no-print">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        {/* 에러 표시 */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 no-print">
            <strong className="font-bold">오류! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {/* 견적서 내용 */}
        {!loading && !error && estimate && (
          <div ref={invoiceRef} className="print-this-section invoice-container bg-white border-2 border-blue-200 rounded-lg shadow-lg">
            {/* 견적서 헤더 */}
            <div className="relative pt-6 px-4 mb-6">
              {/* 로고 삭제 */}
              
              {/* 견적서 제목 */}
              <h1 
                className="text-3xl font-bold text-center mx-auto" 
                style={{ letterSpacing: '0.5em' }}
              >
                견 적 서
              </h1>
              
              {/* 견적일자 - 오른쪽 맨 위로 위치 조정 */}
              <p className="absolute right-4 text-gray-600 text-sm" style={{ letterSpacing: '-0.09em', top: '10px' }}>
                견적일자: {formatDate(estimate.createdAt)}
              </p>
            </div>
            
            {/* 공급자/공급받는자 정보 */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              {/* 공급자 정보 (회사 정보) */}
              <div style={{ flex: '6', border: '1px solid #93c5fd', padding: '8px', marginLeft: '0px', borderRadius: '0.25rem', backgroundColor: '#f0f8ff' }}>
                <h2 className="text-lg font-bold mb-1 text-center border-b border-blue-200 pb-1">공급자</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1px' }}>
                  <div className="flex">
                    <span className="font-semibold w-24">상호명:</span>
                    <span>웰컴 시스템</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold w-24">대표자:</span>
                    <span>김선식</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold w-24">사업자번호:</span>
                    <span>607-02-70320</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold w-24">주소:</span>
                    <span>부산시 동래구 온천동 456-29</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold w-24">전화번호:</span>
                    <span>051-926-6604 (대표전화)</span>
                  </div>
                </div>
              </div>
              
              {/* 공급받는자 정보 (고객 정보) */}
              <div style={{ flex: '4', border: '1px solid #93c5fd', padding: '8px', marginRight: '0px', borderRadius: '0.25rem', backgroundColor: '#f0f8ff' }}>
                <h2 className="text-lg font-bold mb-1 text-center border-b border-blue-200 pb-1">공급받는자</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1px' }}>
                  <div className="flex">
                    <span className="font-semibold w-24">성함:</span>
                    <span>{estimate.customerInfo?.name || '-'}</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold w-24">연락처:</span>
                    <span>{estimate.customerInfo?.phone || '-'}</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold w-24">PC번호:</span>
                    <span>{estimate.customerInfo?.pcNumber || '-'}</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold w-24">AS조건:</span>
                    <span>{estimate.customerInfo?.asCondition || '-'}</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold w-24">견적담당:</span>
                    <span>{estimate.customerInfo?.manager || '-'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 상품 목록 */}
            <div className="mb-6">
              <div className="table-container mx-4">
                <table className="min-w-full divide-y divide-blue-300 border border-blue-300">
                  <thead>
                    <tr className="bg-blue-100">
                      <th className="px-1.5 py-0.5 border border-blue-300 text-sm font-medium w-[4%] t ext-center">No.</th>
                      <th className="px-1.5 py-0.5 border border-blue-300 text-sm font-medium w-[13%] text-center">분류</th>
                      <th className="px-1.5 py-0.5 border border-blue-300 text-sm font-medium w-[50%]">상품명</th>
                      <th className="px-1.5 py-0.5 border border-blue-300 text-sm font-medium w-[7%] text-center">수량</th>
                      <th className="px-1.5 py-0.5 border border-blue-300 text-sm font-medium w-[13%] text-center">단가</th>
                      <th className="px-1.5 py-0.5 border border-blue-300 text-sm font-medium w-[13%] text-center">금액</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {estimate.tableData?.map((item, index) => (
                      <>
                        <tr key={`product-${index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                          <td className="px-1.5 py-0.5 border border-blue-300 text-sm text-center">{index + 1}</td>
                          <td className="px-1.5 py-0.5 border border-blue-300 text-sm text-center">{item.category || '-'}</td>
                          <td className="px-1.5 py-0.5 border border-blue-300 text-sm">{item.productName || '-'}</td>
                          <td className="px-1.5 py-0.5 border border-blue-300 text-sm text-center">{item.quantity || '-'}</td>
                          <td className="px-1.5 py-0.5 border border-blue-300 text-sm text-center">
                            {item.price && item.quantity ? 
                              Math.round(parseInt(item.price) / parseInt(item.quantity)).toLocaleString() : 
                              '-'}
                          </td>
                          <td className="px-1.5 py-0.5 border border-blue-300 text-sm text-center">
                            {item.price ? parseInt(item.price).toLocaleString() : '-'}
                          </td>
                        </tr>
                        {/* 비고가 있는 경우에만 표시 */}
                        {item.remarks && (
                          <tr key={`remarks-${index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                            <td colSpan="6" className="px-1.5 py-0.5 border border-blue-300 text-sm bg-blue-50">
                              <span className="font-medium">비고 : </span>{item.remarks}
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                    
                    {/* 상품 합계만 표시 */}
                    <tr className="bg-blue-100 font-medium">
                      <td colSpan="4" className="px-1.5 py-0.5 border border-blue-300 text-right">상품/부품 합계</td>
                      <td colSpan="2" className="px-1.5 py-0.5 border border-blue-300 text-center">
                        {estimate.calculatedValues?.productTotal?.toLocaleString() || '0'}원
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* 결제 정보 요약 - 별도 섹션으로 분리 */}
            <div className="mb-5 border border-blue-300 rounded-lg px-4 pb-0 pt-3 bg-blue-50 mx-1">
              <h2 className="text-xl font-bold mb-3 text-blue-800 border-b pb-2">결제 정보</h2>
              <div className="space-y-2">
                {/* 상품/부품 합계 - 그대로 유지 */}
                <div className="flex justify-between items-center bg-white p-2 rounded-md shadow-sm">
                  <span className="font-semibold text-sm text-gray-700">상품/부품 합계:</span>
                  <span className="text-right font-medium text-sm">{estimate.calculatedValues?.productTotal?.toLocaleString() || '0'}원</span>
                </div>
                
                {/* 공임비, 세팅비, 계약금 영역 - 항상 표시 */}
                <div className="grid gap-2 grid-cols-3">
                  <div className="bg-white p-2 rounded-md shadow-sm">
                    <div className="font-medium text-sm">
                      공임비 : {estimate.paymentInfo?.laborCost > 0 
                        ? `${estimate.paymentInfo?.laborCost?.toLocaleString()}원` 
                        : "----"}
                    </div>
                  </div>
                  
                  <div className="bg-white p-2 rounded-md shadow-sm">
                    <div className="font-medium text-sm">
                      세팅비 : {estimate.paymentInfo?.setupCost > 0 
                        ? `${estimate.paymentInfo?.setupCost?.toLocaleString()}원` 
                        : "----"}
                    </div>
                  </div>
                  
                  <div className="bg-white p-2 rounded-md shadow-sm">
                    <div className="font-medium text-sm">
                      계약금 : {estimate.paymentInfo?.deposit > 0 
                        ? `${estimate.paymentInfo?.deposit?.toLocaleString()}원` 
                        : "----"}
                    </div>
                  </div>
                </div>
                
                {/* 총 구입 금액 */}
                <div className="flex justify-between items-center bg-blue-100 p-2 rounded-md shadow-sm">
                  <span className="font-semibold text-sm text-gray-700">총 구입 금액:</span>
                  <span className="text-right font-semibold text-sm">{estimate.calculatedValues?.totalPurchase?.toLocaleString() || '0'}원</span>
                </div>
                
                {/* 할인, 부가세(VAT) 영역 - 항상 표시 */}
                <div className="grid gap-2 grid-cols-2">
                  <div className="bg-white p-2 rounded-md shadow-sm">
                    <div className="font-medium text-sm">
                      할인 : {estimate.paymentInfo?.discount > 0 
                        ? `-${estimate.paymentInfo?.discount?.toLocaleString()}원` 
                        : "----"}
                    </div>
                  </div>
                  
                  <div className="bg-white p-2 rounded-md shadow-sm">
                    <div className="font-medium text-sm">
                      부가세(VAT) : {estimate.paymentInfo?.includeVat && estimate.calculatedValues?.vatAmount > 0 
                        ? `${estimate.calculatedValues?.vatAmount?.toLocaleString()}원 (${estimate.paymentInfo.vatRate || 10}%)` 
                        : "----"}
                    </div>
                  </div>
                </div>
                
                {/* 최종 결제 금액 */}
                <div className="flex justify-between items-center bg-blue-200 p-2 rounded-md shadow-sm mt-1">
                  <span className="font-bold text-sm text-blue-900">최종 결제 금액:</span>
                  <span className="text-right font-bold text-base text-blue-900">{estimate.calculatedValues?.finalPayment?.toLocaleString() || '0'}원</span>
                </div>
                
                {/* 택배비 - 작게 표시 */}
                {estimate.paymentInfo?.shippingCost > 0 && (
                  <div className="flex justify-end">
                    <div className="inline-block bg-gray-50 p-1 px-2 rounded-md">
                      <span className="text-xs text-gray-600">※택배비 별도 추가: {estimate.paymentInfo?.shippingCost?.toLocaleString()}원※</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* 참고사항 */}
            <div className="mb-6 border border-blue-300 rounded-lg p-4 bg-blue-50 mx-1">
              <h3 className="text-xl font-bold mb-3 text-blue-800 border-b pb-2">공지-참고-사항(꼭 읽으세요)</h3>
              <div className="bg-white p-2 rounded-md shadow-sm">
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>계약금 입금 후 주문이 확정됩니다.</li>
                  <li>다른 공지사항 적을 거 있으면 말해줘!</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 