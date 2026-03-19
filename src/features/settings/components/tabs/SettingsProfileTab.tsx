import { Form, Input as AntInput } from 'antd';
import { User } from 'lucide-react';
import { Surface, Button, Skeleton } from '@shared/design-system';

import type {
  SettingsProfileFormValues,
  SettingsProfileViewModel,
} from '../../types';
import type { FormInstance } from 'antd/es/form';

interface SettingsProfileTabProps {
  readonly profileLoading: boolean;
  readonly profile: SettingsProfileViewModel | null;
  readonly profileForm: FormInstance<SettingsProfileFormValues>;
  readonly isSaving: boolean;
  readonly getInitials: (name: string) => string;
  readonly onSubmit: (values: SettingsProfileFormValues) => void;
}

export default function SettingsProfileTab({
  profileLoading,
  profile,
  profileForm,
  isSaving,
  getInitials,
  onSubmit,
}: SettingsProfileTabProps): JSX.Element {
  if (profileLoading) {
    return <div className="p-xl"><Skeleton count={5} /></div>;
  }

  const initials = getInitials(profile?.name || '');

  return (
    <Surface elevation={1} padding="lg" className="settings-card">
      <div className="flex items-center gap-md mb-md">
        <div
          className="flex items-center justify-center rounded font-bold text-lg"
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: profile?.avatarUrl ? `url(${profile.avatarUrl}) center/cover` : 'var(--color-primary)',
            color: '#fff',
            flexShrink: 0,
          }}
        >
          {!profile?.avatarUrl && initials}
        </div>
        <div>
          <div className="text-lg font-semibold">{profile?.name}</div>
          <div className="text-sm text-muted">{profile?.role}</div>
        </div>
      </div>

      <div className="border-t mb-md" />

      <Form
        form={profileForm}
        layout="vertical"
        onFinish={onSubmit}
        initialValues={{
          name: profile?.name,
          email: profile?.email,
          avatarUrl: profile?.avatarUrl,
        }}
      >
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: 'Please enter your name' }]}
        >
          <AntInput prefix={<User size={16} />} placeholder="Your name" />
        </Form.Item>

        <Form.Item label="Email" name="email">
          <AntInput disabled />
        </Form.Item>

        <Form.Item label="Avatar URL" name="avatarUrl">
          <AntInput placeholder="https://example.com/avatar.jpg" />
        </Form.Item>

        <Form.Item label="Role">
          <AntInput value={profile?.role} disabled />
        </Form.Item>

        <Form.Item>
          <Button
            variant="primary"
            fullWidth
            loading={isSaving}
            type="submit"
          >
            Save Changes
          </Button>
        </Form.Item>
      </Form>
    </Surface>
  );
}
