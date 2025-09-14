import { GitPanel } from '../git/GitPanel';

export default function GitPanelExample() {
  return (
    <div className="w-80 h-96 border">
      <GitPanel
        currentBranch="feature/ai-improvements"
        onStageFile={(fileId) => console.log('Stage file:', fileId)}
        onUnstageFile={(fileId) => console.log('Unstage file:', fileId)}
        onCommit={(message) => console.log('Commit:', message)}
        onPush={() => console.log('Push changes')}
        onPull={() => console.log('Pull changes')}
        onBranchSwitch={(branch) => console.log('Switch to branch:', branch)}
        onViewDiff={(fileId) => console.log('View diff for:', fileId)}
      />
    </div>
  );
}