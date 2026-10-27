// Default design tokens - matching Acctual UI exactly
export const defaultTokens = {
  theme: 'light',
  primaryColor: '#18181b', // Jet black for primary buttons like Acctual
  selectionColor: '#0ea5e9', // Sky/cyan blue for corner focus brackets
  sidebarBg: '#eae8e4', // Warm neutral grey sidebar
  sidebarText: '#52525b',
  sidebarActiveText: '#18181b',
  mainTextColor: '#18181b',
  secondaryTextColor: '#71717a',
  borderColor: '#e4e4e7',
  invoiceBgColor: '#ffffff',
  fontFamily: 'Inter',
  fontSize: '14px',
  headingFontSize: '24px',
  bodyFontSize: '14px',
  fontWeight: '400',
  headingFontWeight: '600',
  secondaryFontWeight: '400',
  lineHeight: '1.5',
  pagePadding: '32px',
  sectionPadding: '24px',
  horizontalSpacing: '24px',
  verticalSpacing: '16px',
  tableRowSpacing: '12px',
  inputHeight: '40px',
  borderRadius: '8px',
  previewWidth: '500px',
  sidebarWidth: '220px',
};

export const applyTokensToCSS = (tokens) => {
  const root = document.documentElement;
  const t = { ...defaultTokens, ...tokens };

  root.style.setProperty('--color-primary', t.primaryColor);
  root.style.setProperty('--color-selection', t.selectionColor);
  root.style.setProperty('--color-sidebar-bg', t.sidebarBg);
  root.style.setProperty('--color-sidebar-text', t.sidebarText);
  root.style.setProperty('--color-sidebar-active', t.sidebarActiveText);
  root.style.setProperty('--color-text-main', t.mainTextColor);
  root.style.setProperty('--color-text-secondary', t.secondaryTextColor);
  root.style.setProperty('--color-border', t.borderColor);
  root.style.setProperty('--color-invoice-bg', t.invoiceBgColor);
  root.style.setProperty('--font-family', `'${t.fontFamily}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`);
  root.style.setProperty('--font-size', t.fontSize);
  root.style.setProperty('--font-size-heading', t.headingFontSize);
  root.style.setProperty('--font-size-body', t.bodyFontSize);
  root.style.setProperty('--font-weight', t.fontWeight);
  root.style.setProperty('--font-weight-heading', t.headingFontWeight);
  root.style.setProperty('--font-weight-secondary', t.secondaryFontWeight);
  root.style.setProperty('--line-height', t.lineHeight);
  root.style.setProperty('--padding-page', t.pagePadding);
  root.style.setProperty('--padding-section', t.sectionPadding);
  root.style.setProperty('--spacing-h', t.horizontalSpacing);
  root.style.setProperty('--spacing-v', t.verticalSpacing);
  root.style.setProperty('--spacing-table-row', t.tableRowSpacing);
  root.style.setProperty('--input-height', t.inputHeight);
  root.style.setProperty('--border-radius', t.borderRadius);
  root.style.setProperty('--preview-width', t.previewWidth);
  root.style.setProperty('--sidebar-width', t.sidebarWidth);
};
