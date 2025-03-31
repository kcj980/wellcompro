'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Statement() {
  // 오늘 날짜를 한국어 형식(YYYY년 MM월 DD일)으로 변환하는 함수
  const getTodayKoreanFormat = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // getMonth()는 0부터 시작하므로 1을 더함
    const day = today.getDate();

    return `${year}년 ${month.toString().padStart(2, '0')}월 ${day.toString().padStart(2, '0')}일`;
  };

  const [invoiceData, setInvoiceData] = useState({
    date: getTodayKoreanFormat(), // 오늘 날짜로 초기화
    companyInfo: '여기에거래처명',
    totalAmount: '0',
    paymentSystem: '웰컴 시스템',
    customerName: '김선식',
    address: '부산광역시 동래구 온천장로 81-20 신화타워부산컴퓨터도매상가 2층 209호',
    deliveryMethod: '도소매',
    businessType: '컴퓨터및주변기기',
    phone: '010-0000-0000',
    regNumber: '607-02-70320',
    cash: '*0',
    credit: '*0',
  });

  // 품목 데이터 상태 추가
  const [items, setItems] = useState(
    Array(14)
      .fill()
      .map((_, index) => {
        // 12번과 13번 품목에 계좌 정보 미리 설정
        if (index === 13) {
          // 12번 항목 (인덱스는 0부터 시작하므로 11)
          return {
            id: index + 1,
            name: '일반(농협)938-12-182358(소성옥)',
            quantity: '',
            price: '',
            amount: '',
          };
        } else if (index === 12) {
          // 13번 항목
          return {
            id: index + 1,
            name: '사업자(부산)064-13-001200-7(김선식)',
            quantity: '',
            price: '',
            amount: '',
          };
        } else {
          return {
            id: index + 1,
            name: '',
            quantity: '',
            price: '',
            amount: '',
          };
        }
      })
  );

  // 일반 필드 변경 핸들러
  const handleChange = e => {
    const { name, value } = e.target;

    // 현금과 외상 입력 시 쉼표 포맷팅 적용
    if (name === 'cash' || name === 'credit') {
      // * 기호 유지하기
      const hasAsterisk = value.includes('*');

      // 입력 값에서 쉼표와 별표 제거
      const cleanValue = value.replace(/[,*]/g, '');

      // 숫자만 추출
      const numericValue = cleanValue.replace(/[^\d]/g, '');

      // 천 단위 쉼표 추가 및 별표 복원
      if (numericValue) {
        const formattedValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        setInvoiceData(prev => ({
          ...prev,
          [name]: hasAsterisk ? `*${formattedValue}` : formattedValue,
        }));
        return;
      }
    }

    // 그 외 필드는 기존 방식으로 처리
    setInvoiceData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // 품목 데이터 변경 핸들러
  const handleItemChange = (index, field, value) => {
    const newItems = [...items];

    // 단가 입력 시 쉼표 포맷팅 적용
    if (field === 'price') {
      // 입력 값에서 쉼표 제거
      const cleanValue = value.replace(/,/g, '');
      // 숫자만 추출
      const numericValue = cleanValue.replace(/[^\d]/g, '');
      // 천 단위 쉼표 추가
      if (numericValue) {
        value = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      } else {
        value = '';
      }
    }

    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };

    // 수량이나 단가가 변경되면 공급가액 계산
    if (field === 'quantity' || field === 'price') {
      const quantity = field === 'quantity' ? value : newItems[index].quantity;
      const price = field === 'price' ? value : newItems[index].price;

      if (quantity && price) {
        // 쉼표 제거 후 숫자로 변환
        const cleanQuantity = quantity.toString().replace(/,/g, '');
        const cleanPrice = price.toString().replace(/,/g, '');

        // 계산 및 천단위 쉼표 추가
        const amount = (Number(cleanQuantity) * Number(cleanPrice)).toString();
        newItems[index].amount = amount.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      }
    }

    setItems(newItems);
    calculateTotal(newItems);
  };

  // 총액 계산 함수
  const calculateTotal = itemsArray => {
    const total = itemsArray.reduce((sum, item) => {
      if (!item.amount) return sum;
      const cleanAmount = item.amount.toString().replace(/,/g, '');
      return sum + Number(cleanAmount);
    }, 0);

    // 천단위 쉼표 추가하여 총액 업데이트
    setInvoiceData(prev => ({
      ...prev,
      totalAmount: total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','),
    }));
  };

  // 수량의 합계를 계산하는 함수
  const calculateTotalQuantity = itemsArray => {
    return itemsArray.reduce((sum, item) => {
      if (!item.quantity) return sum;
      const cleanQuantity = item.quantity.toString().replace(/,/g, '');
      return sum + Number(cleanQuantity);
    }, 0);
  };

  // 품목 목록에서 마지막으로 입력된 품목의 인덱스를 찾는 함수
  const findLastFilledItemIndex = () => {
    for (let i = items.length - 1; i >= 0; i--) {
      if (
        items[i].name &&
        items[i].name !== '사업자(부산)064-13-001200-7(김선식)' &&
        items[i].name !== '일반(농협)938-12-182358(소성옥)'
      ) {
        return i;
      }
    }
    return -1; // 모든 품목이 비어있거나 계좌 정보만 있는 경우
  };

  // 인쇄 준비 함수
  const handlePrint = () => {
    const lastItemIndex = findLastFilledItemIndex();
    const tempItems = [...items];

    // 마지막 품목 다음 행에 여백 표시 추가
    if (lastItemIndex !== -1 && lastItemIndex < items.length - 1) {
      tempItems[lastItemIndex + 1] = {
        ...tempItems[lastItemIndex + 1],
        name: '------------이하여백------------',
        quantity: '',
        price: '',
        amount: '',
      };

      setItems(tempItems);

      // 잠시 후 인쇄 시작
      setTimeout(() => {
        window.print();

        // 인쇄 후 여백 표시 제거
        setTimeout(() => {
          tempItems[lastItemIndex + 1] = {
            ...tempItems[lastItemIndex + 1],
            name: '',
            quantity: '',
            price: '',
            amount: '',
          };
          setItems(tempItems);
        }, 500);
      }, 100);
    } else {
      // 해당하는 행이 없으면 바로 인쇄
      window.print();
    }
  };

  return (
    <>
      <div className="bg-yellow-100 p-4 mb-4 border-l-4 border-yellow-500 rounded shadow-md">
        <h3 className="text-lg font-bold text-yellow-800 mb-2">작성 안내</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li className="text-yellow-700">
            <span className="font-semibold">날짜:</span> 오늘 날짜가 자동으로 들어가고, 직접 수정도
            가능합니다.
          </li>
          <li className="text-yellow-700">
            <span className="font-semibold">기본 정보:</span> 거래처, 현금, 외상, 연락처 정보를
            수정하면 됩니다.
          </li>
          <li className="text-yellow-700">
            <span className="font-semibold">품목 정보:</span> 품목 및 규격 입력하고, 수량과 단가를
            입력하면 나머진 알아서 계산됩니다.
          </li>
          <li className="text-yellow-700">
            <span className="font-semibold">한곳만 수정하면 다른쪽도 같이 수정됩니다.</span>
          </li>
          <li className="text-yellow-700">
            <span className="font-semibold">인쇄 버튼</span>을 눌리면 자동으로 "----이하여백-----"이
            추가됨니다.
          </li>
          <li className="text-yellow-700">
            <span className="font-semibold">
              인쇄 미리보기에 왼쪽에 세로 줄이 안보이는데 인쇄해보면 정상적으로 출력 됨니다.
            </span>
          </li>
        </ul>
      </div>
      {/* 인쇄 버튼 */}
      <div style={{ marginTop: '24px', textAlign: 'center' }}>
        <button
          onClick={handlePrint}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded print:hidden"
        >
          인쇄하기
        </button>
      </div>
      <div className="p-8 bg-white" style={{ width: '800px', margin: '0 auto' }}>
        <div className="print-this-section">
          {/* 공급받는자용*/}
          <div className="border border-blue-500 p-4 mb-4">
            {/* 상단 제목 */}
            <div className="mb-1 relative">
              <div className="text-center">
                <span className="text-2xl font-bold text-blue-600 border-b-2 border-blue-600 pb-0">
                  거 래 명 세 표
                </span>
              </div>
              <div className="absolute right-0 top-0">
                <span className="text-xs font-normal text-blue-600">(공급받는자 보관용)</span>
              </div>
            </div>

            {/* 날짜 및 번호 */}
            <div className="mb-1 ml-3" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <input
                type="text"
                name="date"
                value={invoiceData.date}
                onChange={handleChange}
                className="text-xs text-blue-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* 상단 정보 테이블 */}
            <table
              className="w-full border-collapse mb-1 text-[10px]"
              style={{ borderWidth: '2px', borderColor: '#3b82f6', borderStyle: 'solid' }}
            >
              <tbody>
                <tr>
                  <td
                    className="border border-blue-500 bg-gray-100 p-0.5 px-0 text-center text-blue-600"
                    style={{ width: '6%' }}
                  >
                    거래처
                  </td>
                  <td colSpan={3} className="border border-blue-500 p-0.5" style={{ width: '45%' }}>
                    <div className="flex items-center">
                      <input
                        type="text"
                        name="companyInfo"
                        value={invoiceData.companyInfo}
                        onChange={handleChange}
                        className="flex-grow focus:outline-none text-right text-sm font-bold"
                      />
                      <span className="text-xs text-blue-600 ml-2 whitespace-nowrap">귀하</span>
                    </div>
                  </td>
                  <td
                    rowSpan={5}
                    className="border border-blue-500 p-0.5 text-center bg-gray-100 text-blue-600"
                    style={{ writingMode: 'vertical-rl', width: '3%' }}
                  >
                    <div className="text-xs">
                      공 &nbsp;&nbsp;&nbsp;&nbsp;급 &nbsp;&nbsp;&nbsp;&nbsp;자
                    </div>
                  </td>
                  <td
                    className="border border-blue-500 p-0.5 px-0 bg-gray-100 text-center text-blue-600"
                    style={{ width: '7%' }}
                  >
                    등록번호
                  </td>
                  <td colSpan={3} className="border border-blue-500 p-0.5">
                    <input
                      type="text"
                      name="regNumber"
                      value={invoiceData.regNumber}
                      onChange={handleChange}
                      className="w-full focus:outline-none text-sm"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border border-blue-500 p-0.5 bg-gray-100 text-center text-blue-600">
                    합계액
                  </td>
                  <td colSpan={3} className="border border-blue-500 p-0.5 text-right text-sm">
                    *{invoiceData.totalAmount}
                    <span className="text-xs text-blue-600 ml-2 whitespace-nowrap">원정</span>
                  </td>
                  <td className="border border-blue-500 p-0.5 bg-gray-100 text-center text-blue-600">
                    상 &nbsp;&nbsp;&nbsp;호
                  </td>
                  <td className="border border-blue-500 p-0.5" style={{ width: '20%' }}>
                    <input
                      type="text"
                      name="paymentSystem"
                      value={invoiceData.paymentSystem}
                      onChange={handleChange}
                      className="w-full text-xs focus:outline-none"
                    />
                  </td>
                  <td
                    className="border border-blue-500 p-0.5 bg-gray-100 text-center text-blue-600"
                    style={{ width: '5%' }}
                  >
                    성 명
                  </td>
                  <td className="border border-blue-500 p-0.5">
                    <div className="flex items-center">
                      <input
                        type="text"
                        name="customerName"
                        value={invoiceData.customerName}
                        onChange={handleChange}
                        className="flex-grow focus:outline-none text-xs"
                      />
                      <div className="relative">
                        <span className="text-[9px] text-blue-600 mr-1 whitespace-nowrap">
                          (인)
                        </span>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <img
                            src="/stamp.png"
                            alt="도장"
                            style={{
                              maxWidth: '40px',
                              height: 'auto',
                              opacity: 0.9,
                              objectFit: 'contain',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="border border-blue-500 p-0.5 bg-gray-100 text-center text-blue-600">
                    현 &nbsp;&nbsp;금
                  </td>
                  <td className="border border-blue-500 p-0.5">
                    <input
                      type="text"
                      name="cash"
                      value={invoiceData.cash}
                      onChange={handleChange}
                      className="w-full focus:outline-none text-right text-xs"
                    />
                  </td>
                  <td
                    className="border border-blue-500 p-0.5 bg-gray-100 text-center text-blue-600"
                    style={{ width: '5%' }}
                  >
                    외 &nbsp;상
                  </td>
                  <td className="border border-blue-500 p-0.5">
                    <input
                      type="text"
                      name="credit"
                      value={invoiceData.credit}
                      onChange={handleChange}
                      className="w-full focus:outline-none text-right text-xs"
                    />
                  </td>
                  <td className="border border-blue-500 p-0.5 bg-gray-100 text-center text-blue-600">
                    주 &nbsp;&nbsp;&nbsp;소
                  </td>
                  <td colSpan={3} className="border border-blue-500 px-1">
                    <textarea
                      name="address"
                      value={invoiceData.address.replace('신화타워', '신화타워\n')}
                      onChange={handleChange}
                      className="w-full focus:outline-none resize-none"
                      rows={2}
                      style={{ lineHeight: '1.1', fontSize: '10px', overflow: 'hidden' }}
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border border-blue-500 p-0.5 bg-gray-100 text-center text-blue-600">
                    연락처
                  </td>
                  <td colSpan={3} className="border border-blue-500 p-0.5">
                    <input
                      type="text"
                      name="phone"
                      value={invoiceData.phone}
                      onChange={handleChange}
                      className="w-full focus:outline-none text-xs"
                    />
                  </td>
                  <td className="border border-blue-500 p-0.5 bg-gray-100 text-center text-blue-600">
                    업 &nbsp;&nbsp;&nbsp;태
                  </td>
                  <td className="border border-blue-500 p-0.5">
                    <input
                      type="text"
                      name="deliveryMethod"
                      value={invoiceData.deliveryMethod}
                      onChange={handleChange}
                      className="w-full focus:outline-none text-xs"
                    />
                  </td>
                  <td className="border border-blue-500 p-0.5 bg-gray-100 text-center text-blue-600">
                    종 목
                  </td>
                  <td className="border border-blue-500 p-0.5">
                    <input
                      type="text"
                      name="businessType"
                      value={invoiceData.businessType}
                      onChange={handleChange}
                      className="w-full focus:outline-none text-xs"
                    />
                  </td>
                </tr>
              </tbody>
            </table>

            {/* 주요 품목 테이블 */}
            <table className="w-full border-collapse text-xs">
              <thead className="text-xs text-blue-600">
                <tr>
                  <th className="border border-blue-500 p-0.5 bg-gray-100" style={{ width: '4%' }}>
                    번호
                  </th>
                  <th className="border border-blue-500 p-0.5 bg-gray-100" style={{ width: '40%' }}>
                    품 &nbsp;&nbsp;목 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;및
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;규 &nbsp;&nbsp;격
                  </th>
                  <th className="border border-blue-500 p-0.5 bg-gray-100" style={{ width: '5%' }}>
                    수 량
                  </th>
                  <th className="border border-blue-500 p-0.5 bg-gray-100" style={{ width: '10%' }}>
                    단 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;가
                  </th>
                  <th className="border border-blue-500 p-0.5 bg-gray-100" style={{ width: '10%' }}>
                    공 급 가 액
                  </th>
                  <th className="border border-blue-500 p-0.5 bg-gray-100" style={{ width: '10%' }}>
                    비 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;고
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* 14개의 고정된 행 생성 */}
                {items.map((item, index) => (
                  <tr key={`row-${index}`}>
                    <td className="border-l border-r border-blue-500 p-0 text-center text-blue-600">
                      <input
                        type="text"
                        value={item.id}
                        readOnly
                        className="w-full text-center focus:outline-none text-xs h-5"
                      />
                    </td>
                    <td className="border-l border-r border-blue-500 px-1">
                      <input
                        type="text"
                        value={item.name}
                        onChange={e => handleItemChange(index, 'name', e.target.value)}
                        className="w-full focus:outline-none text-xs"
                      />
                    </td>
                    <td className="border-l border-r border-blue-500 px-1 text-center">
                      <input
                        type="text"
                        value={item.quantity}
                        onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                        className="w-full text-center focus:outline-none text-xs"
                      />
                    </td>
                    <td className="border-l border-r border-blue-500 px-1 text-right">
                      <input
                        type="text"
                        value={item.price}
                        onChange={e => handleItemChange(index, 'price', e.target.value)}
                        className="w-full text-right focus:outline-none text-xs"
                      />
                    </td>
                    <td className="border-l border-r border-blue-500 px-1 text-right">
                      <input
                        type="text"
                        value={item.amount}
                        readOnly
                        className="w-full text-right focus:outline-none text-xs"
                      />
                    </td>
                    <td className="border-l border-r border-blue-500 px-1 text-center">
                      <input type="text" className="w-full focus:outline-none text-xs" />
                    </td>
                  </tr>
                ))}

                {/* 합계 행 */}
                <tr>
                  <td className="border border-blue-500 p-0.5 text-blue-600" colSpan={2}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <span style={{ marginRight: '100px' }}>인도인:</span>
                        <span>인수인:</span>
                      </div>
                      <div>합계</div>
                    </div>
                  </td>
                  <td className="border border-blue-500 p-0.5 text-center">
                    {calculateTotalQuantity(items)}
                  </td>
                  <td className="border border-blue-500 p-0.5 text-center"></td>
                  <td className="border border-blue-500 p-0.5 text-right">
                    {invoiceData.totalAmount}
                  </td>
                  <td className="border border-blue-500 p-0.5"></td>
                </tr>
              </tbody>
            </table>
          </div>

          <hr className="border-t-2 border-gray-300 my-4" />

          {/* 공급자용*/}
          <div className="border border-red-500 p-4">
            {/* 상단 제목 */}
            <div className="mb-1 relative">
              <div className="text-center">
                <span className="text-2xl font-bold text-red-600 border-b-2 border-red-600 pb-0">
                  거 래 명 세 표
                </span>
              </div>
              <div className="absolute right-0 top-0">
                <span className="text-xs font-normal text-red-600">(공급자 보관용)</span>
              </div>
            </div>

            {/* 날짜 및 번호 */}
            <div className="mb-1 ml-3" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <input
                type="text"
                name="date"
                value={invoiceData.date}
                onChange={handleChange}
                className="text-xs text-red-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* 상단 정보 테이블 */}
            <table
              className="w-full border-collapse mb-1 text-[10px]"
              style={{ borderWidth: '2px', borderColor: '#ef4444', borderStyle: 'solid' }}
            >
              <tbody>
                <tr>
                  <td
                    className="border border-red-500 bg-gray-100 p-0.5 px-0 text-center text-red-600"
                    style={{ width: '6%' }}
                  >
                    거래처
                  </td>
                  <td colSpan={3} className="border border-red-500 p-0.5" style={{ width: '45%' }}>
                    <div className="flex items-center">
                      <input
                        type="text"
                        name="companyInfo"
                        value={invoiceData.companyInfo}
                        onChange={handleChange}
                        className="flex-grow focus:outline-none text-right text-sm font-bold"
                      />
                      <span className="text-xs text-red-600 ml-2 whitespace-nowrap">귀하</span>
                    </div>
                  </td>
                  <td
                    rowSpan={5}
                    className="border border-red-500 p-0.5 text-center bg-gray-100 text-red-600"
                    style={{ writingMode: 'vertical-rl', width: '3%' }}
                  >
                    <div className="text-xs">
                      공 &nbsp;&nbsp;&nbsp;&nbsp;급 &nbsp;&nbsp;&nbsp;&nbsp;자
                    </div>
                  </td>
                  <td
                    className="border border-red-500 p-0.5 px-0 bg-gray-100 text-center text-red-600"
                    style={{ width: '7%' }}
                  >
                    등록번호
                  </td>
                  <td colSpan={3} className="border border-red-500 p-0.5">
                    <input
                      type="text"
                      name="regNumber"
                      value={invoiceData.regNumber}
                      onChange={handleChange}
                      className="w-full focus:outline-none text-sm"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border border-red-500 p-0.5 bg-gray-100 text-center text-red-600">
                    합계액
                  </td>
                  <td colSpan={3} className="border border-red-500 p-0.5 text-right text-sm">
                    *{invoiceData.totalAmount}
                    <span className="text-xs text-red-600 ml-2 whitespace-nowrap">원정</span>
                  </td>
                  <td className="border border-red-500 p-0.5 bg-gray-100 text-center text-red-600">
                    상 &nbsp;&nbsp;&nbsp;호
                  </td>
                  <td className="border border-red-500 p-0.5" style={{ width: '20%' }}>
                    <input
                      type="text"
                      name="paymentSystem"
                      value={invoiceData.paymentSystem}
                      onChange={handleChange}
                      className="w-full text-xs focus:outline-none"
                    />
                  </td>
                  <td
                    className="border border-red-500 p-0.5 bg-gray-100 text-center text-red-600"
                    style={{ width: '5%' }}
                  >
                    성 명
                  </td>
                  <td className="border border-red-500 p-0.5">
                    <div className="flex items-center">
                      <input
                        type="text"
                        name="customerName"
                        value={invoiceData.customerName}
                        onChange={handleChange}
                        className="flex-grow focus:outline-none text-xs"
                      />
                      <div className="relative">
                        <span className="text-[9px] text-red-600 mr-1 whitespace-nowrap">(인)</span>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <img
                            src="/stamp.png"
                            alt="도장"
                            style={{
                              maxWidth: '40px',
                              height: 'auto',
                              opacity: 0.9,
                              objectFit: 'contain',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="border border-red-500 p-0.5 bg-gray-100 text-center text-red-600">
                    현 &nbsp;&nbsp;금
                  </td>
                  <td className="border border-red-500 p-0.5">
                    <input
                      type="text"
                      name="cash"
                      value={invoiceData.cash}
                      onChange={handleChange}
                      className="w-full focus:outline-none text-right text-xs"
                    />
                  </td>
                  <td
                    className="border border-red-500 p-0.5 bg-gray-100 text-center text-red-600"
                    style={{ width: '5%' }}
                  >
                    외 &nbsp;상
                  </td>
                  <td className="border border-red-500 p-0.5">
                    <input
                      type="text"
                      name="credit"
                      value={invoiceData.credit}
                      onChange={handleChange}
                      className="w-full focus:outline-none text-right text-xs"
                    />
                  </td>
                  <td className="border border-red-500 p-0.5 bg-gray-100 text-center text-red-600">
                    주 &nbsp;&nbsp;&nbsp;소
                  </td>
                  <td colSpan={3} className="border border-red-500 px-1">
                    <textarea
                      name="address"
                      value={invoiceData.address.replace('신화타워', '신화타워\n')}
                      onChange={handleChange}
                      className="w-full focus:outline-none resize-none"
                      rows={2}
                      style={{ lineHeight: '1.1', fontSize: '10px', overflow: 'hidden' }}
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border border-red-500 p-0.5 bg-gray-100 text-center text-red-600">
                    연락처
                  </td>
                  <td colSpan={3} className="border border-red-500 p-0.5">
                    <input
                      type="text"
                      name="phone"
                      value={invoiceData.phone}
                      onChange={handleChange}
                      className="w-full focus:outline-none text-xs"
                    />
                  </td>
                  <td className="border border-red-500 p-0.5 bg-gray-100 text-center text-red-600">
                    업 &nbsp;&nbsp;&nbsp;태
                  </td>
                  <td className="border border-red-500 p-0.5">
                    <input
                      type="text"
                      name="deliveryMethod"
                      value={invoiceData.deliveryMethod}
                      onChange={handleChange}
                      className="w-full focus:outline-none text-xs"
                    />
                  </td>
                  <td className="border border-red-500 p-0.5 bg-gray-100 text-center text-red-600">
                    종 목
                  </td>
                  <td className="border border-red-500 p-0.5">
                    <input
                      type="text"
                      name="businessType"
                      value={invoiceData.businessType}
                      onChange={handleChange}
                      className="w-full focus:outline-none text-xs"
                    />
                  </td>
                </tr>
              </tbody>
            </table>

            {/* 주요 품목 테이블 */}
            <table className="w-full border-collapse text-xs">
              <thead className="text-xs text-red-600">
                <tr>
                  <th className="border border-red-500 p-0.5 bg-gray-100" style={{ width: '4%' }}>
                    번호
                  </th>
                  <th className="border border-red-500 p-0.5 bg-gray-100" style={{ width: '40%' }}>
                    품 &nbsp;&nbsp;목 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;및
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;규 &nbsp;&nbsp;격
                  </th>
                  <th className="border border-red-500 p-0.5 bg-gray-100" style={{ width: '5%' }}>
                    수 량
                  </th>
                  <th className="border border-red-500 p-0.5 bg-gray-100" style={{ width: '10%' }}>
                    단 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;가
                  </th>
                  <th className="border border-red-500 p-0.5 bg-gray-100" style={{ width: '10%' }}>
                    공 급 가 액
                  </th>
                  <th className="border border-red-500 p-0.5 bg-gray-100" style={{ width: '10%' }}>
                    비 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;고
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* 14개의 고정된 행 생성 - 공급자용도 같은 데이터 사용 */}
                {items.map((item, index) => (
                  <tr key={`row-red-${index}`}>
                    <td className="border-l border-r border-red-500 p-0 text-center text-red-600">
                      <input
                        type="text"
                        value={item.id}
                        readOnly
                        className="w-full text-center focus:outline-none text-xs h-5"
                      />
                    </td>
                    <td className="border-l border-r border-red-500 px-1">
                      <input
                        type="text"
                        value={item.name}
                        onChange={e => handleItemChange(index, 'name', e.target.value)}
                        className="w-full focus:outline-none text-xs"
                      />
                    </td>
                    <td className="border-l border-r border-red-500 px-1 text-center">
                      <input
                        type="text"
                        value={item.quantity}
                        onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                        className="w-full text-center focus:outline-none text-xs"
                      />
                    </td>
                    <td className="border-l border-r border-red-500 px-1 text-right">
                      <input
                        type="text"
                        value={item.price}
                        onChange={e => handleItemChange(index, 'price', e.target.value)}
                        className="w-full text-right focus:outline-none text-xs"
                      />
                    </td>
                    <td className="border-l border-r border-red-500 px-1 text-right">
                      <input
                        type="text"
                        value={item.amount}
                        readOnly
                        className="w-full text-right focus:outline-none text-xs"
                      />
                    </td>
                    <td className="border-l border-r border-red-500 px-1 text-center">
                      <input type="text" className="w-full focus:outline-none text-xs" />
                    </td>
                  </tr>
                ))}

                {/* 합계 행 */}
                <tr>
                  <td className="border border-red-500 p-0.5 text-red-600" colSpan={2}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <span style={{ marginRight: '100px' }}>인도인:</span>
                        <span>인수인:</span>
                      </div>
                      <div>합계</div>
                    </div>
                  </td>
                  <td className="border border-red-500 p-0.5 text-center">
                    {calculateTotalQuantity(items)}
                  </td>
                  <td className="border border-red-500 p-0.5 text-center"></td>
                  <td className="border border-red-500 p-0.5 text-right">
                    {invoiceData.totalAmount}
                  </td>
                  <td className="border border-red-500 p-0.5"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 인쇄 버튼 */}
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <button
            onClick={handlePrint}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded print:hidden"
          >
            인쇄하기
          </button>
        </div>

        {/* 인쇄 스타일 */}
        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-this-section,
            .print-this-section * {
              visibility: visible;
            }
            .print-this-section {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .no-print {
              display: none !important;
            }
          }
        `}</style>
      </div>
    </>
  );
}
