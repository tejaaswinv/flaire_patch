import React, { useEffect, useState } from 'react';
import { DashboardOverview } from './dashboard-overview';
import { SymptomsView } from './symptoms-view';
import { MedicationManager } from './medication-manager';
import { DietTracker } from './diet-tracker';
import { HealthInsights } from './health-insights';
import { MedicalRecords } from './medical-records';
import { Community } from './community';
import { HealthCalendar } from './health-calendar';
import { FlareMode } from './flare-mode';
import {
  LayoutDashboard,
  Activity,
  Pill,
  Apple,
  TrendingUp,
  FileText,
  Users,
  Calendar,
  Menu,
  LogOut,
  MessageCircle,
  Send,
  X,
  Sparkles,
  Mic,
  MicOff,
  Camera,
} from 'lucide-react';
import { Button } from './ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from './ui/sheet';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { VisuallyHidden } from './ui/visually-hidden';
import { api } from '../../lib/api';

interface DashboardProps {
  userName: string;
  onLogout: () => void;
}

export function Dashboard({ userName, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isFlareMode, setIsFlareMode] = useState(false);
  const [showHelpChat, setShowHelpChat] = useState(false);

  const [chatMessages, setChatMessages] = useState<
    Array<{ role: 'user' | 'assistant'; content: string; image?: string }>
  >([
    {
      role: 'assistant',
      content:
        "Hi! I'm your Flaire assistant. I can help you with anything - from logging symptoms to navigating the app. What can I do for you today?",
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.getDashboardToday();
        setData(res);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'symptoms', name: 'Symptoms', icon: Activity },
    { id: 'medications', name: 'Medications', icon: Pill },
    { id: 'diet', name: 'Diet', icon: Apple },
    { id: 'calendar', name: 'Calendar', icon: Calendar },
    { id: 'insights', name: 'Insights', icon: TrendingUp },
    { id: 'community', name: 'Community', icon: Users },
    { id: 'records', name: 'Records', icon: FileText },
  ];

  const NavigationContent = () => (
    <nav className="space-y-1">
      {navigation.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive ? 'bg-[#7293BB] text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Icon className="h-5 w-5" />
            <span>{item.name}</span>
          </button>
        );
      })}

      <button
        onClick={onLogout}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-gray-700 hover:bg-red-50 hover:text-red-600 mt-4"
      >
        <LogOut className="h-5 w-5" />
        <span>Logout</span>
      </button>

      <button
        onClick={() => setShowHelpChat(true)}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-white mt-2 shadow-lg hover:shadow-xl"
        style={{ backgroundColor: '#B48CBF' }}
      >
        <Sparkles className="h-5 w-5" />
        <span>Quick Help</span>
      </button>
    </nav>
  );

  const handleSendMessage = () => {
    if (!inputMessage.trim() && !uploadedImage) return;

    const currentUploadedImage = uploadedImage;

    const newMessages = [
      ...chatMessages,
      {
        role: 'user' as const,
        content: inputMessage || 'Uploaded an image',
        image: currentUploadedImage || undefined,
      },
    ];

    setChatMessages(newMessages);
    setInputMessage('');
    setUploadedImage(null);

    setTimeout(() => {
      let response = '';

      if (currentUploadedImage) {
        const imageResponses = [
          'I can see this is a medication bottle. Let me help you add this to your medications. The label shows it is a prescription medication. Would you like me to log this?',
          'This appears to be a food item. I can help you track this in your diet log. Should I add this to today’s meals?',
          'I can see some symptoms or a skin condition in this image. Would you like me to log this in your symptom tracker with today’s date?',
          'This looks like a medical document or lab result. I can help you save this to your Medical Records. Would you like to proceed?',
        ];
        response = imageResponses[Math.floor(Math.random() * imageResponses.length)];
      } else {
        const responses = [
          'I can help you with that! Would you like me to navigate you to the relevant section?',
          "Let me assist you with logging that information. I'll guide you through the steps.",
          'Great question! I can help you track that. Would you like to add it now?',
          'I understand. Let me show you where you can find that in the app.',
          'I can definitely help with that. What specific details would you like to log?',
        ];
        response = responses[Math.floor(Math.random() * responses.length)];
      }

      setChatMessages([
        ...newMessages,
        { role: 'assistant' as const, content: response },
      ]);
    }, 1000);
  };

  const handleVoiceInput = () => {
    const SpeechRecognitionClass =
      (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;

    if (!SpeechRecognitionClass) {
      alert('Speech recognition is not supported in your browser. Please try Chrome or Edge.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognitionClass();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputMessage(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header
        className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60"
        style={{ borderBottomColor: 'rgba(0, 0, 0, 0.1)' }}
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>

              <SheetContent side="left" className="w-64 p-6">
                <SheetHeader className="text-left mb-6">
                  <SheetTitle
                    className="text-2xl font-semibold m-0 p-0"
                    style={{ color: '#7293BB' }}
                  >
                    Flaire
                  </SheetTitle>
                  <SheetDescription className="text-sm text-muted-foreground mt-1">
                    Welcome, {userName}!
                  </SheetDescription>
                </SheetHeader>
                <NavigationContent />
              </SheetContent>
            </Sheet>

            <h1 className="text-2xl font-semibold" style={{ color: '#7293BB' }}>
              Flaire
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Welcome, <span className="font-medium text-gray-900">{userName}</span>
              </span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="hidden lg:flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="hidden lg:block w-64 border-r bg-white sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="p-6">
            <NavigationContent />
          </div>
        </aside>

        <main className="flex-1">
          <div className="container mx-auto p-4 lg:p-8 max-w-7xl">
            <div
              style={{
                padding: '10px',
                background: '#eee',
                marginBottom: '12px',
                borderRadius: '8px',
              }}
            >
              {data?.todayStatus?.message || 'Dashboard connected.'}
            </div>

            {isFlareMode ? (
              <FlareMode onExit={() => setIsFlareMode(false)} userName={userName} />
            ) : (
              <>
                {activeTab === 'dashboard' && (
                  <DashboardOverview
                    onNavigate={setActiveTab}
                    onEnableFlareMode={() => setIsFlareMode(true)}
                  />
                )}
                {activeTab === 'symptoms' && <SymptomsView />}
                {activeTab === 'medications' && <MedicationManager />}
                {activeTab === 'diet' && <DietTracker />}
                {activeTab === 'calendar' && <HealthCalendar />}
                {activeTab === 'insights' && <HealthInsights />}
                {activeTab === 'community' && <Community />}
                {activeTab === 'records' && <MedicalRecords />}
              </>
            )}
          </div>
        </main>
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 border-t bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 z-40">
        <div className="grid grid-cols-4 gap-1 p-2">
          {navigation.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                  isActive ? 'text-white' : 'text-gray-600'
                }`}
                style={isActive ? { backgroundColor: '#7293BB' } : {}}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{item.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <Dialog open={showHelpChat} onOpenChange={setShowHelpChat}>
        <DialogContent className="max-w-2xl max-h-[600px] flex flex-col p-0">
          <VisuallyHidden>
            <DialogTitle>Quick Help Assistant</DialogTitle>
            <DialogDescription>
              Chat with your Flaire assistant to get help with anything
            </DialogDescription>
          </VisuallyHidden>

          <div className="p-6 pb-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full" style={{ backgroundColor: '#B48CBF' }}>
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Quick Help</h2>
                <p className="text-sm text-muted-foreground">Your Flaire assistant</p>
              </div>
            </div>

            <Button variant="ghost" size="sm" onClick={() => setShowHelpChat(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {chatMessages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="p-2 rounded-full h-fit" style={{ backgroundColor: '#B48CBF' }}>
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                )}

                <div
                  className={`max-w-[70%] rounded-2xl ${
                    message.role === 'user' ? 'text-white' : 'bg-muted'
                  }`}
                  style={message.role === 'user' ? { backgroundColor: '#7293BB' } : {}}
                >
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Uploaded"
                      className="w-full rounded-t-2xl max-h-48 object-cover"
                    />
                  )}
                  <p className="text-sm p-3">{message.content}</p>
                </div>

                {message.role === 'user' && (
                  <div className="p-2 rounded-full h-fit bg-gray-200">
                    <MessageCircle className="h-4 w-4 text-gray-600" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="px-6 py-3 border-t bg-muted/30">
            <p className="text-xs text-muted-foreground mb-2">Quick actions:</p>
            <div className="flex flex-wrap gap-2">
              {['Log symptoms', 'Add medication', 'Track diet', 'View insights', 'Check calendar'].map(
                (action) => (
                  <button
                    key={action}
                    onClick={() => setInputMessage(action)}
                    className="text-xs px-3 py-1.5 rounded-full border hover:bg-white transition-colors"
                  >
                    {action}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="p-6 pt-3 border-t">
            {isListening && (
              <div className="mb-3 flex items-center gap-2 text-sm" style={{ color: '#B48CBF' }}>
                <div className="flex gap-1">
                  <div className="w-1 h-4 bg-current animate-pulse" style={{ animationDelay: '0ms' }} />
                  <div className="w-1 h-4 bg-current animate-pulse" style={{ animationDelay: '150ms' }} />
                  <div className="w-1 h-4 bg-current animate-pulse" style={{ animationDelay: '300ms' }} />
                </div>
                <span>Listening...</span>
              </div>
            )}

            {uploadedImage && (
              <div className="mb-3">
                <img
                  src={uploadedImage}
                  alt="Preview"
                  className="max-h-32 rounded-lg object-cover border"
                />
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button
                onClick={handleVoiceInput}
                size="icon"
                variant="outline"
                className={isListening ? 'border-2' : ''}
                style={isListening ? { borderColor: '#B48CBF', color: '#B48CBF' } : {}}
                title="Voice input"
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>

              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button type="button" size="icon" variant="outline" asChild title="Upload image">
                  <span>
                    <Camera className="h-4 w-4" />
                  </span>
                </Button>
              </label>

              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                placeholder="Ask me anything..."
                className="flex-1"
              />

              <Button
                onClick={handleSendMessage}
                size="icon"
                className="text-white"
                style={{ backgroundColor: '#B48CBF' }}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
              <Sparkles className="h-3 w-3" />
              AI-powered assistant • Speech-to-text • Image analysis
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}