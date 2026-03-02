import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, X, Send, Star } from "lucide-react";
import { trpc } from "@/lib/trpc";

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<"bug" | "feature" | "improvement" | "other">("feature");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const submitMutation = trpc.feedbackSystem.submitFeedback.useMutation();

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) return;

    try {
      await submitMutation.mutateAsync({
        type: feedbackType,
        title,
        description,
      });
      setSubmitted(true);
      setTimeout(() => {
        setIsOpen(false);
        setSubmitted(false);
        setTitle("");
        setDescription("");
      }, 2000);
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg z-40"
        size="lg"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>

      {/* Feedback Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-end p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle>Send Feedback</CardTitle>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>

            <CardContent className="space-y-4">
              {submitted ? (
                <div className="text-center py-6">
                  <p className="text-lg font-semibold text-green-600">
                    Thank you for your feedback!
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    We appreciate your input and will review it shortly.
                  </p>
                </div>
              ) : (
                <>
                  {/* Feedback Type */}
                  <div>
                    <label className="text-sm font-medium">Type</label>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {["bug", "feature", "improvement", "other"].map((type) => (
                        <Button
                          key={type}
                          size="sm"
                          variant={
                            feedbackType === type ? "default" : "outline"
                          }
                          onClick={() =>
                            setFeedbackType(
                              type as
                                | "bug"
                                | "feature"
                                | "improvement"
                                | "other"
                            )
                          }
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      placeholder="Brief summary..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <textarea
                      placeholder="Tell us more..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full mt-2 p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={4}
                    />
                  </div>

                  {/* Rating */}
                  <div>
                    <label className="text-sm font-medium">Rate your experience</label>
                    <div className="flex gap-2 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className="focus:outline-none transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    onClick={handleSubmit}
                    disabled={!title.trim() || !description.trim()}
                    className="w-full gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Send Feedback
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
