
import React, { useState, useEffect } from 'react';
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
  const [hasSample, setHasSample] = useState<boolean>(false);

  useEffect(() => {
    const hasStoredSample = localStorage.getItem('hasHandwritingSample') === 'true';
    setHasSample(hasStoredSample);
  }, [sampleId]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleFontSizeChange = (value: number[]) => {
    setFontSize(value[0]);
  };

  const generateHandwriting = () => {
    if (!text.trim() || !sampleId || !hasSample) {
      toast.error('Please enter some text and ensure you have a handwriting sample');
      return;
    }

    setIsGenerating(true);

    // In a real app, this would send the text to a backend service that uses the sample
    // Since we don't have a real backend, we'll use a placeholder image
    setTimeout(() => {
      // Create a canvas with text for demonstration purposes
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        canvas.width = 800;
        canvas.height = 400;
        
        // Fill with paper background
        ctx.fillStyle = '#f9f7f1';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Set text properties
        ctx.font = `${fontSize}px 'Segoe Script', cursive`;
        ctx.fillStyle = '#333';
        
        // Handle alignment
        ctx.textAlign = alignment as CanvasTextAlign;
        
        // Position for text
        const x = alignment === 'left' ? 50 : alignment === 'right' ? canvas.width - 50 : canvas.width / 2;
        const y = 100;
        
        // Draw text
        const lines = text.split('\n');
        lines.forEach((line, index) => {
          ctx.fillText(line, x, y + (index * fontSize * 1.5));
        });
        
        // Get data URL
        const dataUrl = canvas.toDataURL('image/png');
        setGeneratedImage(dataUrl);
      }
      
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
              disabled={!hasSample}
            />
            {!hasSample && (
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
                disabled={!hasSample}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Text Alignment</Label>
              <div className="flex space-x-2">
                <Toggle 
                  pressed={alignment === 'left'} 
                  onPressedChange={() => setAlignment('left')}
                  disabled={!hasSample}
                  aria-label="Align left"
                >
                  <AlignLeft className="h-4 w-4" />
                </Toggle>
                <Toggle 
                  pressed={alignment === 'center'} 
                  onPressedChange={() => setAlignment('center')}
                  disabled={!hasSample}
                  aria-label="Align center"
                >
                  <AlignCenter className="h-4 w-4" />
                </Toggle>
                <Toggle 
                  pressed={alignment === 'right'} 
                  onPressedChange={() => setAlignment('right')}
                  disabled={!hasSample}
                  aria-label="Align right"
                >
                  <AlignRight className="h-4 w-4" />
                </Toggle>
              </div>
            </div>
            
            <Button 
              className="w-full" 
              onClick={generateHandwriting}
              disabled={!hasSample || isGenerating || !text.trim()}
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
                <img 
                  src={generatedImage} 
                  alt="Generated handwriting" 
                  className="max-h-[400px] object-contain"
                  style={{ maxWidth: '100%' }}
                />
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
