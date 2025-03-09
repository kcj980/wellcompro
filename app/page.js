import UserGuide from './components/UserGuide';

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg shadow-lg p-4 text-center animate-pulse">
        <div className="bg-white bg-opacity-90 rounded-lg p-4 shadow-inner">
          <h2 className="text-xl font-bold text-gray-800 mb-1">
            <span className="inline-block animate-bounce mr-2">👇</span>
            어머니 아버지 모르실 때 아래를 참고하세요!! 화이팅!!
            <span className="inline-block animate-bounce ml-2">👇</span>
          </h2>
          <p className="text-lg font-medium text-gray-700">
            <span className="bg-yellow-200 px-1 mx-1 rounded">기본 사용법</span>, 
            <span className="bg-green-200 px-1 mx-1 rounded">견적 작성</span>, 
            <span className="bg-blue-200 px-1 mx-1 rounded">검색</span>, 
            <span className="bg-purple-200 px-1 mx-1 rounded">상세페이지</span>, 
            <span className="bg-red-200 px-1 mx-1 rounded">견적서 인쇄</span> 
            패널을 클릭하여 사용법을 확인하세요!
          </p>
        </div>
      </div>
      
      <UserGuide />
    </main>
  );
}
