import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import type { FormProps } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

// Types
interface AuthProps {
  onAuthSuccess?: (email: string) => void;
}

interface FormValues {
  email: string;
  password: string;
  fullName?: string;
}

// Styled Components
const AuthContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  padding: 20px;
`;

const AuthCard = styled(Card)`
  width: 100%;
  max-width: 420px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

  .ant-card-body {
    padding: 32px;
  }
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 24px;
  background: #f8fafc;
  border-radius: 12px;
  padding: 4px;
  border: 1px solid #e2e8f0;
`;

interface TabButtonProps {
  active: boolean;
}

const TabButton = styled.button<TabButtonProps>`
  flex: 1;
  padding: 10px 16px;
  border: none;
  background: ${props => props.active ? '#667eea' : 'transparent'};
  color: ${props => props.active ? 'white' : '#64748b'};
  border-radius: 8px;
  font-weight: ${props => props.active ? '500' : '400'};
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.active ? '#667eea' : '#f1f5f9'};
    color: ${props => props.active ? 'white' : '#334155'};
  }
`;

const HeaderSection = styled.div`
  text-align: center;
  margin-bottom: 24px;

  .title {
    color: #1e293b;
    margin-bottom: 8px !important;
    font-weight: 600;
    font-size: 24px;
  }

  .subtitle {
    color: #64748b;
    font-size: 14px;
    margin: 0;
  }
`;

// Preserve Form generics when styling with styled-components
type StyledFormProps = Omit<FormProps<FormValues>, 'children'> & { children?: React.ReactNode };
const StyledForm = styled((props: StyledFormProps) => (
  <Form<FormValues> {...props} />
))`
  .ant-form-item {
    margin-bottom: 16px;
  }

  .ant-form-item-label > label {
    color: #334155;
    font-weight: 500;
    font-size: 14px;
  }

  .ant-input-affix-wrapper,
  .ant-input {
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    transition: all 0.2s ease;
    padding: 10px 12px;
    height: auto;

    &:hover {
      border-color: #667eea;
    }

    &:focus,
    &.ant-input-affix-wrapper-focused {
      border-color: #667eea;
      box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
    }
  }

  .ant-input-prefix {
    color: #94a3b8;
    margin-right: 8px;
  }
`;

const StyledButton = styled(Button)`
  &.ant-btn-primary {
    background: #667eea;
    border: none;
    border-radius: 8px;
    height: 40px;
    font-weight: 500;
    font-size: 14px;
    transition: all 0.2s ease;

    &:hover {
      background: #5a67d8;
    }

    &:disabled {
      background: #94a3b8;
    }
  }
`;

const FloatingElements = styled.div`
  display: none;
`;

// Auth Component
const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [form] = Form.useForm<FormValues>();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();

  const handleSubmit = async (values: FormValues): Promise<void> => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate success
      const normalizedEmail = values.email.trim();
      localStorage.setItem('auth.token', `demo-token-${Date.now()}`);
      localStorage.setItem('auth.email', normalizedEmail);
      
      if (activeTab === 'login') {
        messageApi.success('Signed in successfully!');
        onAuthSuccess?.(normalizedEmail);
        navigate('/', { replace: true });
      } else {
        messageApi.success('Account created successfully!');
        // Switch to login tab after successful registration
        setTimeout(() => {
          setActiveTab('login');
          form.resetFields();
        }, 1500);
      }
      
    } catch (error) {
      messageApi.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTabChange = (tab: 'login' | 'register'): void => {
    setActiveTab(tab);
    form.resetFields();
  };

  return (
    <AuthContainer>
      {contextHolder}
      <FloatingElements>
        <div className="floating-shape"></div>
        <div className="floating-shape"></div>
        <div className="floating-shape"></div>
        <div className="floating-shape"></div>
      </FloatingElements>
      
      <AuthCard>
        <HeaderSection>
          <Title level={2} className="title">
            {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
          </Title>
          <Text className="subtitle">
            {activeTab === 'login' 
              ? 'Sign in to access your dashboard' 
              : 'Join us to get started'}
          </Text>
        </HeaderSection>

        <TabContainer>
          <TabButton 
            active={activeTab === 'login'} 
            onClick={() => handleTabChange('login')}
            type="button"
          >
            Sign In
          </TabButton>
          <TabButton 
            active={activeTab === 'register'} 
            onClick={() => handleTabChange('register')}
            type="button"
          >
            Sign Up
          </TabButton>
        </TabContainer>

        <StyledForm
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
        >
          {activeTab === 'register' && (
            <Form.Item
              label="Full Name"
              name="fullName"
              rules={[
                { required: true, message: 'Please enter your full name' },
                { min: 2, message: 'Full name must be at least 2 characters' }
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Enter your full name"
                size="large"
              />
            </Form.Item>
          )}

          <Form.Item
            label="Email Address"
            name="email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email address' }
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Enter your email address"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: 'Please enter your password' },
              { min: 6, message: 'Password must be at least 6 characters' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter your password"
              size="large"
              iconRender={(visible: boolean) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          <Form.Item style={{ marginTop: '24px', marginBottom: 0 }}>
            <StyledButton
              type="primary"
              htmlType="submit"
              loading={isSubmitting}
              block
              size="large"
            >
              {isSubmitting 
                ? (activeTab === 'login' ? 'Signing in...' : 'Creating account...') 
                : (activeTab === 'login' ? 'Sign In' : 'Create Account')
              }
            </StyledButton>
          </Form.Item>
        </StyledForm>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Text style={{ color: '#64748b', fontSize: '13px' }}>
            {activeTab === 'login' 
              ? "Don't have an account? " 
              : "Already have an account? "}
            <Text 
              style={{ 
                color: '#667eea', 
                cursor: 'pointer', 
                fontWeight: '500',
                textDecoration: 'underline' 
              }}
              onClick={() => handleTabChange(activeTab === 'login' ? 'register' : 'login')}
            >
              {activeTab === 'login' ? 'Sign up here' : 'Sign in here'}
            </Text>
          </Text>
        </div>
      </AuthCard>
    </AuthContainer>
  );
};

export default Auth;