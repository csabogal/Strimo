
import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Onboarding from './views/Onboarding';
import Dashboard from './views/Dashboard';
import SubscriptionDetail from './views/SubscriptionDetail';
import MemberDetail from './views/MemberDetail';
import AddSubscription from './views/AddSubscription';
import SendReminder from './views/SendReminder';
import NotificationSettings from './views/NotificationSettings';

const App: React.FC = () => {
  return (
    <MemoryRouter>
      <Routes>
        <Route path="/" element={<Onboarding />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/subscription-detail/:id" element={<SubscriptionDetail />} />
        <Route path="/member-detail/:id" element={<MemberDetail />} />
        <Route path="/add-subscription" element={<AddSubscription />} />
        <Route path="/send-reminder/:memberId" element={<SendReminder />} />
        <Route path="/settings" element={<NotificationSettings />} />
      </Routes>
    </MemoryRouter>
  );
};

export default App;
