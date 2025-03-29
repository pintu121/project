import React, { useState, useEffect } from 'react';
import Advertisement from './Advertisement';

interface AdBoundaryProps {
  children: React.ReactNode;
  frequency?: number; // How often to show ads (in components)
  type?: 'banner' | 'sidebar' | 'native';
  className?: string;
}

// Counter to track component instances
let componentCounter = 0;

export default function AdBoundary({ 
  children, 
  frequency = 3, 
  type = 'native',
  className = '' 
}: AdBoundaryProps) {
  const [showAd, setShowAd] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    componentCounter++;
    // Show ad every nth component
    if (componentCounter % frequency === 0) {
      setShowAd(true);
    }

    return () => {
      componentCounter--;
    };
  }, [frequency]);

  if (!showAd || dismissed) {
    return <>{children}</>;
  }

  return (
    <div className="space-y-4">
      {children}
      <Advertisement 
        type={type} 
        className={className}
        onClose={() => setDismissed(true)}
      />
    </div>
  );
}