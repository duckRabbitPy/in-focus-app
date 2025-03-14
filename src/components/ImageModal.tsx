interface ImageModalProps {
  imageUrl: string;
  altText: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageModal({ imageUrl, altText, isOpen, onClose }: ImageModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '2rem',
      }} 
      onClick={onClose}
    >
      <div 
        style={{
          position: 'relative',
          maxWidth: '100%',
          maxHeight: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }} 
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '-2rem',
            right: 0,
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '1.5rem',
            cursor: 'pointer',
            padding: '0.5rem',
          }}
        >
          ✕
        </button>
        <img
          src={imageUrl}
          alt={altText}
          style={{
            maxWidth: '100%',
            maxHeight: 'calc(100vh - 4rem)',
            objectFit: 'contain',
          }}
        />
      </div>
    </div>
  );
} 