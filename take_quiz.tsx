import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { QuizWithQuestions } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";

export default function TakeQuiz() {
  const [, params] = useRoute("/quiz/:id");
  const [, setLocation] = useLocation();
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>(
    {},
  );

  const { data: quiz, isLoading } = useQuery<QuizWithQuestions>({
    queryKey: [`/api/quizzes/${params?.id}`],
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const responses = Object.entries(selectedAnswers).map(
        ([questionId, optionId]) => ({
          questionId: parseInt(questionId),
          optionId,
        }),
      );

      await fetch(`/api/quizzes/${params?.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responses }),
        credentials: "include",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-quizzes"] });
      setLocation("/");
    },
  });

  if (isLoading || !quiz) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-64" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  const progress =
    (Object.keys(selectedAnswers).length / quiz.questions.length) * 100;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{quiz.title}</h1>
          <p className="text-muted-foreground">
            {quiz.duration} minutes • {quiz.totalScore} points
          </p>
        </div>
        <Progress value={progress} className="w-64" />
      </divimport { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Clock, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { QuizWithQuestions, AttemptWithDetails } from "@shared/schema";

export default function TakeQuiz() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const { data: quiz, isLoading: loadingQuiz } = useQuery<QuizWithQuestions>({
    queryKey: [`/api/quizzes/${id}`],
  });

  const { data: attempt, isLoading: loadingAttempt } = useQuery<AttemptWithDetails>({
    queryKey: [`/api/quizzes/${id}/response`],
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/quizzes/${id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          responses: Object.entries(selectedAnswers).map(([questionId, optionId]) => ({
            questionId: parseInt(questionId),
            optionId,
          })),
        }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to submit quiz");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Quiz submitted successfully",
        description: "You can now view your results",
      });
      setLocation("/");
    },
  });

  useEffect(() => {
    if (attempt?.startedAt && quiz?.duration) {
      const endTime = new Date(attempt.startedAt).getTime() + quiz.duration * 60 * 1000;
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const diff = Math.max(0, Math.floor((endTime - now) / 1000));
        setTimeLeft(diff);
        
        if (diff === 0) {
          submitMutation.mutate();
          clearInterval(interval);
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [attempt?.startedAt, quiz?.duration]);

  if (loadingQuiz || loadingAttempt) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-64" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!quiz || !attempt) {
    return <div>Quiz not found</div>;
  }

  if (attempt.completedAt) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="text-green-500" />
            Quiz Completed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium">Your Score</p>
              <p className="text-3xl font-bold">{attempt.score} / {quiz.totalScore}</p>
            </div>
            <Button onClick={() => setLocation("/")}>Back to Home</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{quiz.title}</h1>
          <p className="text-muted-foreground">Answer all questions before time runs out</p>
        </div>
        {timeLeft !== null && (
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <span className="font-mono">{formatTime(timeLeft)}</span>
          </div>
        )}
      </div>

      <Progress
        value={
          (Object.keys(selectedAnswers).length / quiz.questions.length) * 100
        }
      />

      <div className="space-y-8">
        {quiz.questions.map((question, index) => (
          <Card key={question.id}>
            <CardHeader>
              <CardTitle>Question {index + 1}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>{question.text}</p>
                <RadioGroup
                  value={selectedAnswers[question.id]?.toString()}
                  onValueChange={(value) =>
                    setSelectedAnswers((prev) => ({
                      ...prev,
                      [question.id]: parseInt(value),
                    }))
                  }
                >
                  {question.options.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.id.toString()} id={option.id.toString()} />
                      <Label htmlFor={option.id.toString()}>{option.text}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={() => submitMutation.mutate()}
          disabled={
            Object.keys(selectedAnswers).length !== quiz.questions.length ||
            submitMutation.isPending
          }
        >
          Submit Quiz
        </Button>
      </div>
    </div>
  );
}
