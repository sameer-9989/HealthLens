
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { virtualNursingAssistant, VirtualNursingAssistantInput, VirtualNursingAssistantOutput } from '@/ai/flows/virtual-nursing-assistant';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea'; 
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Send, User, Bot, AlertTriangleIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  interactionWarning?: string;
  suggestedAction?: string;
}

// Helper component for simple markdown rendering
const SimpleMarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
  let processedText = text;
  // Replace **bold** with <strong>bold</strong>
  processedText = processedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Replace _italic_ with <em>italic</em>
  processedText = processedText.replace(/\_(.*?)\_/g, '<em>$1</em>');
  // Note: This is a basic replacement. More complex markdown would require a proper library.
  return <span dangerouslySetInnerHTML={{ __html: processedText }} />;
};


export default function VirtualAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const practoUrl = "https://www.practo.com/doctors?utm_source=opd_google&utm_medium=156227283291&utm_campaign=20298938780&gad_source=1&gad_campaignid=20298938780&gclid=Cj0KCQjwoZbBBhDCARIsAOqMEZUedzUjRHTpaZgMdNwfF1zEqrs3oE568pfm6Jpl0Ebi0WRdWwy_6jAaAsjyEALw_wcB";

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => { 
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };
    
    const currentMessagesWithUser = [...messages, userMessage];
    const historyForAI = currentMessagesWithUser
      .slice(-6) 
      .map(msg => `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`)
      .join('\n');

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    
    setIsLoading(true);

    try {
      const aiInput: VirtualNursingAssistantInput = {
        message: userMessage.text,
        conversationHistory: historyForAI,
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
    setInputValue('');
    setIsLoading(false);
  };
  
  useEffect(() => {
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
  }, []);

  const handleTextareaKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!isLoading && inputValue.trim()) {
        handleSendMessage(); 
      }
    }
  };

  return (
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
                    <p className="text-sm whitespace-pre-wrap">
                      {message.sender === 'ai' ? (
                        <SimpleMarkdownRenderer text={message.text} />
                      ) : (
                        message.text 
                      )}
                    </p>
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
                    <AlertDescription className="whitespace-pre-wrap">
                       <SimpleMarkdownRenderer text={message.suggestedAction} />
                    </AlertDescription>
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
      <CardFooter className="p-4 border-t flex flex-col items-stretch"> 
        <form onSubmit={handleSendMessage} className="flex w-full items-end space-x-2"> 
          <Textarea
            placeholder="Type your message (Shift+Enter for new line)..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleTextareaKeyDown}
            className="flex-1 resize-none text-base min-h-[40px] max-h-[180px]" 
            disabled={isLoading}
            autoFocus
          />
          <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="sr-only">Send</span>
          </Button>
        </form>
        {messages.length > 1 && ( 
            <div className="mt-4 flex justify-center md:justify-start w-full">
            <Button
                onClick={() => window.open(practoUrl, "_blank")}
                className="w-full md:w-auto" 
            >
                Book an Appointment
            </Button>
            </div>
        )}
      </CardFooter>
    </Card>
  );
}
