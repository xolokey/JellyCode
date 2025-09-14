import { SearchPanel } from '../search/SearchPanel';

export default function SearchPanelExample() {
  return (
    <div className="w-80 h-96 border">
      <SearchPanel
        onFileOpen={(path, line) => console.log('Open file:', path, 'at line:', line)}
        onSearch={(query, type) => console.log('Search:', query, 'type:', type)}
      />
    </div>
  );
}