import { useState } from 'react';
import {
  Drawer, Box, Typography, IconButton, Divider,
  TextField, Select, MenuItem, FormControl, InputLabel,
  Button, Accordion, AccordionSummary, AccordionDetails,
  Slider, Tooltip,
} from '@mui/material';
import { Close as CloseIcon, ExpandMore as ExpandIcon, RestartAlt as ResetIcon } from '@mui/icons-material';
import { useAppearance } from '../context/AppearanceContext';
import { defaultTokens } from './designTokens';

const ColorField = ({ label, value, onChange }) => (
  <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
    <Box
      component="input"
      type="color"
      value={value || '#000000'}
      onChange={(e) => onChange(e.target.value)}
      sx={{
        width: 36, height: 36, cursor: 'pointer', border: '1px solid',
        borderColor: 'divider', borderRadius: 1, p: 0.25, bgcolor: 'transparent',
      }}
    />
    <Box flexGrow={1}>
      <Typography variant="caption" color="text.secondary" display="block" mb={0.25}>{label}</Typography>
      <Typography variant="caption" fontFamily="monospace">{value}</Typography>
    </Box>
  </Box>
);

const AppearanceSettings = ({ open, onClose }) => {
  const { tokens, updateTokens, resetToDefault } = useAppearance();
  const [local, setLocal] = useState(tokens);

  const update = (key, value) => {
    const updated = { ...local, [key]: value };
    setLocal(updated);
    updateTokens(updated);
  };

  const handleReset = async () => {
    setLocal(defaultTokens);
    await resetToDefault();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 360 }, display: 'flex', flexDirection: 'column' }
      }}
    >
      {/* Header */}
      <Box sx={{ px: 2.5, py: 2, display: 'flex', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight={700} flexGrow={1} fontSize="1rem">Appearance</Typography>
        <Tooltip title="Reset to defaults">
          <IconButton size="small" onClick={handleReset} sx={{ mr: 1 }}>
            <ResetIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <IconButton size="small" onClick={onClose}><CloseIcon /></IconButton>
      </Box>

      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        {/* Theme */}
        <Accordion disableGutters elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 1.5, '&:before': { display: 'none' } }} defaultExpanded>
          <AccordionSummary expandIcon={<ExpandIcon />}>
            <Typography variant="body2" fontWeight={600}>Theme</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormControl fullWidth size="small">
              <InputLabel>Theme Mode</InputLabel>
              <Select value={local.theme || 'light'} label="Theme Mode" onChange={(e) => update('theme', e.target.value)}>
                {['light', 'dark', 'system'].map((t) => (
                  <MenuItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </AccordionDetails>
        </Accordion>

        {/* Colors */}
        <Accordion disableGutters elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 1.5, '&:before': { display: 'none' } }} defaultExpanded>
          <AccordionSummary expandIcon={<ExpandIcon />}>
            <Typography variant="body2" fontWeight={600}>Colors</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <ColorField label="Primary Accent" value={local.primaryColor} onChange={(v) => update('primaryColor', v)} />
            <ColorField label="Selection Corner" value={local.selectionColor} onChange={(v) => update('selectionColor', v)} />
            <ColorField label="Main Text" value={local.mainTextColor} onChange={(v) => update('mainTextColor', v)} />
            <ColorField label="Secondary Text" value={local.secondaryTextColor} onChange={(v) => update('secondaryTextColor', v)} />
            <ColorField label="Border" value={local.borderColor} onChange={(v) => update('borderColor', v)} />
            <ColorField label="Invoice Background" value={local.invoiceBgColor} onChange={(v) => update('invoiceBgColor', v)} />
          </AccordionDetails>
        </Accordion>

        {/* Typography */}
        <Accordion disableGutters elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 1.5, '&:before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandIcon />}>
            <Typography variant="body2" fontWeight={600}>Typography</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
              <InputLabel>Font Family</InputLabel>
              <Select value={local.fontFamily || 'Inter'} label="Font Family" onChange={(e) => update('fontFamily', e.target.value)}>
                {['Inter', 'Roboto', 'Outfit', 'Poppins', 'Lato', 'Open Sans', 'DM Sans'].map((f) => (
                  <MenuItem key={f} value={f} style={{ fontFamily: f }}>{f}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField size="small" label="Font Size" value={local.fontSize || '14px'} onChange={(e) => update('fontSize', e.target.value)} fullWidth sx={{ mb: 1.5 }} />
            <TextField size="small" label="Heading Font Size" value={local.headingFontSize || '24px'} onChange={(e) => update('headingFontSize', e.target.value)} fullWidth sx={{ mb: 1.5 }} />
            <TextField size="small" label="Line Height" value={local.lineHeight || '1.6'} onChange={(e) => update('lineHeight', e.target.value)} fullWidth />
          </AccordionDetails>
        </Accordion>

        {/* Layout */}
        <Accordion disableGutters elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 1.5, '&:before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandIcon />}>
            <Typography variant="body2" fontWeight={600}>Layout</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TextField size="small" label="Page Padding" value={local.pagePadding || '32px'} onChange={(e) => update('pagePadding', e.target.value)} fullWidth sx={{ mb: 1.5 }} />
            <TextField size="small" label="Section Padding" value={local.sectionPadding || '24px'} onChange={(e) => update('sectionPadding', e.target.value)} fullWidth sx={{ mb: 1.5 }} />
            <TextField size="small" label="Border Radius" value={local.borderRadius || '8px'} onChange={(e) => update('borderRadius', e.target.value)} fullWidth sx={{ mb: 1.5 }} />
            <TextField size="small" label="Preview Width" value={local.previewWidth || '480px'} onChange={(e) => update('previewWidth', e.target.value)} fullWidth sx={{ mb: 1.5 }} />
            <TextField size="small" label="Sidebar Width" value={local.sidebarWidth || '220px'} onChange={(e) => update('sidebarWidth', e.target.value)} fullWidth />
          </AccordionDetails>
        </Accordion>
      </Box>

      <Box sx={{ px: 2.5, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button fullWidth variant="outlined" startIcon={<ResetIcon />} onClick={handleReset}>
          Reset to Defaults
        </Button>
      </Box>
    </Drawer>
  );
};

export default AppearanceSettings;
