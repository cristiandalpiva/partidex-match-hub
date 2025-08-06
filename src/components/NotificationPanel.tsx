import React, { useState, useEffect } from 'react';
import { Bell, X, Calendar, Users, CreditCard, Trophy, Check, AlertCircle } from 'lucide-react';
import { GlassmorphismButton } from '@/components/ui/glassmorphism-button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

interface Notification {
  id: string;
  type: 'match_reminder' | 'team_update' | 'payment_confirmation' | 'payment_reminder' | 'general';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  action_url?: string;
  priority: 'low' | 'medium' | 'high';
}

export const NotificationPanel = ({ isOpen, onClose, userId }: NotificationPanelProps) => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen, userId]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      // Since we don't have a notifications table yet, show empty state
      // In a real implementation, you would create a notifications table
      setNotifications([]);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las notificaciones.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
      
      // Here you would update the database
      toast({
        title: "Notificación marcada como leída",
        description: "La notificación se ha marcado como leída."
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      
      toast({
        title: "Todas las notificaciones marcadas como leídas",
        description: "Se han marcado todas las notificaciones como leídas."
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'match_reminder':
        return Calendar;
      case 'team_update':
        return Users;
      case 'payment_confirmation':
      case 'payment_reminder':
        return CreditCard;
      default:
        return Bell;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      default:
        return 'text-green-500';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 60) {
      return `hace ${minutes} min`;
    } else if (hours < 24) {
      return `hace ${hours}h`;
    } else {
      return `hace ${days}d`;
    }
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-xl border">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gold-premium to-gold-premium-light rounded-xl flex items-center justify-center">
              <Bell className="w-6 h-6 text-black-deep" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Notificaciones</h2>
              {unreadCount > 0 && (
                <p className="text-sm text-muted-foreground">
                  {unreadCount} sin leer
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <GlassmorphismButton
                variant="default"
                size="sm"
                onClick={markAllAsRead}
              >
                Marcar todas como leídas
              </GlassmorphismButton>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              filter === 'all' 
                ? 'text-green-dynamic border-b-2 border-green-dynamic' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Todas ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              filter === 'unread' 
                ? 'text-green-dynamic border-b-2 border-green-dynamic' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Sin leer ({unreadCount})
          </button>
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-[60vh]">
          <div className="p-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-dynamic mx-auto"></div>
                <p className="text-muted-foreground mt-2">Cargando notificaciones...</p>
              </div>
            ) : filteredNotifications.length > 0 ? (
              <div className="space-y-3">
                {filteredNotifications.map((notification) => {
                  const Icon = getNotificationIcon(notification.type);
                  
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border transition-all hover:bg-muted/50 cursor-pointer ${
                        !notification.read 
                          ? 'border-green-dynamic/30 bg-green-dynamic/5' 
                          : 'border-border'
                      }`}
                      onClick={() => !notification.read && markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          !notification.read ? 'bg-green-dynamic/20' : 'bg-muted'
                        }`}>
                          <Icon className={`w-4 h-4 ${
                            !notification.read ? 'text-green-dynamic' : 'text-muted-foreground'
                          }`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={`font-medium ${
                              !notification.read ? 'text-foreground' : 'text-muted-foreground'
                            }`}>
                              {notification.title}
                            </h4>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${getPriorityColor(notification.priority)}`} />
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {formatTime(notification.created_at)}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between mt-2">
                            <Badge variant="outline" className="text-xs">
                              {notification.type.replace('_', ' ')}
                            </Badge>
                            
                            {!notification.read && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                className="text-xs text-green-dynamic hover:underline"
                              >
                                Marcar como leída
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  {filter === 'unread' ? 'No tienes notificaciones sin leer' : 'No hay notificaciones'}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <GlassmorphismButton
            variant="default"
            className="w-full"
            onClick={onClose}
          >
            Cerrar
          </GlassmorphismButton>
        </div>
      </div>
    </div>
  );
};