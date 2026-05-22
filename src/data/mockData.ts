import type {
  User,
  Question,
  BookClubSession,
  Review,
  Book,
} from "@/types";

export const mockUsers: User[] = [
  {
    id: "u1",
    email: "minsu@example.com",
    name: "이민수",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    bio: "철학과 심리학을 좋아하는 직장인. 질문이 삶을 바꾼다고 믿습니다.",
    joined_at: "2025-03-15",
    session_count: 12,
  },
  {
    id: "u2",
    email: "jiyeon@example.com",
    name: "박지연",
    avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    bio: "독서를 통해 세상과 연결되는 방법을 탐색 중입니다.",
    joined_at: "2025-04-02",
    session_count: 8,
  },
  {
    id: "u3",
    email: "junho@example.com",
    name: "김준호",
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    bio: "심리상담사 준비 중. 인간관계에 관한 모든 것에 관심이 있습니다.",
    joined_at: "2025-02-20",
    session_count: 20,
  },
  {
    id: "u4",
    email: "sooyeon@example.com",
    name: "최수연",
    avatar_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    bio: "글 쓰는 마케터. 사람들의 이야기에서 영감을 받습니다.",
    joined_at: "2025-05-10",
    session_count: 5,
  },
  {
    id: "u5",
    email: "hyunwoo@example.com",
    name: "정현우",
    avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    bio: "IT 개발자이자 독서 클럽 운영자. 기술과 인문학의 교차점을 좋아합니다.",
    joined_at: "2025-01-08",
    session_count: 31,
  },
];

export const mockBooks: Book[] = [
  {
    id: "b1",
    title: "외로움과 함께 살아가기",
    author: "올리비아 랭",
    cover_url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&h=280&fit=crop",
    description: "도시 속 고독과 예술가들의 이야기",
  },
  {
    id: "b2",
    title: "관계의 기술",
    author: "알랭 드 보통",
    cover_url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&h=280&fit=crop",
    description: "현대인의 사랑과 관계에 대한 철학적 탐구",
  },
  {
    id: "b3",
    title: "인정받고 싶은 나",
    author: "아들러",
    cover_url: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200&h=280&fit=crop",
    description: "용기의 심리학, 미움받을 용기",
  },
  {
    id: "b4",
    title: "사랑의 단상",
    author: "롤랑 바르트",
    cover_url: "https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=200&h=280&fit=crop",
    description: "사랑하는 사람의 언어에 대한 탐구",
  },
  {
    id: "b5",
    title: "인생의 짧음에 관하여",
    author: "세네카",
    cover_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=280&fit=crop",
    description: "시간과 삶의 의미에 관한 스토아 철학",
  },
];

export const mockQuestions: Question[] = [
  {
    id: "q1",
    title: "우리는 왜 인정받고 싶어하는가?",
    description:
      "타인의 시선과 인정이 우리의 행동을 얼마나 좌우하는지 탐구합니다. 진정한 자존감이란 무엇이고, 우리는 어떻게 외부의 평가로부터 자유로워질 수 있을까요?",
    category: "자아",
    tags: ["자존감", "인정욕구", "심리학", "아들러"],
    author: mockUsers[2],
    created_at: "2026-05-10T09:00:00Z",
    session_count: 14,
    participant_total: 168,
    is_featured: true,
  },
  {
    id: "q2",
    title: "혼자는 왜 외로운가?",
    description:
      "현대 도시에서 수많은 사람들 사이에 살면서도 느끼는 깊은 외로움의 본질을 탐구합니다. 디지털 연결이 넘치는 시대에 진정한 연결이란 무엇인가요?",
    category: "감정",
    tags: ["외로움", "연결", "현대사회", "고독"],
    author: mockUsers[0],
    created_at: "2026-05-08T14:00:00Z",
    session_count: 11,
    participant_total: 132,
    is_featured: true,
  },
  {
    id: "q3",
    title: "사랑은 전략인가 진심인가?",
    description:
      "관계에서의 계산과 진정성 사이의 긴장을 이야기합니다. 우리는 사랑을 어떻게 정의하고, 그것이 자연발생적인 감정인지 아니면 선택인지 물어봅니다.",
    category: "사랑",
    tags: ["사랑", "관계", "진심", "철학"],
    author: mockUsers[1],
    created_at: "2026-05-05T11:00:00Z",
    session_count: 18,
    participant_total: 216,
    is_featured: false,
  },
  {
    id: "q4",
    title: "나는 내 삶의 주인공인가?",
    description:
      "우리가 선택이라고 믿는 것들이 실제로는 얼마나 사회적 압력과 무의식에 의해 결정되는지 탐구합니다. 진정한 자유의지와 자기결정이란 무엇일까요?",
    category: "철학",
    tags: ["자유의지", "주체성", "실존주의", "선택"],
    author: mockUsers[4],
    created_at: "2026-05-03T10:00:00Z",
    session_count: 9,
    participant_total: 108,
    is_featured: false,
  },
  {
    id: "q5",
    title: "실패는 성장인가 상처인가?",
    description:
      "실패에 대한 우리 사회의 이중적 태도를 검토합니다. '실패는 성공의 어머니'라는 말이 위로인지 압박인지, 우리가 실패를 어떻게 처리하는지 이야기합니다.",
    category: "성장",
    tags: ["실패", "회복력", "성장마인드셋", "트라우마"],
    author: mockUsers[3],
    created_at: "2026-04-28T09:00:00Z",
    session_count: 7,
    participant_total: 84,
    is_featured: false,
  },
  {
    id: "q6",
    title: "우리는 왜 비교를 멈출 수 없는가?",
    description:
      "SNS 시대에 더욱 심해진 비교 문화를 들여다봅니다. 비교가 동기부여가 되는 순간과 자기파괴가 되는 순간은 어떻게 다를까요?",
    category: "사회",
    tags: ["비교", "SNS", "열등감", "자기수용"],
    author: mockUsers[0],
    created_at: "2026-04-25T13:00:00Z",
    session_count: 13,
    participant_total: 156,
    is_featured: false,
  },
  {
    id: "q7",
    title: "일은 왜 삶의 전부가 되어버렸는가?",
    description:
      "일과 삶의 경계가 무너진 현대에서 일의 의미를 다시 묻습니다. 우리는 살기 위해 일하는가, 아니면 일하기 위해 사는가?",
    category: "일과삶",
    tags: ["번아웃", "워라밸", "의미", "직업"],
    author: mockUsers[2],
    created_at: "2026-04-20T11:00:00Z",
    session_count: 16,
    participant_total: 192,
    is_featured: false,
  },
  {
    id: "q8",
    title: "용서는 나를 위한 것인가 상대를 위한 것인가?",
    description:
      "용서의 심리학과 철학을 탐구합니다. 용서하지 않는 것은 자기 보호인가 자기 파괴인가? 진정한 용서가 가능하기는 한 것인가요?",
    category: "감정",
    tags: ["용서", "상처", "치유", "관계"],
    author: mockUsers[1],
    created_at: "2026-04-15T10:00:00Z",
    session_count: 10,
    participant_total: 120,
    is_featured: false,
  },
];

export const mockSessions: BookClubSession[] = [
  {
    id: "s1",
    question: mockQuestions[0],
    host: mockUsers[2],
    location: "서초구 교대역",
    address: "서울특별시 서초구 서초대로 396",
    date: "2026-05-21",
    start_time: "19:30",
    end_time: "21:30",
    max_participants: 8,
    current_participants: 6,
    status: "live",
    related_books: [mockBooks[2]],
    discussion_questions: [
      "당신이 가장 인정받고 싶은 사람은 누구인가요?",
      "인정받지 못했을 때 당신은 어떻게 반응하나요?",
      "타인의 평가 없이도 행복할 수 있다고 생각하나요?",
    ],
  },
  {
    id: "s2",
    question: mockQuestions[1],
    host: mockUsers[0],
    location: "서초구 강남역",
    address: "서울특별시 서초구 강남대로 465",
    date: "2026-05-22",
    start_time: "20:00",
    end_time: "22:00",
    max_participants: 10,
    current_participants: 4,
    status: "upcoming",
    related_books: [mockBooks[0]],
    discussion_questions: [
      "혼자 있을 때와 외로울 때는 어떻게 다른가요?",
      "디지털 연결이 실제 외로움을 줄여준다고 생각하나요?",
      "당신에게 외로움은 어떤 색깔인가요?",
    ],
  },
  {
    id: "s3",
    question: mockQuestions[2],
    host: mockUsers[1],
    location: "서초구 반포동",
    address: "서울특별시 서초구 반포대로 201",
    date: "2026-05-23",
    start_time: "19:00",
    end_time: "21:00",
    max_participants: 8,
    current_participants: 7,
    status: "upcoming",
    related_books: [mockBooks[1], mockBooks[3]],
    discussion_questions: [
      "사랑에 빠진 순간, 그것이 선택이었나요 감정이었나요?",
      "지속적인 사랑을 위해 노력이 필요하다면 그것은 진심인가요?",
      "이상적인 사랑과 현실적인 사랑의 차이는 무엇인가요?",
    ],
  },
  {
    id: "s4",
    question: mockQuestions[6],
    host: mockUsers[4],
    location: "서초구 방배동",
    address: "서울특별시 서초구 방배로 173",
    date: "2026-05-24",
    start_time: "19:30",
    end_time: "21:30",
    max_participants: 12,
    current_participants: 9,
    status: "upcoming",
    related_books: [mockBooks[4]],
    discussion_questions: [
      "당신에게 일의 의미는 무엇인가요?",
      "이상적인 하루의 시간 배분은 어떻게 되어야 할까요?",
      "일을 줄이면 행복해질까요?",
    ],
  },
];

export const mockReviews: Review[] = [
  {
    id: "r1",
    session: mockSessions[0],
    author: mockUsers[3],
    type: "text",
    content:
      "질문 하나가 오래 남았다. '당신이 가장 인정받고 싶은 사람은 누구인가요?' 처음엔 부모님이라고 답했는데, 대화를 나누다 보니 실은 내 자신이라는 걸 깨달았다.",
    quote: "결국 우리가 인정받고 싶은 사람은 자기 자신이었다.",
    transformation:
      "인정욕구의 방향을 외부에서 내부로 바꿔야 한다는 것을 알았습니다.",
    created_at: "2026-05-18T21:30:00Z",
    likes: 47,
  },
  {
    id: "r2",
    session: mockSessions[1],
    author: mockUsers[0],
    type: "photo",
    content:
      "책보다 사람 이야기가 기억에 남았다. 처음 만나는 사람들과 이렇게 깊은 이야기를 나눌 수 있을 줄 몰랐어요. 외로움에 대해 이야기하면서 오히려 덜 외로워졌습니다.",
    photo_url:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&h=400&fit=crop",
    quote: "외로움을 함께 이야기할 수 있다는 것 자체가 연결이었다.",
    transformation:
      "외로움이 나만의 감정이 아니라 모두가 공유하는 보편적 경험임을 알았습니다.",
    created_at: "2026-05-15T20:00:00Z",
    likes: 63,
  },
  {
    id: "r3",
    session: mockSessions[2],
    author: mockUsers[4],
    type: "text",
    content:
      "사랑에 대해 이렇게 솔직하게 이야기한 적이 없었어요. 모두가 자신의 상처를 조심스럽게 꺼내놓았고, 그 공간이 참 따뜻했습니다. 2시간이 10분처럼 지나갔어요.",
    quote: "사랑에 대한 정의는 있는 게 아니라, 각자가 만들어가는 것.",
    transformation: "사랑을 정의하려 했던 내 강박에서 벗어날 수 있게 됐어요.",
    created_at: "2026-05-12T22:00:00Z",
    likes: 38,
  },
  {
    id: "r4",
    session: mockSessions[0],
    author: mockUsers[1],
    type: "photo",
    content:
      "오늘 모임에서 만난 사람들과 나눈 대화는 평생 기억에 남을 것 같아요. 질문 하나가 우리를 이어주었고, 그 연결은 책 한 권보다 더 오래 남을 것 같습니다.",
    photo_url:
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&h=400&fit=crop",
    quote: "책으로 시작된 질문이 사람을 연결한다는 말이 이제야 실감이 난다.",
    transformation: "처음 보는 사람들에게 마음을 여는 것이 가능하다는 것을 알았습니다.",
    created_at: "2026-05-10T21:00:00Z",
    likes: 92,
  },
  {
    id: "r5",
    session: mockSessions[3],
    author: mockUsers[2],
    type: "text",
    content:
      "번아웃을 겪고 있던 시기에 참여한 모임이었는데, 비슷한 고민을 가진 사람들과 이야기하며 '이건 나만의 문제가 아니구나'라는 안도감을 느꼈습니다.",
    quote: "일의 의미를 찾는 것은, 삶의 의미를 찾는 것과 같다.",
    transformation: "일과 나를 동일시하던 습관에서 조금씩 벗어나고 있습니다.",
    created_at: "2026-05-07T21:30:00Z",
    likes: 55,
  },
  {
    id: "r6",
    session: mockSessions[1],
    author: mockUsers[3],
    type: "photo",
    content:
      "이 공간에서는 솔직해져도 된다는 걸 알았어요. SNS가 아닌 실제 사람의 눈을 보며 나누는 이야기는 전혀 달랐습니다. 다음 모임이 벌써 기대됩니다.",
    photo_url:
      "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=600&h=400&fit=crop",
    quote: "진짜 대화는 화면 너머가 아닌 눈빛에서 시작된다.",
    transformation: "오프라인 연결의 소중함을 다시 느꼈습니다.",
    created_at: "2026-05-05T20:30:00Z",
    likes: 71,
  },
];

export const getTodayQuestion = (): Question => mockQuestions[0];

export const getLiveSessions = (): BookClubSession[] =>
  mockSessions.filter((s) => s.status === "live" || s.status === "upcoming");

export const getPopularQuestions = (): Question[] =>
  [...mockQuestions].sort((a, b) => b.participant_total - a.participant_total).slice(0, 4);

export const getRecentReviews = (): Review[] =>
  [...mockReviews].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
