
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlignLeft, AlignCenter, AlignRight, Type, Download } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { toast } from 'sonner';

interface HandwritingGeneratorProps {
  sampleId: string | null;
}

export const HandwritingGenerator: React.FC<HandwritingGeneratorProps> = ({ sampleId }) => {
  const [text, setText] = useState<string>('');
  const [fontSize, setFontSize] = useState<number>(24);
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>('left');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleFontSizeChange = (value: number[]) => {
    setFontSize(value[0]);
  };

  const generateHandwriting = () => {
    if (!text.trim() || !sampleId) {
      toast.error('Please enter some text first');
      return;
    }

    setIsGenerating(true);

    // In a real app, this would send the text to a backend service that uses the sample
    // Here we're simulating the generation
    setTimeout(() => {
      // For demo, we're just using the sample image from localStorage
      const sampleImage = localStorage.getItem('handwritingSample');
      setGeneratedImage(sampleImage);
      setIsGenerating(false);
      toast.success('Handwriting generated successfully!');
    }, 1500);
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `handwriting-${Date.now()}.png`;
    link.click();
    
    toast.success('Image downloaded successfully!');
  };

  return (
    <Card className="w-full bg-white/80 backdrop-blur-sm shadow-sm border-amber-200/40">
      <CardHeader>
        <CardTitle>Generate Handwritten Text</CardTitle>
        <CardDescription>
          Enter your text and customize its appearance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="text-input">Your Text</Label>
            <Textarea
              id="text-input"
              placeholder="Type your text here..."
              value={text}
              onChange={handleTextChange}
              rows={4}
              className="resize-none"
              disabled={!sampleId}
            />
            {!sampleId && (
              <p className="text-sm text-amber-500">
                Please upload and process a handwriting sample first
              </p>
            )}
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Text Size</Label>
                <span className="text-xs text-gray-500">{fontSize}px</span>
              </div>
              <Slider 
                defaultValue={[fontSize]} 
                max={48} 
                min={12} 
                step={1}
                onValueChange={handleFontSizeChange}
                disabled={!sampleId}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Text Alignment</Label>
              <div className="flex space-x-2">
                <Toggle 
                  pressed={alignment === 'left'} 
                  onPressedChange={() => setAlignment('left')}
                  disabled={!sampleId}
                  aria-label="Align left"
                >
                  <AlignLeft className="h-4 w-4" />
                </Toggle>
                <Toggle 
                  pressed={alignment === 'center'} 
                  onPressedChange={() => setAlignment('center')}
                  disabled={!sampleId}
                  aria-label="Align center"
                >
                  <AlignCenter className="h-4 w-4" />
                </Toggle>
                <Toggle 
                  pressed={alignment === 'right'} 
                  onPressedChange={() => setAlignment('right')}
                  disabled={!sampleId}
                  aria-label="Align right"
                >
                  <AlignRight className="h-4 w-4" />
                </Toggle>
              </div>
            </div>
            
            <Button 
              className="w-full" 
              onClick={generateHandwriting}
              disabled={!sampleId || isGenerating || !text.trim()}
            >
              <Type className="h-4 w-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Generate Handwriting'}
            </Button>
          </div>
          
          {generatedImage && (
            <div className="space-y-4 mt-4 pt-4 border-t">
              <h3 className="text-sm font-medium">Generated Handwriting</h3>
              <div 
                className="border rounded-lg overflow-hidden bg-paper p-4 flex justify-center"
                style={{ textAlign: alignment }}
              >
                <div className="relative max-w-full">
                  <img 
                    src={generatedImage} 
                    alt="Generated handwriting" 
                    className="max-h-[400px] object-contain"
                    style={{ maxWidth: '100%' }}
                  />
                  <div 
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ fontSize: `${fontSize}px` }}
                  >
                    <div className="handwriting-preview text-transparent">
                      {text}
                    </div>
                  </div>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={downloadImage}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Image
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
