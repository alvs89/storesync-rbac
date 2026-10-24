import React from 'react';

// Use identical emphasis in the compact Dashboard and full report insights.
export function BranchComparisonInsight({ text }) {
  const parts = text.split(/(\b(?:Manggahan|San Rafael)(?= recorded | had )|\d+(?:\.\d+)?% more sales|\d+(?:\.\d+)? percentage-point higher profit margin)/g);
  return <>{parts.map((part, index) => index % 2 ? <strong key={index}>{part}</strong> : part)}</>;
}
