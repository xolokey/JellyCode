import { TopBar } from '../layout/TopBar';

export default function TopBarExample() {
  return (
    <TopBar
      projectName="my-awesome-project"
      currentBranch="feature/ai-improvements"
      saveStatus="saved"
      isConnected={true}
      onSettingsClick={() => console.log('Settings clicked')}
      onProfileClick={() => console.log('Profile clicked')}
      onLogoutClick={() => console.log('Logout clicked')}
    />
  );
}