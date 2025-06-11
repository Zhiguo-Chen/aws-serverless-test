import React, { useState, useRef, useEffect } from 'react';
import './ChatWidget.scss';
import { axiosInstance } from '../../auth/axiosInstance';

const MODELS = ['langchain-service', 'gpt-4o-mini', 'gemini-2.0-flash'];

// 消息内容渲染组件
const MessageRenderer = ({ content }: { content: string }) => {
  const renderContent = (text: string) => {
    // 按 \n 分割文本
    const lines = text?.split('\n');

    return lines.map((line, index) => {
      // 如果是空行，渲染空的 div
      if (line.trim() === '') {
        return <div key={index} style={{ height: '8px' }}></div>;
      }

      // 检查是否是以 * ** 开头的列表项 (注意这里可能没有空格)
      if (line.trim().match(/^\*\s*\*\*/)) {
        return renderListItem(line, index);
      }

      // 普通文本行
      return (
        <div key={index} style={{ marginBottom: '8px' }}>
          {line}
        </div>
      );
    });
  };

  const renderListItem = (line: string, index: number) => {
    // 使用正则表达式匹配 * **标题**: 内容 或 * **标题** 内容 格式
    const match = line.trim().match(/^\*\s*\*\*([^*]+)\*\*\s*:?\s*(.*)/);

    if (match) {
      const title = match[1].trim();
      let description = match[2].trim();

      // 清理描述中的所有 **
      description = description.replace(/\*\*/g, '').trim();

      return (
        <div key={index} style={{ marginBottom: '12px', paddingLeft: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <span style={{ color: '#1976d2', marginRight: '8px' }}>•</span>
            <div>
              <span
                style={{
                  fontWeight: 'bold',
                  color: '#1976d2',
                }}
              >
                {title}
              </span>
              {description && (
                <span style={{ color: '#333', marginLeft: '4px' }}>
                  : {description}
                </span>
              )}
            </div>
          </div>
        </div>
      );
    }

    // 如果格式不匹配，返回原始内容（去掉 **）
    return (
      <div key={index} style={{ marginBottom: '8px', paddingLeft: '16px' }}>
        <span style={{ color: '#1976d2', marginRight: '8px' }}>•</span>
        {line.replace(/\*\*/g, '').replace(/^\*\s*/, '')}
      </div>
    );
  };

  return <div>{renderContent(content)}</div>;
};

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<
    { role: string; content: string; type?: string; imageUrl?: string }[]
  >([]);
  const [input, setInput] = useState('');
  const [model, setModel] = useState(MODELS[0]);
  const [sessionId, setSessionId] = useState(null);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSend = async () => {
    if (!input.trim() && !file) return;
    if (file || input.trim()) {
      const imageUrl = file ? URL.createObjectURL(file) : undefined;
      setMessages((prev) => [
        ...prev,
        {
          role: 'user',
          content: input,
          type: file ? 'image' : undefined,
          imageUrl,
        },
      ]);
    }
    try {
      setLoading(true);
      const controller = new AbortController();
      setAbortController(controller);
      const formData = new FormData();
      setInput('');
      formData.append('message', input);
      formData.append('model', model);
      if (file) {
        formData.append('image', file);
      }
      formData.append('sessionId', getOrCreateChatSessionId());
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      const response = await axiosInstance.post('/api/chat', formData, {
        signal: controller.signal,
      });
      const botMessage = response?.data?.response || 'No response from bot.';
      if (response.data.sessionId) {
        setSessionId(response.data.sessionId);
      }
      setMessages((prev) => [...prev, { role: 'bot', content: botMessage }]);
    } catch (err: any) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') {
        setMessages((prev) => [
          ...prev,
          { role: 'bot', content: '⏹️ 已停止回复。' },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'bot', content: 'Error: Unable to get response.' },
        ]);
      }
    } finally {
      setLoading(false);
      setAbortController(null);
    }
  };

  const handleStop = () => {
    if (abortController) {
      abortController.abort();
    }
  };

  const getOrCreateChatSessionId = () => {
    let sessionId = localStorage.getItem('chatSessionId'); // 尝试从 localStorage 获取
    if (!sessionId) {
      // 如果不存在，则生成一个新的 UUID
      // 现代浏览器支持 crypto.randomUUID()
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        sessionId = crypto.randomUUID();
      } else {
        // 兼容旧浏览器，或者使用第三方库如 'uuid'
        sessionId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
          /[xy]/g,
          function (c) {
            var r = (Math.random() * 16) | 0,
              v = c == 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
          },
        );
        console.warn(
          'Using fallback UUID generation. Consider using a dedicated UUID library or modern browser API.',
        );
      }
      localStorage.setItem('chatSessionId', sessionId); // 存储到 localStorage
    }
    console.log('sessionId', sessionId);
    return sessionId;
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
                {msg.imageUrl && (
                  <img
                    src={msg.imageUrl}
                    alt="preview"
                    style={{
                      maxWidth: 80,
                      maxHeight: 80,
                      borderRadius: 4,
                      border: '1px solid #eee',
                      marginBottom: msg.content ? 4 : 0,
                      display: 'block',
                    }}
                  />
                )}
                {msg.content &&
                  (msg.role === 'bot' ? (
                    <MessageRenderer content={msg.content} />
                  ) : (
                    msg.content
                  ))}
              </div>
            ))}
            {loading && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  margin: '8px 0',
                }}
              >
                <span
                  className="chat-widget-loading-icon"
                  style={{ fontSize: 20 }}
                >
                  <svg width="20" height="20" viewBox="0 0 50 50">
                    <circle
                      cx="25"
                      cy="25"
                      r="20"
                      fill="none"
                      stroke="#1976d2"
                      strokeWidth="4"
                      strokeDasharray="31.4 31.4"
                      strokeLinecap="round"
                    >
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from="0 25 25"
                        to="360 25 25"
                        dur="1s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  </svg>
                </span>
              </div>
            )}
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
              <button onClick={loading ? handleStop : handleSend}>
                {loading ? <span title="Stop">⏹</span> : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
