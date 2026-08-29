import { useState } from 'react';
import toast from 'react-hot-toast';
import { User, Store, Mail, Phone, Bell, Settings, LogOut, QrCode, Upload } from 'lucide-react';
import Layout from '../components/layout/Layout.jsx';
import { useAuth } from '../hooks/useAuth';
import { updateProfile, uploadQrCode, logout as logoutApi } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Input from '../components/common/Input.jsx';

export default function Profile() {
  const { merchant, refreshMerchant, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: merchant?.name || '',
    businessName: merchant?.businessName || '',
    phone: merchant?.phone || '',
  });
  const [saving, setSaving] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);
  const [notifications, setNotifications] = useState({
    whatsapp: true,
    email: false,
    sms: true,
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(form);
      await refreshMerchant();
      toast.success('Ledger profile updated successfully! 🎉');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleQrUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit');
      return;
    }

    setUploadingQr(true);
    const formData = new FormData();
    formData.append('qrCode', file);

    try {
      await uploadQrCode(formData);
      await refreshMerchant();
      toast.success('Payment QR Code uploaded successfully! 📱');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload QR Code');
    } finally {
      setUploadingQr(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch (e) {
      // ignore
    }
    logout();
    toast.success('Logged out successfully 👋');
    navigate('/login');
  };

  return (
    <Layout title="Profile Settings">
      <div className="max-w-xl mx-auto space-y-6">
        
        {/* Profile Card Banner */}
        <Card hoverable={false} animate={true} className="text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto text-blue-600 font-bold text-2xl shadow-sm">
            {merchant?.name ? merchant.name.charAt(0).toUpperCase() : 'M'}
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-800 leading-tight">{merchant?.name || 'Merchant'}</h3>
            <p className="text-xs text-blue-600 font-semibold mt-0.5">{merchant?.businessName || 'Kirana Store'}</p>
            <p className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1.5 font-medium">
              <Mail size={12} />
              <span>{merchant?.email}</span>
            </p>
          </div>
        </Card>

        {/* Profile Details Form */}
        <Card hoverable={false} animate={true} delayIdx={1} className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
            <Settings size={16} className="text-blue-600" />
            <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Business details</h4>
          </div>

          <form onSubmit={handleSave} className="space-y-4 pt-1">
            <Input
              label="Merchant Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              icon={User}
              required
            />

            <Input
              label="Business Name"
              value={form.businessName}
              onChange={(e) => setForm({ ...form, businessName: e.target.value })}
              icon={Store}
              required
            />

            <Input
              label="Phone Number"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              icon={Phone}
            />

            <Button 
              type="submit" 
              loading={saving} 
              className="w-full py-4 text-sm font-bold shadow-md shadow-blue-500/10"
            >
              Save Profile Settings
            </Button>
          </form>
        </Card>

        {/* UPI QR Code Section */}
        <Card hoverable={false} animate={true} delayIdx={2} className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
            <QrCode size={16} className="text-blue-600" />
            <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Payment QR Code</h4>
          </div>

          <div className="flex flex-col items-center space-y-4 pt-1">
            {merchant?.qrCodePath ? (
              <div className="relative group">
                <img
                  src={`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'}${merchant.qrCodePath}`}
                  alt="UPI QR Code"
                  className="w-48 h-48 object-contain border border-slate-100 rounded-2xl p-2 bg-white"
                />
                <div className="absolute inset-0 bg-slate-900/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs font-bold bg-slate-900/60 px-3 py-1.5 rounded-full">Change QR Code</span>
                </div>
              </div>
            ) : (
              <div className="w-48 h-48 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center p-4 bg-slate-50/50">
                <QrCode size={36} className="text-slate-350 stroke-[1.5] mb-2" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">No QR Code Uploaded</p>
                <p className="text-[10px] text-slate-400 mt-1">Uploaded QR will display automatically on customer PDF bills</p>
              </div>
            )}

            <div className="w-full">
              <label className="relative flex items-center justify-center gap-2 w-full py-3.5 border border-blue-100 rounded-2xl bg-blue-50/50 hover:bg-blue-50 text-blue-600 font-bold text-xs cursor-pointer transition-all active:scale-[0.98]">
                <Upload size={14} />
                <span>{uploadingQr ? 'Uploading...' : merchant?.qrCodePath ? 'Upload New QR Code' : 'Upload UPI QR Code Image'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleQrUpload}
                  disabled={uploadingQr}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </label>
            </div>
          </div>
        </Card>

        {/* Notifications & Settings Preference */}
        <Card hoverable={false} animate={true} delayIdx={3} className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
            <Bell size={16} className="text-blue-600" />
            <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Preferences</h4>
          </div>

          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-800">WhatsApp Automated Receipts</p>
                <p className="text-xs text-slate-400">Share bills instantly on customer phone numbers</p>
              </div>
              <input 
                type="checkbox" 
                checked={notifications.whatsapp}
                onChange={(e) => setNotifications({ ...notifications, whatsapp: e.target.checked })}
                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
              />
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <div>
                <p className="text-sm font-bold text-slate-800">Weekly Email Summaries</p>
                <p className="text-xs text-slate-400">Receive store ledger exports weekly via email</p>
              </div>
              <input 
                type="checkbox" 
                checked={notifications.email}
                onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
              />
            </div>
          </div>
        </Card>

        {/* Logout area */}
        <div className="pt-2 text-center animate-slide-up delay-4">
          <Button 
            variant="danger"
            onClick={handleLogout}
            icon={LogOut}
            className="w-full py-4 shadow-sm shadow-rose-500/5"
          >
            Sign Out from CredLink
          </Button>
        </div>

      </div>
    </Layout>
  );
}
