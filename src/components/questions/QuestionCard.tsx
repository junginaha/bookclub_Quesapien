import Link from "next/link";
import { ArrowUpRight, Users, BookOpen } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Question } from "@/types";
import { getCategoryColor, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface QuestionCardProps {
  question: Question;
  featured?: boolean;
}

export default function QuestionCard({ question, featured }: QuestionCardProps) {
  return (
    <Link
      href={`/questions/${question.id}`}
      className={cn(
        "group card-base flex flex-col gap-4 p-6 transition-all duration-300",
        featured && "sm:col-span-2 sm:row-span-2"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`tag-base ${getCategoryColor(question.category)}`}>
            {question.category}
          </span>
          {question.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="tag-base bg-warm-50 text-warm-500">
              #{tag}
            </span>
          ))}
        </div>
        <ArrowUpRight className="h-4 w-4 text-warm-300 shrink-0 transition-all duration-200 group-hover:text-warm-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>

      <div className="flex-1">
        <h3
          className={cn(
            "font-serif font-bold text-warm-900 leading-snug group-hover:text-warm-700 transition-colors",
            featured ? "text-2xl sm:text-3xl" : "text-lg"
          )}
        >
          &ldquo;{question.title}&rdquo;
        </h3>

        {featured && (
          <p className="text-warm-500 text-sm leading-relaxed mt-3 line-clamp-2">
            {question.description}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-warm-50">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage
              src={question.author.avatar_url}
              alt={question.author.name}
            />
            <AvatarFallback className="text-[10px]">
              {question.author.name[0]}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-warm-400">{question.author.name}</span>
          <span className="text-xs text-warm-200">·</span>
          <span className="text-xs text-warm-400">{formatDate(question.created_at)}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-warm-400">
            <BookOpen className="h-3 w-3" />
            <span>{question.session_count}회</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-warm-400">
            <Users className="h-3 w-3" />
            <span>{question.participant_total}명</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
