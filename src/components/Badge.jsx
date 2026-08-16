const toneMap = {
  success: 'badge-success',
  warning: 'badge-warning',
  neutral: 'badge-neutral',
  info: 'badge-info',
};

export default function Badge({ tone = 'neutral', className = '', children }) {
  const toneClass = toneMap[tone] || 'badge-neutral';
  return <span className={`badge ${toneClass} ${className}`.trim()}>{children}</span>;
}