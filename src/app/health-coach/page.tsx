
"use client";

import React, { useState } from 'react';
import { conversationalHealthCoach, ConversationalHealthCoachInput, ConversationalHealthCoachOutput } from '@/ai/flows/conversational-health-coach';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertTriangle, BotMessageSquare, Sparkles, MessagesSquare } from 'lucide-react';
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const healthTopics = [
  { value: "hydration", label: "Hydration" },
  { value: "exercise", label: "Exercise" },
  { value: "sleep", label: "Sleep" },
  { value: "stressReduction", label: "Stress Reduction" },
  { value: "mindfulness", label: "Mindfulness" },
  { value: "posture", label: "Posture" },
  { value: "diet", label: "Diet" },
] as const;

type HealthTopicValue = typeof healthTopics[number]['value'];

const formSchema = z.object({
  userName: z.string().min(2, { message: "Please enter your name (at least 2 characters)." }),
  healthTopic: z.enum(healthTopics.map(t => t.value) as [HealthTopicValue, ...HealthTopicValue[]]),
  userMessage: z.string().min(5, { message: "Your message should be at least 5 characters." }),
  conversationHistory: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  task?: string;
}

export default function HealthCoachPage() {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { control, register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      healthTopic: "hydration",
      userName: "User",
      userMessage: "",
      conversationHistory: "",
    },
  });

  const currentTopic = watch("healthTopic");

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    setError(null);

    const currentUserMessage: ChatMessage = { sender: 'user', text: data.userMessage };
    setChatMessages(prev => [...prev, currentUserMessage]);

    // Prepare conversation history string for the AI
    const historyForAI = chatMessages.map(msg => `${msg.sender === 'user' ? data.userName : 'AI'}: ${msg.text}${msg.task ? ` (Suggested Task: ${msg.task})` : ''}`).join('\n');
    setValue("conversationHistory", historyForAI);


    try {
      const input: ConversationalHealthCoachInput = {
        userName: data.userName,
        healthTopic: data.healthTopic,
        userMessage: data.userMessage,
        conversationHistory: historyForAI // Send current state of history
      };
      const output = await conversationalHealthCoach(input);
      
      const aiResponse: ChatMessage = { sender: 'ai', text: output.coachResponse, task: output.suggestedTask };
      setChatMessages(prev => [...prev, aiResponse]);
      setValue("userMessage", ""); // Clear user input field
      
      // Update conversation history for the next turn (including AI's response)
      const updatedHistoryForAI = [...chatMessages, currentUserMessage, aiResponse]
        .map(msg => `${msg.sender === 'user' ? data.userName : 'AI'}: ${msg.text}${msg.task ? ` (Suggested Task: ${msg.task})` : ''}`)
        .join('\n');
      setValue("conversationHistory", updatedHistoryForAI);


    } catch (e) {
      setError('An error occurred while talking to the Health Coach. Please try again.');
      console.error(e);
      const errorResponse: ChatMessage = { sender: 'ai', text: "Sorry, I couldn't process that. Please try again." };
      setChatMessages(prev => [...prev, errorResponse]);
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center"><BotMessageSquare className="mr-2 h-7 w-7 text-primary" /> Conversational Health Coach</CardTitle>
          <CardDescription>
            Chat with your AI health coach to build and maintain better health habits. Start by selecting a topic and sending a message.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {chatMessages.length > 0 && (
            <div className="border rounded-md p-4 max-h-96 overflow-y-auto space-y-3 bg-muted/20">
              {chatMessages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-lg shadow-sm max-w-[80%] ${msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background'}`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    {msg.task && (
                      <div className="mt-2 pt-2 border-t border-white/20">
                        <p className="text-xs font-semibold flex items-center"><Sparkles className="h-3 w-3 mr-1 text-yellow-300"/> Suggested Task:</p>
                        <p className="text-xs">{msg.task}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
               {isLoading && (
                 <div className="flex justify-start">
                    <div className="p-3 rounded-lg shadow-sm bg-background">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                 </div>
                )}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="userName">Your Name</Label>
                  <Input id="userName" {...register("userName")} placeholder="Enter your name" className="mt-1"/>
                  {errors.userName && <p className="text-sm text-destructive mt-1">{errors.userName.message}</p>}
                </div>
                <div>
                  <Label htmlFor="healthTopic">Health Topic</Label>
                  <Controller
                    name="healthTopic"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger id="healthTopic" className="mt-1">
                          <SelectValue placeholder="Select a topic" />
                        </SelectTrigger>
                        <SelectContent>
                          {healthTopics.map(topic => (
                            <SelectItem key={topic.value} value={topic.value}>{topic.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.healthTopic && <p className="text-sm text-destructive mt-1">{errors.healthTopic.message}</p>}
                </div>
            </div>
            
            <div>
              <Label htmlFor="userMessage">Your Message</Label>
              <Textarea
                id="userMessage"
                placeholder={`Chat about ${healthTopics.find(t => t.value === currentTopic)?.label.toLowerCase()}... (e.g., "I want to drink more water", "I feel stressed", "Help me exercise")`}
                className="min-h-[100px] mt-1"
                {...register("userMessage")}
              />
              {errors.userMessage && <p className="text-sm text-destructive mt-1">{errors.userMessage.message}</p>}
            </div>
             <input type="hidden" {...register("conversationHistory")} />
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessagesSquare className="mr-2 h-4 w-4" />}
              Send Message
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
