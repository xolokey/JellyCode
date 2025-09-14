import { MonacoEditor } from '../editor/MonacoEditor';

export default function MonacoEditorExample() {
  const sampleCode = `function calculateSum(a: number, b: number): number {
  return a + b;
}

const result = calculateSum(5, 3);
console.log('Result:', result);`;

  return (
    <div className="h-96 border">
      <MonacoEditor
        value={sampleCode}
        language="typescript"
        onChange={(value) => console.log('Code changed:', value)}
        onCursorPositionChange={(line, column) => console.log('Cursor:', line, column)}
        theme="dark"
      />
    </div>
  );
}