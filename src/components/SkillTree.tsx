import { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Tooltip, CircularProgress, 
  Chip, Dialog, DialogTitle, DialogContent, DialogActions, Button, 
  Alert } from '@mui/material';
import { motion } from 'framer-motion';
import { 
  Lock, Zap, Flame, Award, 
  Dumbbell, BicepsFlexed, Star, Check 
} from 'lucide-react';
import { supabase } from '../supabase';
import type { Skill, UserSkill } from '../supabase';
import './SkillTree.css';

const iconMap: Record<string, any> = {
  Zap, Flame, Award, Dumbbell, BicepsFlexed, Star, Lock
};

const SkillNode = ({ 
  skill, 
  status, 
  onClick,
  canUnlock
}: { 
  skill: Skill; 
  status: string; 
  onClick: () => void;
  canUnlock: boolean;
}) => {
  const Icon = iconMap[skill.icon_name] || Star;
  const isLocked = status === 'locked' && !canUnlock;
  
  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="skill-node-wrapper"
    >
      <Tooltip title={`${skill.name}: ${skill.descripyion}`} arrow>
        <Box className={`skill-node-box ${status} ${isLocked ? 'locked' : ''}`}>
          {isLocked ? <Lock size={24} /> : <Icon size={24} />}
          {status === 'mastered' && (
            <Box className="mastery-star">
              <Star size={20} fill="#fbbf24" color="#fbbf24" />
            </Box>
          )}
        </Box>
      </Tooltip>
      <Typography variant="caption" className={`skill-node-name ${isLocked ? 'locked' : ''}`}>
        {skill.name}
      </Typography>
    </motion.div>
  );
};

export const SkillTree = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: skillsData } = await supabase.from('skills').select('*').order('tier', { ascending: true });
    const { data: userSkillsData } = await supabase.from('user_skills').select('*');
    if (skillsData) setSkills(skillsData);
    if (userSkillsData) setUserSkills(userSkillsData);
    setLoading(false);
  };

  const getStatus = (skillId: string) => {
    const userSkill = userSkills.find(us => us.skill_id === skillId);
    return userSkill ? userSkill.status : 'locked';
  };

  const checkCanUnlock = (skill: Skill | null) => {
    if (!skill) return false;
    if (skill.tier === 1) return true;
    if (!skill.prerequisites) return true;
    return getStatus(skill.prerequisites) === 'mastered';
  };

  const handleLogProgress = async (status: string) => {
    if (!selectedSkill) return;
    const userId = '00000000-0000-0000-0000-000000000000';
    const { error } = await supabase
      .from('user_skills')
      .upsert({ 
        user_id: userId, 
        skill_id: selectedSkill.id, 
        status: status,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,skill_id' });

    if (!error) {
      await fetchData();
      setIsLogModalOpen(false);
    } else {
      console.error(error);
    }
  };

  if (loading) return <Box className="loading-container"><CircularProgress /></Box>;

  const tiers = Array.from(new Set(skills.map(s => s.tier))).sort((a, b) => a - b);

  return (
    <Box className="skill-tree-container">
      <Box className="skill-tree-header">
        <Typography variant="h3" gutterBottom className="skill-tree-title">
          Visual Skill Tree
        </Typography>
        <Typography color="text.secondary">
          Track your journey from Beginner to Legend
        </Typography>
      </Box>

      <Box className="tiers-wrapper">
        {tiers.map(tier => (
          <Box key={tier} className="tier-container">
            <Box className="tier-header">
              <Chip label={`Tier ${tier}`} color="primary" variant="outlined" className="tier-chip" />
              <Box className="tier-divider" />
            </Box>
            
            <Grid container spacing={4} sx={{ justifyContent: 'center' }}>
              {skills.filter(s => s.tier === tier).map(skill => (
                <Grid key={skill.id}>
                  <SkillNode 
                    skill={skill} 
                    status={getStatus(skill.id)} 
                    canUnlock={checkCanUnlock(skill)}
                    onClick={() => {
                      setSelectedSkill(skill);
                      setIsLogModalOpen(true);
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        ))}
      </Box>

      <Dialog 
        open={isLogModalOpen} 
        onClose={() => setIsLogModalOpen(false)}
        slotProps={{
          backdrop: { className: "modal-backdrop" },
          paper: { className: "modal-paper" }
        }}
      >
        <DialogTitle className="modal-title">
          {selectedSkill?.name || 'Skill Details'}
        </DialogTitle>
        <DialogContent className="modal-content">
          {selectedSkill && (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {selectedSkill.descripyion}
              </Typography>
              
              {!checkCanUnlock(selectedSkill) && (
                <Alert severity="error" className="modal-alert">
                  Prerequisites not met! Master the previous skill to unlock this.
                </Alert>
              )}

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button 
                  fullWidth 
                  variant="contained" 
                  color="primary"
                  onClick={() => handleLogProgress('unlocked')}
                  startIcon={<Check />}
                >
                  Mark as Unlocked
                </Button>
                <Button 
                  fullWidth 
                  variant="contained" 
                  color="warning"
                  onClick={() => handleLogProgress('mastered')}
                  startIcon={<Star />}
                >
                  Master Skill
                </Button>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions className="modal-actions">
          <Button onClick={() => setIsLogModalOpen(false)} className="cancel-btn">Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
