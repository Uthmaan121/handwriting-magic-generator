
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
  const [penStyle, setPenStyle] = useState<'fountain' | 'ballpoint' | 'pencil'>('fountain');
  const [pressure, setPressure] = useState<number>(70);
  const [shakiness, setShakiness] = useState<number>(50);

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

  const handlePressureChange = (value: number[]) => {
    setPressure(value[0]);
  };

  const handleShakinessChange = (value: number[]) => {
    setShakiness(value[0]);
  };

  // Function to create realistic paper texture
  const createPaperTexture = (
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
    
    // Add realistic paper texture with fiber patterns
    const createFiberTexture = () => {
      const textureCanvas = document.createElement('canvas');
      const textureCtx = textureCanvas.getContext('2d');
      textureCanvas.width = width;
      textureCanvas.height = height;
      
      if (textureCtx) {
        // Base color
        textureCtx.fillStyle = 'rgba(249, 247, 241, 1)';
        textureCtx.fillRect(0, 0, width, height);
        
        // Create paper fibers
        for (let i = 0; i < width * height * 0.003; i++) {
          const fiberLength = 5 + Math.random() * 20;
          const fiberWidth = 0.5 + Math.random() * 1.5;
          const x = Math.random() * width;
          const y = Math.random() * height;
          const angle = Math.random() * Math.PI * 2;
          
          textureCtx.save();
          textureCtx.translate(x, y);
          textureCtx.rotate(angle);
          
          // Random fiber color (slight variations of off-white)
          const r = 245 + Math.random() * 10;
          const g = 240 + Math.random() * 10;
          const b = 230 + Math.random() * 15;
          const a = 0.1 + Math.random() * 0.2;
          
          textureCtx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
          textureCtx.fillRect(-fiberLength/2, -fiberWidth/2, fiberLength, fiberWidth);
          textureCtx.restore();
        }
        
        // Add subtle noise for texture
        for (let x = 0; x < width; x += 2) {
          for (let y = 0; y < height; y += 2) {
            if (Math.random() > 0.85) {
              const r = 220 + Math.floor(Math.random() * 20);
              const g = 215 + Math.floor(Math.random() * 20);
              const b = 205 + Math.floor(Math.random() * 20);
              const a = 0.01 + Math.random() * 0.05;
              
              textureCtx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
              textureCtx.fillRect(x, y, 2, 2);
            }
          }
        }
        
        // Add paper creases and imperfections
        const creaseCount = 2 + Math.floor(Math.random() * 4);
        for (let i = 0; i < creaseCount; i++) {
          const startX = Math.random() * width;
          const startY = Math.random() * height;
          const endX = startX + (Math.random() - 0.5) * width * 0.8;
          const endY = startY + (Math.random() - 0.5) * height * 0.8;
          
          const gradient = textureCtx.createLinearGradient(startX, startY, endX, endY);
          gradient.addColorStop(0, 'rgba(200, 200, 200, 0)');
          gradient.addColorStop(0.5, 'rgba(200, 200, 200, 0.05)');
          gradient.addColorStop(1, 'rgba(200, 200, 200, 0)');
          
          textureCtx.save();
          textureCtx.lineWidth = 1 + Math.random() * 2;
          textureCtx.strokeStyle = gradient;
          textureCtx.beginPath();
          textureCtx.moveTo(startX, startY);
          
          // Create slightly curved crease
          const controlX1 = startX + (endX - startX) * 0.3 + (Math.random() - 0.5) * 50;
          const controlY1 = startY + (endY - startY) * 0.3 + (Math.random() - 0.5) * 50;
          const controlX2 = startX + (endX - startX) * 0.7 + (Math.random() - 0.5) * 50;
          const controlY2 = startY + (endY - startY) * 0.7 + (Math.random() - 0.5) * 50;
          
          textureCtx.bezierCurveTo(controlX1, controlY1, controlX2, controlY2, endX, endY);
          textureCtx.stroke();
          textureCtx.restore();
        }
        
        // Apply texture to main canvas
        ctx.save();
        ctx.globalAlpha = 0.7;
        ctx.drawImage(textureCanvas, 0, 0);
        ctx.restore();
      }
    };
    
    createFiberTexture();
    
    // Add slightly curved or worn edges
    const edgeEffect = () => {
      // Top edge shadow/wear
      const topGradient = ctx.createLinearGradient(0, 0, 0, height * 0.02);
      topGradient.addColorStop(0, 'rgba(0, 0, 0, 0.1)');
      topGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = topGradient;
      ctx.fillRect(0, 0, width, height * 0.02);
      
      // Left edge shadow/wear
      const leftGradient = ctx.createLinearGradient(0, 0, width * 0.02, 0);
      leftGradient.addColorStop(0, 'rgba(0, 0, 0, 0.1)');
      leftGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = leftGradient;
      ctx.fillRect(0, 0, width * 0.02, height);
      
      // Right edge subtle darkening
      const rightGradient = ctx.createLinearGradient(width, 0, width - width * 0.01, 0);
      rightGradient.addColorStop(0, 'rgba(0, 0, 0, 0.05)');
      rightGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = rightGradient;
      ctx.fillRect(width - width * 0.01, 0, width * 0.01, height);
      
      // Bottom edge subtle darkening
      const bottomGradient = ctx.createLinearGradient(0, height, 0, height - height * 0.01);
      bottomGradient.addColorStop(0, 'rgba(0, 0, 0, 0.05)');
      bottomGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = bottomGradient;
      ctx.fillRect(0, height - height * 0.01, width, height * 0.01);
    };
    
    edgeEffect();
    
    // Add paper-specific elements
    if (style === 'lined' || style === 'yellow') {
      // Draw horizontal lines with proper spacing based on font size
      const lineSpacingPx = Math.max(fontSize * lineSpacing, 24);
      const lineOpacity = style === 'yellow' ? 0.2 : 0.15;
      const lineRGB = style === 'yellow' ? '0, 0, 150' : '0, 0, 200';
      
      ctx.strokeStyle = `rgba(${lineRGB}, ${lineOpacity})`;
      ctx.lineWidth = 1;
      
      // Start lines higher on the page based on font size to ensure text aligns with lines
      const firstLineY = Math.max(lineSpacingPx, fontSize);
      
      for (let y = firstLineY; y < height; y += lineSpacingPx) {
        // Add slight waviness to the lines for realism
        ctx.beginPath();
        let prevX = 0;
        const segments = 20;
        const segmentWidth = width / segments;
        
        for (let i = 0; i <= segments; i++) {
          const x = i * segmentWidth;
          // Subtle vertical variation
          const yVariation = Math.random() * 1.2 - 0.6;
          
          if (i === 0) {
            ctx.moveTo(x, y + yVariation);
          } else {
            // Create a slightly curved segment
            const controlPoint = prevX + segmentWidth / 2;
            const controlYVariation = Math.random() * 1.5 - 0.75;
            ctx.quadraticCurveTo(controlPoint, y + controlYVariation, x, y + yVariation);
          }
          
          prevX = x;
        }
        ctx.stroke();
      }
      
      // Add red margin line if it's lined paper
      if (style === 'lined') {
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.2)';
        // Add slight waviness to the margin line
        ctx.beginPath();
        const marginX = 40;
        let prevY = 0;
        const segments = 15;
        const segmentHeight = height / segments;
        
        for (let i = 0; i <= segments; i++) {
          const y = i * segmentHeight;
          // Subtle horizontal variation
          const xVariation = Math.random() * 2 - 1;
          
          if (i === 0) {
            ctx.moveTo(marginX + xVariation, y);
          } else {
            // Create a slightly curved segment
            const controlPoint = prevY + segmentHeight / 2;
            const controlXVariation = Math.random() * 2.5 - 1.25;
            ctx.quadraticCurveTo(marginX + controlXVariation, controlPoint, marginX + xVariation, y);
          }
          
          prevY = y;
        }
        ctx.stroke();
      }
    } else if (style === 'grid') {
      // Draw grid with imperfections
      const gridSize = Math.max(30, fontSize * 1.2); // Scale grid with font size
      ctx.strokeStyle = 'rgba(0, 0, 200, 0.1)';
      ctx.lineWidth = 0.5;
      
      // Horizontal lines with slight imperfections
      for (let y = gridSize; y < height; y += gridSize) {
        ctx.beginPath();
        for (let x = 0; x < width; x += 10) {
          const yVar = y + (Math.random() - 0.5) * 0.7;
          if (x === 0) {
            ctx.moveTo(x, yVar);
          } else {
            ctx.lineTo(x, yVar);
          }
        }
        ctx.stroke();
      }
      
      // Vertical lines with slight imperfections
      for (let x = gridSize; x < width; x += gridSize) {
        ctx.beginPath();
        for (let y = 0; y < height; y += 10) {
          const xVar = x + (Math.random() - 0.5) * 0.7;
          if (y === 0) {
            ctx.moveTo(xVar, y);
          } else {
            ctx.lineTo(xVar, y);
          }
        }
        ctx.stroke();
      }
    }
    
    // Add slight coffee stain or fingerprint in random location (rare)
    if (Math.random() > 0.75) {
      const stainX = Math.random() * width * 0.8 + width * 0.1;
      const stainY = Math.random() * height * 0.8 + height * 0.1;
      const stainSize = 20 + Math.random() * 60;
      
      const stainGradient = ctx.createRadialGradient(
        stainX, stainY, stainSize * 0.1,
        stainX, stainY, stainSize
      );
      
      // Coffee stain or fingerprint
      if (Math.random() > 0.5) {
        // Coffee stain
        stainGradient.addColorStop(0, 'rgba(139, 69, 19, 0.15)');
        stainGradient.addColorStop(0.7, 'rgba(139, 69, 19, 0.03)');
        stainGradient.addColorStop(1, 'rgba(139, 69, 19, 0)');
      } else {
        // Fingerprint
        stainGradient.addColorStop(0, 'rgba(100, 100, 100, 0.05)');
        stainGradient.addColorStop(0.8, 'rgba(100, 100, 100, 0.01)');
        stainGradient.addColorStop(1, 'rgba(100, 100, 100, 0)');
      }
      
      ctx.fillStyle = stainGradient;
      ctx.beginPath();
      ctx.arc(stainX, stainY, stainSize, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Add bent corner 
    if (Math.random() > 0.4) {
      // Decide which corner to bend
      const cornerIndex = Math.floor(Math.random() * 4);
      let cornerX = 0, cornerY = 0;
      
      switch (cornerIndex) {
        case 0: // top-right
          cornerX = width;
          cornerY = 0;
          break;
        case 1: // bottom-right
          cornerX = width;
          cornerY = height;
          break;
        case 2: // bottom-left
          cornerX = 0;
          cornerY = height;
          break;
        case 3: // top-left
          cornerX = 0;
          cornerY = 0;
          break;
      }
      
      const bendSize = 25 + Math.random() * 30;
      const shadowSize = bendSize * 1.2;
      
      // Shadow under the bent corner
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.beginPath();
      
      if (cornerIndex === 0) { // top-right
        ctx.moveTo(cornerX, cornerY);
        ctx.lineTo(cornerX - shadowSize, cornerY);
        ctx.lineTo(cornerX, cornerY + shadowSize);
      } else if (cornerIndex === 1) { // bottom-right
        ctx.moveTo(cornerX, cornerY);
        ctx.lineTo(cornerX - shadowSize, cornerY);
        ctx.lineTo(cornerX, cornerY - shadowSize);
      } else if (cornerIndex === 2) { // bottom-left
        ctx.moveTo(cornerX, cornerY);
        ctx.lineTo(cornerX + shadowSize, cornerY);
        ctx.lineTo(cornerX, cornerY - shadowSize);
      } else { // top-left
        ctx.moveTo(cornerX, cornerY);
        ctx.lineTo(cornerX + shadowSize, cornerY);
        ctx.lineTo(cornerX, cornerY + shadowSize);
      }
      
      ctx.closePath();
      ctx.fill();
      
      // Lighter triangle for the bent part
      ctx.fillStyle = style === 'yellow' ? '#f5eecc' : '#f4f2ec';
      ctx.beginPath();
      
      if (cornerIndex === 0) { // top-right
        ctx.moveTo(cornerX, cornerY);
        ctx.lineTo(cornerX - bendSize, cornerY);
        ctx.lineTo(cornerX, cornerY + bendSize);
      } else if (cornerIndex === 1) { // bottom-right
        ctx.moveTo(cornerX, cornerY);
        ctx.lineTo(cornerX - bendSize, cornerY);
        ctx.lineTo(cornerX, cornerY - bendSize);
      } else if (cornerIndex === 2) { // bottom-left
        ctx.moveTo(cornerX, cornerY);
        ctx.lineTo(cornerX + bendSize, cornerY);
        ctx.lineTo(cornerX, cornerY - bendSize);
      } else { // top-left
        ctx.moveTo(cornerX, cornerY);
        ctx.lineTo(cornerX + bendSize, cornerY);
        ctx.lineTo(cornerX, cornerY + bendSize);
      }
      
      ctx.closePath();
      ctx.fill();
    }
  };

  // Function to get base character style based on pen type
  const getPenStyle = (ctx: CanvasRenderingContext2D, color: string) => {
    const baseAlpha = 0.85 + (pressure / 200);
    
    if (penStyle === 'fountain') {
      // Fountain pen - variable line width, dark rich color
      ctx.lineWidth = 1.2 + (pressure / 100);
      
      if (color === 'blue') {
        return `rgba(0, 20, 120, ${baseAlpha})`;
      } else if (color === 'dark-blue') {
        return `rgba(0, 0, 70, ${baseAlpha})`;
      } else {
        return `rgba(10, 10, 30, ${baseAlpha})`;
      }
    } else if (penStyle === 'ballpoint') {
      // Ballpoint - thinner, more consistent lines
      ctx.lineWidth = 0.8 + (pressure / 150);
      
      if (color === 'blue') {
        return `rgba(0, 50, 180, ${baseAlpha})`;
      } else if (color === 'dark-blue') {
        return `rgba(0, 10, 100, ${baseAlpha})`;
      } else {
        return `rgba(20, 20, 40, ${baseAlpha})`;
      }
    } else {
      // Pencil - lighter, grayer
      ctx.lineWidth = 0.7 + (pressure / 120);
      
      if (color === 'blue') {
        return `rgba(40, 60, 100, ${baseAlpha - 0.1})`;
      } else if (color === 'dark-blue') {
        return `rgba(30, 40, 80, ${baseAlpha - 0.1})`;
      } else {
        return `rgba(60, 60, 70, ${baseAlpha - 0.1})`;
      }
    }
  };

  // Function to simulate realistic ink flow
  const simulateInkFlow = (
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    char: string, 
    messinessFactor: number,
    sampleMultiplier: number
  ) => {
    // Base ink opacity varies with pressure
    const baseOpacity = Math.min(0.95, 0.7 + (pressure / 100));
    
    // Ink pooling/bleeding at random points (where pen slows or stops)
    if (penStyle !== 'pencil' && messinessFactor > 40 && Math.random() > 0.7) {
      const poolSize = 1.5 + (Math.random() * messinessFactor / 30);
      const poolOpacity = Math.min(0.7, baseOpacity + 0.1);
      
      // Calculate color based on ink color but slightly darker
      let poolColor;
      if (inkColor === 'blue') {
        poolColor = `rgba(0, 10, 90, ${poolOpacity})`;
      } else if (inkColor === 'dark-blue') {
        poolColor = `rgba(0, 0, 60, ${poolOpacity})`;
      } else {
        poolColor = `rgba(0, 0, 0, ${poolOpacity})`;
      }
      
      ctx.save();
      ctx.fillStyle = poolColor;
      ctx.beginPath();
      
      // Create irregular ink pool shape
      const centerX = x + (Math.random() - 0.5) * 5;
      const centerY = y + (Math.random() - 0.5) * 5;
      
      // Create random blob shape
      ctx.beginPath();
      const blobPoints = 5 + Math.floor(Math.random() * 3);
      for (let i = 0; i < blobPoints; i++) {
        const angle = (i / blobPoints) * Math.PI * 2;
        const radius = poolSize * (0.7 + Math.random() * 0.6);
        const blobX = centerX + Math.cos(angle) * radius;
        const blobY = centerY + Math.sin(angle) * radius;
        
        if (i === 0) {
          ctx.moveTo(blobX, blobY);
        } else {
          const controlX = centerX + Math.cos(angle - Math.PI/blobPoints) * radius * 1.2;
          const controlY = centerY + Math.sin(angle - Math.PI/blobPoints) * radius * 1.2;
          ctx.quadraticCurveTo(controlX, controlY, blobX, blobY);
        }
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    
    // For pencil, add graphite smudges
    if (penStyle === 'pencil' && messinessFactor > 30 && Math.random() > 0.8) {
      const smudgeWidth = 5 + Math.random() * 10;
      const smudgeHeight = 2 + Math.random() * 3;
      const smudgeOpacity = 0.05 + Math.random() * 0.1;
      
      ctx.save();
      ctx.fillStyle = `rgba(30, 30, 30, ${smudgeOpacity})`;
      ctx.beginPath();
      
      // Create smudge with irregular edges
      const smudgeX = x + (Math.random() - 0.5) * 10;
      const smudgeY = y + (Math.random() - 0.5) * 10;
      const rotation = Math.random() * Math.PI;
      
      ctx.translate(smudgeX, smudgeY);
      ctx.rotate(rotation);
      
      // Create irregular shape
      ctx.beginPath();
      ctx.moveTo(-smudgeWidth/2, -smudgeHeight/2);
      ctx.lineTo(smudgeWidth/2, -smudgeHeight/2 + (Math.random() - 0.5) * 2);
      ctx.lineTo(smudgeWidth/2 + (Math.random() - 0.5) * 3, smudgeHeight/2 + (Math.random() - 0.5) * 2);
      ctx.lineTo(-smudgeWidth/2 + (Math.random() - 0.5) * 3, smudgeHeight/2);
      ctx.closePath();
      ctx.fill();
      
      ctx.restore();
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
    
    // Different handwriting qualities based on sample count and messiness
    const baseLineVariation = (sampleCount > 2) ? 
                              Math.max(0.7, messinessFactor / 100) : 
                              Math.max(1.0, messinessFactor / 80);
    
    // Calculate shakiness effect based on shakiness slider
    const shakinessFactor = shakiness / 50; // 0-2 range
    
    // Track baseline for realistic handwriting flow
    let baselineY = y;
    let prevChar = '';
    let letterCount = 0;
    
    // Randomly determine if this line slants up or down
    const lineSlant = (Math.random() - 0.5) * (messinessFactor / 200);
    
    // Track when pen needs to be "re-inked" - causing darker spots
    let inkLevel = 1.0;
    const inkDepletionRate = 0.01 + (Math.random() * 0.02);
    
    // For pressure variations across the text
    let currentPressure = pressure * (0.9 + Math.random() * 0.2);
    
    chars.forEach((char, i) => {
      letterCount++;
      
      // Adjust baseline as we move across the page (subtle slant up or down)
      baselineY += lineSlant;
      
      // More natural baseline variation that flows up and down
      if (i % Math.floor(4 + Math.random() * 3) === 0) {
        // More extreme baseline changes with higher messiness
        const variationRange = fontSize * 0.15 * (messinessFactor / 70);
        baselineY = y + lineSlant * letterCount + (Math.random() - 0.5) * variationRange * randomFactor;
      }
      
      // Apply shakiness effect
      const shakyX = currentX + (Math.random() - 0.5) * shakinessFactor * 3;
      const shakyY = baselineY + (Math.random() - 0.5) * shakinessFactor * 3;
      
      // Calculate random vertical position with more variation for higher messiness
      const yVariation = shakyY + (Math.random() - 0.5) * fontSize * baseLineVariation * randomFactor;
      
      // Random character rotation - more samples = more consistent rotation
      const rotationVariation = sampleCount > 3 ? 0.04 : 0.08;
      // More rotation variation with higher messiness and shakiness
      const rotationFactor = rotationVariation * (messinessFactor / 70) * (1 + shakinessFactor * 0.5);
      const rotation = (Math.random() - 0.5) * rotationFactor;
      
      // Random character size variation (more with higher messiness)
      const sizeVariationAmount = 0.12 * (messinessFactor / 70);
      const sizeVariation = 1 + (Math.random() - 0.5) * sizeVariationAmount * randomFactor;
      
      // Letter slant for cursive effect
      const slantVariation = (0.03 + Math.random() * 0.07) * (messinessFactor / 80);
      const slant = (Math.random() * slantVariation + 0.01) * randomFactor;
      
      // Calculate ink darkness based on current ink level and pressure
      const currentPressureFactor = 0.7 + (currentPressure / 100) * 0.3;
      
      // Simulate running out of ink slightly
      inkLevel -= inkDepletionRate;
      if (inkLevel < 0.5) {
        // "Re-ink" the pen
        inkLevel = 0.9 + Math.random() * 0.1;
      }
      
      // Vary pressure randomly through the text
      if (i % Math.floor(3 + Math.random() * 5) === 0) {
        currentPressure = pressure * (0.8 + Math.random() * 0.4);
      }
      
      // Save context state
      ctx.save();
      
      // Apply random rotation centered on the character position
      ctx.translate(shakyX, yVariation);
      ctx.rotate(rotation);
      ctx.scale(sizeVariation, sizeVariation);
      
      // Apply slant transform for cursive effect
      ctx.transform(1, 0, slant, 1, 0, 0);
      
      // Set ink color with variations for realism
      const basePenStyle = getPenStyle(ctx, inkColor);
      // Extract the rgba values for manipulation
      const rgbaMatch = basePenStyle.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
      
      if (rgbaMatch) {
        const r = parseInt(rgbaMatch[1]);
        const g = parseInt(rgbaMatch[2]);
        const b = parseInt(rgbaMatch[3]);
        // Base alpha from pen style, modified by pressure, ink level, and messiness
        const alpha = parseFloat(rgbaMatch[4]) * currentPressureFactor * inkLevel;
        
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
      } else {
        ctx.fillStyle = basePenStyle;
      }
      
      // Simulate ink flow and bleeding with additional effects
      simulateInkFlow(ctx, 0, 0, char, messinessFactor, sampleMultiplier);
      
      // Draw the character with all the randomness
      ctx.fillText(char, 0, 0);
      
      // For pencil, add additional graphite marks for realism
      if (penStyle === 'pencil' && messinessFactor > 30 && Math.random() > 0.7) {
        // Double stroke some parts to simulate pencil inconsistency
        ctx.fillStyle = `rgba(60, 60, 70, 0.2)`;
        ctx.fillText(char, (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5);
      }
      
      // Add connecting line for certain character pairs (cursive effect)
      if (prevChar && "oearictsnml".includes(prevChar) && "oearictsnml".includes(char) && Math.random() > 0.3) {
        const connectorX = -ctx.measureText(char).width * 0.5;
        ctx.beginPath();
        ctx.moveTo(connectorX, 0);
        // Add slight curve to the connector line
        const controlY = (Math.random() - 0.5) * 3;
        ctx.quadraticCurveTo(connectorX / 2, controlY, 0, 0);
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
      
      // More variation in spacing with higher messiness
      const spacingVariationAmount = 0.1 * (1 + messinessFactor / 100);
      const spacingVariation = spacingFactor * (1 + (Math.random() - 0.5) * spacingVariationAmount * randomFactor);
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
        createPaperTexture(ctx, canvasWidth, canvasHeight, paperStyle);
        
        // Set text properties based on ink color
        let fontFamily;
        if (penStyle === 'fountain') {
          fontFamily = "'Segoe Script', 'Comic Sans MS', cursive";
        } else if (penStyle === 'ballpoint') {
          fontFamily = "'Comic Sans MS', 'Segoe Script', cursive";
        } else { // pencil
          fontFamily = "'Comic Sans MS', 'Segoe Script', cursive";
        }
        
        ctx.font = `${fontSize}px ${fontFamily}`;
        
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
        
        // Determine starting Y position - properly align with the lines
        let baseY;
        if (paperStyle === 'lined' || paperStyle === 'yellow') {
          // Align with the first line
          const lineSpacingPx = Math.max(fontSize * lineSpacing, 24);
          baseY = Math.max(lineSpacingPx, fontSize);
        } else {
          baseY = Math.max(fontSize * 1.5, 70);
        }
        
        // Calculate sample quality multiplier (more samples = better quality)
        const sampleMultiplier = Math.min(1 + (sampleCount * 0.1), 1.5);
        
        // Draw text with randomness
        const lines = text.split('\n');
        let currentY = baseY;
        
        lines.forEach((line, index) => {
          // Add some random line height variation - more variation with higher messiness
          const lineVariationAmount = 0.15 * (messiness / 70);
          const lineHeightVariation = 1 + (Math.random() - 0.5) * lineVariationAmount;
          currentY += (index > 0) ? fontSize * lineSpacing * lineHeightVariation : 0;
          
          // Use the custom function to draw text with randomness
          const lineWidth = addRandomnessToText(ctx, line, x, currentY, messiness, sampleMultiplier);
          
          // Add random ink splotches and dots for realism
          if (messiness > 40 && penStyle !== 'pencil') {
            const splotchCount = Math.floor((messiness / 20) * Math.random() * 3);
            
            for (let i = 0; i < splotchCount; i++) {
              const splotchX = x + Math.random() * lineWidth;
              const splotchY = currentY + (Math.random() - 0.5) * fontSize;
              const splotchSize = 1 + Math.random() * 3 * (messiness / 50);
              
              ctx.save();
              // Use the same ink color but slightly darker
              let splotchColor;
              if (inkColor === 'blue') {
                splotchColor = 'rgba(0, 10, 100, 0.7)';
              } else if (inkColor === 'dark-blue') {
                splotchColor = 'rgba(0, 0, 80, 0.7)';
              } else {
                splotchColor = 'rgba(0, 0, 0, 0.7)';
              }
              
              ctx.fillStyle = splotchColor;
              ctx.beginPath();
              
              // Create irregular ink splotch
              if (Math.random() > 0.5) {
                // Round splotch
                ctx.arc(splotchX, splotchY, splotchSize, 0, Math.PI * 2);
              } else {
                // Irregular splotch
                ctx.moveTo(splotchX, splotchY);
                for (let a = 0; a < Math.PI * 2; a += Math.PI/4) {
                  const radius = splotchSize * (0.7 + Math.random() * 0.6);
                  const ptX = splotchX + Math.cos(a) * radius;
                  const ptY = splotchY + Math.sin(a) * radius;
                  ctx.lineTo(ptX, ptY);
                }
                ctx.closePath();
              }
              
              ctx.fill();
              ctx.restore();
            }
          }
          
          // For pencil style, add eraser marks and smudges
          if (penStyle === 'pencil' && messiness > 50 && Math.random() > 0.6) {
            const eraserX = x + Math.random() * lineWidth;
            const eraserY = currentY + (Math.random() - 0.5) * fontSize * 2;
            const eraserWidth = 5 + Math.random() * 15;
            const eraserHeight = 3 + Math.random() * 8;
            
            ctx.save();
            ctx.globalCompositeOperation = 'destination-out';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.beginPath();
            
            // Create eraser mark with rotation
            ctx.translate(eraserX, eraserY);
            ctx.rotate(Math.random() * Math.PI * 2);
            ctx.fillRect(-eraserWidth/2, -eraserHeight/2, eraserWidth, eraserHeight);
            
            ctx.restore();
            
            // Add graphite smudge near eraser mark
            ctx.save();
            ctx.fillStyle = 'rgba(30, 30, 30, 0.1)';
            ctx.beginPath();
            ctx.translate(eraserX + (Math.random() - 0.5) * 10, eraserY + (Math.random() - 0.5) * 10);
            ctx.rotate(Math.random() * Math.PI * 2);
            ctx.fillRect(-eraserWidth*0.7, -eraserHeight*0.7, eraserWidth*1.4, eraserHeight*0.5);
            ctx.restore();
          }
        });
        
        // Add random ink smudges
        if (messiness > 50 && penStyle !== 'pencil') {
          const smudgeCount = Math.floor(messiness / 15);
          
          for (let i = 0; i < smudgeCount; i++) {
            const smudgeX = Math.random() * canvasWidth;
            const smudgeY = Math.random() * canvasHeight;
            const smudgeWidth = 5 + Math.random() * 20;
            const smudgeHeight = 2 + Math.random() * 5;
            const smudgeRotation = Math.random() * Math.PI;
            
            ctx.save();
            ctx.translate(smudgeX, smudgeY);
            ctx.rotate(smudgeRotation);
            
            if (inkColor === 'blue') {
              ctx.fillStyle = 'rgba(0, 20, 150, 0.1)';
            } else if (inkColor === 'dark-blue') {
              ctx.fillStyle = 'rgba(0, 0, 100, 0.1)';
            } else {
              ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            }
            
            // Create jagged smudge shape
            ctx.beginPath();
            ctx.moveTo(-smudgeWidth/2, -smudgeHeight/2);
            
            // Top edge with jags
            for (let x = -smudgeWidth/2; x < smudgeWidth/2; x += smudgeWidth/8) {
              const jagY = -smudgeHeight/2 + (Math.random() - 0.5) * smudgeHeight * 0.5;
              ctx.lineTo(x, jagY);
            }
            
            // Right edge
            ctx.lineTo(smudgeWidth/2, -smudgeHeight/2);
            ctx.lineTo(smudgeWidth/2, smudgeHeight/2);
            
            // Bottom edge with jags
            for (let x = smudgeWidth/2; x > -smudgeWidth/2; x -= smudgeWidth/8) {
              const jagY = smudgeHeight/2 + (Math.random() - 0.5) * smudgeHeight * 0.5;
              ctx.lineTo(x, jagY);
            }
            
            // Left edge
            ctx.lineTo(-smudgeWidth/2, smudgeHeight/2);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          }
        }
        
        // Add fingerprint smudge for high messiness
        if (messiness > 70 && Math.random() > 0.5) {
          const fpX = Math.random() * canvasWidth;
          const fpY = Math.random() * canvasHeight;
          const fpRadius = 15 + Math.random() * 25;
          
          ctx.save();
          const gradient = ctx.createRadialGradient(fpX, fpY, 0, fpX, fpY, fpRadius);
          
          if (penStyle === 'pencil') {
            gradient.addColorStop(0, 'rgba(80, 80, 80, 0.05)');
            gradient.addColorStop(1, 'rgba(80, 80, 80, 0)');
          } else {
            if (inkColor === 'blue') {
              gradient.addColorStop(0, 'rgba(0, 20, 120, 0.05)');
              gradient.addColorStop(1, 'rgba(0, 20, 120, 0)');
            } else if (inkColor === 'dark-blue') {
              gradient.addColorStop(0, 'rgba(0, 0, 60, 0.05)');
              gradient.addColorStop(1, 'rgba(0, 0, 60, 0)');
            } else {
              gradient.addColorStop(0, 'rgba(0, 0, 0, 0.05)');
              gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            }
          }
          
          ctx.fillStyle = gradient;
          
          // Add fingerprint pattern
          for (let i = 0; i < 10; i++) {
            const arcRadius = fpRadius * (0.5 + Math.random() * 0.5);
            const arcStartAngle = Math.random() * Math.PI * 2;
            const arcEndAngle = arcStartAngle + Math.PI * (0.2 + Math.random() * 0.8);
            
            ctx.beginPath();
            ctx.arc(fpX, fpY, arcRadius, arcStartAngle, arcEndAngle);
            ctx.lineWidth = 1 + Math.random() * 2;
            ctx.strokeStyle = ctx.fillStyle;
            ctx.stroke();
          }
          
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
                <p className="text-xs text-gray-500">Controls how messy the handwriting appears</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Shakiness</Label>
                  <span className="text-xs text-gray-500">{shakiness}%</span>
                </div>
                <Slider 
                  defaultValue={[shakiness]} 
                  max={100} 
                  min={0} 
                  step={5}
                  onValueChange={handleShakinessChange}
                  disabled={!hasSample}
                />
                <p className="text-xs text-gray-500">Controls hand trembling effect</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Pressure</Label>
                  <span className="text-xs text-gray-500">{pressure}%</span>
                </div>
                <Slider 
                  defaultValue={[pressure]} 
                  max={100} 
                  min={20} 
                  step={5}
                  onValueChange={handlePressureChange}
                  disabled={!hasSample}
                />
                <p className="text-xs text-gray-500">Controls pen/pencil pressure</p>
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
                <Label>Pen Style</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    variant={penStyle === 'fountain' ? 'default' : 'outline'} 
                    className="justify-start"
                    onClick={() => setPenStyle('fountain')}
                    disabled={!hasSample}
                  >
                    <div className="w-4 h-4 bg-blue-900 rounded-full mr-2"></div>
                    Fountain
                  </Button>
                  <Button 
                    variant={penStyle === 'ballpoint' ? 'default' : 'outline'} 
                    className="justify-start"
                    onClick={() => setPenStyle('ballpoint')}
                    disabled={!hasSample}
                  >
                    <div className="w-4 h-4 bg-blue-700 rounded-full mr-2"></div>
                    Ballpoint
                  </Button>
                  <Button 
                    variant={penStyle === 'pencil' ? 'default' : 'outline'} 
                    className="justify-start"
                    onClick={() => setPenStyle('pencil')}
                    disabled={!hasSample}
                  >
                    <div className="w-4 h-4 bg-gray-600 rounded-full mr-2"></div>
                    Pencil
                  </Button>
                </div>
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
                    disabled={!hasSample || penStyle === 'pencil'}
                  >
                    <div className="w-4 h-4 bg-blue-700 rounded-full mr-2"></div>
                    Blue
                  </Button>
                  <Button 
                    variant={inkColor === 'black' ? 'default' : 'outline'} 
                    className="justify-start"
                    onClick={() => setInkColor('black')}
                    disabled={!hasSample || penStyle === 'pencil'}
                  >
                    <div className="w-4 h-4 bg-gray-900 rounded-full mr-2"></div>
                    Black
                  </Button>
                  <Button 
                    variant={inkColor === 'dark-blue' ? 'default' : 'outline'} 
                    className="justify-start"
                    onClick={() => setInkColor('dark-blue')}
                    disabled={!hasSample || penStyle === 'pencil'}
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
