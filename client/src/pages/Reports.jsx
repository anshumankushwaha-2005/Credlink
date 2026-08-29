import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FileDown, Calendar, Filter, TrendingUp, TrendingDown, Wallet, Clock } from 'lucide-react';
import Layout from '../components/layout/Layout.jsx';
import { listCustomers } from '../services/customerService';
import { getCustomerReport, downloadCustomerStatement } from '../services/reportService';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Input from '../components/common/Input.jsx';
import Badge from '../components/common/Badge.jsx';
import Skeleton from '../components/common/Skeleton.jsx';

export default function Reports() {
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    listCustomers({ limit: 100 }).then(({ data }) => setCustomers(data.data.customers));
  }, []);

  const handleGenerate = async () => {
    if (!customerId) {
      toast.error('Please select a customer first');
      return;
    }
    setLoading(true);
    try {
      const { data } = await getCustomerReport(customerId, { from, to });
      setReport(data.data);
      toast.success('Report generated successfully!');
    } catch (err) {
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!customerId) return;
    setDownloading(true);
    try {
      const customer = customers.find((c) => c._id === customerId);
      await downloadCustomerStatement(customerId, { from, to }, `Statement-${customer?.name || 'customer'}.pdf`);
      toast.success('Statement downloaded successfully!');
    } catch (err) {
      toast.error('Failed to download statement');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Layout title="Ledger Reports">
      <div className="space-y-6">
        
        {/* Title Description */}
        <div className="animate-slide-up">
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Financial Reports</h2>
          <p className="text-sm text-slate-400 mt-0.5">Filter customer ledgers and export PDF statements.</p>
        </div>

        {/* Filter Card Section */}
        <Card animate={true} delayIdx={1} hoverable={false} className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
            <Filter size={16} className="text-blue-600" />
            <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Report Filters</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Customer select */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Customer Name</label>
              <select 
                value={customerId} 
                onChange={(e) => setCustomerId(e.target.value)} 
                className="input py-3 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-brand-500"
              >
                <option value="">Select customer</option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Date from */}
            <Input 
              label="From Date"
              type="date" 
              value={from} 
              onChange={(e) => setFrom(e.target.value)} 
            />

            {/* Date to */}
            <Input 
              label="To Date"
              type="date" 
              value={to} 
              onChange={(e) => setTo(e.target.value)} 
            />
          </div>

          <div className="pt-2">
            <Button 
              onClick={handleGenerate} 
              disabled={loading} 
              className="py-3 px-6 shadow-md shadow-blue-500/10 text-xs"
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </Button>
          </div>
        </Card>

        {/* Report Display */}
        {loading ? (
          <div className="space-y-6">
            <Skeleton variant="rect" className="h-20" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Skeleton variant="rect" className="h-20" />
              <Skeleton variant="rect" className="h-20" />
              <Skeleton variant="rect" className="h-20" />
            </div>
            <Skeleton variant="rect" className="h-60" />
          </div>
        ) : report ? (
          <div className="space-y-6 animate-fade-in">
            
            {/* Report Header summary */}
            <Card hoverable={false} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white">
              <div>
                <h3 className="font-extrabold text-slate-800 text-lg">{report.customer.name}</h3>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <Calendar size={12} />
                  <span>
                    Statement: {formatDate(report.period.from)} – {formatDate(report.period.to)}
                  </span>
                </p>
              </div>

              <Button 
                variant="secondary"
                size="sm"
                onClick={handleDownloadPdf} 
                disabled={downloading} 
                icon={FileDown}
                className="shrink-0 hover:bg-blue-50/50 hover:text-blue-700 hover:border-blue-100"
              >
                {downloading ? 'Downloading...' : 'Download Statement PDF'}
              </Button>
            </Card>

            {/* Financial Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Total Credit */}
              <Card hoverable={true} className="border-l-4 border-l-rose-500 bg-white">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Credit Given</p>
                    <p className="text-lg font-extrabold text-rose-600 mt-1">{formatCurrency(report.totals.totalCredit)}</p>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 border border-rose-100/50 flex items-center justify-center">
                    <TrendingUp size={16} />
                  </div>
                </div>
              </Card>

              {/* Total Payments */}
              <Card hoverable={true} className="border-l-4 border-l-sky-500 bg-white">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Paid Back</p>
                    <p className="text-lg font-extrabold text-sky-600 mt-1">{formatCurrency(report.totals.totalPayment)}</p>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-500 border border-sky-100/50 flex items-center justify-center">
                    <TrendingDown size={16} />
                  </div>
                </div>
              </Card>

              {/* Outstanding */}
              <Card hoverable={true} className="border-l-4 border-l-blue-500 bg-white">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Net Outstanding Balance</p>
                    <p className="text-lg font-extrabold text-blue-700 mt-1">{formatCurrency(report.totals.outstanding)}</p>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-500 border border-blue-100/50 flex items-center justify-center">
                    <Wallet size={16} />
                  </div>
                </div>
              </Card>

            </div>

            {/* List transactions */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-800 px-1">Statement Entries</h4>
              
              <Card hoverable={false} className="bg-white divide-y divide-slate-100 !p-0">
                {report.transactions.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-8">No transactions found in selected date range.</p>
                ) : (
                  <div className="divide-y divide-slate-100 px-6">
                    {report.transactions.map((tx) => {
                      const isCredit = tx.type === 'CREDIT';
                      return (
                        <div key={tx._id} className="py-3.5 flex justify-between items-center gap-3 text-sm">
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 text-sm leading-tight truncate">
                              {tx.description || tx.transcript || (isCredit ? 'Credit Entry' : 'Payment Received')}
                            </p>
                            <span className="text-[10px] text-slate-400 font-bold block mt-1 uppercase tracking-wider">
                              {formatDate(tx.createdAt)}
                            </span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className={`font-extrabold text-sm ${isCredit ? 'text-rose-600' : 'text-sky-600'}`}>
                              {isCredit ? '+' : '-'}{formatCurrency(tx.amount)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </div>

          </div>
        ) : (
          /* Empty statement page state */
          <Card hoverable={false} animate={true} delayIdx={2} className="text-center py-16 bg-white max-w-md mx-auto space-y-4">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-400 border border-slate-100/50">
              <Clock size={24} />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-slate-800">No report generated</h3>
              <p className="text-xs text-slate-400 leading-relaxed px-6">
                Select a customer and click "Generate Report" above to review statements and history details.
              </p>
            </div>
          </Card>
        )}

      </div>
    </Layout>
  );
}
