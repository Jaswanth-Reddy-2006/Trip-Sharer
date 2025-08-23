import React from 'react';

export default function EmptyState({ message, imageName = 'empty-state.svg' }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <img 
        src={`${process.env.PUBLIC_URL}/${imageName}`} 
        alt="Empty state" 
        style={{ maxWidth: 300, marginBottom: 20 }} 
      />
      <h3>{message || 'Nothing to show here yet!'}</h3>
    </div>
  );
}
