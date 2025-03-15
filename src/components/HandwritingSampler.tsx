
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Image as ImageIcon, Check, AlertTriangle, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

interface HandwritingSamplerProps {
  onSampleProcessed: (sampleId: string) => void;
}

export const HandwritingSampler: React.FC<HandwritingSamplerProps> = ({ onSampleProcessed }) => {
  const [images, setImages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessed, setIsProcessed] = useState(false);
  const [learningProgress, setLearningProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if we have samples already
  useEffect(() => {
    const savedSampleCount = localStorage.getItem('handwritingSampleCount');
    const hasHandwritingSample = localStorage.getItem('hasHandwritingSample') === 'true';
    
    if (hasHandwritingSample && savedSampleCount) {
      setIsProcessed(true);
      // Try to restore images from localStorage if they exist
      const storedImages = [];
      for (let i = 0; i < parseInt(savedSampleCount); i++) {
        const img = localStorage.getItem(`handwritingSample_${i}`);
        if (img && img.startsWith('data:image')) {
          storedImages.push(img);
        }
      }
      if (storedImages.length > 0) {
        setImages(storedImages);
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Handle multiple files
    Array.from(files).forEach(file => {
      if (!file.type.includes('image/')) {
        toast.error('Please upload image files only');
        return;
      }

      // Check file size - increased to 10MB
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image file is too large. Please upload an image smaller than 10MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setImages(prevImages => [...prevImages, event.target?.result as string]);
        setIsProcessed(false);
      };
      reader.readAsDataURL(file);
    });
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeImage = (index: number) => {
    setImages(prevImages => prevImages.filter((_, i) => i !== index));
    setIsProcessed(false);
  };

  const processHandwriting = () => {
    if (images.length === 0) {
      toast.error('Please upload at least one handwriting sample');
      return;
    }
    
    setIsProcessing(true);
    setLearningProgress(0);
    
    // Simulate AI learning progress
    const totalSteps = 10;
    let currentStep = 0;
    
    const learningInterval = setInterval(() => {
      currentStep++;
      setLearningProgress(Math.floor((currentStep / totalSteps) * 100));
      
      if (currentStep >= totalSteps) {
        clearInterval(learningInterval);
        finishProcessing();
      }
    }, 300);
  };
  
  const finishProcessing = () => {
    try {
      // Generate a sample ID that includes the number of samples
      const sampleId = `sample-${Date.now()}-${images.length}`;
      
      // Store the number of samples
      localStorage.setItem('handwritingSampleCount', images.length.toString());
      
      // Limit storage to first 5 images to avoid localStorage quota issues
      // In a real app, these would be sent to a server for AI training
      const samplesToStore = images.slice(0, 5);
      samplesToStore.forEach((img, index) => {
        try {
          localStorage.setItem(`handwritingSample_${index}`, img);
        } catch (err) {
          console.warn('Could not store full image due to storage limits', err);
          // Store a smaller version instead (just in case)
          localStorage.setItem(`handwritingSample_${index}`, 'data:image/jpeg;base64,stored');
        }
      });
      
      localStorage.setItem('hasHandwritingSample', 'true');
      localStorage.setItem('handwritingSampleId', sampleId);
      
      setIsProcessing(false);
      setIsProcessed(true);
      
      toast.success(`${images.length} handwriting samples analyzed successfully!`);
      onSampleProcessed(sampleId);
    } catch (error) {
      console.error('Error storing handwriting samples:', error);
      toast.error('Failed to process handwriting samples');
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full bg-white/80 backdrop-blur-sm shadow-sm border-amber-200/40">
      <CardHeader>
        <CardTitle>Upload Your Handwriting</CardTitle>
        <CardDescription>
          Take clear photos of your handwriting for best results. The more samples, the better our AI can learn your style.
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
            multiple
          />
          
          <div 
            onClick={triggerFileInput}
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 w-full cursor-pointer hover:border-ink-blue transition-colors"
          >
            <div className="flex flex-col items-center justify-center space-y-2">
              <Upload className="h-8 w-8 text-gray-400" />
              <p className="text-sm text-gray-500 text-center">
                Click to upload photos of your handwriting
              </p>
              <p className="text-xs text-gray-400">
                Upload multiple samples for better results (up to 10MB per image)
              </p>
            </div>
          </div>
          
          {images.length > 0 && (
            <div className="w-full space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Handwriting Samples ({images.length})</h3>
                <Button variant="ghost" size="sm" onClick={triggerFileInput}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add More
                </Button>
              </div>
              
              <ScrollArea className="h-[250px] rounded-md border">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4">
                  {images.map((img, index) => (
                    <div key={index} className="relative rounded-lg overflow-hidden border border-gray-200 group">
                      <img 
                        src={img} 
                        alt={`Handwriting sample ${index + 1}`} 
                        className="w-full object-contain h-[120px]"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500/80 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Remove image"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      {isProcessed && (
                        <div className="absolute bottom-1 right-1 bg-green-500 text-white p-1 rounded-full">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              {isProcessing && (
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
                    style={{ width: `${learningProgress}%` }}
                  ></div>
                  <p className="text-xs text-gray-500 mt-1">
                    AI learning your handwriting style: {learningProgress}%
                  </p>
                </div>
              )}
              
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setImages([]);
                    setIsProcessed(false);
                  }}
                  disabled={isProcessing}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
                
                <Button 
                  onClick={processHandwriting} 
                  disabled={isProcessing || images.length === 0 || isProcessed}
                >
                  {isProcessing ? `Processing (${learningProgress}%)` : isProcessed ? 'Processed!' : 'Process Handwriting'}
                </Button>
              </div>
              
              <div className="text-xs text-gray-500 mt-2">
                <p className="flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1 text-amber-500" />
                  For best results, provide samples with different letters and writing styles.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
