
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
  const [messiness, setMessiness] = useState<number>(50);
  const [lineSpacing, setLineSpacing] = useState<number>(1.5);

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

  const handleMessinessChange = (value: number[]) => {
    setMessiness(value[0]);
  };

  const handleLineSpacingChange = (value: number[]) => {
    setLineSpacing(value[0]);
  };

  // Function to add randomness to text for more realistic handwriting
  const addRandomnessToText = (
    ctx: CanvasRenderingContext2D, 
    text: string, 
    x: number, 
    y: number, 
    messinessFactor: number
  ) => {
    const chars = text.split('');
    let currentX = x;
    
    // Base randomness factor from messiness parameter (0-100)
    const randomFactor = messinessFactor / 100;
    
    chars.forEach((char) => {
      // Random vertical position variation
      const yVariation = (Math.random() - 0.5) * fontSize * 0.1 * randomFactor;
      
      // Random character rotation
      const rotation = (Math.random() - 0.5) * 0.05 * randomFactor;
      
      // Random character size variation
      const sizeVariation = 1 + (Math.random() - 0.5) * 0.1 * randomFactor;
      
      // Save context state
      ctx.save();
      
      // Apply random rotation centered on the character position
      ctx.translate(currentX, y + yVariation);
      ctx.rotate(rotation);
      ctx.scale(sizeVariation, sizeVariation);
      
      // Draw the character with slight random variations
      ctx.fillText(char, 0, 0);
      
      // Restore context state
      ctx.restore();
      
      // Calculate next character position with slight random spacing
      const charWidth = ctx.measureText(char).width;
      const spacingVariation = 1 + (Math.random() - 0.5) * 0.08 * randomFactor;
      currentX += charWidth * spacingVariation;
    });
  };

  const generateHandwriting = () => {
    if (!text.trim() || !sampleId || !hasSample) {
      toast.error('Please enter some text and ensure you have a handwriting sample');
      return;
    }

    setIsGenerating(true);

    // In a real app, this would send the text to a backend service that uses the sample
    setTimeout(() => {
      // Create a canvas with text for demonstration purposes
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Calculate required canvas size based on text length
        const textLength = text.length;
        const numLines = text.split('\n').length;
        
        canvas.width = Math.max(800, textLength * fontSize * 0.6);
        canvas.height = Math.max(400, numLines * fontSize * lineSpacing * 1.5);
        
        // Fill with paper background - slightly off-white with texture
        ctx.fillStyle = '#f9f7f1';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add subtle paper texture
        for (let i = 0; i < canvas.width * canvas.height * 0.01; i++) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          const size = Math.random() * 2;
          const opacity = Math.random() * 0.03;
          
          ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
          ctx.fillRect(x, y, size, size);
        }
        
        // Set text properties - use a handwriting-like font
        ctx.font = `${fontSize}px 'Segoe Script', cursive`;
        ctx.fillStyle = 'rgba(10, 10, 30, 0.9)'; // Slightly varied ink color
        
        // Handle alignment
        ctx.textAlign = alignment as CanvasTextAlign;
        
        // Position for text
        const x = alignment === 'left' ? 50 : alignment === 'right' ? canvas.width - 50 : canvas.width / 2;
        const baseY = 100;
        
        // Draw text with randomness
        const lines = text.split('\n');
        lines.forEach((line, index) => {
          // Add some random line height variation
          const lineHeightVariation = 1 + (Math.random() - 0.5) * 0.1;
          const y = baseY + (index * fontSize * lineSpacing * lineHeightVariation);
          
          // Use the custom function to draw text with randomness
          addRandomnessToText(ctx, line, x, y, messiness);
        });
        
        // Simulate pen pressure variation by adding random darker spots
        if (messiness > 30) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
          for (let i = 0; i < text.length * (messiness / 20); i++) {
            const randX = Math.random() * canvas.width;
            const randY = Math.random() * canvas.height;
            const inkBlotSize = Math.random() * 2 * (messiness / 50);
            
            ctx.beginPath();
            ctx.arc(randX, randY, inkBlotSize, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        
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
              <div className="flex justify-between items-center">
                <Label>Messiness</Label>
                <span className="text-xs text-gray-500">{messiness}%</span>
              </div>
              <Slider 
                defaultValue={[messiness]} 
                max={100} 
                min={0} 
                step={5}
                onValueChange={handleMessinessChange}
                disabled={!hasSample}
              />
              <p className="text-xs text-gray-500">Controls how messy and variable the handwriting appears</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Line Spacing</Label>
                <span className="text-xs text-gray-500">{lineSpacing.toFixed(1)}x</span>
              </div>
              <Slider 
                defaultValue={[lineSpacing]} 
                max={3} 
                min={1} 
                step={0.1}
                onValueChange={handleLineSpacingChange}
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
