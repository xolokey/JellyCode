import { EditorTabs } from '../editor/EditorTabs';

export default function EditorTabsExample() {
  const mockTabs = [
    {
      id: "1",
      name: "App.tsx",
      path: "src/App.tsx",
      isDirty: false,
      language: "typescript",
    },
    {
      id: "2",
      name: "Button.tsx",
      path: "src/components/Button.tsx",
      isDirty: true,
      language: "typescript",
    },
    {
      id: "3",
      name: "styles.css",
      path: "src/styles.css",
      isDirty: false,
      language: "css",
    },
    {
      id: "4",
      name: "README.md",
      path: "README.md",
      isDirty: true,
      language: "markdown",
    },
  ];

  return (
    <EditorTabs
      tabs={mockTabs}
      activeTab="2"
      onTabSelect={(tabId) => console.log('Tab selected:', tabId)}
      onTabClose={(tabId) => console.log('Tab closed:', tabId)}
      onTabCloseAll={() => console.log('Close all tabs')}
      onTabCloseOthers={(tabId) => console.log('Close others except:', tabId)}
      onNewTab={() => console.log('New tab')}
    />
  );
}