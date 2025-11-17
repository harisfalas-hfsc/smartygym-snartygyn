import { Component, ErrorInfo, ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class NotificationBadgeErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[NotificationBadge] Error boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return null; // Silently fail without breaking the UI
    }

    return this.props.children;
  }
}

interface NotificationBadgeProps {
  count: number;
}

export const NotificationBadge = ({ count }: NotificationBadgeProps) => {
  try {
    if (count <= 0) return null;
    
    return (
      <Badge 
        variant="destructive"
        className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center p-0 text-[10px] sm:text-xs"
      >
        {count > 9 ? '9+' : count}
      </Badge>
    );
  } catch (error) {
    console.error('[NotificationBadge] Render error:', error);
    return null;
  }
};

export const SafeNotificationBadge = ({ count }: NotificationBadgeProps) => (
  <NotificationBadgeErrorBoundary>
    <NotificationBadge count={count} />
  </NotificationBadgeErrorBoundary>
);
