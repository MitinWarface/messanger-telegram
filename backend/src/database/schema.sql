-- Пользователи с флагом администратора
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT false,
 is_banned BOOLEAN DEFAULT false,
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMP DEFAULT NOW(),
 created_at TIMESTAMP DEFAULT NOW()
);

-- Чаты
CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(10) CHECK (type IN ('private', 'group', 'channel')) NOT NULL,
  title VARCHAR(255),
  avatar_url TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Участники чатов
CREATE TABLE IF NOT EXISTS chat_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(chat_id, user_id)
);

-- Сообщения с медиа
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  content TEXT,
  file_type VARCHAR(20),  -- image, video, document, etc.
  file_url TEXT,
  file_name VARCHAR(500),
  file_size INTEGER,
  mime_type VARCHAR(100),
  is_edited BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Логи SMS для админ-панели
CREATE TABLE IF NOT EXISTS sms_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  sms_id VARCHAR(100),
  status VARCHAR(20) NOT NULL,
  sent_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Действия администратора
CREATE TABLE IF NOT EXISTS admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES users(id) NOT NULL,
  action_type VARCHAR(50) NOT NULL,
  target_id UUID,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_users_admin ON users(is_admin);
CREATE INDEX IF NOT EXISTS idx_chats_created_by ON chats(created_by);
CREATE INDEX IF NOT EXISTS idx_messages_chat ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_sms_logs_phone ON sms_logs(phone_number);
CREATE INDEX IF NOT EXISTS idx_sms_logs_created ON sms_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin ON admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_type ON admin_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created ON admin_actions(created_at);

-- Автоназначение прав для администратора
INSERT INTO users (phone_number, is_admin) 
VALUES ('+7991816358', true)
ON CONFLICT (phone_number) 
DO UPDATE SET is_admin = true;