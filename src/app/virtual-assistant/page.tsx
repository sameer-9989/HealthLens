
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { virtualNursingAssistant, VirtualNursingAssistantInput, VirtualNursingAssistantOutput } from '@/ai/flows/virtual-nursing-assistant';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Send, User, Bot, AlertTriangleIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
// Label and Textarea are no longer needed if context inputs are removed
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  interactionWarning?: string;
  suggestedAction?: string;
}

export default function VirtualAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // User context state removed as per request
  // const [userMedications, setUserMedications] = useState<string[]>(['Lisinopril 10mg daily', 'Metformin 500mg twice daily']);
  // const [userHealthGoals, setUserHealthGoals] = useState<string[]>(['Lower A1c', 'Increase daily steps to 8000']);
  // const [medicationToCheck, setMedicationToCheck] = useState('');

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    
    setIsLoading(true);

    try {
      const aiInput: VirtualNursingAssistantInput = {
        message: userMessage.text,
        // medications, healthGoals, and medicationToCheck are no longer passed from page state
        // The AI flow should handle cases where these are undefined if it needs them.
        // For this iteration, we assume the VA can operate based on the message alone,
        // or that these context points would be fetched/managed differently in a full app.
      };
      const aiOutput: VirtualNursingAssistantOutput = await virtualNursingAssistant(aiInput);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiOutput.response,
        sender: 'ai',
        timestamp: new Date(),
        interactionWarning: aiOutput.interactionWarning,
        suggestedAction: aiOutput.suggestedAction,
      };
      setMessages((prevMessages) => [...prevMessages, aiMessage]);
    } catch (error) {
      console.error("Error with virtual assistant:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble connecting. Please try again later.",
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }
    setInputValue(''); // Clear main input
    // setMedicationToCheck(''); // No longer needed
    setIsLoading(false);
  };
  
  useEffect(() => {
    // Ensure initial greeting is still set
    if (messages.length === 0) {
        setMessages([
        {
            id: 'initial-greeting',
            text: "Hello! I'm your Virtual Nursing Assistant. How can I help you today? You can ask me about health goals, request a simple mindfulness exercise, or explain a medical term.",
            sender: 'ai',
            timestamp: new Date(),
        }
        ]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    // Removed the outer div flex container and the first Card for "Context & Tools"
    // The chat card now takes full width and height available.
    <Card className="shadow-lg w-full flex flex-col h-[calc(100vh-8rem)] max-h-[700px] md:max-h-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Virtual Nursing Assistant</CardTitle>
        <CardDescription>
          Chat for health guidance, term explanations, or simple exercises.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id}>
                <div
                  className={cn(
                    "flex items-end gap-2",
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.sender === 'ai' && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback><Bot size={18} /></AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-xl px-4 py-2.5 shadow-sm",
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-none'
                        : 'bg-secondary text-secondary-foreground rounded-bl-none'
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    <p className={cn(
                        "text-xs mt-1.5",
                        message.sender === 'user' ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground text-left'
                      )}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {message.sender === 'user' && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback><User size={18} /></AvatarFallback>
                    </Avatar>
                  )}
                </div>
                {message.sender === 'ai' && message.interactionWarning && (
                  <Alert variant="destructive" className="mt-2 ml-10 max-w-[80%]">
                    <AlertTriangleIcon className="h-4 w-4" />
                    <AlertTitle>Potential Interaction Note</AlertTitle>
                    <AlertDescription className="whitespace-pre-wrap">{message.interactionWarning}</AlertDescription>
                  </Alert>
                )}
                {message.sender === 'ai' && message.suggestedAction && (
                   <Alert variant="default" className="mt-2 ml-10 max-w-[80%] bg-accent/20 border-accent/50">
                    <AlertTitle className="font-semibold">Suggested Action/Exercise</AlertTitle>
                    <AlertDescription className="whitespace-pre-wrap">{message.suggestedAction}</AlertDescription>
                  </Alert>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-end gap-2 justify-start">
                 <Avatar className="h-8 w-8">
                    <AvatarFallback><Bot size={18} /></AvatarFallback>
                  </Avatar>
                <div className="max-w-[70%] rounded-xl px-4 py-3 shadow-sm bg-secondary text-secondary-foreground rounded-bl-none">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
          <Input
            type="text"
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 h-10 text-base"
            disabled={isLoading}
            autoFocus
          />
          <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
