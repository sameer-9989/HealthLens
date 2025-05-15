
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon, Bell, Palette, ShieldCheck, Languages, MessageSquareQuote, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // States for settings - in a real app, these would be fetched and persisted
  const [notifications, setNotifications] = useState({
    dailyCheckIns: true,
    medReminders: false,
  });
  const [privacy, setPrivacy] = useState({
    personalizedRecommendations: true,
  });
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [assistantTone, setAssistantTone] = useState("empathetic");

  useEffect(() => {
    // Sync theme toggle with localStorage if used elsewhere
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark') {
      setIsDarkMode(true);
    } else {
      setIsDarkMode(false);
    }
  }, []);

  const handleThemeChange = (checked: boolean) => {
    setIsDarkMode(checked);
    if (checked) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    toast({ title: "Theme Updated", description: `Switched to ${checked ? 'Dark' : 'Light'} Mode.` });
  };

  const handleSaveChanges = () => {
    // Placeholder for saving settings to backend
    console.log("Settings saved:", { notifications, theme: isDarkMode ? 'dark' : 'light', privacy, selectedLanguage, assistantTone });
    toast({ title: "Settings Saved", description: "Your preferences have been updated." });
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader className="items-center text-center">
          <SettingsIcon className="h-12 w-12 text-primary mb-2" />
          <CardTitle className="text-2xl font-bold">Settings</CardTitle>
          <CardDescription>
            Manage your HealthLens account preferences and settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Notification Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center"><Bell className="mr-2 h-5 w-5 text-primary"/>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="dailyCheckIns" className="flex-1">Enable Daily Check-ins</Label>
                <Switch 
                  id="dailyCheckIns" 
                  checked={notifications.dailyCheckIns}
                  onCheckedChange={(checked) => setNotifications(prev => ({...prev, dailyCheckIns: checked}))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="medReminders" className="flex-1">Enable Medication Reminders</Label>
                <Switch 
                  id="medReminders"
                  checked={notifications.medReminders}
                  onCheckedChange={(checked) => setNotifications(prev => ({...prev, medReminders: checked}))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Theme Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center"><Palette className="mr-2 h-5 w-5 text-primary"/>Theme Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="darkModeToggle" className="flex-1">Dark Mode</Label>
                <Switch 
                  id="darkModeToggle"
                  checked={isDarkMode}
                  onCheckedChange={handleThemeChange}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Data Privacy Preferences */}
           <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center"><ShieldCheck className="mr-2 h-5 w-5 text-primary"/>Data & Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="personalizedRecs" className="flex-1">Enable AI Personalized Recommendations</Label>
                 <Switch
                  id="personalizedRecs"
                  checked={privacy.personalizedRecommendations}
                  onCheckedChange={(checked) => setPrivacy(prev => ({...prev, personalizedRecommendations: checked}))}
                />
              </div>
              <Button variant="link" className="p-0 h-auto">View Privacy Policy (Placeholder)</Button>
            </CardContent>
          </Card>

          {/* Language Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center"><Languages className="mr-2 h-5 w-5 text-primary"/>Language</CardTitle>
            </CardHeader>
            <CardContent>
               <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger id="languageSelect">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español (Spanish - UI Placeholder)</SelectItem>
                  <SelectItem value="fr">Français (French - UI Placeholder)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">Note: AI responses may vary in selected language. UI translation is a placeholder.</p>
            </CardContent>
          </Card>

          {/* AI Assistant Tone */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center"><MessageSquareQuote className="mr-2 h-5 w-5 text-primary"/>AI Assistant Tone</CardTitle>
            </CardHeader>
            <CardContent>
               <Select value={assistantTone} onValueChange={setAssistantTone}>
                <SelectTrigger id="toneSelect">
                  <SelectValue placeholder="Select AI tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="empathetic">Empathetic & Supportive</SelectItem>
                  <SelectItem value="neutral">Neutral & Informative</SelectItem>
                  <SelectItem value="concise">Concise & To-the-point</SelectItem>
                </SelectContent>
              </Select>
               <p className="text-xs text-muted-foreground mt-1">Note: AI tone preference requires backend AI flow adjustments not implemented in this prototype.</p>
            </CardContent>
          </Card>
          
          <Button onClick={handleSaveChanges} className="w-full md:w-auto mt-6">
            <Save className="mr-2 h-4 w-4"/> Save All Settings
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">Settings persistence is a placeholder in this prototype.</p>
        </CardContent>
      </Card>
    </div>
  );
}
