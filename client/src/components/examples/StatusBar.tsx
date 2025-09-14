import { StatusBar } from '../layout/StatusBar';

export default function StatusBarExample() {
  return (
    <StatusBar
      cursorPosition={{ line: 42, column: 15 }}
      fileEncoding="UTF-8"
      language="typescript"
      gitStatus={{
        branch: "main",
        ahead: 2,
        behind: 0,
        modified: 3,
        staged: 1,
      }}
      lspStatus="connected"
      collaborators={2}
      aiStatus="idle"
    />
  );
}