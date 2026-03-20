import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdTrack() {
  const { token } = useParams<{ token: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [timeLeft, setTimeLeft] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [mathQuestion, setMathQuestion] = useState({ num1: 0, num2: 0, answer: 0 });
  const [userAnswer, setUserAnswer] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [targetUrl, setTargetUrl] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setError("Invalid tracking token");
      return;
    }

    fetch(`/api/ad-views/${token}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.adView && data.campaign) {
          const duration = data.campaign.duration || 30;
          setTimeLeft(duration);
          setTotalDuration(duration);
          setIsLoading(false);
        } else {
          setError("Failed to load ad details");
        }
      })
      .catch((err) => {
        console.error("Failed to fetch ad details:", err);
        setError("Failed to load advertisement");
      });

    fetch(`/api/ad-views/${token}/click`, {
      method: "POST",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          console.log("Ad click tracked");
        }
      })
      .catch((err) => console.error("Failed to track click:", err));

    fetch(`/api/track/${token}`, {
      credentials: "include",
      redirect: "manual",
    })
      .then((res) => {
        if (res.type === "opaqueredirect") {
          return res.text().then(() => {
            return fetch(`/api/track/${token}`, {
              credentials: "include",
            });
          });
        }
        return res;
      })
      .then((res) => {
        if (res && res.url) {
          setTargetUrl(res.url);
        }
      })
      .catch((err) => {
        console.error("Failed to get target URL:", err);
        setError("Failed to load advertisement");
      });
  }, [token]);

  useEffect(() => {
    if (timeLeft > 0 && !isCompleted && !isLoading) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isCompleted && !isLoading) {
      setIsCompleted(true);

      const num1 = Math.floor(Math.random() * 10) + 1;
      const num2 = Math.floor(Math.random() * 10) + 1;
      setMathQuestion({ num1, num2, answer: num1 + num2 });

      fetch(`/api/ad-views/${token}/complete`, {
        method: "POST",
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            toast({
              title: "Ad Viewed!",
              description: "Please answer the verification question to claim your reward.",
            });
          }
        })
        .catch((err) => {
          console.error("Failed to mark ad as completed:", err);
          setError("Failed to complete ad view");
        });
    }
  }, [timeLeft, isCompleted, isLoading, token, toast]);

  const handleVerify = () => {
    const answer = parseInt(userAnswer);
    if (answer === mathQuestion.answer) {
      setIsVerified(true);
      toast({
        title: "Verified!",
        description: "You can now close this window and claim your reward.",
      });

      setTimeout(() => {
        window.close();
      }, 2000);
    } else {
      toast({
        title: "Incorrect Answer",
        description: "Please try again.",
        variant: "destructive",
      });
      setUserAnswer("");
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-red-500" />
              <h2 className="text-xl font-semibold">Error</h2>
              <p className="text-gray-600">{error}</p>
              <Button onClick={() => window.close()}>Close Window</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md border-b">
        <div className="container mx-auto px-4 py-4">
          <Card>
            <CardContent className="pt-6">
              {!isCompleted ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-blue-500" />
                      <span className="font-semibold">Time Remaining:</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">{timeLeft}s</span>
                  </div>
                  <Progress
                    value={((totalDuration - timeLeft) / totalDuration) * 100}
                    className="h-2"
                  />
                  <p className="text-sm text-gray-600 text-center">
                    Please wait for the timer to complete before claiming your reward
                  </p>
                </div>
              ) : !isVerified ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-semibold">Timer Complete!</span>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-center">
                      Verification: What is {mathQuestion.num1} + {mathQuestion.num2}?
                    </label>
                    <div className="flex space-x-2">
                      <Input
                        type="number"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="Enter answer"
                        className="flex-1"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleVerify();
                          }
                        }}
                      />
                      <Button onClick={handleVerify}>Verify</Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-2 text-green-600">
                  <CheckCircle2 className="h-8 w-8" />
                  <p className="font-semibold">Verified! You can close this window now.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {targetUrl && (
        <div className="pt-32">
          <iframe
            src={targetUrl}
            className="w-full h-screen border-0"
            title="Advertisement"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        </div>
      )}
    </div>
  );
}
