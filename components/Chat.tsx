// Chat.tsx
import { useState, FormEvent, useEffect, useRef } from 'react';
import { sendChatMessage } from '../utils/api';

type Message = {
  sender: 'user' | 'assistant';
  content: string;
};

export default function Chat({ sessionId }: { sessionId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleChatSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    setMessages(prev => [...prev, { sender: 'user', content: chatInput }]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const data = await sendChatMessage(sessionId, chatInput);
      setMessages(prev => [...prev, { sender: 'assistant', content: data.chatHistory[data.chatHistory.length - 1] }]);
    } catch (error) {
      console.error('Error in chat submission:', error);
    } finally {
      setIsChatLoading(false);
    }
  };

  const formatMessage = (content: string) => {
    const parts = content.split(/```[\w]*\n/);
    return parts.map((part, index) => {
      if (index % 2 === 0) {
        let formattedPart = part
          .replace(/####\s(.*?)$/gm, '<h4>$1</h4>')
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/(\d+\.\s.*?)$/gm, '$1<br>');
  
        return <p key={index} className="mb-2  p-4 text-left" dangerouslySetInnerHTML={{ __html: formattedPart }} />;
      } else {
        return (
          <pre key={index} className="bg-[rgba(156,156,156,0.3)]  border border-[rgba(83,254,234,0.3)]  text-left text-[#d8e6e1] p-3 rounded mb-2 overflow-x-auto">
            <code>{part}</code>
          </pre>
        );
      }
    });
  };

  return (
    <div className="mt-8 ">
      <h2 className=" font-bold mb-4 flex justify-center text-[rgb(186,219,207)] text-2xl">Chat</h2>
      <div className="bg-[rgba(156,156,156,0.3)]  border-[rgba(83,254,234,0.15)] border w-[70%] m-auto flex overflow-hidden p-8 rounded  max-h-auto min-h-32 flex-col">
        {messages.map((message, index) => (
          <div key={index} className={`mb-4 ${message.sender === 'user' ? 'self-end' : 'self-start'}`}>
            <div className={`p-2  rounded-lg ${message.sender === 'user' ? ' bg-[rgba(156,156,156,0.3)]' : 'text-[#eae8e8] px-6 w-[50%] bg-[rgba(156,156,156,0.3)]'}`}>
              {formatMessage(message.content)}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={handleChatSubmit} className=" mt-4 w-[70%] flex flex-row gap-4 m-auto">
        <input
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder='Ask a question'
          className="w-full px-3 py-2 border rounded bg-[rgba(156,156,156,0.3)] border-[rgba(83,254,234,0.3)]"
          required
        />
        <button
          type="submit"
          className="px-4  my-auto py-2 text-[rgb(255,255,255)] bg-[rgb(52,143,109)] rounded  hover:text-[rgb(222,222,222)]  disabled:bg-[rgb(108,153,136)]"
          disabled={isChatLoading}
        >
          {isChatLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}