import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, ChevronRight, X, Phone, User, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../components/layout/Layout.jsx';
import { listCustomers, createCustomer } from '../services/customerService';
import { formatCurrency } from '../utils/formatCurrency';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Input from '../components/common/Input.jsx';
import Badge from '../components/common/Badge.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import Skeleton from '../components/common/Skeleton.jsx';
import Modal from '../components/common/Modal.jsx';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [saving, setSaving] = useState(false);

  const fetchCustomers = async (searchTerm = '') => {
    setLoading(true);
    try {
      const { data } = await listCustomers({ search: searchTerm, limit: 100 });
      setCustomers(data.data.customers);
    } catch (err) {
      // quiet error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchCustomers(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Customer name is required');
      return;
    }
    setSaving(true);
    try {
      await createCustomer(form);
      toast.success('Customer added successfully! 🎉');
      setShowModal(false);
      setForm({ name: '', phone: '', address: '' });
      fetchCustomers(search);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add customer');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout title="Customers">
      <div className="space-y-6">
        
        {/* Header Description */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-up">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Shop Customers</h2>
            <p className="text-sm text-slate-400 mt-0.5">Manage your customer credit ledger easily.</p>
          </div>
          
          <Button 
            onClick={() => setShowModal(true)} 
            icon={Plus}
            className="shadow-md shadow-blue-500/10 shrink-0"
          >
            Add Customer
          </Button>
        </div>

        {/* Search Input Bar */}
        <div className="animate-slide-up delay-1">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer by name or phone..."
            icon={Search}
          />
        </div>

        {/* Customer Cards Grid list */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Skeleton variant="rect" className="h-40" />
            <Skeleton variant="rect" className="h-40" />
            <Skeleton variant="rect" className="h-40" />
          </div>
        ) : customers.length === 0 ? (
          /* Empty state */
          <EmptyState
            title="No customers yet"
            description="Add your first customer and start tracking credit digitally using speech or manual logs."
            icon={User}
            actionText="Add Customer"
            onActionClick={() => setShowModal(true)}
            className="animate-slide-up delay-2"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {customers.map((c, idx) => {
              const hasOutstanding = c.currentBalance > 0;
              return (
                <Card 
                  key={c._id} 
                  delayIdx={idx} 
                  hoverable={true}
                  className="flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    {/* Header info */}
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-sm text-slate-600">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-800 text-sm truncate leading-tight group-hover:text-blue-600 transition-colors">{c.name}</h4>
                          <span className="text-[10px] text-slate-450 mt-1 flex items-center gap-1">
                            <Phone size={10} />
                            {c.phone || 'No phone'}
                          </span>
                        </div>
                      </div>

                      {/* Balance Badge status */}
                      <Badge variant={hasOutstanding ? 'danger' : 'success'}>
                        {hasOutstanding ? 'Outstanding' : 'Settled'}
                      </Badge>
                    </div>

                    {/* Balance display */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100/60 flex justify-between items-center">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Balance</span>
                      <span className={`font-extrabold text-sm ${hasOutstanding ? 'text-rose-600' : 'text-sky-600'}`}>
                        {formatCurrency(c.currentBalance)}
                      </span>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="mt-4 pt-3.5 border-t border-slate-50 flex justify-end">
                    <Link 
                      to={`/customers/${c._id}`} 
                      className="btn-secondary !py-2.5 !px-4 text-xs font-bold hover:bg-blue-55/55 hover:text-blue-700 hover:border-blue-100/50 flex items-center gap-1"
                    >
                      <span>View Details</span>
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

      </div>

      {/* Add Customer Modal Overlay */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Add Customer"
        subtitle="Register a customer to record credit ledger"
        icon={Plus}
      >
        <form onSubmit={handleCreate} className="space-y-4 pt-2">
          <Input
            label="Customer Name *"
            placeholder="Enter name (e.g. Ramesh Kumar)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            autoFocus
          />

          <Input
            label="Phone / WhatsApp Number"
            type="tel"
            placeholder="10-digit mobile (e.g. 9812345678)"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />

          <Input
            label="Address (Optional)"
            placeholder="Enter shop/residential address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />

          <Button 
            type="submit" 
            loading={saving} 
            className="w-full py-4 text-sm font-bold shadow-md shadow-blue-500/10"
          >
            Save Customer Info
          </Button>
        </form>
      </Modal>
    </Layout>
  );
}
