import UserGuide from './components/UserGuide';
import BibleVerse from './components/bible';

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      {/* 다나와 확장 프로그램 다운로드 섹션 */}
      <div className="mb-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg shadow-lg p-4 text-center">
        <div className="bg-white bg-opacity-90 rounded-lg p-4 shadow-inner">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            <span className="inline-block mr-2">🚀</span>
            다나와 견적 가져오기 확장 프로그램
            <span className="inline-block ml-2">🚀</span>
          </h2>
          <p className="text-md text-gray-700 mb-3">
            다나와 PC 견적 정보를 WellCompro 견적 작성 페이지로 자동 전송하는{' '}
            <span className="font-bold text-xl">크롬 확장 프로그램</span>입니다.
          </p>
          <a
            href="/extension.zip"
            download
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full transition-colors duration-300 shadow-md"
          >
            확장 프로그램 다운로드
          </a>
          <p className="text-sm text-gray-600 mt-2">
            설치 방법: 다운로드 후 <span className="font-bold text-lg">압축해제</span>하고
            크롬브라우저에 <span className="font-bold text-lg">"chrome://extensions"</span>{' '}
            입력하시고 오른쪽위 <span className="font-bold text-lg">"개발자모드 클릭"</span>, <br />
            왼쪽에{' '}
            <span className="font-bold text-lg">"압축 해제된 확장프로그램을 로드합니다. 클릭"</span>
            , 압축푼 폴더 선택하면 완료
          </p>
        </div>
      </div>

      <BibleVerse />

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
