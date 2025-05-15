
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { virtualNursingAssistant, VirtualNursingAssistantInput, VirtualNursingAssistantOutput } from '@/ai/flows/virtual-nursing-assistant';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Send, User, Bot, AlertTriangleIcon, ShieldQuestion, Pill } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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

  // User context, can be fetched or set by user profile in a real app
  const [userMedications, setUserMedications] = useState<string[]>(['Lisinopril 10mg daily', 'Metformin 500mg twice daily']);
  const [userHealthGoals, setUserHealthGoals] = useState<string[]>(['Lower A1c', 'Increase daily steps to 8000']);
  
  const [medicationToCheck, setMedicationToCheck] = useState('');

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
        medications: medicationToCheck ? userMedications : undefined, // Only send user meds if checking an interaction
        healthGoals: userHealthGoals,
        medicationToCheck: medicationToCheck || undefined,
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
    setMedicationToCheck(''); // Clear medication check input after sending
    setIsLoading(false);
  };
  
  useEffect(() => {
    setMessages([
      {
        id: 'initial-greeting',
        text: "Hello! I'm your Virtual Nursing Assistant. How can I help you today? You can ask me about your medications, health goals, request a simple mindfulness exercise, or explain a medical term.",
        sender: 'ai',
        timestamp: new Date(),
      }
    ]);
  }, []);

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-8rem)] max-h-[700px] md:max-h-full">
      <Card className="shadow-lg w-full md:w-1/3 flex flex-col">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Context & Tools</CardTitle>
          <CardDescription>Provide context for the assistant.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 overflow-y-auto">
          <div>
            <Label htmlFor="userMedications" className="flex items-center"><Pill className="mr-2 h-4 w-4 text-primary"/> Your Medications</Label>
            <Textarea 
              id="userMedications"
              value={userMedications.join('\n')}
              onChange={(e) => setUserMedications(e.target.value.split('\n').map(m => m.trim()).filter(m => m))}
              placeholder="Aspirin 100mg daily&#10;Lisinopril 20mg daily"
              className="min-h-[80px] mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">Enter one medication per line.</p>
          </div>
          <div>
            <Label htmlFor="userHealthGoals">Your Health Goals</Label>
            <Textarea
              id="userHealthGoals"
              value={userHealthGoals.join('\n')}
              onChange={(e) => setUserHealthGoals(e.target.value.split('\n').map(g => g.trim()).filter(g => g))}
              placeholder="Lower blood pressure&#10;Walk 30 minutes a day"
              className="min-h-[60px] mt-1"
            />
             <p className="text-xs text-muted-foreground mt-1">Enter one goal per line.</p>
          </div>
          <div>
            <Label htmlFor="medicationToCheck" className="flex items-center"><ShieldQuestion className="mr-2 h-4 w-4 text-primary"/> Check Interaction For:</Label>
            <Input 
              id="medicationToCheck"
              value={medicationToCheck}
              onChange={(e) => setMedicationToCheck(e.target.value)}
              placeholder="e.g., Ibuprofen (with current meds list)"
              className="mt-1"
            />
             <p className="text-xs text-muted-foreground mt-1">Enter a single drug name. Will be checked against 'Your Medications' list.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg w-full md:w-2/3 flex flex-col h-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Virtual Nursing Assistant</CardTitle>
          <CardDescription>
            Chat for medication info, health guidance, term explanations, or simple exercises.
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
    </div>
  );
}
