'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Statement() {
  const [invoiceData, setInvoiceData] = useState({
    date: '2025년 03월 06일',
    invoiceNumber: '20250306-4',
    companyInfo: '여기에거래처명',
    totalAmount: '40,000',
    paymentSystem: '웰컴 시스템',
    customerName: '김선식',
    address: '부산광역시 동래구 온천장로 81-20 신화타워부산컴퓨터도매상가 2층 209호',
    deliveryMethod: '도소매',
    businessType: '컴퓨터및주변기기',
    phone: '051-123-4567',
    regNumber: '123-45-67890',
    cash: '*0',
    credit: '*0',
    items: [
      { id: 1, name: '쿨러CPU', spec: 'RGB', quantity: 1, price: '32,000', amount: '32,000' },
      {
        id: 2,
        name: 'AS수리',
        spec: '분해청소, 재조립',
        quantity: 1,
        price: '8,000',
        amount: '8,000',
      },
    ],
    accountInfo: {
      business1: '사업자(부산은행) 064-13-001200-7',
      business2: '일반(부산은행) 033-13-000316-9',
    },
  });

  // 일반 필드 변경 핸들러
  const handleChange = e => {
    const { name, value } = e.target;
    setInvoiceData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // 계좌 정보 변경 핸들러
  const handleAccountChange = e => {
    const { name, value } = e.target;
    setInvoiceData(prev => ({
      ...prev,
      accountInfo: {
        ...prev.accountInfo,
        [name]: value,
      },
    }));
  };

  // 품목 정보 변경 핸들러
  const handleItemChange = (index, field, value) => {
    const newItems = [...invoiceData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };

    // 수량과 단가 변경 시 금액 자동 계산
    if (field === 'quantity' || field === 'price') {
      const quantity = field === 'quantity' ? value : newItems[index].quantity;
      const price = field === 'price' ? value : newItems[index].price;

      if (quantity && price) {
        const cleanPrice = price.toString().replace(/,/g, '');
        const amount = (Number(quantity) * Number(cleanPrice)).toString();
        newItems[index].amount = amount.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      }
    }

    setInvoiceData(prev => ({
      ...prev,
      items: newItems,
    }));

    // 총액 재계산
    calculateTotal(newItems);
  };

  // 품목 추가
  const addItem = () => {
    const newId =
      invoiceData.items.length > 0 ? Math.max(...invoiceData.items.map(item => item.id)) + 1 : 1;

    setInvoiceData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { id: newId, name: '', spec: '', quantity: 1, price: '0', amount: '0' },
      ],
    }));
  };

  // 품목 삭제
  const removeItem = index => {
    const newItems = [...invoiceData.items];
    newItems.splice(index, 1);

    setInvoiceData(prev => ({
      ...prev,
      items: newItems,
    }));

    // 총액 재계산
    calculateTotal(newItems);
  };

  // 총액 계산
  const calculateTotal = items => {
    const total = items.reduce((sum, item) => {
      const amount = item.amount.toString().replace(/,/g, '');
      return sum + Number(amount);
    }, 0);

    setInvoiceData(prev => ({
      ...prev,
      totalAmount: total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','),
    }));
  };

  return (
    <>
      <div className="p-8 bg-white" style={{ width: '800px', margin: '0 auto' }}>
        <div className="print-container">
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
                      <span className="text-[9px] text-blue-600 ml-1 whitespace-nowrap">(인)</span>
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
                {Array.from({ length: 12 }).map((_, index) => (
                  <tr key={`row-${index}`}>
                    <td className="border-l border-r border-blue-500 p-0 text-center text-blue-600">
                      <input
                        type="text"
                        defaultValue={index + 1}
                        className="w-full text-center focus:outline-none text-xs h-5"
                      />
                    </td>
                    <td className="border-l border-r border-blue-500 px-1">
                      <input
                        type="text"
                        defaultValue={
                          index < invoiceData.items.length
                            ? invoiceData.items[index].spec
                              ? `${invoiceData.items[index].name} (${invoiceData.items[index].spec})`
                              : invoiceData.items[index].name
                            : ''
                        }
                        className="w-full focus:outline-none text-xs"
                      />
                    </td>
                    <td className="border-l border-r border-blue-500 px-1 text-center">
                      <input
                        type="text"
                        defaultValue={
                          index < invoiceData.items.length ? invoiceData.items[index].quantity : ''
                        }
                        className="w-full text-center focus:outline-none text-xs"
                      />
                    </td>
                    <td className="border-l border-r border-blue-500 px-1 text-right">
                      <input
                        type="text"
                        defaultValue={
                          index < invoiceData.items.length ? invoiceData.items[index].price : ''
                        }
                        className="w-full text-right focus:outline-none text-xs"
                      />
                    </td>
                    <td className="border-l border-r border-blue-500 px-1 text-right">
                      <input
                        type="text"
                        defaultValue={
                          index < invoiceData.items.length ? invoiceData.items[index].amount : ''
                        }
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
                  <td className="border border-blue-500 p-0.5 text-center">2</td>
                  <td className="border border-blue-500 p-0.5 text-center"></td>
                  <td className="border border-blue-500 p-0.5 text-right">
                    {invoiceData.totalAmount}
                  </td>
                  <td className="border border-blue-500 p-0.5"></td>
                </tr>
              </tbody>
            </table>
          </div>

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
                      <span className="text-[9px] text-red-600 ml-1 whitespace-nowrap">(인)</span>
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
                {/* 14개의 고정된 행 생성 */}
                {Array.from({ length: 12 }).map((_, index) => (
                  <tr key={`row-${index}`}>
                    <td className="border-l border-r border-red-500 p-0 text-center text-red-600">
                      <input
                        type="text"
                        defaultValue={index + 1}
                        className="w-full text-center focus:outline-none text-xs h-5"
                      />
                    </td>
                    <td className="border-l border-r border-red-500 px-1">
                      <input
                        type="text"
                        defaultValue={
                          index < invoiceData.items.length
                            ? invoiceData.items[index].spec
                              ? `${invoiceData.items[index].name} (${invoiceData.items[index].spec})`
                              : invoiceData.items[index].name
                            : ''
                        }
                        className="w-full focus:outline-none text-xs"
                      />
                    </td>
                    <td className="border-l border-r border-red-500 px-1 text-center">
                      <input
                        type="text"
                        defaultValue={
                          index < invoiceData.items.length ? invoiceData.items[index].quantity : ''
                        }
                        className="w-full text-center focus:outline-none text-xs"
                      />
                    </td>
                    <td className="border-l border-r border-red-500 px-1 text-right">
                      <input
                        type="text"
                        defaultValue={
                          index < invoiceData.items.length ? invoiceData.items[index].price : ''
                        }
                        className="w-full text-right focus:outline-none text-xs"
                      />
                    </td>
                    <td className="border-l border-r border-red-500 px-1 text-right">
                      <input
                        type="text"
                        defaultValue={
                          index < invoiceData.items.length ? invoiceData.items[index].amount : ''
                        }
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
                  <td className="border border-red-500 p-0.5 text-center">2</td>
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
            onClick={() => window.print()}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded print:hidden"
          >
            인쇄하기
          </button>
        </div>

        <style jsx global>{`
          @media print {
            @page {
              size: A4;
              margin: 10mm;
            }
            body {
              background-color: white;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .print-hidden {
              display: none;
            }
            input {
              border: none !important;
            }
          }
        `}</style>
      </div>
    </>
  );
}
