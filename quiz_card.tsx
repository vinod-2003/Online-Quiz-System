import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Clock, Trophy } from "lucide-react";

type QuizCardProps = {
  id: number;
  title: string;
  duration: number;
  totalScore: number;
  status: "not-started" | "in-progress" | "completed";
  score?: number | null;
  onStart?: () => void;
  onResume?: () => void;
  onViewScore?: () => void;
};

export default function QuizCard({
  title,
  duration,
  totalScore,
  status,
  score,
  onStart,
  onResume,
  onViewScore,
}: QuizCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <Badge
            variant={
              status === "completed"
                ? "default"
                : status === "in-progress"
                ? "secondary"
                : "outline"
            }
          >
            {status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {duration} minutes
          </div>
          <div className="flex items-center gap-1">
            <Trophy className="h-4 w-4" />
            {totalScore} points
          </div>
        </div>

        {status === "completed" && score !== null && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">Your score</p>
            <p className="text-2xl font-bold">
              {score} / {totalScore}
            </p>
          </div>
        )}

        <div className="flex justify-end">
          {status === "not-started" && (
            <Button onClick={onStart}>Start Quiz</Button>
          )}
          {status === "in-progress" && (
            <Button onClick={onResume}>Resume Quiz</Button>
          )}
          {status === "completed" && (
            <Button onClick={onViewScore} variant="outline">
              View Details
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
