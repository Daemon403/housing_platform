'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HomeIcon, UserIcon, InboxIcon, HeartIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon, CalendarIcon } from '@heroicons/react/24/outline';

type TabType = 'overview' | 'listings' | 'bookings' | 'messages' | 'settings';

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const router = useRouter();

  const TabButton = ({ tab, icon: Icon, label }: { tab: TabType; icon: React.ElementType; label: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center w-full px-4 py-3 text-left rounded-lg ${
        activeTab === tab ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'
      }`}
    >
      <Icon className="h-5 w-5 mr-3" />
      {label}
    </button>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'listings':
        return <ListingsTab />;
      case 'bookings':
        return <BookingsTab />;
      case 'messages':
        return <MessagesTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="md:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-4 sticky top-8">
              <div className="flex items-center space-x-3 mb-8 p-2">
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <UserIcon className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium">John Doe</p>
                  <p className="text-sm text-gray-500">Student</p>
                </div>
              </div>
              
              <nav className="space-y-1">
                <TabButton tab="overview" icon={HomeIcon} label="Overview" />
                <TabButton tab="listings" icon={HomeIcon} label="My Listings" />
                <TabButton tab="bookings" icon={CalendarIcon} label="Bookings" />
                <TabButton tab="messages" icon={InboxIcon} label="Messages" />
                <TabButton tab="settings" icon={Cog6ToothIcon} label="Settings" />
              </nav>
            </div>
          </div>
          
          {/* Main content */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Tab components
const OverviewTab = () => (
  <div>
    <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-gray-500 text-sm">Active Listings</h3>
        <p className="text-2xl font-bold">3</p>
      </div>
      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="text-gray-500 text-sm">Upcoming Bookings</h3>
        <p className="text-2xl font-bold">2</p>
      </div>
      <div className="bg-purple-50 p-4 rounded-lg">
        <h3 className="text-gray-500 text-sm">Unread Messages</h3>
        <p className="text-2xl font-bold">5</p>
      </div>
    </div>
  </div>
);

const ListingsTab = () => (
  <div>
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold">My Listings</h2>
      <button className="btn-primary px-4 py-2">
        + Add New
      </button>
    </div>
    <div className="border rounded-lg p-4">
      <p>Your listings will appear here</p>
    </div>
  </div>
);

const BookingsTab = () => (
  <div>
    <h2 className="text-2xl font-bold mb-6">My Bookings</h2>
    <div className="border rounded-lg p-4">
      <p>Your bookings will appear here</p>
    </div>
  </div>
);

const MessagesTab = () => (
  <div>
    <h2 className="text-2xl font-bold mb-6">Messages</h2>
    <div className="border rounded-lg p-4">
      <p>Your messages will appear here</p>
    </div>
  </div>
);

const SettingsTab = () => (
  <div>
    <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
    <div className="border rounded-lg p-4">
      <p>Account settings will appear here</p>
    </div>
  </div>
);

export default DashboardPage;
