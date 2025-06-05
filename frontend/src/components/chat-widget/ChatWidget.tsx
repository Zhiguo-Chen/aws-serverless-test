import React, { useState, useRef, useEffect } from 'react';
import './ChatWidget.scss';
import { axiosInstance } from '../../auth/axiosInstance';

const MODELS = ['gemini-2.0-flash', 'gpt-4o-mini'];

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    [],
  );
  const [input, setInput] = useState('');
  const [model, setModel] = useState(MODELS[0]);
  const [sessionId, setSessionId] = useState(null);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: 'user', content: input }]);
    // Call chat API and add bot response to messages
    try {
      const formData = new FormData();
      setInput('');
      formData.append('message', input);
      formData.append('model', model);
      if (file) {
        formData.append('image', file);
      }
      if (sessionId) {
        formData.append('sessionId', sessionId);
      }
      console.log(file);
      // Dynamically import to avoid import at top
      // const { createChat } = await import('../../api/chat');
      console.log(formData);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      const response = await axiosInstance.post('/api/chat', formData);
      console.log(response);
      const botMessage = response?.data?.response || 'No response from bot.';
      if (response.data.sessionId) {
        setSessionId(response.data.sessionId);
      }
      setMessages((prev) => [...prev, { role: 'bot', content: botMessage }]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', content: 'Error: Unable to get response.' },
      ]);
    }

    // TODO: Call your API here and add the response to messages
    // Example:
    // const response = await fetch('/api/chat', { ... });
    // setMessages([...messages, { role: 'user', content: input }, { role: 'bot', content: response }]);
  };

  useEffect(() => {
    if (file) {
      console.log('File state updated:', file);
    }
  }, [file]);

  const handleFileSubmit = (e: any): any => {
    console.log(e.target.files?.[0]);
    setFile(e.target.files?.[0]);
    setTimeout(() => {
      console.log(file);
    }, 1000);
  };

  return (
    <>
      <div
        className={`chat-widget-fab${open ? ' open' : ''}`}
        onClick={() => setOpen(!open)}
      >
        💬
      </div>
      {open && (
        <div className="chat-widget-dialog">
          <div className="chat-widget-header">
            <span>AI Chat</span>
            <select value={model} onChange={(e) => setModel(e.target.value)}>
              {MODELS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <button
              className="chat-widget-close"
              onClick={() => setOpen(false)}
            >
              ✕
            </button>
          </div>
          <div className="chat-widget-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-widget-msg ${msg.role}`}>
                {msg.content}
              </div>
            ))}
          </div>
          <div
            className="chat-widget-footer"
            style={{ display: 'flex', flexDirection: 'column' }}
          >
            {file && file.type.startsWith('image/') && (
              <div
                className="chat-widget-image-preview"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt="preview"
                  style={{
                    maxWidth: 80,
                    maxHeight: 80,
                    marginRight: 8,
                    borderRadius: 4,
                    border: '1px solid #eee',
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: '#f5222d',
                    cursor: 'pointer',
                    fontSize: 18,
                  }}
                  title="Delete image"
                >
                  ×
                </button>
              </div>
            )}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                gap: 8,
              }}
            >
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileSubmit}
              />
              <button onClick={() => fileInputRef.current?.click()}>📎</button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                style={{ flex: 1 }}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button onClick={handleSend}>Send</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
