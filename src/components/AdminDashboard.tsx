'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Users, Activity, Settings, AlertTriangle, Play, Pause, Calendar, Eye, Edit3, MoreVertical } from 'lucide-react';

// Import your bot management system
import { botManager, BotProfile, getAdminDashboardData } from '../lib/bot-management-system';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(getAdminDashboardData());
  const [selectedBot, setSelectedBot] = useState<BotProfile | null>(null);
  const [showBotModal, setShowBotModal] = useState(false);
  const [emergencyConfirm, setEmergencyConfirm] = useState(false);

  const refreshData = () => {
    setDashboardData(getAdminDashboardData());
  };

  const handleBotToggle = (botId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    if (newStatus === 'ACTIVE') {
      botManager.activateBot(botId, 'admin');
    } else {
      botManager.deactivateBot(botId, 'admin');
    }
    refreshData();
  };

  const handleEmergencyStop = () => {
    if (emergencyConfirm) {
      botManager.emergencyStopAll('admin');
      setEmergencyConfirm(false);
      refreshData();
    } else {
      setEmergencyConfirm(true);
      setTimeout(() => setEmergencyConfirm(false), 3000);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-600 bg-green-100';
      case 'INACTIVE': return 'text-gray-600 bg-gray-100';
      case 'MANUAL': return 'text-blue-600 bg-blue-100';
      case 'SCHEDULED': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getReputationColor = (reputation: string) => {
    switch (reputation) {
      case 'Legend': return 'text-yellow-600 bg-yellow-100';
      case 'Expert': return 'text-red-600 bg-red-100';
      case 'Veteran': return 'text-blue-600 bg-blue-100';
      case 'Rising Star': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const BotModal = ({ bot, onClose }: { bot: BotProfile; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{bot.username}</h3>
              <p className="text-gray-600">{bot.realName} • {bot.age} • {bot.location}</p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Background</h4>
              <p className="text-gray-700 text-sm">{bot.background}</p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Bio</h4>
              <p className="text-gray-700 text-sm">{bot.bio}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Expertise</h4>
                <div className="flex flex-wrap gap-1">
                  {bot.expertise.map((skill, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Specialties</h4>
                <div className="flex flex-wrap gap-1">
                  {bot.specialties.map((specialty, idx) => (
                    <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className="text-lg font-bold text-gray-900">{bot.coinBalance}</div>
                <div className="text-xs text-gray-600">Coins</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className="text-lg font-bold text-gray-900">{bot.postsPerDay}</div>
                <div className="text-xs text-gray-600">Posts/Day</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className="text-lg font-bold text-gray-900">{bot.responseRate}%</div>
                <div className="text-xs text-gray-600">Response Rate</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">AI Prompt (Preview)</h4>
              <div className="bg-gray-50 p-3 rounded text-xs text-gray-700 max-h-32 overflow-y-auto">
                {bot.aiPrompt.substring(0, 300)}...
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <button 
                onClick={() => handleBotToggle(bot.id, bot.status)}
                className={`flex-1 py-2 px-4 rounded font-medium ${
                  bot.status === 'ACTIVE' 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {bot.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
                Edit Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-8 w-8 text-indigo-600" />
          <h1 className="text-3xl font-bold text-gray-900">AlphaRise Admin</h1>
        </div>
        <p className="text-gray-600">Bot Management & Community Control Center</p>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{dashboardData.stats.total}</div>
              <div className="text-sm text-gray-600">Total Bots</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Activity className="h-8 w-8 text-green-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{dashboardData.stats.byStatus.active}</div>
              <div className="text-sm text-gray-600">Active Bots</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-yellow-600 font-bold">C</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{dashboardData.stats.totalCoins.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Coins</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Settings className="h-8 w-8 text-purple-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{Math.round(dashboardData.stats.averageResponseRate)}%</div>
              <div className="text-sm text-gray-600">Avg Response Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Controls */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Emergency Controls</h3>
              <p className="text-sm text-gray-600">System-wide bot management</p>
            </div>
          </div>
          <button
            onClick={handleEmergencyStop}
            className={`px-6 py-2 rounded font-medium transition-colors ${
              emergencyConfirm 
                ? 'bg-red-600 text-white' 
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
          >
            {emergencyConfirm ? 'CONFIRM STOP ALL' : 'Emergency Stop All Bots'}
          </button>
        </div>
      </div>

      {/* Bot Grid */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Bot Management</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bot</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reputation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Activity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dashboardData.bots.map((bot) => (
                <tr key={bot.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-semibold text-sm">
                          {bot.username.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{bot.username}</div>
                        <div className="text-sm text-gray-500">{bot.realName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(bot.status)}`}>
                      {bot.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getReputationColor(bot.reputation)}`}>
                      {bot.reputation}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{bot.postsPerDay} posts/day</div>
                    <div className="text-xs text-gray-400">Last: {bot.lastActive}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{bot.responseRate}% response rate</div>
                    <div className="text-xs text-gray-500">{bot.coinBalance} coins</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleBotToggle(bot.id, bot.status)}
                        className={`p-1 rounded hover:bg-gray-100 ${
                          bot.status === 'ACTIVE' ? 'text-red-600' : 'text-green-600'
                        }`}
                        title={bot.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      >
                        {bot.status === 'ACTIVE' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedBot(bot);
                          setShowBotModal(true);
                        }}
                        className="p-1 rounded hover:bg-gray-100 text-blue-600"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        className="p-1 rounded hover:bg-gray-100 text-gray-600"
                        title="More Options"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="p-6">
          {dashboardData.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm">
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600">{activity.timestamp}</span>
                  <span className="text-gray-900">
                    Bot <strong>{activity.botId}</strong> status changed to <strong>{activity.newStatus}</strong>
                  </span>
                  {activity.reason && (
                    <span className="text-gray-500">({activity.reason})</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No recent activity</p>
          )}
        </div>
      </div>

      {/* Bot Modal */}
      {showBotModal && selectedBot && (
        <BotModal 
          bot={selectedBot} 
          onClose={() => {
            setShowBotModal(false);
            setSelectedBot(null);
          }} 
        />
      )}
    </div>
  );
};

export default AdminDashboard;