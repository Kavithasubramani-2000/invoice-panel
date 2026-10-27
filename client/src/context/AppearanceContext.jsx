import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getAppearance, updateAppearance as apiUpdateAppearance } from '../api/settings.api';
import { defaultTokens, applyTokensToCSS } from '../settings/designTokens';
import { buildMuiTheme } from '../settings/theme';

const AppearanceContext = createContext(null);

export const AppearanceProvider = ({ children }) => {
  const { user } = useAuth();
  const [tokens, setTokens] = useState(defaultTokens);
  const [muiTheme, setMuiTheme] = useState(() => buildMuiTheme(defaultTokens));

  const applyTokens = useCallback((newTokens) => {
    const merged = { ...defaultTokens, ...newTokens };
    setTokens(merged);
    setMuiTheme(buildMuiTheme(merged));
    applyTokensToCSS(merged);
  }, []);

  useEffect(() => {
    if (!user) {
      applyTokens(defaultTokens);
      return;
    }
    getAppearance().then((res) => {
      if (res.data?.data) applyTokens(res.data.data);
    }).catch(() => {
      applyTokens(defaultTokens);
    });
  }, [user, applyTokens]);

  const updateTokens = async (newTokens) => {
    applyTokens(newTokens);
    try {
      await apiUpdateAppearance(newTokens);
    } catch (e) {
      console.error('Failed to save appearance', e);
    }
  };

  const resetToDefault = async () => {
    await updateTokens(defaultTokens);
  };

  return (
    <AppearanceContext.Provider value={{ tokens, muiTheme, updateTokens, resetToDefault }}>
      {children}
    </AppearanceContext.Provider>
  );
};

export const useAppearance = () => {
  const ctx = useContext(AppearanceContext);
  if (!ctx) throw new Error('useAppearance must be used within AppearanceProvider');
  return ctx;
};
