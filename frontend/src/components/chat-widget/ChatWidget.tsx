import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { axiosInstance } from '../../auth/axiosInstance';
import './ChatWidget.scss';
import { testChat } from '../../api/chat';

const MODELS = ['langchain-service', 'gpt-4o-mini', 'gemini-2.0-flash'];

// 消息内容渲染组件
const MessageRenderer = ({
  content,
  products,
}: {
  content: string;
  products?: any[];
}) => {
  const findProductByName = (name: string) => {
    if (!products) return null;
    // 尝试通过模糊匹配找到最相关的产品
    const normalizedName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    return products.find((p) =>
      p.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .includes(normalizedName),
    );
  };
  const renderContent = (text: string) => {
    // 按 \n 分割文本
    const lines = text?.split('\n');

    return lines.map((line, index) => {
      if (line.trim() === '') {
        return <div key={index} style={{ height: '8px' }}></div>;
      }

      // 三个*或两个*开头，保持原有逻辑
      if (line.trim().match(/^(\*{2,})/)) {
        return renderListItem(line, index);
      }

      // * **标题**: 内容 这种格式，优先判断
      const match = line.trim().match(/^\*\s*\*\*([^*]+)\*\*\s*:?\s*(.*)/);
      if (match) {
        const title = match[1].trim();
        let description = match[2].trim();
        description = description.replace(/\*\*/g, '').trim();
        const product = findProductByName(title);
        return (
          <div
            key={index}
            style={{ marginBottom: '12px', paddingLeft: '16px' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
              <span style={{ color: '#1976d2', marginRight: '8px' }}>•</span>
              <div>
                <span style={{ fontWeight: 'bold', color: '#1976d2' }}>
                  {product ? (
                    <Link
                      to={`/main/${product.id}/product-detail`}
                      className="product-link cursor-pointer"
                    >
                      {title}
                    </Link>
                  ) : (
                    title
                  )}
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

      // 单个*开头，渲染为有缩进的普通列表项
      if (line.trim().match(/^\*\s+/)) {
        return (
          <div
            key={index}
            style={{
              marginBottom: '8px',
              paddingLeft: '24px',
              color: '#1976d2',
              display: 'flex',
              alignItems: 'flex-start',
            }}
          >
            <span style={{ marginRight: 8 }}>•</span>
            <span style={{ color: '#333' }}>
              {line.trim().replace(/^\*\s+/, '')}
            </span>
          </div>
        );
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
      const product = findProductByName(title);

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
                {product ? (
                  <Link
                    to={`/main/${product.id}/product-detail`}
                    className="product-link cursor-pointer"
                  >
                    {title}
                  </Link>
                ) : (
                  title
                )}
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
    {
      role: string;
      content: string;
      type?: string;
      imageUrl?: string;
      products?: any[];
    }[]
  >([]);
  const [input, setInput] = useState('');
  const [model, setModel] = useState(MODELS[0]);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);

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
      const response = await axiosInstance.post(
        '/api/products/chat',
        formData,
        {
          signal: controller.signal,
        },
      );
      // const response = await testChat(formData);
      const botMessage = response?.data?.response || 'No response from bot.';
      const products = response?.data?.products || [];
      setMessages((prev) => [
        ...prev,
        { role: 'bot', content: botMessage, products: products },
      ]);
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
              v = c === 'x' ? r : (r & 0x3) | 0x8;
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

  const handleFileSubmit = (e: any): any => {
    setFile(e.target.files?.[0]);
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
                    <MessageRenderer
                      content={msg.content}
                      products={msg.products}
                    />
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
