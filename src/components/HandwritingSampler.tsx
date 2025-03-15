
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Image as ImageIcon, Check, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface HandwritingSamplerProps {
  onSampleProcessed: (sampleId: string) => void;
}

export const HandwritingSampler: React.FC<HandwritingSamplerProps> = ({ onSampleProcessed }) => {
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessed, setIsProcessed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Check file size
    if (file.size > 3 * 1024 * 1024) { // 3MB limit
      toast.error('Image file is too large. Please upload an image smaller than 3MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target?.result as string);
      setIsProcessed(false);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const processHandwriting = () => {
    if (!image) return;
    
    setIsProcessing(true);
    
    // In a real app, this would send the image to a backend service
    // Here we're just simulating the processing
    setTimeout(() => {
      try {
        // Generate a fake sample ID
        const sampleId = `sample-${Date.now()}`;
        
        // Store a smaller version of the image or a reference instead of the full image
        // For this demo, we'll just store the sample ID and use it in the generator
        localStorage.setItem('handwritingSampleId', sampleId);
        
        // Instead of storing the full image, just store the fact that we have a sample
        localStorage.setItem('hasHandwritingSample', 'true');
        
        setIsProcessing(false);
        setIsProcessed(true);
        
        toast.success('Handwriting sample processed successfully!');
        onSampleProcessed(sampleId);
      } catch (error) {
        console.error('Error storing handwriting sample:', error);
        toast.error('Failed to process handwriting sample due to storage limitations');
        setIsProcessing(false);
      }
    }, 2000);
  };

  return (
    <Card className="w-full bg-white/80 backdrop-blur-sm shadow-sm border-amber-200/40">
      <CardHeader>
        <CardTitle>Upload Your Handwriting</CardTitle>
        <CardDescription>
          Take a clear photo of your handwriting for best results.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
          
          {!image ? (
            <div 
              onClick={triggerFileInput}
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 w-full cursor-pointer hover:border-ink-blue transition-colors"
            >
              <div className="flex flex-col items-center justify-center space-y-2">
                <Upload className="h-8 w-8 text-gray-400" />
                <p className="text-sm text-gray-500 text-center">
                  Click to upload a photo of your handwriting
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full space-y-4">
              <div className="relative w-full rounded-lg overflow-hidden border border-gray-200">
                <img 
                  src={image} 
                  alt="Handwriting sample" 
                  className="w-full object-contain max-h-[300px]"
                />
                {isProcessed && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={triggerFileInput}>
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Change Image
                </Button>
                
                <Button 
                  onClick={processHandwriting} 
                  disabled={isProcessing || isProcessed}
                >
                  {isProcessing ? 'Processing...' : isProcessed ? 'Processed!' : 'Process Handwriting'}
                </Button>
              </div>
              
              <div className="text-xs text-gray-500 mt-2">
                <p className="flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1 text-amber-500" />
                  For best results, write clearly on unlined paper with good lighting.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
