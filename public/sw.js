// 최소 서비스 워커 — PWA 설치(홈화면 추가) 가능성을 위해 fetch 핸들러를 둔다.
// Slice 1 범위에서는 오프라인 우선 동기화는 하지 않는다(네트워크 우선, 폴백 없음).
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))
self.addEventListener('fetch', () => {
  // 네트워크에 그대로 위임. 존재 자체가 설치 가능 조건을 만족시킨다.
})
