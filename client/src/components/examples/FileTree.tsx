import { FileTree } from '../editor/FileTree';

export default function FileTreeExample() {
  const mockFiles = [
    {
      id: "1",
      name: "src",
      type: "folder" as const,
      path: "src",
      isOpen: true,
      children: [
        {
          id: "2",
          name: "components",
          type: "folder" as const,
          path: "src/components",
          children: [
            {
              id: "3",
              name: "Button.tsx",
              type: "file" as const,
              path: "src/components/Button.tsx",
              gitStatus: "modified" as const,
            },
            {
              id: "4",
              name: "Modal.tsx",
              type: "file" as const,
              path: "src/components/Modal.tsx",
            },
          ],
        },
        {
          id: "5",
          name: "hooks",
          type: "folder" as const,
          path: "src/hooks",
          children: [
            {
              id: "6",
              name: "useAuth.ts",
              type: "file" as const,
              path: "src/hooks/useAuth.ts",
              gitStatus: "added" as const,
            },
          ],
        },
        {
          id: "7",
          name: "App.tsx",
          type: "file" as const,
          path: "src/App.tsx",
        },
        {
          id: "8",
          name: "index.css",
          type: "file" as const,
          path: "src/index.css",
          gitStatus: "untracked" as const,
        },
      ],
    },
    {
      id: "9",
      name: "package.json",
      type: "file" as const,
      path: "package.json",
    },
    {
      id: "10",
      name: "README.md",
      type: "file" as const,
      path: "README.md",
    },
  ];

  return (
    <div className="w-64 h-96 border">
      <FileTree
        files={mockFiles}
        selectedFile="src/components/Button.tsx"
        onFileSelect={(path) => console.log('File selected:', path)}
        onFileCreate={(parentPath, type) => console.log('Create', type, 'in', parentPath)}
        onFileRename={(path, newName) => console.log('Rename', path, 'to', newName)}
        onFileDelete={(path) => console.log('Delete', path)}
      />
    </div>
  );
}