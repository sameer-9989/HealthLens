
"use client";

import React, { useState } from 'react';
import { processCognitiveCheckIn, CognitiveCheckInInput, CognitiveCheckInOutput } from '@/ai/flows/cognitive-health-tracker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertTriangle, Brain, MessageSquare, Lightbulb, Zap } from 'lucide-react';
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const formSchema = z.object({
  userMessage: z.string().min(3, { message: "Message must be at least 3 characters." }),
  userId: z.string().min(1, {message: "User ID is required."}), // Simplified for now
  conversationContext: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface TrackerChatMessage {
  sender: 'user' | 'ai';
  text: string;
  analysis?: CognitiveCheckInOutput['analysis'];
  isQuestion?: boolean;
}

export default function CognitiveTrackerPage() {
  const [chatHistory, setChatHistory] = useState<TrackerChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { control, register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: "demoUser123", // Default or fetch logged-in user
      userMessage: "",
      conversationContext: "",
    }
  });
  
  const currentContext = watch("conversationContext");

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    setError(null);

    const userMessage: TrackerChatMessage = { sender: 'user', text: data.userMessage };
    setChatHistory(prev => [...prev, userMessage]);

    // Update conversation context for the AI
    const contextForAI = [...chatHistory, userMessage]
      .map(msg => `${msg.sender === 'user' ? 'User' : 'AI'}: ${msg.text}`)
      .join('\n');
    setValue("conversationContext", contextForAI);

    try {
      const input: CognitiveCheckInInput = {
        userMessage: data.userMessage,
        userId: data.userId,
        conversationContext: contextForAI, // Pass the updated context
      };
      const output = await processCognitiveCheckIn(input);
      
      const aiMessage: TrackerChatMessage = {
        sender: 'ai',
        text: output.aiResponse,
        analysis: output.analysis,
        isQuestion: output.isAskingQuestion
      };
      setChatHistory(prev => [...prev, aiMessage]);
      setValue("userMessage", ""); // Clear input field

      // Update context for next turn
       const finalContext = [...chatHistory, userMessage, aiMessage]
        .map(msg => `${msg.sender === 'user' ? 'User' : 'AI'}: ${msg.text}`)
        .join('\n');
       setValue("conversationContext", finalContext);


    } catch (e) {
      setError('An error occurred while processing your check-in. Please try again.');
      console.error(e);
       const errorAiMessage: TrackerChatMessage = { sender: 'ai', text: "Sorry, I encountered an issue. Could you try that again?"};
       setChatHistory(prev => [...prev, errorAiMessage]);
    }
    setIsLoading(false);
  };
  
  // Send an initial message to trigger the first question from AI
  const triggerInitialPrompt = async () => {
    if (chatHistory.length > 0) return; // Only if chat is empty
    setIsLoading(true);
    setError(null);
    const initialUserMessage: TrackerChatMessage = { sender: 'user', text: "Cognitive check-in" };
     // Don't add "Cognitive check-in" to visible chat, AI will ask the first question directly
    
    setValue("conversationContext", "User: Cognitive check-in"); // Set initial context for AI

    try {
      const input: CognitiveCheckInInput = {
        userMessage: "Cognitive check-in", // Trigger phrase
        userId: watch("userId") || "demoUser123",
        conversationContext: "User: Cognitive check-in",
      };
      const output = await processCognitiveCheckIn(input);
      const aiMessage: TrackerChatMessage = {
        sender: 'ai',
        text: output.aiResponse,
        analysis: output.analysis,
        isQuestion: output.isAskingQuestion
      };
      setChatHistory(prev => [aiMessage]); // Start chat with AI's question
      setValue("conversationContext", `AI: ${output.aiResponse}`); // Update context
    } catch (e) {
      setError('Failed to start cognitive check-in. Please try refreshing.');
      console.error(e);
    }
    setIsLoading(false);
  };

  React.useEffect(() => {
    triggerInitialPrompt();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center"><Brain className="mr-2 h-7 w-7 text-primary" /> Cognitive Health Tracker</CardTitle>
          <CardDescription>
            Engage in daily mental check-ins. Respond to the AI's prompts about your focus, memory, and overall cognitive feeling.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           {chatHistory.length > 0 && (
            <div className="border rounded-md p-4 max-h-[30rem] overflow-y-auto space-y-3 bg-muted/20">
              {chatHistory.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-lg shadow-sm max-w-[85%] ${msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background'}`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    {msg.sender === 'ai' && msg.analysis && msg.analysis.summary && (
                      <Card className="mt-3 bg-accent/30 p-2 border-accent/50">
                        <CardHeader className="p-1 pb-0">
                           <CardTitle className="text-xs font-semibold flex items-center"><Lightbulb className="h-3 w-3 mr-1.5 text-yellow-500"/> AI Analysis Snapshot</CardTitle>
                        </CardHeader>
                        <CardContent className="p-1 text-xs">
                          <p>{msg.analysis.summary}</p>
                          <ul className="list-disc list-inside mt-1 opacity-80">
                            {msg.analysis.cognitiveFatigueDetected && <li>Cognitive fatigue noted.</li>}
                            {msg.analysis.stressPatternDetected && <li>Stress patterns observed.</li>}
                            {msg.analysis.emotionalDeclineDetected && <li>Signs of emotional decline.</li>}
                            {msg.analysis.earlyCognitiveDeclineSigns && <li>Potential early cognitive decline indicators.</li>}
                            {msg.analysis.burnoutSigns && <li>Burnout signs detected.</li>}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && chatHistory.length > 0 && ( // Show loader only if there's ongoing chat
                 <div className="flex justify-start">
                    <div className="p-3 rounded-lg shadow-sm bg-background">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                 </div>
                )}
            </div>
          )}
           {isLoading && chatHistory.length === 0 && ( // Initial loading state
            <div className="flex justify-center items-center p-6">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2 text-muted-foreground">Starting Cognitive Check-in...</p>
            </div>
            )}


          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="userMessage">Your Response</Label>
              <Textarea
                id="userMessage"
                placeholder="Type your response to the AI's question here..."
                className="min-h-[100px] mt-1"
                {...register("userMessage")}
              />
              {errors.userMessage && <p className="text-sm text-destructive mt-1">{errors.userMessage.message}</p>}
            </div>
            
            {/* Hidden fields for context and userId, manage them if needed for more complex scenarios */}
            <input type="hidden" {...register("userId")} />
            <input type="hidden" {...register("conversationContext")} />

            <Button type="submit" disabled={isLoading || chatHistory.length === 0 || !chatHistory.some(m => m.sender === 'ai' && m.isQuestion) } className="w-full md:w-auto">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageSquare className="mr-2 h-4 w-4"/>}
              Send Response
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="mt-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
