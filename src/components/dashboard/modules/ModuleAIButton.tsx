import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModuleAIButtonProps {
  module: 'feed' | 'health' | 'reproduction' | 'genetics' | 'inventory' | 'production';
  animalTypeName: string;
}

const MODULE_PROMPTS = {
  feed: [
    'What is the optimal feeding schedule?',
    'How can I reduce feed costs?',
    'Best feed types for growth?',
  ],
  health: [
    'Common health issues to watch for?',
    'Vaccination schedule recommendations?',
    'Signs of illness to monitor?',
  ],
  reproduction: [
    'Optimal breeding timing?',
    'How to improve conception rates?',
    'Managing pregnant animals?',
  ],
  genetics: [
    'Best breeding pairs for traits?',
    'How to improve genetic diversity?',
    'Lineage tracking tips?',
  ],
  inventory: [
    'When to buy or sell?',
    'Optimal herd size?',
    'Market timing strategies?',
  ],
  production: [
    'How to increase production?',
    'Quality improvement tips?',
    'Seasonal production planning?',
  ],
};

const MODULE_TITLES = {
  feed: 'Feed Management',
  health: 'Health & Vaccination',
  reproduction: 'Reproduction',
  genetics: 'Genetics',
  inventory: 'Inventory',
  production: 'Production',
};

export function ModuleAIButton({ module, animalTypeName }: ModuleAIButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    // Simulate AI response - in production this would call an AI API
    setTimeout(() => {
      setResponse(`Here's advice for ${animalTypeName} ${MODULE_TITLES[module].toLowerCase()}:\n\nBased on your question about "${query}", here are some recommendations:\n\n1. Monitor daily patterns and keep detailed records\n2. Consult with local veterinarians or experts\n3. Compare with industry best practices\n4. Consider seasonal and environmental factors\n\nThis is a placeholder response. Connect to an AI service for real insights.`);
      setIsLoading(false);
    }, 1500);
  };

  const handleQuickPrompt = (prompt: string) => {
    setQuery(prompt);
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        size="sm"
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 gap-2 shadow-lg rounded-full h-12 px-4"
        style={{
          background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.8) 100%)',
        }}
      >
        <Sparkles className="w-4 h-4" />
        <span className="hidden sm:inline">AI Assistant</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              {MODULE_TITLES[module]} AI Assistant
            </DialogTitle>
            <DialogDescription>
              Get AI-powered insights for your {animalTypeName.toLowerCase()} {MODULE_TITLES[module].toLowerCase()}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Quick prompts */}
            <div className="flex flex-wrap gap-2">
              {MODULE_PROMPTS[module].map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickPrompt(prompt)}
                  className="text-xs px-2.5 py-1.5 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <Textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask a question..."
                className="min-h-[80px] resize-none"
              />
            </div>
            
            <Button 
              onClick={handleSubmit} 
              disabled={!query.trim() || isLoading}
              className="w-full gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {isLoading ? 'Thinking...' : 'Get AI Insights'}
            </Button>

            {/* Response */}
            {response && (
              <ScrollArea className="h-[200px] rounded-md border p-3">
                <div className="text-sm whitespace-pre-wrap">{response}</div>
              </ScrollArea>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
