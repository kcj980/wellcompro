// 페이지 로드 시 실행
window.addEventListener('load', function() {
  // PC견적 페이지인 경우에만 버튼 추가
  if (isPCEstimatePage()) {
    addExportButton();
  }
  
  // 페이지 변경 감지 (SPA 대응)
  const observer = new MutationObserver(() => {
    if (isPCEstimatePage() && !document.getElementById('wellcompro-export-btn')) {
      addExportButton();
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
});

// PC견적 페이지인지 확인하는 함수
function isPCEstimatePage() {
  const currentUrl = window.location.href;
  return currentUrl.includes('shop.danawa.com/virtualestimate') && 
         currentUrl.includes('controller=estimateMain') && 
         currentUrl.includes('methods=index');
}

// 다나와 페이지에 버튼 추가
function addExportButton() {
  // 이미 버튼이 있는지 확인
  if (document.getElementById('wellcompro-export-btn')) {
    return;
  }

  // 버튼 생성
  const exportBtn = document.createElement('button');
  exportBtn.id = 'wellcompro-export-btn';
  exportBtn.textContent = 'WellCompro로 견적 보내기';
  exportBtn.style.cssText = 'position: fixed; top: 10px; right: 10px; z-index: 9999; background-color: #4CAF50; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;';
  
  // 버튼 클릭 이벤트
  exportBtn.addEventListener('click', exportEstimateData);
  
  // 페이지에 버튼 추가
  document.body.appendChild(exportBtn);
}

// 견적 데이터 추출 및 전송
function exportEstimateData() {
  try {
    // 견적 데이터 추출
    const products = extractProductData();
    
    if (products.length === 0) {
      alert('견적 카트에 상품이 없습니다. 상품을 추가한 후 다시 시도해주세요.');
      return;
    }
    
    // 현재 창의 URL에서 도메인 추출
    const currentUrl = window.location.href;
    const urlObj = new URL(currentUrl);
    
    // 웰컴프로 견적 페이지 URL 설정
    let wellcomproUrl;
    
    // 개발 환경인지 배포 환경인지 확인하는 방법 변경
    // 크롬 확장 프로그램에서는 환경 변수를 직접 사용할 수 없으므로 다른 방법 사용
    const isDevelopment = false; // 개발 환경에서는 true, 배포 환경에서는 false로 설정
    
    if (isDevelopment) {
      wellcomproUrl = 'http://localhost:3000/estimate';
    } else {
      wellcomproUrl = 'https://wellcompro.vercel.app/estimate'; // 실제 배포 URL
    }
    
    const wellcomproWindow = window.open(wellcomproUrl, 'wellcompro_estimate');
    
    // 데이터 전송 (postMessage 사용)
    setTimeout(() => {
      wellcomproWindow.postMessage({
        type: 'DANAWA_ESTIMATE_DATA',
        products: products
      }, '*');
      
      //alert(`${products.length}개 상품 정보를 WellCompro 견적 페이지로 전송했습니다.`);
    }, 1100); // 페이지 로드 시간 고려
    
  } catch (error) {
    console.error('견적 데이터 추출 오류:', error);
    alert('견적 데이터 추출 중 오류가 발생했습니다.');
  }
}

// 상품 데이터 추출 함수
function extractProductData() {
  const products = [];
  
  // pd_list_area 내의 상품 정보 추출
  const pdListArea = document.querySelector('.pd_list_area');
  if (!pdListArea) {
    console.error('pd_list_area를 찾을 수 없습니다.');
    return products;
  }
  
  // 각 카테고리 그룹 처리
  const pdLists = pdListArea.querySelectorAll('.pd_list');
  pdLists.forEach(pdList => {
    // 각 카테고리 처리
    const pdItems = pdList.querySelectorAll('.pd_item');
    pdItems.forEach(pdItem => {
      // 카테고리명 (CPU, 메인보드 등)
      const categoryTitle = pdItem.querySelector('.pd_item_title')?.textContent.trim()
        .replace(/NEW/gi, '').trim() // "NEW" 태그 제거 (대소문자 구분 없이)
        .replace(/\s*선택됨$/, '').trim(); // "선택됨" 텍스트 제거
      
      // 각 상품 처리
      const rows = pdItem.querySelectorAll('.pd_item_list li.row');
      rows.forEach(row => {
        // 상품명
        const productName = row.querySelector('.subject a')?.textContent.trim() || '';
        
        // 상품 ID
        const productId = row.id?.replace('wishList_', '') || `temp_${Date.now()}_${Math.random()}`;
        
        // 가격 (숫자만 추출)
        const priceText = row.querySelector('.price')?.textContent.trim() || '0';
        const price = parseInt(priceText.replace(/[^0-9]/g, ''), 10) || 0;
        
        // 수량
        const quantity = parseInt(row.querySelector('.input_qnt')?.value || '1', 10);
        
        if (productName) {
          products.push({
            id: productId,
            productName,
            price,
            quantity,
            totalPrice: price * quantity,
            category: categoryTitle,
          });
        }
      });
    });
  });
  
  return products;
} 