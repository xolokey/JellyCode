import { ChatPanel } from '../ai/ChatPanel';

export default function ChatPanelExample() {
  return (
    <div className="w-96 h-96 border">
      <ChatPanel
        onSendMessage={(message) => console.log('Message sent:', message)}
        onCodeApply={(code) => console.log('Apply code:', code)}
        isLoading={false}
      />
    </div>
  );
}