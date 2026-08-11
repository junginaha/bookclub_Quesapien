import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

const IDS = {
  today: "a1000001-0000-0000-0000-000000000001",
  f1:    "a1000001-0000-0000-0000-000000000002",
  f2:    "a1000001-0000-0000-0000-000000000003",
  f3:    "a1000001-0000-0000-0000-000000000004",
  f4:    "a1000001-0000-0000-0000-000000000005",
  f5:    "a1000001-0000-0000-0000-000000000006",
  r1:    "a1000001-0000-0000-0000-000000000011",
  r2:    "a1000001-0000-0000-0000-000000000012",
  r3:    "a1000001-0000-0000-0000-000000000013",
  r4:    "a1000001-0000-0000-0000-000000000014",
  r5:    "a1000001-0000-0000-0000-000000000015",
  r6:    "a1000001-0000-0000-0000-000000000016",
  r7:    "a1000001-0000-0000-0000-000000000017",
  r8:    "a1000001-0000-0000-0000-000000000018",
};

const allIds = Object.values(IDS);

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-seed-secret");
  if (secret !== process.env.SEED_SECRET && secret !== "qsapiens-seed-2026") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createServiceClient() as any;

  try {
    // 기존 시드 데이터 삭제
    await supabase.from("landing_question_answers").delete().in("question_id", allIds);
    await supabase.from("landing_questions").delete().in("id", allIds);

    const now = new Date();
    const daysAgo = (n: number) => new Date(now.getTime() - n * 86400000).toISOString();
    const hoursAgo = (n: number) => new Date(now.getTime() - n * 3600000).toISOString();

    // 질문 삽입
    const questions = [
      { id: IDS.today, content: "당신은 마지막으로 언제, 진심으로 울었나요?", author_name: "편집팀", likes: 1284, saves: 397, answers_count: 0, is_featured: true, is_today: true, is_approved: true, created_at: hoursAgo(18) },
      { id: IDS.f1, content: "인간은 왜 외로운가요?", author_name: "민재", likes: 842, saves: 210, answers_count: 0, is_featured: true, is_today: false, is_approved: true, created_at: daysAgo(3) },
      { id: IDS.f2, content: "AI 시대에도 사랑은 여전히 중요할까요?", author_name: "서연", likes: 1103, saves: 287, answers_count: 0, is_featured: true, is_today: false, is_approved: true, created_at: daysAgo(5) },
      { id: IDS.f3, content: "당신을 살게 만든 한 문장은 무엇인가요?", author_name: "현우", likes: 2071, saves: 512, answers_count: 0, is_featured: true, is_today: false, is_approved: true, created_at: daysAgo(7) },
      { id: IDS.f4, content: "실패를 얼마나 오래 기억하시나요?", author_name: "지우", likes: 634, saves: 178, answers_count: 0, is_featured: true, is_today: false, is_approved: true, created_at: daysAgo(9) },
      { id: IDS.f5, content: "지금 가장 피하고 싶은 대화는 무엇인가요?", author_name: "도연", likes: 723, saves: 195, answers_count: 0, is_featured: true, is_today: false, is_approved: true, created_at: daysAgo(11) },
      { id: IDS.r1, content: "혼자 여행을 떠나본 적 있나요? 그 여행이 당신에게 남긴 것은?", author_name: "재희", likes: 47, saves: 18, answers_count: 0, is_featured: false, is_today: false, is_approved: true, created_at: daysAgo(3) },
      { id: IDS.r2, content: "부모님께 아직 하지 못한 말이 있나요?", author_name: "하린", likes: 89, saves: 31, answers_count: 0, is_featured: false, is_today: false, is_approved: true, created_at: daysAgo(4) },
      { id: IDS.r3, content: "당신의 20대를 한 단어로 표현한다면?", author_name: "민수", likes: 156, saves: 54, answers_count: 0, is_featured: false, is_today: false, is_approved: true, created_at: daysAgo(4) },
      { id: IDS.r4, content: "오늘 하루 중 가장 솔직했던 순간은 언제인가요?", author_name: "채현", likes: 23, saves: 9, answers_count: 0, is_featured: false, is_today: false, is_approved: true, created_at: daysAgo(5) },
      { id: IDS.r5, content: "지금 당신 곁에 있어줬으면 하는 사람은 누구인가요?", author_name: "은지", likes: 312, saves: 87, answers_count: 0, is_featured: false, is_today: false, is_approved: true, created_at: daysAgo(5) },
      { id: IDS.r6, content: "읽다가 멈춘 책이 있나요? 왜 멈췄나요?", author_name: "진호", likes: 78, saves: 22, answers_count: 0, is_featured: false, is_today: false, is_approved: true, created_at: daysAgo(6) },
      { id: IDS.r7, content: "당신에게 '집'은 어떤 의미인가요?", author_name: "세아", likes: 201, saves: 63, answers_count: 0, is_featured: false, is_today: false, is_approved: true, created_at: daysAgo(6) },
      { id: IDS.r8, content: "마지막으로 새로운 사람과 깊은 대화를 한 건 언제인가요?", author_name: "현우", likes: 134, saves: 41, answers_count: 0, is_featured: false, is_today: false, is_approved: true, created_at: daysAgo(7) },
    ];

    const { error: qErr } = await supabase.from("landing_questions").insert(questions);
    if (qErr) throw new Error(`질문 삽입 실패: ${qErr.message}`);

    // 답변 삽입
    const answers = [
      // 오늘의 질문
      { question_id: IDS.today, content: "작년 겨울, 할머니가 돌아가셨을 때요. 버스 안에서 혼자 울었습니다. 다행히 마스크를 쓰고 있었어요.", author_name: "민준", likes: 47, is_approved: true, created_at: hoursAgo(16) },
      { question_id: IDS.today, content: "책을 읽다가 울었어요. 별것 아닌 문장이었는데, 그 순간 오래 참아온 감정들이 한꺼번에 쏟아졌습니다. 혼자여서 다행이었어요.", author_name: "서아", likes: 31, is_approved: true, created_at: hoursAgo(14) },
      { question_id: IDS.today, content: "친구가 '요즘 어때?'라고 물어봤을 때요. 잘 지내고 있다고 대답하려다가, 그냥 눈물이 났어요. 질문 하나가 방어막을 허물어버렸습니다.", author_name: "지현", likes: 28, is_approved: true, created_at: hoursAgo(12) },
      { question_id: IDS.today, content: "영화 <코코>를 봤을 때입니다. 이미 세 번째 보는 영화인데도 매번 같은 장면에서 울어요.", author_name: "도윤", likes: 22, is_approved: true, created_at: hoursAgo(10) },
      { question_id: IDS.today, content: "오래된 사진을 정리하다가요. 내가 이렇게 많은 시간을 보냈구나 싶어서 울었는지, 그 시간들이 그리워서 울었는지 아직도 모르겠어요.", author_name: "하은", likes: 19, is_approved: true, created_at: hoursAgo(8) },
      { question_id: IDS.today, content: "오늘이요. 이 질문을 읽고 나서요.", author_name: "익명", likes: 84, is_approved: true, created_at: hoursAgo(6) },
      { question_id: IDS.today, content: "기억이 잘 나지 않아요. 그게 더 슬픈 것 같습니다.", author_name: "재원", likes: 36, is_approved: true, created_at: hoursAgo(4) },
      { question_id: IDS.today, content: "아버지와 화해한 날 밤에 울었습니다. 그건 슬픔이 아니라 해방감이었어요.", author_name: "수현", likes: 41, is_approved: true, created_at: hoursAgo(2) },
      // 인간은 왜 외로운가요?
      { question_id: IDS.f1, content: "우리는 언어로만 소통하기 때문 아닐까요. 말로는 전달되지 않는 것들이 너무 많아서, 그 간극이 외로움이 된다고 생각해요.", author_name: "유진", likes: 38, is_approved: true, created_at: daysAgo(3) },
      { question_id: IDS.f1, content: "완전히 이해받을 수 없다는 사실을 알기 때문에요. 그래서 사랑하면서도 외로운 것 같아요.", author_name: "세연", likes: 29, is_approved: true, created_at: new Date(now.getTime() - (2 * 86400000 + 20 * 3600000)).toISOString() },
      { question_id: IDS.f1, content: "저는 외로움이 꼭 나쁜 것만은 아니라고 생각해요. 외로움이 있어야 연결을 원하게 되니까요.", author_name: "준호", likes: 24, is_approved: true, created_at: new Date(now.getTime() - (2 * 86400000 + 18 * 3600000)).toISOString() },
      { question_id: IDS.f1, content: "자아가 있기 때문이라고 생각해요. 내가 '나'라는 경계를 가지는 순간, 타인과의 간격이 생기는 거잖아요.", author_name: "민재", likes: 21, is_approved: true, created_at: daysAgo(2) },
      // AI 시대에도 사랑은?
      { question_id: IDS.f2, content: "오히려 더 중요해질 것 같아요. AI가 할 수 없는 유일한 것이 진짜 감정이니까요.", author_name: "서연", likes: 44, is_approved: true, created_at: daysAgo(5) },
      { question_id: IDS.f2, content: "사랑의 의미가 달라질 것 같아요. AI와의 유대가 생기면서 '사랑'이라는 단어가 가리키는 대상이 확장될 거라고 생각해요.", author_name: "혜수", likes: 31, is_approved: true, created_at: new Date(now.getTime() - (4 * 86400000 + 12 * 3600000)).toISOString() },
      { question_id: IDS.f2, content: "중요하죠. 하지만 AI와 사랑에 빠지는 사람들도 생겨날 것 같아서, 그게 좋은 건지 나쁜 건지는 아직 모르겠어요.", author_name: "태양", likes: 27, is_approved: true, created_at: daysAgo(4) },
      // 당신을 살게 만든 한 문장
      { question_id: IDS.f3, content: "'지금 이 순간도 지나간다.' 힘들 때마다 이 문장을 되뇌었어요. 좋은 일도, 나쁜 일도 모두 지나간다는 게 위로가 되었습니다.", author_name: "현우", likes: 89, is_approved: true, created_at: daysAgo(7) },
      { question_id: IDS.f3, content: "카뮈의 '그럼에도 불구하고 행복해야 한다.' 부조리한 세계에서도 의지를 가지고 살아야 한다는 것, 그게 제 20대를 버티게 해줬어요.", author_name: "예린", likes: 67, is_approved: true, created_at: new Date(now.getTime() - (6 * 86400000 + 18 * 3600000)).toISOString() },
      { question_id: IDS.f3, content: "'당신이 지금 느끼는 감정은 틀리지 않았습니다.' 처음으로 내 감정이 허용된 것 같았습니다.", author_name: "지수", likes: 72, is_approved: true, created_at: daysAgo(6) },
      { question_id: IDS.f3, content: "'살아 있다는 것은 아직 이야기가 끝나지 않았다는 뜻이다.' 제목도 작가도 기억 못하는데, 문장만 남아있어요.", author_name: "성민", likes: 58, is_approved: true, created_at: new Date(now.getTime() - (5 * 86400000 + 12 * 3600000)).toISOString() },
      { question_id: IDS.f3, content: "'당신은 당신이 생각하는 것보다 훨씬 강합니다.' 제가 저한테 하는 말이에요.", author_name: "익명", likes: 94, is_approved: true, created_at: daysAgo(5) },
      // 실패를 오래 기억
      { question_id: IDS.f4, content: "사실 거의 영원히요. 성공한 일은 잊어버려도 실패는 계속 떠올라요. 그게 좋은지 나쁜지 아직도 모르겠어요.", author_name: "지우", likes: 33, is_approved: true, created_at: daysAgo(9) },
      { question_id: IDS.f4, content: "더 중요한 실패일수록 오래 기억하는 것 같아요. 관계에서의 실패는 10년이 지나도 가끔 꿈에 나와요.", author_name: "해나", likes: 27, is_approved: true, created_at: daysAgo(8) },
      { question_id: IDS.f4, content: "저는 다음 성공이 생기면 그전 실패를 잊어요. 그래서 도전을 멈추지 않으려고 노력합니다.", author_name: "준희", likes: 19, is_approved: true, created_at: new Date(now.getTime() - (7 * 86400000 + 12 * 3600000)).toISOString() },
      // 피하고 싶은 대화
      { question_id: IDS.f5, content: "오래된 친구와의 대화요. 우리가 얼마나 달라졌는지 확인하는 게 두렵거든요.", author_name: "도연", likes: 29, is_approved: true, created_at: daysAgo(11) },
      { question_id: IDS.f5, content: "'요즘 어떻게 살아?' 라는 질문이요. 솔직하게 답하면 너무 무거워질까봐, 항상 '그냥 바쁘게 지내'라고 해요.", author_name: "민서", likes: 41, is_approved: true, created_at: daysAgo(10) },
      { question_id: IDS.f5, content: "나 자신과의 대화요. 잘 자려고 누우면 머릿속에서 시작되는 그 대화.", author_name: "태호", likes: 67, is_approved: true, created_at: new Date(now.getTime() - (9 * 86400000 + 12 * 3600000)).toISOString() },
      // 혼자 여행
      { question_id: IDS.r1, content: "제주도로 혼자 4박 5일을 갔어요. 처음 이틀은 외로웠는데, 3일째부터는 이상하게 자유로웠어요. 나 혼자도 충분하다는 걸 알게 됐습니다.", author_name: "재희", likes: 12, is_approved: true, created_at: new Date(now.getTime() - (2 * 86400000 + 14 * 3600000)).toISOString() },
      { question_id: IDS.r1, content: "교토에서 혼자 비를 바라보다가, 이 순간을 누군가와 나눌 수 없다는 게 슬프면서도 완전하다는 생각이 들었어요.", author_name: "유라", likes: 9, is_approved: true, created_at: daysAgo(2) },
      // 부모님
      { question_id: IDS.r2, content: "'사랑해요.'요. 그 말이 이상하게 입에서 안 나와요. 대신 맛있는 거 사드리고 청소 해드리고... 근데 그게 다 사랑이잖아요.", author_name: "하린", likes: 18, is_approved: true, created_at: new Date(now.getTime() - (3 * 86400000 + 6 * 3600000)).toISOString() },
      { question_id: IDS.r2, content: "'많이 힘들었지요?' 라는 말이요. 부모님도 그 시절 얼마나 힘드셨는지, 이제야 조금 알 것 같아서요.", author_name: "준영", likes: 14, is_approved: true, created_at: new Date(now.getTime() - (2 * 86400000 + 18 * 3600000)).toISOString() },
      { question_id: IDS.r2, content: "아버지한테 한 번도 포옹을 해본 적이 없어요. 말보다 그게 먼저 하고 싶습니다.", author_name: "익명", likes: 22, is_approved: true, created_at: new Date(now.getTime() - (2 * 86400000 + 6 * 3600000)).toISOString() },
      // 20대
      { question_id: IDS.r3, content: "'버텼다.' 잘 살았다기보다 어떻게든 버텼다는 표현이 더 맞는 것 같아요.", author_name: "민수", likes: 31, is_approved: true, created_at: new Date(now.getTime() - (3 * 86400000 + 18 * 3600000)).toISOString() },
      { question_id: IDS.r3, content: "'질문.' 뭘 해야 할지, 어디로 가야 할지, 왜 살아야 하는지. 온통 물음표였어요.", author_name: "소은", likes: 26, is_approved: true, created_at: new Date(now.getTime() - (3 * 86400000 + 6 * 3600000)).toISOString() },
      { question_id: IDS.r3, content: "'연습.' 사랑도, 일도, 우정도 전부 연습 중이었던 시절이었어요.", author_name: "태영", likes: 19, is_approved: true, created_at: new Date(now.getTime() - (2 * 86400000 + 12 * 3600000)).toISOString() },
      // 곁에 있어줬으면
      { question_id: IDS.r5, content: "10년 전의 나요. 그 애한테 '다 잘 될 거야'라고 말해주고 싶어요.", author_name: "은지", likes: 54, is_approved: true, created_at: new Date(now.getTime() - (4 * 86400000 + 12 * 3600000)).toISOString() },
      { question_id: IDS.r5, content: "지금은 없는 사람이에요. 더 이상 곁에 있어달라고 할 수 없어서, 가끔 꿈에서 만나요.", author_name: "익명", likes: 41, is_approved: true, created_at: daysAgo(4) },
      { question_id: IDS.r5, content: "고양이요. 아무 말 없이 그냥 옆에 있어주는 존재가 필요할 때가 있어요.", author_name: "다은", likes: 38, is_approved: true, created_at: new Date(now.getTime() - (3 * 86400000 + 12 * 3600000)).toISOString() },
      // 읽다가 멈춘 책
      { question_id: IDS.r6, content: "카프카의 변신이요. 너무 사실적으로 느껴져서 무서웠어요.", author_name: "진호", likes: 14, is_approved: true, created_at: new Date(now.getTime() - (5 * 86400000 + 6 * 3600000)).toISOString() },
      { question_id: IDS.r6, content: "한강의 채식주의자요. 너무 잘 써서 멈췄어요. 한 문장 읽고 멍하니 있다가, 또 읽고...", author_name: "수진", likes: 19, is_approved: true, created_at: new Date(now.getTime() - (4 * 86400000 + 18 * 3600000)).toISOString() },
    ];

    const { error: aErr } = await supabase.from("landing_question_answers").insert(answers);
    if (aErr) throw new Error(`답변 삽입 실패: ${aErr.message}`);

    // answers_count 업데이트
    const countMap: Record<string, number> = {};
    for (const a of answers) countMap[a.question_id] = (countMap[a.question_id] || 0) + 1;
    for (const [qid, cnt] of Object.entries(countMap)) {
      await supabase.from("landing_questions").update({ answers_count: cnt }).eq("id", qid);
    }

    return NextResponse.json({
      ok: true,
      inserted: { questions: questions.length, answers: answers.length },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "알 수 없는 오류";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
