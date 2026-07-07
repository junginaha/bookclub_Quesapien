// 브라우저 Geolocation API 래퍼. "내 근처" 기능(온보딩 관심지역, M1 클럽 검색)에서 공용으로 쓴다.
// 진짜 지오코딩(주소↔좌표 변환, 카카오 로컬 API 등)은 아직 연동하지 않았다 —
// 지역명 검색은 clubs.location_name 텍스트 매칭으로 대체한다(§C3 M1).

export interface Coords {
  lat: number;
  lng: number;
}

export function getCurrentPosition(options?: PositionOptions): Promise<Coords> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("이 브라우저에서는 위치 정보를 사용할 수 없어요."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60 * 1000, ...options }
    );
  });
}
