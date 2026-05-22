import Link from "next/link";
import { Button } from "@/components/ui/button";
import MagicalCTAButton from "./MagicalCTAButton";

export default function CTASection() {
  return (
    <section className="bg-warm-900 overflow-hidden">
      <div className="container-base py-20 sm:py-28">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto">

          {/* Bridge copy */}
          <p className="text-warm-600 text-sm italic mb-10">
            — 이상하게 계속 보게 되죠?
          </p>

          {/* Emotional pre-note */}
          <p className="text-warm-500 text-xs italic mb-5">
            사람은 결국 사람으로 회복됩니다
          </p>

          {/* Large emotional headline */}
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-[1.22] mb-8 text-balance">
            우리는 책을 읽는 모임이 아니라,
            <br />
            사람을 다시 연결하는
            <br />
            모임을 만듭니다.
          </h2>

          <p className="text-warm-400 text-base leading-relaxed mb-14 text-balance">
            생각이 많은 밤을 위한 커뮤니티.
            <br className="hidden sm:block" />
            도망치듯 보던 쇼츠를 잠깐 멈추고,
            <br className="hidden sm:block" />
            관계에도 취향이 있다는 걸 알게 되는 공간.
          </p>

          {/* ── Magical CTA Button ──────────────────────── */}
          <MagicalCTAButton />

          {/* Secondary ghost link */}
          <div className="mt-10">
            <Link href="/archive">
              <Button
                variant="ghost"
                className="text-warm-400 hover:text-white hover:bg-warm-800"
              >
                후기 먼저 보기
              </Button>
            </Link>
          </div>

          {/* Sub-CTA friction-removing copy */}
          <div className="mt-8 flex flex-col items-center gap-1.5">
            <p className="text-warm-500 text-xs">
              가입 승인 기다리지 마세요 &nbsp;·&nbsp; 오늘 바로 참여 가능
            </p>
            <p className="text-warm-600 text-xs italic">
              카톡 문의 안 하셔도 됩니다 &nbsp;·&nbsp; 3초 뒤면 사람들과 연결됩니다
            </p>
          </div>

          {/* Social proof */}
          <p className="text-warm-600 text-xs mt-8">
            이미{" "}
            <span className="text-warm-300 font-semibold">1,200명</span>이 함께하고 있어요 ·
            서초구 선정 프로젝트
          </p>

          {/* Final emotional note */}
          <div className="mt-14 pt-10 border-t border-warm-800 w-full">
            <p className="font-serif text-warm-500 text-sm leading-loose italic text-center">
              그리고 사실,
              <br />
              우리도 그런 연결이 필요했습니다.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
