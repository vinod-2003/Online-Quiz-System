import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle2, Clock, Plus, XCircle } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import type { QuizWithQuestions, Attempt } from "@shared/schema";

const questionSchema = z.object({
  text: z.string().min(1),
  marks: z.number().min(1),
  options: z.array(
    z.object({
      text: z.string().min(1),
      isCorrect: z.boolean(),
    }),
  ).min(2).refine(opts => opts.filter(o => o.isCorrect).length === 1, {
    message: "Exactly one option must be correct",
  }),
});

export default function QuizDetails() {
  const { id } = useParams();
  const { data: quiz, isLoading: loadingQuiz } = useQuery<QuizWithQuestions>({
    queryKey: [`/api/quizzes/${id}`],
  });

  const { data: attempts, isLoading: loadingAttempts } = useQuery<Attempt[]>({
    queryKey: [`/api/quizzes/${id}/participants`],
  });

  const form = useForm({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      text: "",
      marks: 10,
      options: [
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ],
    },
  });

  const addQuestionMutation = useMutation({
    mutationFn: async (data: z.infer<typeof questionSchema>) => {
      const res = await fetch(`/api/quizzes/${id}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to add question");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/quizzes/${id}`] });
      form.reset();
    },
  });

  if (loadingQuiz || loadingAttempts) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!quiz) return <div>Quiz not found</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{quiz.title}</h1>
        <div className="flex items-center gap-4 mt-2 text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {quiz.duration} minutes
          </div>
          <div>
            {quiz.questions.length} questions ({quiz.totalScore} points)
          </div>
        </div>
      </div>

      <Tabs defaultValue="questions">
        <TabsList>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="participants">Participants</TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="space-y-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Question
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Question</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit((data) =>
                    addQuestionMutation.mutate(data)
                  )}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="text"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Question</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="marks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marks</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {form.watch("options").map((_, index) => (
                    <div key={index} className="space-y-2">
                      <FormField
                        control={form.control}
                        name={`options.${index}.text`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Option {index + 1}</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`options.${index}.isCorrect`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <label className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  checked={field.value}
                                  onChange={() => {
                                    const newOptions = form
                                      .getValues()
                                      .options.map((opt, i) => ({
                                        ...opt,
                                        isCorrect: i === index,
                                      }));
                                    form.setValue("options", newOptions);
                                  }}
                                />
                                Correct Answer
                              </label>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={addQuestionMutation.isPending}
                  >
                    Add Question
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <div className="space-y-4">
            {quiz.questions.map((question, index) => (
              <Card key={question.id}>
                <CardHeader>
                  <CardTitle>Question {index + 1}</CardTitle>
                  <CardDescription>{question.marks} marks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p>{question.text}</p>
                    <div className="space-y-2">
                      {question.options.map((option) => (
                        <div
                          key={option.id}
                          className="flex items-center gap-2"
                        >
                          {option.isCorrect ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-gray-300" />
                          )}
                          <span>{option.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="participants">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Started At</TableHead>
                <TableHead>Completed At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attempts?.map((attempt) => (
                <TableRow key={attempt.id}>
                  <TableCell>{attempt.userId}</TableCell>
                  <TableCell>
                    {attempt.completedAt ? "Completed" : "In Progress"}
                  </TableCell>
                  <TableCell>
                    {attempt.score !== null ? attempt.score : "-"}
                  </TableCell>
                  <TableCell>
                    {new Date(attempt.startedAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {attempt.completedAt
                      ? new Date(attempt.completedAt).toLocaleString()
                      : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
}
