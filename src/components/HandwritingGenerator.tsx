
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlignLeft, AlignCenter, AlignRight, Type, Download, Check } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { Switch } from '@/components/ui/switch';
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
  const [messiness, setMessiness] = useState<number>(65); // Default to higher messiness
  const [lineSpacing, setLineSpacing] = useState<number>(1.5);
  const [showLines, setShowLines] = useState<boolean>(true);
  const [paperStyle, setPaperStyle] = useState<'white' | 'lined' | 'grid' | 'yellow'>('lined');
  const [inkColor, setInkColor] = useState<'blue' | 'black' | 'dark-blue'>('blue');
  const [sampleCount, setSampleCount] = useState<number>(0);

  useEffect(() => {
    const hasStoredSample = localStorage.getItem('hasHandwritingSample') === 'true';
    setHasSample(hasStoredSample);
    
    const count = parseInt(localStorage.getItem('handwritingSampleCount') || '0');
    setSampleCount(count);
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

  // Function to create lined paper background
  const createLinedPaperBackground = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    style: string
  ) => {
    // Clear canvas with base color
    if (style === 'yellow') {
      ctx.fillStyle = '#faf3d4'; // Yellow legal pad color
    } else {
      ctx.fillStyle = '#f9f7f1'; // Slightly off-white for regular paper
    }
    ctx.fillRect(0, 0, width, height);
    
    // Add paper texture
    for (let i = 0; i < width * height * 0.01; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 2;
      const opacity = Math.random() * 0.03;
      
      ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
      ctx.fillRect(x, y, size, size);
    }
    
    if (style === 'lined' || style === 'yellow') {
      // Draw horizontal lines
      const lineSpacingPx = Math.max(fontSize * lineSpacing, 30); // Minimum spacing
      ctx.strokeStyle = style === 'yellow' ? 'rgba(0, 0, 150, 0.2)' : 'rgba(0, 0, 200, 0.15)';
      ctx.lineWidth = 1;
      
      for (let y = lineSpacingPx; y < height; y += lineSpacingPx) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      
      // Add red margin line if it's lined paper
      if (style === 'lined') {
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.moveTo(40, 0);
        ctx.lineTo(40, height);
        ctx.stroke();
      }
    } else if (style === 'grid') {
      // Draw grid
      const gridSize = 30;
      ctx.strokeStyle = 'rgba(0, 0, 200, 0.1)';
      ctx.lineWidth = 0.5;
      
      // Horizontal lines
      for (let y = gridSize; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      
      // Vertical lines
      for (let x = gridSize; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
    }
    
    // Add subtle shadow at edges for realism
    const shadowWidth = 15;
    
    // Top shadow
    const topGradient = ctx.createLinearGradient(0, 0, 0, shadowWidth);
    topGradient.addColorStop(0, 'rgba(0, 0, 0, 0.1)');
    topGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = topGradient;
    ctx.fillRect(0, 0, width, shadowWidth);
    
    // Left shadow
    const leftGradient = ctx.createLinearGradient(0, 0, shadowWidth, 0);
    leftGradient.addColorStop(0, 'rgba(0, 0, 0, 0.1)');
    leftGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = leftGradient;
    ctx.fillRect(0, 0, shadowWidth, height);
    
    // Add slightly bent corner
    if (Math.random() > 0.5) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.beginPath();
      ctx.moveTo(width, 0);
      ctx.lineTo(width - 40, 0);
      ctx.lineTo(width, 35);
      ctx.closePath();
      ctx.fill();
    }
  };

  // Function to add randomness to text for more realistic handwriting
  const addRandomnessToText = (
    ctx: CanvasRenderingContext2D, 
    text: string, 
    x: number, 
    y: number, 
    messinessFactor: number,
    sampleMultiplier: number // Factor based on number of samples
  ) => {
    const chars = text.split('');
    let currentX = x;
    
    // Base randomness factor from messiness parameter (0-100)
    const randomFactor = messinessFactor / 100 * Math.max(0.8, Math.min(1.5, sampleMultiplier));
    
    // Different handwriting qualities based on sample count
    const baseLineVariation = sampleCount > 2 ? 0.7 : 1.2;
    
    // Track baseline for realistic handwriting flow
    let baselineY = y;
    let prevChar = '';
    
    chars.forEach((char, i) => {
      // Handwriting naturally flows up and down - more samples = more natural flow
      if (i % Math.floor(4 + Math.random() * 3) === 0) {
        baselineY = y + (Math.random() - 0.5) * fontSize * 0.15 * randomFactor;
      }
      
      // Random vertical position variation
      const yVariation = baselineY + (Math.random() - 0.5) * fontSize * baseLineVariation * randomFactor;
      
      // Random character rotation - more samples = more consistent rotation
      const rotationFactor = sampleCount > 3 ? 0.04 : 0.08;
      const rotation = (Math.random() - 0.5) * rotationFactor * randomFactor;
      
      // Random character size variation
      const sizeVariation = 1 + (Math.random() - 0.5) * 0.12 * randomFactor;
      
      // Letter slant for cursive effect
      const slant = (Math.random() * 0.05 + 0.01) * randomFactor;
      
      // Save context state
      ctx.save();
      
      // Apply random rotation centered on the character position
      ctx.translate(currentX, yVariation);
      ctx.rotate(rotation);
      ctx.scale(sizeVariation, sizeVariation);
      
      // Apply slant transform for cursive effect
      ctx.transform(1, 0, slant, 1, 0, 0);
      
      // Adjust pressure (line width) randomly for some characters
      if (Math.random() > 0.7) {
        ctx.lineWidth = 1 + Math.random() * randomFactor;
        const origFillStyle = ctx.fillStyle;
        // Darken some characters slightly for ink variation
        const alpha = 0.85 + Math.random() * 0.15;
        // Use the same color but with varying alpha
        if (typeof origFillStyle === 'string') {
          const rgba = origFillStyle.replace('rgba', '').replace('rgb', '').replace(/[()]/g, '').split(',');
          if (rgba.length >= 3) {
            ctx.fillStyle = `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${alpha})`;
          }
        }
      }
      
      // Draw the character with slight random variations
      ctx.fillText(char, 0, 0);
      
      // Add connecting line for certain character pairs (cursive effect)
      if (prevChar && "oearictsnml".includes(prevChar) && "oearictsnml".includes(char) && Math.random() > 0.3) {
        const connectorX = -ctx.measureText(char).width * 0.5;
        ctx.beginPath();
        ctx.moveTo(connectorX, 0);
        ctx.lineTo(0, 0);
        ctx.stroke();
      }
      
      // Restore context state
      ctx.restore();
      
      // Calculate next character position with slight random spacing
      const charWidth = ctx.measureText(char).width;
      const specialPairs = {'r': 0.9, 't': 0.9, 'f': 0.9, 'i': 0.85, 'l': 0.85, 'j': 0.9};
      let spacingFactor = 1.0;
      
      // Adjust spacing for specific letters
      if (char in specialPairs) {
        spacingFactor = specialPairs[char as keyof typeof specialPairs];
      }
      
      // Random spacing variation
      const spacingVariation = spacingFactor * (1 + (Math.random() - 0.5) * 0.1 * randomFactor);
      currentX += charWidth * spacingVariation;
      
      prevChar = char;
    });
    
    return currentX - x; // Return the total width
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
        
        // Ensure minimum width and adjust based on text length
        const canvasWidth = Math.max(800, textLength * fontSize * 0.6);
        const lineHeightEstimate = fontSize * lineSpacing;
        const canvasHeight = Math.max(400, numLines * lineHeightEstimate * 1.8);
        
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        
        // Create paper background based on selected style
        createLinedPaperBackground(ctx, canvasWidth, canvasHeight, paperStyle);
        
        // Set text properties based on ink color
        ctx.font = `${fontSize}px 'Segoe Script', cursive`;
        
        // Set ink color
        if (inkColor === 'blue') {
          ctx.fillStyle = 'rgba(0, 20, 120, 0.85)';
        } else if (inkColor === 'dark-blue') {
          ctx.fillStyle = 'rgba(0, 0, 70, 0.9)';
        } else {
          ctx.fillStyle = 'rgba(10, 10, 30, 0.9)';
        }
        
        // Handle alignment
        ctx.textAlign = alignment as CanvasTextAlign;
        
        // Position for text based on paper style
        let x = 50;
        if (paperStyle === 'lined' && alignment === 'left') {
          // Account for margin line in lined paper
          x = 60;
        } else if (alignment === 'center') {
          x = canvasWidth / 2;
        } else if (alignment === 'right') {
          x = canvasWidth - 50;
        }
        
        // Determine starting Y position
        const baseY = Math.max(fontSize * 1.5, 70);
        
        // Calculate sample quality multiplier (more samples = better quality)
        const sampleMultiplier = Math.min(1 + (sampleCount * 0.1), 1.5);
        
        // Draw text with randomness
        const lines = text.split('\n');
        let currentY = baseY;
        
        lines.forEach((line, index) => {
          // Add some random line height variation
          const lineHeightVariation = 1 + (Math.random() - 0.5) * 0.1;
          currentY += (index > 0) ? fontSize * lineSpacing * lineHeightVariation : 0;
          
          // Use the custom function to draw text with randomness
          const lineWidth = addRandomnessToText(ctx, line, x, currentY, messiness, sampleMultiplier);
          
          // Add random ink splotches and dots for realism
          if (messiness > 40) {
            const splotchCount = Math.floor((messiness / 20) * Math.random() * 3);
            
            for (let i = 0; i < splotchCount; i++) {
              const splotchX = x + Math.random() * lineWidth;
              const splotchY = currentY + (Math.random() - 0.5) * fontSize;
              const splotchSize = 1 + Math.random() * 3 * (messiness / 50);
              
              ctx.save();
              // Use the same ink color but slightly darker
              ctx.fillStyle = inkColor === 'blue' ? 'rgba(0, 10, 100, 0.7)' : 'rgba(0, 0, 0, 0.7)';
              ctx.beginPath();
              ctx.arc(splotchX, splotchY, splotchSize, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            }
          }
        });
        
        // Add random ink smudges
        if (messiness > 50) {
          const smudgeCount = Math.floor(messiness / 20);
          
          for (let i = 0; i < smudgeCount; i++) {
            const smudgeX = Math.random() * canvasWidth;
            const smudgeY = Math.random() * canvasHeight;
            const smudgeWidth = 5 + Math.random() * 20;
            const smudgeHeight = 2 + Math.random() * 5;
            const smudgeRotation = Math.random() * Math.PI;
            
            ctx.save();
            ctx.translate(smudgeX, smudgeY);
            ctx.rotate(smudgeRotation);
            ctx.fillStyle = inkColor === 'blue' ? 'rgba(0, 20, 150, 0.1)' : 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(-smudgeWidth/2, -smudgeHeight/2, smudgeWidth, smudgeHeight);
            ctx.restore();
          }
        }
        
        // Add fingerprint smudge for high messiness
        if (messiness > 75 && Math.random() > 0.6) {
          const fpX = Math.random() * canvasWidth;
          const fpY = Math.random() * canvasHeight;
          const fpRadius = 10 + Math.random() * 20;
          
          ctx.save();
          const gradient = ctx.createRadialGradient(fpX, fpY, 0, fpX, fpY, fpRadius);
          gradient.addColorStop(0, 'rgba(100, 100, 100, 0.02)');
          gradient.addColorStop(1, 'rgba(100, 100, 100, 0)');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(fpX, fpY, fpRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
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
          {sampleCount > 0 && (
            <span className="ml-1 text-green-600 inline-flex items-center">
              <Check className="h-3 w-3 mr-1" />
              {sampleCount} sample{sampleCount !== 1 ? 's' : ''} analyzed
            </span>
          )}
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>
            
            <div className="space-y-4">
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
              
              <div className="space-y-2">
                <Label>Paper Style</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant={paperStyle === 'white' ? 'default' : 'outline'} 
                    className="justify-start"
                    onClick={() => setPaperStyle('white')}
                    disabled={!hasSample}
                  >
                    <div className="w-4 h-4 bg-gray-50 border border-gray-200 rounded mr-2"></div>
                    Blank
                  </Button>
                  <Button 
                    variant={paperStyle === 'lined' ? 'default' : 'outline'} 
                    className="justify-start"
                    onClick={() => setPaperStyle('lined')}
                    disabled={!hasSample}
                  >
                    <div className="w-4 h-4 bg-gray-50 border border-gray-200 rounded mr-2 flex flex-col justify-around">
                      <div className="border-t border-blue-300"></div>
                      <div className="border-t border-blue-300"></div>
                    </div>
                    Lined
                  </Button>
                  <Button 
                    variant={paperStyle === 'grid' ? 'default' : 'outline'} 
                    className="justify-start"
                    onClick={() => setPaperStyle('grid')}
                    disabled={!hasSample}
                  >
                    <div className="w-4 h-4 bg-gray-50 border border-gray-200 rounded mr-2 grid grid-cols-2 grid-rows-2">
                      <div className="border-r border-b border-blue-200"></div>
                      <div className="border-b border-blue-200"></div>
                      <div className="border-r border-blue-200"></div>
                      <div></div>
                    </div>
                    Grid
                  </Button>
                  <Button 
                    variant={paperStyle === 'yellow' ? 'default' : 'outline'} 
                    className="justify-start"
                    onClick={() => setPaperStyle('yellow')}
                    disabled={!hasSample}
                  >
                    <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded mr-2 flex flex-col justify-around">
                      <div className="border-t border-blue-200"></div>
                    </div>
                    Yellow Pad
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Ink Color</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    variant={inkColor === 'blue' ? 'default' : 'outline'} 
                    className="justify-start"
                    onClick={() => setInkColor('blue')}
                    disabled={!hasSample}
                  >
                    <div className="w-4 h-4 bg-blue-700 rounded-full mr-2"></div>
                    Blue
                  </Button>
                  <Button 
                    variant={inkColor === 'black' ? 'default' : 'outline'} 
                    className="justify-start"
                    onClick={() => setInkColor('black')}
                    disabled={!hasSample}
                  >
                    <div className="w-4 h-4 bg-gray-900 rounded-full mr-2"></div>
                    Black
                  </Button>
                  <Button 
                    variant={inkColor === 'dark-blue' ? 'default' : 'outline'} 
                    className="justify-start"
                    onClick={() => setInkColor('dark-blue')}
                    disabled={!hasSample}
                  >
                    <div className="w-4 h-4 bg-blue-900 rounded-full mr-2"></div>
                    Dark Blue
                  </Button>
                </div>
              </div>
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
