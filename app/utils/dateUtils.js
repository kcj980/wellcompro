/**
 * 현재 날짜와 시간을 한국 시간(KST)으로 변환하여 ISO 문자열로 반환합니다.
 * @returns {string} 한국 시간 기준 ISO 문자열
 */
export function getKoreanISOString() {
  const now = new Date();
  const koreaTime = new Date(now.getTime() + (9 * 60 * 60 * 1000)); // UTC+9
  return koreaTime.toISOString();
}

/**
 * 현재 날짜를 한국 시간(KST) 기준으로 YYYY-MM-DD 형식으로 반환합니다.
 * @returns {string} YYYY-MM-DD 형식의 날짜 문자열
 */
export function getKoreanDate() {
  return getKoreanISOString().split('T')[0];
}

/**
 * 주어진 Date 객체를 한국 시간(KST) 기준으로 YYYY-MM-DD 형식으로 변환합니다.
 * @param {Date} date - 변환할 Date 객체
 * @returns {string} YYYY-MM-DD 형식의 날짜 문자열
 */
export function formatDateToKoreanDate(date) {
  const koreaTime = new Date(date.getTime() + (9 * 60 * 60 * 1000)); // UTC+9
  return koreaTime.toISOString().split('T')[0];
} 