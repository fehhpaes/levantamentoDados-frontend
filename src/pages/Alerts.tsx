import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  Mail,
  MessageCircle,
  Smartphone,
  Globe,
  Clock,
  Filter,
  Settings,
  RefreshCw,
  Check,
  X,
  Link,
  Unlink,
  Copy,
  Trash2,
  CheckCircle,
  AlertCircle,
  Info,
  Zap,
} from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Button, Input, Select, Toggle } from '../components/ui/Form';
import { Badge, StatusBadge } from '../components/ui/Badge';
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  resetNotificationPreferences,
  linkTelegram,
  unlinkTelegram,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteAllNotifications,
  getNotificationStats,
} from '../services/api';
import type { 
  NotificationPreferences, 
  NotificationType, 
  Notification,
  NotificationStats,
  TelegramLinkResponse 
} from '../types';

type AlertsTab = 'preferences' | 'telegram' | 'history' | 'stats';

const notificationTypeLabels: Record<NotificationType, string> = {
  value_bet: 'Value Bets',
  match_start: 'Match Start',
  match_end: 'Match End',
  score_update: 'Score Updates',
  odds_movement: 'Odds Movement',
  prediction_result: 'Prediction Results',
  daily_summary: 'Daily Summary',
  weekly_report: 'Weekly Report',
  system_alert: 'System Alerts',
};

const notificationTypeIcons: Record<NotificationType, typeof Zap> = {
  value_bet: Zap,
  match_start: Bell,
  match_end: CheckCircle,
  score_update: AlertCircle,
  odds_movement: AlertCircle,
  prediction_result: Info,
  daily_summary: Mail,
  weekly_report: Mail,
  system_alert: Settings,
};

export default function Alerts() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<AlertsTab>('preferences');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [telegramCode, setTelegramCode] = useState<TelegramLinkResponse | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Fetch preferences
  const { data: preferences, isLoading: prefsLoading, refetch: refetchPrefs } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: async () => {
      const response = await getNotificationPreferences();
      return response.data as NotificationPreferences;
    },
  });

  // Fetch notifications
  const { data: notificationsData, isLoading: notificationsLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await getNotifications({ page: 1, page_size: 50 });
      return response.data;
    },
  });

  // Fetch stats
  const { data: stats } = useQuery<NotificationStats>({
    queryKey: ['notification-stats'],
    queryFn: async () => {
      const response = await getNotificationStats();
      return response.data;
    },
  });

  // Local state for form
  const [formData, setFormData] = useState<Partial<NotificationPreferences>>({});

  useEffect(() => {
    if (preferences) {
      setFormData(preferences);
    }
  }, [preferences]);

  // Update preferences mutation
  const updateMutation = useMutation({
    mutationFn: updateNotificationPreferences,
    onSuccess: () => {
      setSaveSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      setTimeout(() => setSaveSuccess(false), 3000);
    },
  });

  // Link Telegram mutation
  const linkTelegramMutation = useMutation({
    mutationFn: linkTelegram,
    onSuccess: (response) => {
      setTelegramCode(response.data);
    },
  });

  // Unlink Telegram mutation
  const unlinkTelegramMutation = useMutation({
    mutationFn: unlinkTelegram,
    onSuccess: () => {
      setTelegramCode(null);
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
    },
  });

  // Mark all read mutation
  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-stats'] });
    },
  });

  const handleSavePreferences = async () => {
    setIsSaving(true);
    try {
      await updateMutation.mutateAsync(formData);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleAlertType = (type: NotificationType) => {
    const currentTypes = formData.enabled_alert_types || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    setFormData({ ...formData, enabled_alert_types: newTypes });
  };

  const handleCopyCode = () => {
    if (telegramCode) {
      navigator.clipboard.writeText(telegramCode.verification_code);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const tabs = [
    { id: 'preferences' as const, name: 'Preferences', icon: Settings },
    { id: 'telegram' as const, name: 'Telegram', icon: MessageCircle },
    { id: 'history' as const, name: 'History', icon: Bell },
    { id: 'stats' as const, name: 'Statistics', icon: Filter },
  ];

  const digestFrequencyOptions = [
    { value: 'instant', label: 'Instant' },
    { value: 'hourly', label: 'Hourly' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
  ];

  const timezoneOptions = [
    { value: 'America/Sao_Paulo', label: 'Brasilia (GMT-3)' },
    { value: 'America/New_York', label: 'New York (GMT-5)' },
    { value: 'Europe/London', label: 'London (GMT+0)' },
    { value: 'Europe/Paris', label: 'Paris (GMT+1)' },
    { value: 'UTC', label: 'UTC' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Bell className="h-8 w-8 text-gray-600 dark:text-gray-400" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Alerts & Notifications</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Configure how and when you receive alerts
            </p>
          </div>
        </div>
        {stats && (
          <div className="flex items-center space-x-4">
            <Badge variant="primary">
              {stats.unread_count} unread
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchPrefs()}
              leftIcon={<RefreshCw className="h-4 w-4" />}
            >
              Refresh
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <Card padding="sm">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <tab.icon className="h-5 w-5 mr-3" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </Card>

          {/* Quick Stats */}
          {stats && (
            <Card className="mt-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Quick Stats</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Today</span>
                  <span className="font-medium dark:text-gray-200">{stats.notifications_today}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">This Week</span>
                  <span className="font-medium dark:text-gray-200">{stats.notifications_this_week}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Total</span>
                  <span className="font-medium dark:text-gray-200">{stats.total_notifications}</span>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              {/* Channels */}
              <Card>
                <CardHeader
                  title="Notification Channels"
                  subtitle="Choose how you want to receive notifications"
                />
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-gray-500 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">Email</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Receive alerts via email</p>
                      </div>
                    </div>
                    <Toggle
                      checked={formData.email_enabled || false}
                      onChange={(checked) => setFormData({ ...formData, email_enabled: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center">
                      <MessageCircle className="h-5 w-5 text-blue-500 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">Telegram</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {preferences?.telegram_verified 
                            ? `Connected: @${preferences.telegram_username}` 
                            : 'Real-time alerts via Telegram bot'}
                        </p>
                      </div>
                    </div>
                    <Toggle
                      checked={formData.telegram_enabled || false}
                      onChange={(checked) => setFormData({ ...formData, telegram_enabled: checked })}
                      disabled={!preferences?.telegram_verified}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center">
                      <Smartphone className="h-5 w-5 text-green-500 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">Push Notifications</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Browser push notifications</p>
                      </div>
                    </div>
                    <Toggle
                      checked={formData.push_enabled || false}
                      onChange={(checked) => setFormData({ ...formData, push_enabled: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center">
                      <Globe className="h-5 w-5 text-purple-500 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">In-App (WebSocket)</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Real-time in-app notifications</p>
                      </div>
                    </div>
                    <Toggle
                      checked={formData.websocket_enabled || false}
                      onChange={(checked) => setFormData({ ...formData, websocket_enabled: checked })}
                    />
                  </div>
                </div>
              </Card>

              {/* Alert Types */}
              <Card>
                <CardHeader
                  title="Alert Types"
                  subtitle="Select which types of alerts you want to receive"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(Object.keys(notificationTypeLabels) as NotificationType[]).map((type) => {
                    const Icon = notificationTypeIcons[type];
                    const isEnabled = formData.enabled_alert_types?.includes(type);
                    
                    return (
                      <button
                        key={type}
                        onClick={() => handleToggleAlertType(type)}
                        className={`flex items-center p-3 rounded-lg border-2 transition-colors ${
                          isEnabled
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <Icon className={`h-5 w-5 mr-3 ${isEnabled ? 'text-primary-600' : 'text-gray-400'}`} />
                        <span className={`font-medium ${isEnabled ? 'text-primary-700 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}>
                          {notificationTypeLabels[type]}
                        </span>
                        {isEnabled && <Check className="h-4 w-4 ml-auto text-primary-600" />}
                      </button>
                    );
                  })}
                </div>
              </Card>

              {/* Thresholds */}
              <Card>
                <CardHeader
                  title="Alert Thresholds"
                  subtitle="Set minimum values to filter alerts"
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Min Edge %"
                    type="number"
                    value={formData.min_edge_percentage || 5}
                    onChange={(e) => setFormData({ ...formData, min_edge_percentage: parseFloat(e.target.value) })}
                    helperText="Minimum edge for value bet alerts"
                  />
                  <Input
                    label="Min Confidence"
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={formData.min_confidence || 0.6}
                    onChange={(e) => setFormData({ ...formData, min_confidence: parseFloat(e.target.value) })}
                    helperText="Minimum confidence (0-1)"
                  />
                  <Input
                    label="Min Odds Change %"
                    type="number"
                    value={formData.min_odds_change || 5}
                    onChange={(e) => setFormData({ ...formData, min_odds_change: parseFloat(e.target.value) })}
                    helperText="Minimum % change for odds alerts"
                  />
                </div>
              </Card>

              {/* Digest & Schedule */}
              <Card>
                <CardHeader
                  title="Digest & Schedule"
                  subtitle="Configure when you receive summary notifications"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Digest Frequency"
                    options={digestFrequencyOptions}
                    value={formData.digest_frequency || 'daily'}
                    onChange={(e) => setFormData({ ...formData, digest_frequency: e.target.value as any })}
                  />
                  <Input
                    label="Digest Time"
                    type="time"
                    value={formData.digest_time || '09:00'}
                    onChange={(e) => setFormData({ ...formData, digest_time: e.target.value })}
                    helperText="When to send daily digest"
                  />
                  <Select
                    label="Timezone"
                    options={timezoneOptions}
                    value={formData.timezone || 'America/Sao_Paulo'}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  />
                </div>

                <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-gray-500 mr-2" />
                      <span className="font-medium text-gray-900 dark:text-gray-100">Quiet Hours</span>
                    </div>
                    <Toggle
                      checked={formData.quiet_hours_enabled || false}
                      onChange={(checked) => setFormData({ ...formData, quiet_hours_enabled: checked })}
                    />
                  </div>
                  {formData.quiet_hours_enabled && (
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Start Time"
                        type="time"
                        value={formData.quiet_hours_start || '22:00'}
                        onChange={(e) => setFormData({ ...formData, quiet_hours_start: e.target.value })}
                      />
                      <Input
                        label="End Time"
                        type="time"
                        value={formData.quiet_hours_end || '08:00'}
                        onChange={(e) => setFormData({ ...formData, quiet_hours_end: e.target.value })}
                      />
                    </div>
                  )}
                </div>
              </Card>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button
                  onClick={handleSavePreferences}
                  isLoading={isSaving}
                  leftIcon={saveSuccess ? <Check className="h-4 w-4" /> : undefined}
                >
                  {saveSuccess ? 'Saved!' : 'Save Preferences'}
                </Button>
              </div>
            </div>
          )}

          {/* Telegram Tab */}
          {activeTab === 'telegram' && (
            <Card>
              <CardHeader
                title="Telegram Integration"
                subtitle="Connect your Telegram account to receive instant alerts"
              />
              
              {preferences?.telegram_verified ? (
                <div className="space-y-6">
                  <div className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="h-8 w-8 text-green-500 mr-4" />
                    <div>
                      <p className="font-medium text-green-800 dark:text-green-300">Telegram Connected</p>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        @{preferences.telegram_username} | Chat ID: {preferences.telegram_chat_id}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button
                      variant="danger"
                      onClick={() => unlinkTelegramMutation.mutate()}
                      isLoading={unlinkTelegramMutation.isPending}
                      leftIcon={<Unlink className="h-4 w-4" />}
                    >
                      Disconnect Telegram
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">How to connect:</h4>
                    <ol className="list-decimal list-inside text-sm text-blue-700 dark:text-blue-400 space-y-1">
                      <li>Click "Generate Code" below</li>
                      <li>Open Telegram and search for our bot</li>
                      <li>Send the verification code to the bot</li>
                      <li>You'll start receiving alerts instantly!</li>
                    </ol>
                  </div>

                  {telegramCode ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Your verification code:</p>
                        <div className="flex items-center space-x-2">
                          <code className="text-2xl font-mono font-bold text-primary-600 dark:text-primary-400">
                            {telegramCode.verification_code}
                          </code>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopyCode}
                            leftIcon={copySuccess ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          >
                            {copySuccess ? 'Copied!' : 'Copy'}
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          Expires: {new Date(telegramCode.expires_at).toLocaleString()}
                        </p>
                      </div>
                      
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <p className="text-sm text-yellow-700 dark:text-yellow-400">
                          <strong>Send to bot:</strong> @{telegramCode.bot_username}
                        </p>
                        <p className="text-sm text-yellow-600 dark:text-yellow-500 mt-1">
                          /verify {telegramCode.verification_code}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-center">
                      <Button
                        onClick={() => linkTelegramMutation.mutate()}
                        isLoading={linkTelegramMutation.isPending}
                        leftIcon={<Link className="h-4 w-4" />}
                      >
                        Generate Verification Code
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Card>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <Card>
              <CardHeader
                title="Notification History"
                subtitle="View your recent notifications"
                action={
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markAllReadMutation.mutate()}
                      isLoading={markAllReadMutation.isPending}
                    >
                      Mark All Read
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteAllNotifications(30)}
                      leftIcon={<Trash2 className="h-4 w-4" />}
                    >
                      Clear Old
                    </Button>
                  </div>
                }
              />
              
              {notificationsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : notificationsData?.notifications?.length > 0 ? (
                <div className="space-y-3">
                  {notificationsData.notifications.map((notification: Notification) => {
                    const Icon = notificationTypeIcons[notification.notification_type] || Bell;
                    const isRead = !!notification.read_at;
                    
                    return (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-lg border ${
                          isRead 
                            ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50' 
                            : 'border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20'
                        }`}
                      >
                        <div className="flex items-start">
                          <Icon className={`h-5 w-5 mr-3 mt-0.5 ${isRead ? 'text-gray-400' : 'text-primary-500'}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className={`font-medium ${isRead ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-gray-100'}`}>
                                {notification.title}
                              </p>
                              <div className="flex items-center space-x-2">
                                <Badge 
                                  variant={notification.priority === 'high' || notification.priority === 'urgent' ? 'danger' : 'default'}
                                  size="sm"
                                >
                                  {notification.channel}
                                </Badge>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(notification.created_at).toLocaleString()}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {notification.message}
                            </p>
                          </div>
                          {!isRead && (
                            <button
                              onClick={() => markNotificationRead(notification.id)}
                              className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Bell className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No notifications</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    You'll see your alerts here when they arrive.
                  </p>
                </div>
              )}
            </Card>
          )}

          {/* Stats Tab */}
          {activeTab === 'stats' && stats && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="text-center">
                  <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                    {stats.total_notifications}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Notifications</p>
                </Card>
                <Card className="text-center">
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {stats.unread_count}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Unread</p>
                </Card>
                <Card className="text-center">
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {stats.notifications_today}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Today</p>
                </Card>
                <Card className="text-center">
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {stats.notifications_this_week}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">This Week</p>
                </Card>
              </div>

              <Card>
                <CardHeader title="By Type" />
                <div className="space-y-2">
                  {Object.entries(stats.by_type).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                      <span className="text-gray-700 dark:text-gray-300">
                        {notificationTypeLabels[type as NotificationType] || type}
                      </span>
                      <Badge variant="default">{count}</Badge>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader title="By Channel" />
                  <div className="space-y-2">
                    {Object.entries(stats.by_channel).map(([channel, count]) => (
                      <div key={channel} className="flex items-center justify-between py-2">
                        <span className="text-gray-700 dark:text-gray-300 capitalize">{channel}</span>
                        <Badge variant="primary">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card>
                  <CardHeader title="By Status" />
                  <div className="space-y-2">
                    {Object.entries(stats.by_status).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between py-2">
                        <span className="text-gray-700 dark:text-gray-300 capitalize">{status}</span>
                        <Badge variant={status === 'sent' || status === 'delivered' || status === 'read' ? 'success' : status === 'pending' ? 'warning' : 'default'}>
                          {count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
