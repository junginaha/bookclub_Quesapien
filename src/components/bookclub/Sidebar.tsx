"use client";

import { useState } from "react";
import NotifyForm from "./NotifyForm";

export default function Sidebar({
  stats,
  venueName,
  venueMapUrl,
}: {
  stats: { totalSessions: number; totalPeople: number; totalBooks: number };
  venueName: string;
  venueMapUrl: string;
}) {
  const [notifyOpen, setNotifyOpen] = useState(false);

  return (
    <aside className="qc-sidebar" aria-label="질문하는 사람들 소개">
      <div>
        <div className="qc-sidebar-mark">?!</div>
        <div className="qc-sidebar-name">질문하는 사람들</div>
        <p className="qc-sidebar-intro">
          질문으로 연결되는 지적 커뮤니티. 서초구 선정 미래혁신형 북클럽.
        </p>
      </div>

      <div className="qc-stats" aria-label="지금까지의 기록">
        <div className="qc-stat">
          <div className="qc-stat-num">{stats.totalSessions}</div>
          <div className="qc-stat-label">연 모임</div>
        </div>
        <div className="qc-stat">
          <div className="qc-stat-num">{stats.totalPeople}</div>
          <div className="qc-stat-label">함께한 사람</div>
        </div>
        <div className="qc-stat">
          <div className="qc-stat-num">{stats.totalBooks}</div>
          <div className="qc-stat-label">읽은 책</div>
        </div>
      </div>

      <div>
        <button
          type="button"
          className="qc-notify-btn"
          onClick={() => setNotifyOpen((v) => !v)}
          aria-expanded={notifyOpen}
        >
          알림 받기
        </button>
        {notifyOpen && (
          <div style={{ marginTop: 10 }}>
            <NotifyForm clubSlug={null} mode="notify" />
          </div>
        )}
      </div>

      <div className="qc-sidebar-links">
        <a
          className="qc-sidebar-link"
          href={venueMapUrl}
          target="_blank"
          rel="noreferrer"
        >
          {venueName} 지도 보기
        </a>
        <a className="qc-sidebar-link" href="mailto:junginaha@qsapiens.com">
          문의하기
        </a>
      </div>
    </aside>
  );
}
