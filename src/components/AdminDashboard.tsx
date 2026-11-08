import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ADMIN_EMAIL } from '../constants/admin';
import {
  ShieldAlert,
  Users,
  MessageSquare,
  BookOpen,
  Coins,
  CheckCircle,
  Trash2,
  PlusCircle,
  Award,
  Clock,
  Sparkles,
  Search,
  Filter,
  ArrowLeft,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { BouncyButton } from './BouncyButton';

interface AdminDashboardProps {
  onBack: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const {
    user,
    feedbackList,
    updateFeedbackStatus,
    deleteFeedback,
    allUsers,
    adminUpdateUserCoins,
    adminUpdateUserLevel,
    allTopics,
    deleteCustomTopic,
    securityLogs,
    addCustomTopic
  } = useApp();

  const [activeTab, setActiveTab] = useState<'feedback' | 'users' | 'topics' | 'security'>('feedback');
  const [feedbackFilter, setFeedbackFilter] = useState<'all' | 'new' | 'reviewed'>('all');
  const [searchUser, setSearchUser] = useState('');

  const filteredFeedback = feedbackList.filter(f => {
    if (feedbackFilter === 'new') return f.status === 'new';
    if (feedbackFilter === 'reviewed') return f.status !== 'new';
    return true;
  });

  const filteredUsers = allUsers.filter(u =>
    u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.email.toLowerCase().includes(searchUser.toLowerCase())
  );

  const newFeedbackCount = feedbackList.filter(f => f.status === 'new').length;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

      {/* Top Admin Identity Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-2 border-indigo-500/40 rounded-3xl p-6 sm:p-8 text-white mb-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg shadow-yellow-500/30">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  Bosh Administrator Paneli
                </h1>
                <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Admin
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-1">
                Admin: <b>{user.name}</b> ({ADMIN_EMAIL}) — Tizim to'liq nazoratingiz ostida.
              </p>
            </div>
          </div>

          <BouncyButton
            variant="outline"
            size="sm"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={onBack}
            className="!bg-white/10 !border-white/20 !text-white hover:!bg-white/20"
          >
            Foydalanuvchi Ko'rinishiga Qaytish
          </BouncyButton>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-indigo-900/60">
          <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl">
            <div className="text-xs text-indigo-300 font-semibold flex items-center gap-1.5 mb-1">
              <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
              <span>Yangi Takliflar</span>
            </div>
            <div className="text-xl font-black text-white flex items-center gap-2">
              <span>{newFeedbackCount}</span>
              {newFeedbackCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full animate-pulse">
                  Yangi
                </span>
              )}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl">
            <div className="text-xs text-indigo-300 font-semibold flex items-center gap-1.5 mb-1">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Foydalanuvchilar</span>
            </div>
            <div className="text-xl font-black text-white">{allUsers.length} ta</div>
          </div>

          <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl">
            <div className="text-xs text-indigo-300 font-semibold flex items-center gap-1.5 mb-1">
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Jami Mavzular</span>
            </div>
            <div className="text-xl font-black text-white">{allTopics.length} ta</div>
          </div>

          <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl">
            <div className="text-xs text-indigo-300 font-semibold flex items-center gap-1.5 mb-1">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>Anti-Cheat Hodisalari</span>
            </div>
            <div className="text-xl font-black text-rose-400">{securityLogs.length} ta</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('feedback')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'feedback'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Kelgan Takliflar ({feedbackList.length})</span>
          {newFeedbackCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'users'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Foydalanuvchilar ({allUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('topics')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'topics'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Mavzular Nazorati ({allTopics.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'security'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Xavfsizlik & Anti-Cheat ({securityLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: FEEDBACK INBOX */}
      {activeTab === 'feedback' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
              <button
                onClick={() => setFeedbackFilter('all')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  feedbackFilter === 'all' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm' : 'text-slate-500'
                }`}
              >
                Barchasi ({feedbackList.length})
              </button>
              <button
                onClick={() => setFeedbackFilter('new')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  feedbackFilter === 'new' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm' : 'text-slate-500'
                }`}
              >
                Yangi ({newFeedbackCount})
              </button>
              <button
                onClick={() => setFeedbackFilter('reviewed')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  feedbackFilter === 'reviewed' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm' : 'text-slate-500'
                }`}
              >
                Ko'rib chiqilgan
              </button>
            </div>
          </div>

          {filteredFeedback.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800">
              <p className="text-slate-400 text-sm">Hozircha xabarlar yo'q.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredFeedback.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white dark:bg-slate-900 border rounded-3xl p-5 shadow-sm transition-all flex flex-col justify-between ${
                    item.status === 'new'
                      ? 'border-blue-300 dark:border-blue-700 ring-2 ring-blue-500/10'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                        {item.type}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{item.createdAt}</span>
                      </span>
                    </div>

                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mb-1">
                      {item.subject}
                    </h4>

                    <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-700 mb-3 leading-relaxed">
                      {item.content}
                    </p>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Yuboruvchi: <b>{item.userName}</b> ({item.userEmail})
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    {item.status === 'new' ? (
                      <button
                        onClick={() => updateFeedbackStatus(item.id, 'reviewed')}
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Ko'rib chiqildi deb belgilash</span>
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Ko'rib chiqilgan</span>
                      </span>
                    )}

                    <button
                      onClick={() => deleteFeedback(item.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-all"
                      title="O'chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: USERS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Foydalanuvchi qidirish..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <span className="text-xs font-semibold text-slate-400">
              Jami: {filteredUsers.length} nafar
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-100 dark:border-slate-800 text-slate-500 font-bold">
                <tr>
                  <th className="py-3 px-4">Foydalanuvchi</th>
                  <th className="py-3 px-4">Level</th>
                  <th className="py-3 px-4">Coinlar</th>
                  <th className="py-3 px-4">Yozilgan Essay</th>
                  <th className="py-3 px-4 text-right">Boshqaruv (Coin qo'shish / Ayirish)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-xl object-cover" />
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                            <span>{u.name}</span>
                            {u.role === 'admin' && (
                              <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-md">
                                ADMIN
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400">{u.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <select
                        value={u.level}
                        onChange={(e) => adminUpdateUserLevel(u.id, e.target.value as any)}
                        className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-blue-600"
                      >
                        {['A1', 'A2', 'B1', 'B2', 'C1'].map(lvl => (
                          <option key={lvl} value={lvl}>{lvl}</option>
                        ))}
                      </select>
                    </td>

                    <td className="py-3 px-4 font-black text-amber-600 flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5 text-amber-500" />
                      <span>{u.coins}</span>
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">
                      {u.completedEssays} ta
                    </td>

                    <td className="py-3 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => adminUpdateUserCoins(u.id, 50)}
                        className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 px-2.5 py-1 rounded-xl font-bold text-[11px] hover:bg-emerald-100"
                      >
                        +50 Coin
                      </button>
                      <button
                        onClick={() => adminUpdateUserCoins(u.id, -50)}
                        className="bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 px-2.5 py-1 rounded-xl font-bold text-[11px] hover:bg-rose-100"
                      >
                        -50 Coin
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: TOPICS MANAGEMENT */}
      {activeTab === 'topics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allTopics.map((topic) => (
              <div
                key={topic.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="bg-blue-600 text-white font-black text-[10px] px-2 py-0.5 rounded-lg">
                      {topic.level}
                    </span>
                    {topic.isCustom ? (
                      <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Foydalanuvchi: {topic.authorName || 'Maxsus'}
                      </span>
                    ) : (
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Standart
                      </span>
                    )}
                  </div>

                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mb-1.5 line-clamp-2">
                    {topic.title}
                  </h4>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                    {topic.prompt}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
                  <span>{topic.recommendedWords.min}-{topic.recommendedWords.max} so'z</span>
                  {topic.isCustom && (
                    <button
                      onClick={() => deleteCustomTopic(topic.id)}
                      className="text-rose-500 hover:text-rose-700 font-bold flex items-center gap-1 text-[11px]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>O'chirish</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SECURITY & ANTI-CHEAT LOGS */}
      {activeTab === 'security' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Anti-Cheat Xavfsizlik Jurnali
              </h3>
              <p className="text-xs text-slate-500">
                Imtihon paytida Alt+Tab bosgan, darchani almashtirgan yoki qoidani buzganlar
              </p>
            </div>
          </div>

          {securityLogs.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              Hozircha hech qanday qoidabuzarlik qayd etilmagan.
            </div>
          ) : (
            <div className="space-y-2.5">
              {securityLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        {log.userName} — <span className="text-rose-600 font-extrabold">{log.violation}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Mavzu: "{log.topicTitle}" • Vaqt: {log.timestamp}
                      </div>
                    </div>
                  </div>

                  <span className="bg-rose-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full">
                    {log.strikesCount}/3 Strike {log.wasAborted ? '(To\'xtatildi)' : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
