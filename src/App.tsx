import { useState } from 'react';
import { 
  Box, Container, Typography, Tab, Tabs, AppBar, Toolbar
} from '@mui/material';
import { TreePine, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SkillTree } from './components/SkillTree';
import { AdminDashboard } from './components/AdminDashboard';
import './App.css';

function App() {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <Box className="app-wrapper">
      <AppBar position="sticky" elevation={0} className="app-bar">
        <Container maxWidth="xl">
          <Toolbar disableGutters className="toolbar-root">
            <Box className="logo-container">
              <Box className="logo-box">
                <TreePine color="white" size={24} />
              </Box>
              <Typography variant="h5" className="app-title" sx={{ display: { xs: 'none', sm: 'block' } }}>
                CALI<span style={{ color: '#38bdf8' }}>TREE</span>
              </Typography>
            </Box>

            <Tabs 
              value={currentTab} 
              onChange={handleTabChange}
              className="nav-tabs"
            >
              <Tab icon={<TreePine size={18} />} iconPosition="start" label="Skill Tree" />
              <Tab icon={<UserIcon size={18} />} iconPosition="start" label="Profiles" />
            </Tabs>

            <Box sx={{ width: 100, display: { xs: 'none', sm: 'block' } }} />
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="xl" className="main-content-container">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {currentTab === 0 && <SkillTree />}
            {currentTab === 1 && <AdminDashboard />}
          </motion.div>
        </AnimatePresence>
      </Container>

      <Box className="footer">
        <Typography variant="body2">
          © 2026 CaliTree Level up your life.
        </Typography>
      </Box>
    </Box>
  );
}

export default App;
