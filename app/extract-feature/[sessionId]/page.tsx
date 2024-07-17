"use client"
import { useState, FormEvent } from 'react';
import { extractFeature, ExtractionResult } from '../../../utils/api';
import { useParams } from 'next/navigation';
import Chat from '@/components/Chat';

export default function ExtractFeature() {
  const params = useParams();
  const [featureTitle, setFeatureTitle] = useState('');
  const [featureDescription, setFeatureDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [showChat, setShowChat] = useState(false);

  const sessionId = params.sessionId as string;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (typeof sessionId !== 'string') {
        throw new Error('Invalid session ID');
      }

      const data = await extractFeature(sessionId, featureTitle, featureDescription);
      setResult(data);
      
    } catch (error) {
      console.error('Error extracting feature:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartChat = () => {
    setShowChat(true);
  };

  const formatMessage = (content: string) => {
    const parts = content.split(/```[\w]*\n/);
    return parts.map((part, index) => {
      if (index % 2 === 0) {
        let formattedPart = part
          .replace(/####\s(.*?)$/gm, '<h4>$1</h4>')
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/(\d+\.\s.*?)$/gm, '$1<br>');
  
        return <p key={index} className="mb-2 p-4 px-8 text-left" dangerouslySetInnerHTML={{ __html: formattedPart }} />;
      } else {
        return (
          <pre key={index} className="bg-[rgba(156,156,156,0.3)]  border border-[rgba(83,254,234,0.3)] px-8 text-left text-[#c3c3c3] p-3 rounded mb-2 overflow-x-auto">
            <code>{part}</code>
          </pre>
        );
      }
    });
  };

  return (
    <div className="container mx-auto p-4 flex flex-col justify content-between w-50%">
      <h1 className="text-2xl font-bold mb-4 text-[rgb(248,248,248)] m-auto">Extract Feature</h1>
      <form onSubmit={handleSubmit} className="mb-8 w-[70%] flex flex-col justify-center m-auto">
        <div className="mb-4">
          <label htmlFor="featureTitle" className="block  mb-2 text-[rgba(236,238,237,0.69)]">Feature Title:</label>
          <input
            type="text"
            id="featureTitle"
            value={featureTitle}
            onChange={(e) => setFeatureTitle(e.target.value)}
            className="w-full px-3 py-2 bg-[rgba(156,156,156,0.3)] border border-[rgba(255,255,255,0.81)] rounded "
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="featureDescription" className="block mb-2 text-[rgba(236,238,237,0.69)]">Feature Description:</label>
          <textarea
            id="featureDescription"
            value={featureDescription}
            onChange={(e) => setFeatureDescription(e.target.value)}
            className="w-full  px-3 py-2 border bg-[rgba(156,156,156,0.3)] border-[rgba(255,255,255,0.9)] rounded "
            rows={4}
            required
          />
        </div>
        <button
          type="submit"
          className="px-4 w-52  py-2 text-[rgb(255,255,255)] bg-[rgb(52,143,109)] rounded  hover:text-[rgb(204,203,203)] disabled:bg-[rgb(108,143,130)]"
          disabled={isLoading}
        >
          {isLoading ? 'Extracting...' : 'Extract Feature'}
        </button>
      </form>

      {result && (
        <div className="mt-8 space-y-8">
          
          <div className="text-center">
            <h2 className="text-xl font-bold mb-4">Implementation Suggestions</h2>
            <p className="inline-block bg-[rgba(156,156,156,0.3)] p-4  text-[#c0c0c0] rounded overflow-auto max-w-[70%]"> {formatMessage(result.implementationSuggestions.message)}</p>
          </div>
          {!showChat && (
            <div className="text-center">
              <button
                onClick={handleStartChat}
                className="px-4 py-2 text-[rgb(255,255,255)] bg-[rgb(52,143,109)] rounded  hover:text-[rgb(222,222,222)] "
              >
                Start Chat
              </button>
            </div>
          )}
        </div>
      )}

      {showChat && <Chat sessionId={sessionId} />}
    </div>
  );
}