import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Download, MessageCircle, FileText, Eye, X, Receipt, Wallet, Search } from 'lucide-react';
import Layout from '../components/layout/Layout.jsx';
import { listBills, sendBillWhatsApp, downloadBill } from '../services/billService';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDateTime } from '../utils/formatDate';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Input from '../components/common/Input.jsx';
import Badge from '../components/common/Badge.jsx';
import Skeleton from '../components/common/Skeleton.jsx';
import Modal from '../components/common/Modal.jsx';

export default function Bills() {
  const { merchant } = useAuth();
  const [bills, setBills] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [selectedBill, setSelectedBill] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [sendingWhatsapp, setSendingWhatsapp] = useState(false);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const { data } = await listBills({ limit: 100 });
      setBills(data.data.bills);
    } catch (err) {
      // quiet error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const handleDownload = async (bill) => {
    try {
      await downloadBill(bill._id, `${bill.receiptNumber}.pdf`);
      toast.success('Receipt PDF download initiated');
    } catch (err) {
      toast.error('Failed to download PDF');
    }
  };

  const handleWhatsAppSend = async () => {
    if (!selectedBill) return;
    setSendingWhatsapp(true);
    try {
      const { data } = await sendBillWhatsApp(selectedBill._id);
      setShowWhatsApp(false);
      if (data.data.mode === 'twilio') {
        toast.success('Sent via WhatsApp');
      } else if (data.data.whatsappWebUrl) {
        window.open(data.data.whatsappWebUrl, '_blank');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send WhatsApp message');
    } finally {
      setSendingWhatsapp(false);
    }
  };

  const filteredBills = bills.filter(
    (b) =>
      b.receiptNumber.toLowerCase().includes(search.toLowerCase()) ||
      b.customerId?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout title="Generated Bills">
      <div className="space-y-6">
        
        {/* Header Description */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-up">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Ledger Bills</h2>
            <p className="text-sm text-slate-400 mt-0.5">View and share digital transaction receipts.</p>
          </div>
        </div>

        {/* Search */}
        <div className="animate-slide-up delay-1">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bills by receipt ID or customer name..."
            icon={Search}
          />
        </div>

        {/* List Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Skeleton variant="rect" className="h-44" />
            <Skeleton variant="rect" className="h-44" />
            <Skeleton variant="rect" className="h-44" />
          </div>
        ) : filteredBills.length === 0 ? (
          <Card animate={true} delayIdx={2} hoverable={false} className="text-center py-16 max-w-md mx-auto space-y-4">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-400 border border-slate-100/50">
              <FileText size={24} />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-slate-800">No bills generated yet</h3>
              <p className="text-xs text-slate-400 leading-relaxed px-4">
                Once transactions are confirmed, their receipts will show up here for downloading or sharing.
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBills.map((bill, idx) => {
              const isCredit = bill.type === 'CREDIT';
              return (
                <Card 
                  key={bill._id} 
                  delayIdx={idx} 
                  hoverable={true}
                  className="flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    {/* Bill Header */}
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100/50 text-blue-600 flex items-center justify-center">
                          <FileText size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm leading-tight">{bill.receiptNumber}</p>
                          <p className="text-xs text-slate-400 mt-0.5 font-medium">{bill.customerId?.name || 'Unknown'}</p>
                        </div>
                      </div>
                      
                      <Badge variant={isCredit ? 'danger' : 'success'}>
                        {bill.type}
                      </Badge>
                    </div>

                    {/* Receipt Specs info */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100/60 flex justify-between items-center text-xs">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Amount</span>
                      <span className={`font-extrabold text-sm ${isCredit ? 'text-rose-600' : 'text-sky-600'}`}>
                        {isCredit ? '+' : '-'}{formatCurrency(bill.amount)}
                      </span>
                    </div>
                    
                    <p className="text-[10px] text-slate-400 font-semibold">{formatDateTime(bill.createdAt)}</p>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex gap-2 mt-4 pt-3.5 border-t border-slate-50">
                    <Button 
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setSelectedBill(bill);
                        setShowPreview(true);
                      }} 
                      icon={Eye}
                      className="flex-1 !py-2.5"
                    >
                      Preview
                    </Button>
                    
                    <Button 
                      size="sm"
                      onClick={() => {
                        setSelectedBill(bill);
                        setShowWhatsApp(true);
                      }} 
                      icon={MessageCircle}
                      className="flex-1 !py-2.5 bg-sky-600 hover:bg-sky-700 border-none shadow-sm shadow-sky-500/5"
                    >
                      Share
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

      </div>

      {/* MODAL 1: RECEIPT PDF REPLICA PREVIEW */}
      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title="View Bill Receipt"
        icon={Receipt}
      >
        {selectedBill && (
          <div className="space-y-6 pt-2">
            
            {/* Invoice Header */}
            <div className="text-center pb-4 border-b-2 border-dashed border-slate-200">
              <h4 className="text-sm font-extrabold text-blue-600 tracking-wider uppercase">CREDLINK</h4>
              <p className="text-xs text-slate-400 mt-0.5">Digital Bahi-Khata</p>
              <p className="text-base font-bold text-slate-800 mt-2">{merchant?.businessName || 'Sharma General Store'}</p>
            </div>

            {/* Specs detail table */}
            <div className="space-y-4 text-sm font-medium">
              
              <div className="flex justify-between items-center text-xs text-slate-400 font-bold uppercase tracking-wider">
                <span>Receipt Code:</span>
                <span className="text-slate-800">{selectedBill.receiptNumber}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Customer</span>
                  <span className="text-slate-700 font-bold text-sm block mt-0.5">{selectedBill.customerId?.name || 'Customer'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Date & Time</span>
                  <span className="text-slate-700 font-bold text-xs block mt-0.5 leading-snug">{formatDateTime(selectedBill.createdAt)}</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-450">Transaction:</span>
                  <Badge variant={selectedBill.type === 'CREDIT' ? 'danger' : 'success'}>
                    {selectedBill.type === 'CREDIT' ? 'Credit Given' : 'Payment Received'}
                  </Badge>
                </div>

                <div className="flex justify-between items-center font-bold text-slate-800 text-sm border-t border-slate-100 pt-3">
                  <span>Transaction Amount:</span>
                  <span>{formatCurrency(selectedBill.amount)}</span>
                </div>

                <div className="flex justify-between items-center border-t border-slate-100 pt-3 text-slate-500">
                  <span>Previous Balance:</span>
                  <span>{formatCurrency(selectedBill.balanceBefore)}</span>
                </div>

                <div className="flex justify-between items-center font-extrabold text-base border-t border-slate-100 pt-3 text-slate-800">
                  <span>Ledger Balance:</span>
                  <span className={selectedBill.balanceAfter > 0 ? 'text-rose-600' : 'text-sky-600'}>
                    {formatCurrency(selectedBill.balanceAfter)}
                  </span>
                </div>
              </div>

            </div>

            {/* Receipt Footer Message */}
            <div className="text-center border-t border-slate-100 pt-4">
              <p className="text-xs text-slate-400 italic">"Thank you for your business."</p>
              <p className="text-[10px] text-slate-450 mt-0.5">Recorded digitally via CredLink ledger</p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button 
                onClick={() => {
                  setShowPreview(false);
                  setShowWhatsApp(true);
                }} 
                icon={MessageCircle}
                className="flex-1 bg-sky-600 hover:bg-sky-700 border-none shadow-sm shadow-sky-500/5 text-xs !py-3"
              >
                WhatsApp
              </Button>
              <Button 
                variant="secondary"
                onClick={() => handleDownload(selectedBill)} 
                icon={Download}
                className="flex-1 text-xs !py-3"
              >
                Download PDF
              </Button>
            </div>

          </div>
        )}
      </Modal>

      {/* MODAL 2: WHATSAPP EXPERIENCE MODAL */}
      <Modal
        isOpen={showWhatsApp}
        onClose={() => setShowWhatsApp(false)}
        title="Send Bill on WhatsApp? 📱"
        subtitle="Send a digital receipt link immediately"
        icon={MessageCircle}
      >
        {selectedBill && (
          <div className="space-y-4 pt-2">
            
            <div className="space-y-3.5 text-xs text-slate-500 font-medium">
              <div className="flex justify-between items-center text-slate-650">
                <span>Customer Name:</span>
                <strong className="text-slate-800 font-bold">{selectedBill.customerId?.name}</strong>
              </div>
              <div className="flex justify-between items-center text-slate-650">
                <span>Customer Phone:</span>
                <strong className="text-slate-800 font-bold">{selectedBill.customerId?.phone || '98XXXXXX12'}</strong>
              </div>

              {/* Message preview text-box */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Message Preview</label>
                <div className="w-full bg-sky-50/50 rounded-2xl p-4 border border-sky-100/50 text-sky-950 font-mono text-[11px] leading-relaxed whitespace-pre-wrap select-all">
                  {`Hello ${selectedBill.customerId?.name || 'Customer'},\nYour transaction has been recorded in CredLink.\n\nAmount: ${formatCurrency(selectedBill.amount)}\nType: ${selectedBill.type === 'CREDIT' ? 'Credit (Udhaar)' : 'Payment (Jama)'}\nCurrent Balance: ${formatCurrency(selectedBill.balanceAfter)}\n\nYour digital receipt is generated and stored securely.`}
                </div>
              </div>

              <p className="text-[10px] text-slate-450 text-center leading-relaxed">
                If the WhatsApp automated API fails, CredLink will open WhatsApp Web or WhatsApp App with the pre-filled message for sharing manually.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-2 pt-2">
              <Button 
                variant="secondary"
                onClick={() => setShowWhatsApp(false)} 
                className="flex-1 text-xs !py-3"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleWhatsAppSend} 
                disabled={sendingWhatsapp}
                icon={MessageCircle}
                className="flex-1 text-xs !py-3 bg-sky-600 hover:bg-sky-700 border-none shadow-sm shadow-sky-500/10"
              >
                {sendingWhatsapp ? 'Sending...' : 'Send WhatsApp'}
              </Button>
            </div>

          </div>
        )}
      </Modal>

    </Layout>
  );
}
