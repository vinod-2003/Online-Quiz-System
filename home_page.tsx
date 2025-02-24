import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import QuizCard from "@/components/quiz-card";
import { Skeleton } from "@/components/ui/skeleton";

type QuizWithStatus = {
  id: number;
  title: string;
  duration: number;
  totalScore: number;
  status: "not-started" | "in-progress" | "completed";
  score: number | null;
};

export default function HomePage() {
  const [, setLocation] = useLocation();
  const { data: quizzes, isLoading } = useQuery<QuizWithStatus[]>({
    queryKey: ["/api/my-quizzes"],
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Available Quizzes</h1>
        <p className="text-muted-foreground">
          Choose a quiz to test your knowledge
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {quizzes?.map((quiz) => (
          <QuizCard
            key={quiz.id}
            {...quiz}
            onStart={() => {
              fetch(`/api/quizzes/${quiz.id}/start`, {
                method: "POST",
                credentials: "include",
              }).then(() => setLocation(`/quiz/${quiz.id}`));
            }}
            onResume={() => setLocation(`/quiz/${quiz.id}`)}
            onViewScore={() => setLocation(`/quiz/${quiz.id}`)}
          />
        ))}
      </div>
    </div>
  );
}
