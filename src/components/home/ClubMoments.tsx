export default function ClubMoments() {
  const moments = [
    {
      src: "https://images.pexels.com/photos/7889208/pexels-photo-7889208.jpeg?auto=compress&dpr=1&h=900&w=1400",
      alt: "밝은 공간의 테이블에서 이야기를 나누는 사람들",
      caption: "낯선 사람과도 책 한 권이면 이야기가 시작됩니다.",
      credit: "RDNE Stock project · Pexels",
      href: "https://www.pexels.com/photo/a-group-of-people-discussing-on-a-wooden-table-7889208/",
    },
    {
      src: "https://images.pexels.com/photos/6147389/pexels-photo-6147389.jpeg?auto=compress&dpr=1&h=900&w=1400",
      alt: "가을 햇살 아래 책을 함께 읽으며 웃는 사람들",
      caption: "잘 읽는 것보다, 함께 읽고 오래 이야기하는 쪽을 좋아합니다.",
      credit: "Keira Burton · Pexels",
      href: "https://www.pexels.com/photo/multiracial-students-studying-with-book-and-coffee-cup-in-park-6147389/",
    },
  ];

  return (
    <div className="clubMoments" aria-label="북클럽 분위기">
      <div className="clubMomentsIntro">
        <span>OUR TABLE</span>
        <h3>책은 핑계가 되고,<br />대화는 오래 남습니다.</h3>
        <p>처음 와도 괜찮습니다. 잘 말해야 하는 자리보다, 잘 듣고 궁금해하는 사람이 편한 자리입니다.</p>
      </div>
      <div className="clubMomentsRail">
        {moments.map((moment, index) => (
          <figure className="clubMoment" key={moment.src}>
            <div className="clubMomentPhoto">
              <img src={moment.src} alt={moment.alt} loading="lazy" />
              <span>{String(index + 1).padStart(2, "0")}</span>
            </div>
            <figcaption>
              <p>{moment.caption}</p>
              <a href={moment.href} target="_blank" rel="noreferrer">{moment.credit}</a>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
