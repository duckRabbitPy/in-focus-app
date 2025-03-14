import { ReactNode } from 'react';

interface EllipsisMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  direction?: 'right' | 'bottom';
  children: ReactNode;
}

const styles = {
  menuButton: {
    background: 'none',
    border: 'none',
    padding: '0.5rem',
    cursor: 'pointer',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&:hover': {
      backgroundColor: '#f5f5f5',
    },
  },
  menuDropdown: {
    position: 'absolute' as const,
    backgroundColor: '#fff',
    border: '1px solid #e5e5e5',
    borderRadius: '4px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    zIndex: 10,
  },
  menuDropdownRight: {
    right: 'auto',
    left: '100%',
    top: 0,
    marginLeft: '0.25rem',
  },
  menuDropdownBottom: {
    top: '100%',
    right: 0,
    marginTop: '0.25rem',
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    color: '#dc2626',
    cursor: 'pointer',
    width: '100%',
    border: 'none',
    background: 'none',
    fontSize: '0.9rem',
    whiteSpace: 'nowrap' as const,
    '&:hover': {
      backgroundColor: '#f5f5f5',
    },
  },
};

export function EllipsisMenu({ isOpen, onToggle, onClose, direction = 'right', children }: EllipsisMenuProps) {
  return (
    <div style={{ position: 'relative' }}>
      <button 
        onClick={onToggle}
        style={styles.menuButton}
        aria-label="More options"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="2" />
          <circle cx="19" cy="12" r="2" />
          <circle cx="5" cy="12" r="2" />
        </svg>
      </button>
      {isOpen && (
        <>
          <div 
            style={{ 
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 5,
            }} 
            onClick={onClose}
          />
          <div style={{
            ...styles.menuDropdown,
            ...(direction === 'right' ? styles.menuDropdownRight : styles.menuDropdownBottom),
          }}>
            {children}
          </div>
        </>
      )}
    </div>
  );
}

export const MenuItem = ({ onClick, icon, children }: { onClick: () => void; icon?: ReactNode; children: ReactNode }) => (
  <button onClick={onClick} style={styles.menuItem}>
    {icon}
    {children}
  </button>
); 