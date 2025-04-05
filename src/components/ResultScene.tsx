import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { useTranslation } from "react-i18next"; // Import useTranslation
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { Comment } from "../types";
import { generateAiFeedback } from "../services/geminiService";
import { useMissionStore } from "../stores/missionStore";

interface Feedback {
  npc_name: string;
  message: string;
}

const ResultScene: React.FC = () => {
  const { t, i18n } = useTranslation("resultScene"); // Get i18n instance
  const location = useLocation();
  const navigate = useNavigate();

  interface LocationState {
    missionId?: number;
    success?: boolean;
    allComments?: Comment[];
    missionTitle?: string;
  }
  const {
    missionId,
    success: isSuccess = false,
    allComments = [],
    missionTitle = t("unknownMission"), // Use translation for default
  } = (location.state as LocationState) || {};

  const currentMission = useMissionStore((state) => state.currentMission);

  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingEnding, setIsCheckingEnding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchCalledRef = useRef(false);

  const isLastMission = missionId === 3; // Example: Assume missionId 3 is the last

  useEffect(() => {
    const fetchFeedback = async () => {
      if (!isSuccess) {
        setIsLoading(false);
        return;
      }
      if (!currentMission) {
        setIsLoading(false);
        setError(t("errorNoMissionData"));
        console.error(
          "Current mission data not found in store for feedback generation."
        );
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log("Fetching AI feedback with data:", {
          missionTitle, // Already translated if coming from missionData hook
          articleContent: currentMission.articleContent,
          allComments,
          isSuccess,
        });
        const feedbackResult = await generateAiFeedback(
          missionTitle,
          currentMission.articleContent ?? "",
          allComments,
          isSuccess,
          i18n.language // Pass current language
        );
        console.log("AI Feedback Result:", feedbackResult);

        if (feedbackResult.error) {
          // Use a generic error key, as the specific message might not be translatable easily
          setError(
            t("errorFeedbackGeneration", { message: feedbackResult.message })
          );
        } else {
          setFeedback(feedbackResult);
        }
      } catch (err: any) {
        console.error("Error fetching feedback:", err);
        setError(t("errorFeedbackGeneration", { message: err.message }));
      } finally {
        setIsLoading(false);
      }
    };

    if (missionId !== undefined) {
      if (!fetchCalledRef.current) {
        fetchCalledRef.current = true;
        fetchFeedback();
      }
    } else {
      setIsLoading(false);
      setError(t("errorNoMissionId"));
      console.error("Mission ID not found in location state");
    }
  }, [
    missionId,
    isSuccess,
    allComments,
    missionTitle,
    currentMission,
    t,
    i18n.language,
  ]); // Add i18n.language to dependencies

  const handleProceed = async () => {
    if (isLastMission) {
      setIsCheckingEnding(true);
      setError(null);
      try {
        console.log("Checking final ending (placeholder)...");
        await new Promise((resolve) => setTimeout(resolve, 500));
        const mockEndingType = isSuccess ? "good" : "bad";
        console.log("Ending type determined (placeholder):", mockEndingType);
        navigate("/ending", { state: { endingType: mockEndingType } });
      } catch (err: any) {
        console.error("Error checking ending (placeholder):", err);
        setError(t("errorCheckingEnding", { message: err.message }));
        setIsCheckingEnding(false);
      }
    } else {
      console.log("Proceeding to next episode...");
      const nextMissionId = (missionId ?? 0) + 1;
      navigate("/game", { state: { missionId: Number(nextMissionId) } });
    }
  };

  const renderContent = () => {
    if (error) {
      return <p className="text-red-500 p-4 text-center">{error}</p>;
    }

    if (isSuccess) {
      return (
        <>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-green-400">
              🎉 {t("successTitle")} 🎉
            </CardTitle>
            <CardDescription className="text-lg pt-2">
              {t("successDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-2 pt-4 pb-4">
                <Skeleton className="h-4 w-1/4 mx-auto" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4 mx-auto" />
              </div>
            ) : feedback ? (
              <div className="text-center">
                <h3 className="font-semibold text-lg mb-1 text-gray-200">
                  {t("feedbackTitle", { name: feedback.npc_name })}
                </h3>
                <p className="text-base italic text-gray-300">
                  "{feedback.message}" {/* AI message kept as is */}
                </p>
              </div>
            ) : (
              <p className="text-center text-muted-foreground">
                {t("feedbackUnavailable")}
              </p>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            {!isLoading && (
              <Button
                onClick={handleProceed}
                disabled={isCheckingEnding || isLoading}
                className="px-8 py-3 bg-primary text-primary-foreground border border-border hover:bg-accent hover:text-accent-foreground active:translate-y-px transition duration-300 ease-in-out transform hover:-translate-y-1"
              >
                {isCheckingEnding
                  ? t("checkingEnding")
                  : isLastMission
                  ? t("viewFinalResult")
                  : t("nextEpisode")}
              </Button>
            )}
          </CardFooter>
        </>
      );
    } else {
      // Mission failed scenario
      return (
        <>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-red-500">
              {t("failTitle")}
            </CardTitle>
            <CardDescription className="text-lg pt-2">
              {t("failDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center">{t("failMessage")}</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button
              onClick={handleProceed}
              disabled={isCheckingEnding}
              className="px-8 py-3 bg-primary text-primary-foreground border border-border hover:bg-accent hover:text-accent-foreground active:translate-y-px transition duration-300 ease-in-out transform hover:-translate-y-1"
            >
              {isCheckingEnding
                ? t("checkingEnding")
                : isLastMission
                ? t("viewFinalResult")
                : t("nextEpisode")}
            </Button>
          </CardFooter>
        </>
      );
    }
  };

  return (
    <div className="bg-black text-white p-4 w-full h-full flex items-center justify-center">
      <Card className="w-full max-w-lg bg-gray-900 border-gray-700 shadow-xl shadow-blue-500/20 rounded-lg">
        {renderContent()}
      </Card>
    </div>
  );
};

export default ResultScene;
