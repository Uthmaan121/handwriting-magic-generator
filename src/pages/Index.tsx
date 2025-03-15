
import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { HandwritingSampler } from '@/components/HandwritingSampler';
import { HandwritingGenerator } from '@/components/HandwritingGenerator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, Type } from 'lucide-react';

const Index = () => {
  const [sampleId, setSampleId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("sample");

  // Check if we have a sample already
  useEffect(() => {
    const savedSampleId = localStorage.getItem('handwritingSampleId');
    if (savedSampleId) {
      setSampleId(savedSampleId);
    }
  }, []);

  const handleSampleProcessed = (id: string) => {
    setSampleId(id);
    // Automatically switch to generate tab after processing
    setActiveTab("generate");
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-6">
          Transform Your Handwriting Into Digital Text
        </h1>
        <p className="text-center text-ink-light mb-10 max-w-2xl mx-auto">
          Upload a sample of your handwriting, and our AI will learn to mimic your unique style.
          Then, generate any text in your personal handwriting!
        </p>

        <Tabs 
          defaultValue="sample" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="mb-10"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sample" className="flex items-center">
              <Pencil className="h-4 w-4 mr-2" />
              <span>1. Sample</span>
            </TabsTrigger>
            <TabsTrigger value="generate" className="flex items-center" disabled={!sampleId}>
              <Type className="h-4 w-4 mr-2" />
              <span>2. Generate</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="sample" className="mt-6">
            <HandwritingSampler onSampleProcessed={handleSampleProcessed} />
          </TabsContent>
          
          <TabsContent value="generate" className="mt-6">
            <HandwritingGenerator sampleId={sampleId} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Index;
