import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/AuthProvider';
import { supabase } from '../lib/supabase';
import { Scale, FileText, Clock, MessageSquare, Upload, AlertTriangle, CheckCircle, Loader2, Send, LogOut, User, Bell } from 'lucide-react';

interface CaseInfo {
  id: string; title: string; status: string; case_type: string; created_at: string;
  next_deadline?: string; next_deadline_label?: string;
}

interface Message {
  id: string; content: string; sender: 'client' | 'attorney' | 'ai'; created_at: string;
}

export default function ClientPortal() {
  const { user, signOut } = useAuth();
  const [cases, setCases] = useState<CaseInfo[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'messages'>('overview');

  useEffect(() => {
    loadClientData();
  }, []);

  const loadClientData = async () => {
    setLoading(true);
    try {
      const { data: casesData } = await supabase.from('cases').select('*').eq('client_email', user?.email).order('created_at', { ascending: false });
      if (casesData) setCases(casesData as any);

      const { data: msgs } = await supabase.from('case_messages').select('*').eq('client_email', user?.email).order('created_at', { ascending: true }).limit(50);
      if (msgs) setMessages(msgs as any);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    const msg = { content: newMessage, sender: 'client' as const, client_email: user?.email, created_at: new Date().toISOString(), id: crypto.randomUUID() };
    setMessages(prev => [...prev, msg]);
    setNewMessage('');
    await supabase.from('case_messages').insert({ content: newMessage, sender: 'client', client_email: user?.email });
  };

  const statusColor = (s: string) => {
    if (s === 'active') return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (s === 'pending') return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-blue-400" size={32} />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Client Portal</h1>
          <p className="text-slate-400">Welcome back, {user?.user_metadata?.full_name || user?.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-slate-400 hover:text-white relative">
            <Bell size={20} />
          </button>
          <button onClick={signOut} className="flex items-center gap-2 text-slate-400 hover:text-red-400 text-sm">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-700/60 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
              <Scale className="text-blue-400" size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{cases.length}</div>
              <div className="text-sm text-slate-400">Active Cases</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-700/60 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-amber-600/20 rounded-lg flex items-center justify-center">
              <Clock className="text-amber-400" size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{cases.filter(c => c.next_deadline).length}</div>
              <div className="text-sm text-slate-400">Upcoming Deadlines</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-700/60 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
              <MessageSquare className="text-green-400" size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{messages.length}</div>
              <div className="text-sm text-slate-400">Messages</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800 rounded-lg p-1 w-fit">
        {(['overview', 'documents', 'messages'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${activeTab === t ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            {t}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-4">
          {cases.length === 0 ? (
            <div className="bg-slate-900 border border-slate-700/60 rounded-xl p-8 text-center">
              <Scale className="mx-auto text-slate-600 mb-3" size={40} />
              <h3 className="text-white font-medium mb-1">No cases yet</h3>
              <p className="text-slate-400 text-sm">Your case information will appear here once your matter is opened.</p>
            </div>
          ) : cases.map(c => (
            <div key={c.id} className="bg-slate-900 border border-slate-700/60 rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white font-medium">{c.title}</h3>
                  <p className="text-slate-400 text-sm">{c.case_type}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full border ${statusColor(c.status)}`}>{c.status}</span>
              </div>
              {c.next_deadline && (
                <div className="flex items-center gap-2 text-amber-400 text-sm">
                  <AlertTriangle size={14} />
                  <span>Next deadline: {c.next_deadline_label} — {new Date(c.next_deadline).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="bg-slate-900 border border-slate-700/60 rounded-xl overflow-hidden">
          <div className="h-80 overflow-y-auto p-4 space-y-3">
            {messages.map(m => (
              <div key={m.id} className={`flex ${m.sender === 'client' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-xl px-4 py-2.5 text-sm ${m.sender === 'client' ? 'bg-blue-600 text-white' : m.sender === 'ai' ? 'bg-purple-600/20 text-purple-200 border border-purple-500/30' : 'bg-slate-800 text-slate-200'}`}>
                  {m.sender !== 'client' && <div className="text-xs font-medium mb-1 opacity-60">{m.sender === 'ai' ? '🤖 AI Assistant' : '⚖️ Attorney'}</div>}
                  {m.content}
                </div>
              </div>
            ))}
            {messages.length === 0 && <p className="text-slate-500 text-center py-8">No messages yet. Send a message to get started.</p>}
          </div>
          <div className="border-t border-slate-700/60 p-3 flex gap-2">
            <input value={newMessage} onChange={e => setNewMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:border-blue-500 outline-none text-sm"
              placeholder="Type a message..." />
            <button onClick={sendMessage} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2">
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="bg-slate-900 border border-slate-700/60 rounded-xl p-8 text-center">
          <Upload className="mx-auto text-slate-600 mb-3" size={40} />
          <h3 className="text-white font-medium mb-1">Document Portal</h3>
          <p className="text-slate-400 text-sm mb-4">Upload documents securely for your attorney to review.</p>
          <label className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer text-sm font-medium">
            <Upload size={16} /> Upload Document
            <input type="file" className="hidden" multiple />
          </label>
        </div>
      )}
    </div>
  );
}
