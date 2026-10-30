import { businessLines } from "@/lib/business";

/**
 * 사업자 정보 — 전자상거래법 제10조가 **초기화면에** 표시하라고 정한 항목.
 *
 * 예전에는 상호·대표·사업자등록번호·이메일을 푸터에 그대로 늘어놓았다. 법을
 * 지키려다 화면에서 제일 사적인 것이 제일 크게 보이는 상태가 됐다 — 게다가
 * iOS가 사업자등록번호를 전화번호로, 이메일을 주소로 자동 인식해 밑줄까지 그어
 * 더 튀었다(layout.tsx의 formatDetection으로 껐다).
 *
 * §10은 "소비자가 **쉽게 알 수 있도록**" 표시하라고 할 뿐, 펼친 채로 두라고 하지
 * 않는다. 한국 쇼핑몰이 흔히 쓰는 방식대로 같은 화면에서 한 번에 펼쳐지는
 * 접이식으로 둔다 — 페이지를 떠나지 않고 바로 읽을 수 있으므로 표시 의무를
 * 충족하면서, 평소 화면에는 한 줄만 조용히 남는다.
 *
 * 색은 지정하지 않는다. `currentColor` + opacity라 밝은 푸터(홈)와 어두운
 * 푸터(공통) 어디에 놓아도 그 화면의 톤을 그대로 따른다.
 */
export default function BusinessInfo({ className = "" }: { className?: string }) {
  return (
    <details className={`q-biz ${className}`.trim()}>
      <summary>사업자 정보</summary>
      <div className="q-biz-body">
        {businessLines().map((r, i) => (
          <span key={r.label}>
            {i > 0 ? <b aria-hidden="true"> · </b> : null}
            <i>{r.label}</i> {r.value}
          </span>
        ))}
      </div>
    </details>
  );
}
