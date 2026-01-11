import { useState } from 'react';
import { Layout } from './components/Layout';
import { CariPage } from './pages/CariPage';
import { GiderPage } from './pages/GiderPage';
import { BackupModal } from './components/BackupModal';

function App() {
  const [activeTab, setActiveTab] = useState<'cari' | 'gider'>('cari');
  const [showBackupModal, setShowBackupModal] = useState(false);

  const handleHelpClick = () => {
    setShowBackupModal(true);
  };

  return (
    <>
      <Layout activeTab={activeTab} onTabChange={setActiveTab} onHelpClick={handleHelpClick}>

        {activeTab === 'cari' && (
          <CariPage />
        )}

        {activeTab === 'gider' && (
          <GiderPage />
        )}

      </Layout>

      {showBackupModal && <BackupModal onClose={() => setShowBackupModal(false)} />}
    </>
  );
}

export default App;
