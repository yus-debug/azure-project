import { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Chip, Button, IconButton, TextField, 
  CircularProgress, Avatar, Dialog, DialogTitle, 
  DialogContent, DialogActions
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import { Users, Edit, Trash2 } from 'lucide-react';
import { userApi } from '../api';
import type { Profile } from '../supabase';
import './AdminDashboard.css';

export const AdminDashboard = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({ username: '', level: 1, xp: 0 });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const data = await userApi.getAllUsers();
    setUsers(data);
    setLoading(false);
  };

  const handleOpenDialog = (user: Profile | null = null) => {
    setEditingUser(user);
    setFormData(user ? { 
      username: user.username || '', 
      level: user.level || 0, 
      xp: user.xp || 0 
    } : { 
      username: '', 
      level: 1, 
      xp: 0 
    });
    setDialogOpen(true);
  };

  const handleSaveUser = async () => {
    try {
      const payload = {
        ...formData,
        level: Number(formData.level) || 0,
        xp: Number(formData.xp) || 0
      };
      
      if (editingUser) {
        await userApi.updateUser(editingUser.id, payload);
      } else {
        await userApi.createUser(payload);
      }
      fetchUsers();
      setDialogOpen(false);
    } catch (err) {}
  };

  const handleDeleteRequest = (id: string) => {
    setUserToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (userToDelete) {
      await userApi.deleteUser(userToDelete);
      fetchUsers();
    }
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const columns: GridColDef[] = [
    { 
      field: 'username', 
      headerName: 'Username', 
      flex: 1,
      renderCell: (params) => (
        <Box className="cell-container">
          <Avatar className="user-avatar">
            {params.value?.[0]?.toUpperCase()}
          </Avatar>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{params.value}</Typography>
        </Box>
      )
    },
    { 
      field: 'level', 
      headerName: 'Level', 
      width: 150,
      renderCell: (params) => (
        <Box className="cell-container">
          <Chip label={`Level ${params.value}`} size="small" className="level-chip" />
        </Box>
      )
    },
    { 
      field: 'xp', 
      headerName: 'Experience (XP)', 
      width: 200,
      renderCell: (params) => (
        <Box className="cell-container">
          <Typography variant="body2" className="xp-text">
            {params.value?.toLocaleString()} XP
          </Typography>
        </Box>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box className="actions-container">
          <IconButton onClick={() => handleOpenDialog(params.row)} className="edit-btn" size="small">
            <Edit size={18} />
          </IconButton>
          <IconButton onClick={() => handleDeleteRequest(params.row.id)} className="delete-btn" size="small">
            <Trash2 size={18} />
          </IconButton>
        </Box>
      )
    }
  ];

  const filteredUsers = users.filter(user => 
    user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Box className="loading-container"><CircularProgress /></Box>;

  return (
    <Box className="admin-dashboard-container">
      <Box className="dashboard-header">
        <Typography variant="h4" className="dashboard-title">Profile Management</Typography>
        <Button 
          variant="contained" 
          startIcon={<Users size={18} />} 
          onClick={() => handleOpenDialog()}
          className="add-profile-btn"
        >
          Add Profile
        </Button>
      </Box>

      <Paper className="datagrid-paper">
        <Box className="search-box-container">
          <TextField
            placeholder="Search profiles..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-textfield"
          />
        </Box>

        <DataGrid
          rows={filteredUsers}
          columns={columns}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          className="custom-datagrid"
        />
      </Paper>

      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        slotProps={{
          backdrop: { sx: { backgroundColor: 'rgba(2, 6, 23, 0.9)' } },
          paper: { className: "modal-paper" }
        }}
      >
        <DialogTitle className="modal-title">
          {editingUser ? 'Edit Profile' : 'Add New Profile'}
        </DialogTitle>
        <DialogContent className="modal-content">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="modal-input"
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Level"
                type="number"
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value === '' ? 0 : parseInt(e.target.value) || 0 })}
                className="modal-input"
              />
              <TextField
                fullWidth
                label="XP"
                type="number"
                value={formData.xp}
                onChange={(e) => setFormData({ ...formData, xp: e.target.value === '' ? 0 : parseInt(e.target.value) || 0 })}
                className="modal-input"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions className="modal-actions">
          <Button onClick={() => setDialogOpen(false)} className="cancel-btn">Cancel</Button>
          <Button variant="contained" onClick={handleSaveUser} className="save-btn">Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        slotProps={{
          backdrop: { sx: { backgroundColor: 'rgba(2, 6, 23, 0.9)' } },
          paper: { className: "delete-modal-paper" }
        }}
      >
        <DialogTitle className="modal-title">Confirm Delete</DialogTitle>
        <DialogContent className="modal-content">
          <Typography>Are you sure you want to delete this profile? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions className="modal-actions">
          <Button onClick={() => setDeleteDialogOpen(false)} className="cancel-btn">Cancel</Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete} className="confirm-delete-btn">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
