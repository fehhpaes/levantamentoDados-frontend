import { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Palette, 
  Globe, 
  Shield,
  Save,
  RefreshCw,
  Check
} from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Button, Input, Select, Toggle } from '../components/ui/Form';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  getUserSettings, 
  updateUserSettings, 
  getNotificationSettings, 
  updateNotificationSettings,
  changePassword 
} from '../services/api';
import type { UserSettings, NotificationSettings } from '../types';

type SettingsTab = 'profile' | 'notifications' | 'appearance' | 'preferences' | 'security';

export default function Settings() {
  const { user, refreshUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');

  // Settings state
  const [settings, setSettings] = useState<Partial<UserSettings>>({
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
    odds_format: 'decimal',
    default_stake: 10,
    auto_refresh_interval: 30,
    show_live_scores: true,
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    value_bet_alerts: true,
    live_match_updates: true,
    prediction_results: true,
    bankroll_alerts: true,
    system_notifications: true,
    email_daily_summary: false,
    email_weekly_report: true,
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const [settingsRes, notificationsRes] = await Promise.all([
        getUserSettings(),
        getNotificationSettings(),
      ]);
      setSettings(settingsRes.data);
      setNotifications(notificationsRes.data);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setError('');
    setSaveSuccess(false);
    try {
      await updateUserSettings(settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    setError('');
    setSaveSuccess(false);
    try {
      await updateNotificationSettings(notifications);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError('Failed to save notification settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess(false);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    setIsSaving(true);
    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordSuccess(true);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) {
      setPasswordError('Failed to change password. Please check your current password.');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'profile' as const, name: 'Profile', icon: User },
    { id: 'notifications' as const, name: 'Notifications', icon: Bell },
    { id: 'appearance' as const, name: 'Appearance', icon: Palette },
    { id: 'preferences' as const, name: 'Preferences', icon: Globe },
    { id: 'security' as const, name: 'Security', icon: Shield },
  ];

  const themeOptions = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' },
  ];

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'pt', label: 'Portuguese' },
    { value: 'es', label: 'Spanish' },
  ];

  const timezoneOptions = [
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'Eastern Time (US)' },
    { value: 'America/Sao_Paulo', label: 'Brasilia Time' },
    { value: 'Europe/London', label: 'London Time' },
    { value: 'Europe/Paris', label: 'Central European Time' },
  ];

  const oddsFormatOptions = [
    { value: 'decimal', label: 'Decimal (1.50)' },
    { value: 'fractional', label: 'Fractional (1/2)' },
    { value: 'american', label: 'American (-200)' },
  ];

  const refreshIntervalOptions = [
    { value: 15, label: '15 seconds' },
    { value: 30, label: '30 seconds' },
    { value: 60, label: '1 minute' },
    { value: 120, label: '2 minutes' },
    { value: 300, label: '5 minutes' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <SettingsIcon className="h-8 w-8 text-gray-600 dark:text-gray-400" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage your account and preferences</p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={loadSettings}
          disabled={isLoading}
          leftIcon={<RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />}
        >
          Refresh
        </Button>
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
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <Card>
              <CardHeader 
                title="Profile Information" 
                subtitle="Update your account details"
              />
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="h-20 w-20 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{user?.username}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <Input
                    label="Username"
                    value={user?.username || ''}
                    disabled
                    helperText="Username cannot be changed"
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    helperText="Contact support to change email"
                  />
                  <Input
                    label="Full Name"
                    value={user?.full_name || ''}
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <Card>
              <CardHeader 
                title="Notification Settings" 
                subtitle="Choose what notifications you receive"
              />
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">Push Notifications</h4>
                  <div className="space-y-4">
                    <Toggle
                      label="Value bet alerts"
                      checked={notifications.value_bet_alerts}
                      onChange={(checked) => setNotifications({ ...notifications, value_bet_alerts: checked })}
                    />
                    <Toggle
                      label="Live match updates"
                      checked={notifications.live_match_updates}
                      onChange={(checked) => setNotifications({ ...notifications, live_match_updates: checked })}
                    />
                    <Toggle
                      label="Prediction results"
                      checked={notifications.prediction_results}
                      onChange={(checked) => setNotifications({ ...notifications, prediction_results: checked })}
                    />
                    <Toggle
                      label="Bankroll alerts"
                      checked={notifications.bankroll_alerts}
                      onChange={(checked) => setNotifications({ ...notifications, bankroll_alerts: checked })}
                    />
                    <Toggle
                      label="System notifications"
                      checked={notifications.system_notifications}
                      onChange={(checked) => setNotifications({ ...notifications, system_notifications: checked })}
                    />
                  </div>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">Email Notifications</h4>
                  <div className="space-y-4">
                    <Toggle
                      label="Daily summary"
                      checked={notifications.email_daily_summary}
                      onChange={(checked) => setNotifications({ ...notifications, email_daily_summary: checked })}
                    />
                    <Toggle
                      label="Weekly report"
                      checked={notifications.email_weekly_report}
                      onChange={(checked) => setNotifications({ ...notifications, email_weekly_report: checked })}
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <Button onClick={handleSaveNotifications} isLoading={isSaving}>
                    {saveSuccess ? <Check className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    {saveSuccess ? 'Saved!' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <Card>
              <CardHeader 
                title="Appearance" 
                subtitle="Customize how the app looks"
              />
              <div className="space-y-6">
                <Select
                  label="Theme"
                  options={themeOptions}
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
                />
                <Select
                  label="Language"
                  options={languageOptions}
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                />
                <Toggle
                  label="Show live scores"
                  checked={settings.show_live_scores || false}
                  onChange={(checked) => setSettings({ ...settings, show_live_scores: checked })}
                />
                <div className="flex justify-end pt-4">
                  <Button onClick={handleSaveSettings} isLoading={isSaving}>
                    {saveSuccess ? <Check className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    {saveSuccess ? 'Saved!' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <Card>
              <CardHeader 
                title="Preferences" 
                subtitle="Configure your betting preferences"
              />
              <div className="space-y-6">
                <Select
                  label="Timezone"
                  options={timezoneOptions}
                  value={settings.timezone}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                />
                <Select
                  label="Odds Format"
                  options={oddsFormatOptions}
                  value={settings.odds_format}
                  onChange={(e) => setSettings({ ...settings, odds_format: e.target.value as UserSettings['odds_format'] })}
                />
                <Input
                  label="Default Stake"
                  type="number"
                  value={settings.default_stake || ''}
                  onChange={(e) => setSettings({ ...settings, default_stake: parseFloat(e.target.value) })}
                  helperText="Default bet amount"
                />
                <Select
                  label="Auto-refresh Interval"
                  options={refreshIntervalOptions}
                  value={settings.auto_refresh_interval?.toString()}
                  onChange={(e) => setSettings({ ...settings, auto_refresh_interval: parseInt(e.target.value) })}
                />
                <div className="flex justify-end pt-4">
                  <Button onClick={handleSaveSettings} isLoading={isSaving}>
                    {saveSuccess ? <Check className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    {saveSuccess ? 'Saved!' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <Card>
              <CardHeader 
                title="Security" 
                subtitle="Manage your password and security settings"
              />
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">Change Password</h4>
                  {passwordError && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md text-sm text-red-700 dark:text-red-300">
                      {passwordError}
                    </div>
                  )}
                  {passwordSuccess && (
                    <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-md text-sm text-green-700 dark:text-green-300">
                      Password changed successfully!
                    </div>
                  )}
                  <div className="space-y-4">
                    <Input
                      label="Current Password"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    />
                    <Input
                      label="New Password"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      helperText="Minimum 8 characters"
                    />
                    <Input
                      label="Confirm New Password"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={handleChangePassword} 
                    isLoading={isSaving}
                    disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                  >
                    Change Password
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
