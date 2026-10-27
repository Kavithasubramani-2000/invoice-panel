import { Box } from '@mui/material';

const CORNER_SIZE = 14;
const CORNER_THICKNESS = 2.5;

// Exact vibrant electric blue
const VIBRANT_BLUE = '#0084ff';

const cornerConfig = {
  topLeft: {
    top: -5,
    left: -5,
    borderTop: `${CORNER_THICKNESS}px solid ${VIBRANT_BLUE}`,
    borderLeft: `${CORNER_THICKNESS}px solid ${VIBRANT_BLUE}`,
    anim: 'jumpTopLeft',
  },
  topRight: {
    top: -5,
    right: -5,
    borderTop: `${CORNER_THICKNESS}px solid ${VIBRANT_BLUE}`,
    borderRight: `${CORNER_THICKNESS}px solid ${VIBRANT_BLUE}`,
    anim: 'jumpTopRight',
  },
  bottomLeft: {
    bottom: -5,
    left: -5,
    borderBottom: `${CORNER_THICKNESS}px solid ${VIBRANT_BLUE}`,
    borderLeft: `${CORNER_THICKNESS}px solid ${VIBRANT_BLUE}`,
    anim: 'jumpBottomLeft',
  },
  bottomRight: {
    bottom: -5,
    right: -5,
    borderBottom: `${CORNER_THICKNESS}px solid ${VIBRANT_BLUE}`,
    borderRight: `${CORNER_THICKNESS}px solid ${VIBRANT_BLUE}`,
    anim: 'jumpBottomRight',
  },
};

const AnimatedSelectionFrame = ({
  selected = false,
  badgeText = null,
  stepNumber = null,
  forPrint = false,
  children,
  sectionId,
  sx = {},
}) => {
  return (
    <Box
      data-section-id={sectionId}
      sx={{
        position: 'relative',
        borderRadius: 2,
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        bgcolor: selected
          ? 'rgba(0, 132, 255, 0.025)'
          : 'transparent',
        cursor: forPrint ? 'default' : 'pointer',
        /* Light background and subtle border ONLY on hover */
        '&:hover': forPrint
          ? {}
          : {
              bgcolor: selected ? 'rgba(0, 132, 255, 0.045)' : '#f8fafc',
              boxShadow: '0 0 0 1px rgba(0, 132, 255, 0.12)',
            },
        /* Mild inside-outside jumping transition keyframes */
        '@keyframes jumpTopLeft': {
          '0%, 100%': { transform: 'translate(0px, 0px)' },
          '50%': { transform: 'translate(3px, 3px)' },
        },
        '@keyframes jumpTopRight': {
          '0%, 100%': { transform: 'translate(0px, 0px)' },
          '50%': { transform: 'translate(-3px, 3px)' },
        },
        '@keyframes jumpBottomLeft': {
          '0%, 100%': { transform: 'translate(0px, 0px)' },
          '50%': { transform: 'translate(3px, -3px)' },
        },
        '@keyframes jumpBottomRight': {
          '0%, 100%': { transform: 'translate(0px, 0px)' },
          '50%': { transform: 'translate(-3px, -3px)' },
        },
        '@keyframes badgePulse': {
          '0%, 100%': { transform: 'translateX(-50%) translateY(0px)' },
          '50%': { transform: 'translateX(-50%) translateY(1.5px)' },
        },
        /* Frame entrance animation when switching active steps */
        '@keyframes frameEntrance': {
          '0%': {
            opacity: 0,
            transform: 'translateX(-8px) scale(0.98)',
          },
          '100%': {
            opacity: 1,
            transform: 'translateX(0) scale(1)',
          },
        },
        ...sx,
      }}
    >
      {/* 4 Blue corner brackets: ONLY for active/clicked section */}
      {!forPrint && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 15,
            opacity: selected ? 1 : 0,
            transition: 'opacity 0.25s ease',
            animation: selected ? 'frameEntrance 0.3s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
          }}
        >
          {Object.entries(cornerConfig).map(([pos, cfg]) => (
            <Box
              key={pos}
              aria-hidden="true"
              sx={{
                position: 'absolute',
                width: CORNER_SIZE,
                height: CORNER_SIZE,
                borderTop: cfg.borderTop || 'none',
                borderBottom: cfg.borderBottom || 'none',
                borderLeft: cfg.borderLeft || 'none',
                borderRight: cfg.borderRight || 'none',
                top: cfg.top,
                bottom: cfg.bottom,
                left: cfg.left,
                right: cfg.right,
                animation: selected
                  ? `${cfg.anim} 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite`
                  : 'none',
              }}
            />
          ))}
        </Box>
      )}

      {/* Pill badge: ONLY shown AFTER clicked / selected! */}
      {!forPrint && selected && badgeText && (
        <Box
          sx={{
            position: 'absolute',
            top: -12,
            left: '50%',
            transform: 'translateX(-50%)',
            bgcolor: '#18181b',
            color: '#ffffff',
            borderRadius: '16px',
            px: 1.25,
            py: 0.35,
            fontSize: '0.75rem',
            fontWeight: 600,
            zIndex: 16,
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
            animation: 'badgePulse 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite',
            pointerEvents: 'none',
          }}
        >
          {stepNumber && (
            <Box
              component="span"
              sx={{
                width: 15,
                height: 15,
                borderRadius: '50%',
                bgcolor: '#3f3f46',
                color: '#ffffff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.6875rem',
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              {stepNumber}
            </Box>
          )}
          <span>{badgeText}</span>
        </Box>
      )}

      {children}
    </Box>
  );
};

export default AnimatedSelectionFrame;
