export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'secondary' | 'primary';
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
  className?: string;
  onClick?: () => void;
}

const variantClasses = {
  default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  secondary: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

export function Badge({ children, variant = 'default', size = 'sm', pulse = false, className = '', onClick }: BadgeProps) {
  return (
    <span
      onClick={onClick}
      className={`
        inline-flex items-center font-medium rounded-full
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${pulse ? 'animate-pulse' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </span>
  );
}

// Status badge for match status
export interface StatusBadgeProps {
  status: 'live' | 'halftime' | 'finished' | 'scheduled' | 'postponed' | 'cancelled' | string;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config: Record<string, { variant: BadgeProps['variant']; label: string; pulse?: boolean }> = {
    live: { variant: 'danger', label: 'Ao Vivo', pulse: true },
    halftime: { variant: 'warning', label: 'Intervalo' },
    finished: { variant: 'success', label: 'Finalizado' },
    scheduled: { variant: 'info', label: 'Agendado' },
    postponed: { variant: 'secondary', label: 'Adiado' },
    cancelled: { variant: 'default', label: 'Cancelado' },
  };

  const { variant, label, pulse } = config[status] || { variant: 'default', label: status };

  return (
    <Badge variant={variant} pulse={pulse} className={className}>
      {pulse && <span className="w-2 h-2 bg-current rounded-full mr-1.5" />}
      {label}
    </Badge>
  );
}

// Value indicator badge
export interface ValueBadgeProps {
  value: number;
  suffix?: string;
  invertColors?: boolean;
  thresholds?: { low: number; medium: number; high: number };
}

export function ValueBadge({ value, suffix = '%', invertColors = false, thresholds }: ValueBadgeProps) {
  let variant: BadgeProps['variant'];
  
  if (thresholds) {
    if (value >= thresholds.high) {
      variant = invertColors ? 'danger' : 'success';
    } else if (value >= thresholds.medium) {
      variant = 'warning';
    } else {
      variant = invertColors ? 'success' : 'danger';
    }
  } else {
    const isPositive = value >= 0;
    variant = invertColors
      ? isPositive ? 'danger' : 'success'
      : isPositive ? 'success' : 'danger';
  }

  return (
    <Badge variant={variant} size="sm">
      {value >= 0 ? '+' : ''}{value.toFixed(2)}{suffix}
    </Badge>
  );
}
