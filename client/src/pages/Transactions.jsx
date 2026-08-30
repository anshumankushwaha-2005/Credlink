import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Search, Download, MessageCircle, FileText, Calendar, Filter, Clock } from 'lucide-react';
import Layout from '../components/layout/Layout.jsx';
import { listTransactions } from '../services/transactionService';
import { downloadBill, sendBillWhatsApp } from '../services/billService';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDateTime } from '../utils/formatDate';
import Card from '../components/common/Card.jsx';
import Input from '../components/common/Input.jsx';
import Badge from '../components/common/Badge.jsx';
import Skeleton from '../components/common/Skeleton.jsx';
import { useTranslation } from '../context/LanguageContext';

const localTxTranslations = {
  en: {
    ledgerHistory: "Ledger History",
    ledgerHistoryDesc: "Chronological record of all shop credit and payments.",
    searchPlaceholder: "Search transactions by customer name...",
    allTransactions: "All Transactions",
    creditOnly: "Credit Only (Udhaar)",
    paymentOnly: "Payments Only (Mila)",
    noTransactionsTitle: "No transactions found",
    noTransactionsDesc: "Try clearing search filters or add a new entry via the dashboard voice recorder.",
    amountLabel: "Amount:",
    balanceAfterLabel: "Balance after:",
    receiptTitle: "Receipt",
    downloadReceipt: "Download PDF Receipt",
    shareWhatsApp: "Share on WhatsApp",
    pdfSuccess: "PDF download initiated",
    pdfFailed: "Failed to download PDF",
    whatsappSuccess: "Sent via WhatsApp",
    whatsappFailed: "Failed to send WhatsApp message",
    unknown: "Unknown",
    credit: "Credit (Udhaar)",
    payment: "Payment (Jama)"
  },
  hi: {
    ledgerHistory: "बही-खाता इतिहास",
    ledgerHistoryDesc: "दुकान के सभी उधार और भुगतानों का कालानुक्रमिक रिकॉर्ड।",
    searchPlaceholder: "ग्राहक के नाम से लेन-देन खोजें...",
    allTransactions: "सभी लेन-देन",
    creditOnly: "केवल उधार (Udhaar)",
    paymentOnly: "केवल भुगतान (Mila)",
    noTransactionsTitle: "कोई लेन-देन नहीं मिला",
    noTransactionsDesc: "खोज फ़िल्टर साफ़ करने का प्रयास करें या डैशबोर्ड वॉयस रिकॉर्डर के माध्यम से एक नई प्रविष्टि जोड़ें।",
    amountLabel: "राशि:",
    balanceAfterLabel: "बाद का शेष:",
    receiptTitle: "रसीद",
    downloadReceipt: "पीडीएफ रसीद डाउनलोड करें",
    shareWhatsApp: "व्हाट्सएप पर साझा करें",
    pdfSuccess: "पीडीएफ डाउनलोड शुरू हुआ",
    pdfFailed: "पीडीएफ डाउनलोड करने में विफल",
    whatsappSuccess: "व्हाट्सएप द्वारा भेजा गया",
    whatsappFailed: "व्हाट्सएप संदेश भेजने में विफल",
    unknown: "अअज्ञात",
    credit: "उधार (Credit)",
    payment: "भुगतान (Payment)"
  },
  hinglish: {
    ledgerHistory: "Ledger History",
    ledgerHistoryDesc: "Shop ke saare credit aur payment entries ka record.",
    searchPlaceholder: "Customer name se search karein...",
    allTransactions: "Saare Transactions",
    creditOnly: "Credit Only (Udhaar)",
    paymentOnly: "Payment Only (Mila)",
    noTransactionsTitle: "Koyi entry nahi mili",
    noTransactionsDesc: "Search filters clear karke dekhein ya dashboard recorder se naya entry jodein.",
    amountLabel: "Amount:",
    balanceAfterLabel: "Baad ka balance:",
    receiptTitle: "Receipt",
    downloadReceipt: "PDF download karein",
    shareWhatsApp: "WhatsApp par share karein",
    pdfSuccess: "PDF download shuru ho gaya",
    pdfFailed: "PDF download failed",
    whatsappSuccess: "WhatsApp par send ho gaya",
    whatsappFailed: "WhatsApp message send failed",
    unknown: "Unknown",
    credit: "Credit (Udhaar)",
    payment: "Payment (Jama)"
  },
  mr: {
    ledgerHistory: "खातेवही इतिहास",
    ledgerHistoryDesc: "दुकानाच्या सर्व उधारी आणि पेमेंटची कालानुक्रमिक नोंद.",
    searchPlaceholder: "ग्राहकाच्या नावाने व्यवहार शोधा...",
    allTransactions: "सर्व व्यवहार",
    creditOnly: "फक्त उधार (Udhaar)",
    paymentOnly: "फक्त जमा (Mila)",
    noTransactionsTitle: "कोणतेही व्यवहार आढळले नाहीत",
    noTransactionsDesc: "शोध फिल्टर साफ करण्याचा प्रयत्न करा किंवा डॅशबोर्ड वॉयस रेकॉर्डरद्वारे नवीन नोंद जोडा.",
    amountLabel: "रक्कम:",
    balanceAfterLabel: "व्यवहारानंतर शिल्लक:",
    receiptTitle: "पावती",
    downloadReceipt: "पीडीएफ पावती डाउनलोड करा",
    shareWhatsApp: "व्हॉट्सॲपवर शेअर करा",
    pdfSuccess: "पीडीएफ डाउनलोड सुरू झाले",
    pdfFailed: "पीडीएफ डाउनलोड करण्यात अयशस्वी",
    whatsappSuccess: "व्हॉट्सॲपवर पाठवले",
    whatsappFailed: "व्हॉट्सॲप संदेश पाठविण्यात अयशस्वी",
    unknown: "अज्ञात",
    credit: "उधार (Credit)",
    payment: "जमा (Payment)"
  },
  gu: {
    ledgerHistory: "ખાતાવહી ઇતિહાસ",
    ledgerHistoryDesc: "દુકાનની તમામ ઉધારી અને ચૂકવણીનો કાલક્રમિક રેકોર્ડ.",
    searchPlaceholder: "ગ્રાહકના નામથી વ્યવહાર શોધો...",
    allTransactions: "તમામ વ્યવહારો",
    creditOnly: "માત્ર ઉધાર (Udhaar)",
    paymentOnly: "માત્ર ચૂકવણી (Mila)",
    noTransactionsTitle: "કોઈ વ્યવહાર મળ્યો નથી",
    noTransactionsDesc: "શોધ ફિલ્ટર્સ સાફ કરવાનો પ્રયાસ કરો અથવા ડેશબોર્ડ વૉઇસ રેકોર્ડર દ્વારા નવી એન્ટ્રી ઉમેરો.",
    amountLabel: "રકમ:",
    balanceAfterLabel: "વ્યવહાર પછીની બાકી:",
    receiptTitle: "રસીદ",
    downloadReceipt: "પીડીએફ રસીદ ડાઉનલોડ કરો",
    shareWhatsApp: "વોટ્સએપ પર શેર કરો",
    pdfSuccess: "પીડીએફ ડાઉનલોડ શરૂ થયું",
    pdfFailed: "પીડીએફ ડાઉનલોડ કરવામાં નિષ્ફળ",
    whatsappSuccess: "વોટ્સએપ પર મોકલાયું",
    whatsappFailed: "વોટ્સએપ સંદેશ મોકલવામાં નિષ્ફળ",
    unknown: "અજ્ઞાત",
    credit: "ઉધાર (Credit)",
    payment: "ચૂકવણી (Payment)"
  },
  ta: {
    ledgerHistory: "பேரேடு வரலாறு",
    ledgerHistoryDesc: "கடையின் அனைத்து கடன் மற்றும் கொடுப்பனவுகளின் காலவரிசை பதிவு.",
    searchPlaceholder: "வாடிக்கையாளர் பெயர் மூலம் பரிவர்த்தனைகளைத் தேடவும்...",
    allTransactions: "அனைத்து பரிவர்த்தனைகளும்",
    creditOnly: "கடன் மட்டும் (Udhaar)",
    paymentOnly: "பணம் செலுத்தியது மட்டும் (Mila)",
    noTransactionsTitle: "பரிவர்த்தனைகள் எதுவும் இல்லை",
    noTransactionsDesc: "தேடல் வடிப்பான்களை அழிக்க முயற்சிக்கவும் அல்லது முகப்பு குரல் பதிவி மூலம் புதிய பதிவைச் சேர்க்கவும்.",
    amountLabel: "தொகை:",
    balanceAfterLabel: "பரிவர்த்தனைக்கு பிந்தைய இருப்பு:",
    receiptTitle: "ரசீது",
    downloadReceipt: "PDF ரசீதைப் பதிவிறக்கவும்",
    shareWhatsApp: "வாட்ஸ்அப்பில் பகிரவும்",
    pdfSuccess: "PDF பதிவிறக்கம் தொடங்கப்பட்டது",
    pdfFailed: "PDF பதிவிறக்கம் தோல்வியடைந்தது",
    whatsappSuccess: "வாட்ஸ்அப் மூலம் அனுப்பப்பட்டது",
    whatsappFailed: "வாட்ஸ்அப் செய்தி அனுப்புவதில் தோல்வி",
    unknown: "அறியப்படாத",
    credit: "கடன் (Credit)",
    payment: "பணம் செலுத்தியது (Payment)"
  },
  te: {
    ledgerHistory: "ఖాతా చరిత్ర",
    ledgerHistoryDesc: "షాప్ యొక్క అన్ని అప్పులు మరియు చెల్లింపుల వరుస రికార్డు.",
    searchPlaceholder: "కస్టమర్ పేరుతో లావాదేవీలను వెతకండి...",
    allTransactions: "అన్ని లావాదేవీలు",
    creditOnly: "అప్పు మాత్రమే (Udhaar)",
    paymentOnly: "చెల్లింపులు మాత్రమే (Mila)",
    noTransactionsTitle: "కనుగొనబడలేదు",
    noTransactionsDesc: "శోధన ఫిల్టర్లను తొలగించండి లేదా డ్యాష్‌బోర్డ్ వాయిస్ రికార్డర్ ద్వారా కొత్త లావాదేవీని జోడించండి.",
    amountLabel: "మొత్తం:",
    balanceAfterLabel: "లావాదేవీ తర్వాత నిల్వ:",
    receiptTitle: "రశీదు",
    downloadReceipt: "PDF రశీదును డౌన్‌లోడ్ చేయి",
    shareWhatsApp: "వాట్సాప్‌లో భాగస్వామ్యం చేయి",
    pdfSuccess: "PDF డౌన్‌లోడ్ ప్రారంభించబడింది",
    pdfFailed: "PDF డౌన్‌లోడ్ చేయడం విఫలమైంది",
    whatsappSuccess: "వాట్సాప్ ద్వారా పంపబడింది",
    whatsappFailed: "వాట్సాప్ సందేశం పంపడం విఫలమైంది",
    unknown: "తెలియదు",
    credit: "అప్పు (Credit)",
    payment: "చెల్లింపు (Payment)"
  },
  bn: {
    ledgerHistory: "হিসাব খাতার ইতিহাস",
    ledgerHistoryDesc: "দোকানের সকল বাকী ও পেমেন্টের তারিখভিত্তিক রেকর্ড।",
    searchPlaceholder: "গ্রাহকের নাম দিয়ে লেনদেন খুঁজুন...",
    allTransactions: "সকল লেনদেন",
    creditOnly: "শুধুমাত্র বাকী (Udhaar)",
    paymentOnly: "শুধুমাত্র পেমেন্ট (Mila)",
    noTransactionsTitle: "কোনো লেনদেন পাওয়া যায়নি",
    noTransactionsDesc: "অনুগ্রহ করে সার্চ ফিল্টার পরিবর্তন করুন অথবা ড্যাশবোর্ড ভয়েস রেকর্ডের মাধ্যমে নতুন লেনদেন যোগ করুন।",
    amountLabel: "পরিমাণ:",
    balanceAfterLabel: "পরবর্তী ব্যালেন্স:",
    receiptTitle: "রসিদ",
    downloadReceipt: "পিডিএফ রসিদ ডাউনলোড করুন",
    shareWhatsApp: "হোয়াটসঅ্যাপে শেয়ার করুন",
    pdfSuccess: "পিডিএফ ডাউনলোড শুরু হয়েছে",
    pdfFailed: "পিডিএফ ডাউনলোড করতে ব্যর্থ",
    whatsappSuccess: "হোয়াটসঅ্যাপের মাধ্যমে পাঠানো হয়েছে",
    whatsappFailed: "হোয়াটসঅ্যাপ বার্তা পাঠাতে ব্যর্থ",
    unknown: "অজানা",
    credit: "বাকী (Credit)",
    payment: "পেমেন্ট (Payment)"
  },
  pa: {
    ledgerHistory: "ਖਾਤਾ ਵਹੀ ਦਾ ਇਤਿਹਾਸ",
    ledgerHistoryDesc: "ਦੁਕਾਨ ਦੇ ਸਾਰੇ ਉਧਾਰ ਅਤੇ ਭੁਗਤਾਨਾਂ ਦਾ ਕ੍ਰਮਵਾਰ ਰਿਕਾਰਡ।",
    searchPlaceholder: "ਗਾਹਕ ਦੇ ਨਾਮ ਨਾਲ ਲੈਣ-ਦੇਣ ਲੱਭੋ...",
    allTransactions: "ਸਾਰੇ ਲੈਣ-ਦੇਣ",
    creditOnly: "ਸਿਰਫ ਉਧਾਰ (Udhaar)",
    paymentOnly: "ਸਿਰਫ ਭੁਗਤਾਨ (Mila)",
    noTransactionsTitle: "ਕੋਈ ਲੈਣ-ਦੇਣ ਨਹੀਂ ਮਿਲਿਆ",
    noTransactionsDesc: "ਖੋਜ ਫਿਲਟਰਾਂ ਨੂੰ ਹਟਾਓ ਜਾਂ ਡੈਸ਼ਬੋਰਡ ਵੌਇਸ ਰਿਕਾਰਡਰ ਰਾਹੀਂ ਨਵੀਂ ਐਂਟਰੀ ਜੋੜੋ।",
    amountLabel: "ਰਕਮ:",
    balanceAfterLabel: "ਬਾਅਦ ਦਾ ਬੈਲੰਸ:",
    receiptTitle: "ਰਸੀਦ",
    downloadReceipt: "PDF ਰਸੀਦ ਡਾਊਨਲੋਡ ਕਰੋ",
    shareWhatsApp: "ਵਟਸਐਪ 'ਤੇ ਸਾਂਝਾ ਕਰੋ",
    pdfSuccess: "PDF ਡਾਊਨਲੋਡ ਸ਼ੁਰੂ ਹੋਇਆ",
    pdfFailed: "PDF ਡਾਊਨਲੋਡ ਕਰਨ ਵਿੱਚ ਅਸਫਲ",
    whatsappSuccess: "ਵਟਸਐਪ ਰਾਹੀਂ ਭੇਜਿਆ ਗਿਆ",
    whatsappFailed: "ਵਟਸਐਪ ਸੁਨੇਹਾ ਭੇਜਣ ਵਿੱਚ ਅਸਫਲ",
    unknown: "ਅਣਜਾਣ",
    credit: "ਉਧਾਰ (Credit)",
    payment: "ਭੁਗਤਾਨ (Payment)"
  }
};

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const { language } = useTranslation();

  const tt = (key) => {
    const dict = localTxTranslations[language] || localTxTranslations['en'];
    return dict[key] || localTxTranslations['en'][key] || key;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await listTransactions({ search, type: typeFilter, limit: 100 });
      setTransactions(data.data.transactions);
    } catch (err) {
      // quiet error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchData, 300);
    return () => clearTimeout(t);
  }, [search, typeFilter]);

  const handleDownload = async (tx) => {
    try {
      await downloadBill(tx._id, `${tx.receiptNumber}.pdf`);
      toast.success(tt('pdfSuccess'));
    } catch (err) {
      toast.error(tt('pdfFailed'));
    }
  };

  const handleWhatsApp = async (tx) => {
    try {
      const { data } = await sendBillWhatsApp(tx._id);
      if (data.data.mode === 'twilio') {
        toast.success(tt('whatsappSuccess'));
      } else if (data.data.whatsappWebUrl) {
        window.open(data.data.whatsappWebUrl, '_blank');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || tt('whatsappFailed'));
    }
  };

  return (
    <Layout title={tt('ledgerHistory')}>
      <div className="space-y-6">
        
        {/* Title Description */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-up">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">{tt('ledgerHistory')}</h2>
            <p className="text-sm text-slate-400 mt-0.5">{tt('ledgerHistoryDesc')}</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 animate-slide-up delay-1">
          <div className="flex-1">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={tt('searchPlaceholder')}
              icon={Search}
            />
          </div>
          <div className="space-y-1.5 shrink-0">
            <select 
              value={typeFilter} 
              onChange={(e) => setTypeFilter(e.target.value)} 
              className="input sm:w-48 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-brand-500"
            >
              <option value="">{tt('allTransactions')}</option>
              <option value="CREDIT">{tt('creditOnly')}</option>
              <option value="PAYMENT">{tt('paymentOnly')}</option>
            </select>
          </div>
        </div>

        {/* List Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton variant="rect" className="h-32" />
            <Skeleton variant="rect" className="h-32" />
            <Skeleton variant="rect" className="h-32" />
            <Skeleton variant="rect" className="h-32" />
          </div>
        ) : transactions.length === 0 ? (
          <Card animate={true} delayIdx={2} hoverable={false} className="text-center py-16 max-w-md mx-auto space-y-4 bg-white">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-400 border border-slate-100/50">
              <Clock size={24} />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-slate-800">{tt('noTransactionsTitle')}</h3>
              <p className="text-xs text-slate-400 leading-relaxed px-6">
                {tt('noTransactionsDesc')}
              </p>
            </div>
          </Card>
        ) : (
          /* Cards list */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {transactions.map((tx, idx) => {
              const isCredit = tx.type === 'CREDIT';
              return (
                <Card 
                  key={tx._id} 
                  delayIdx={idx} 
                  hoverable={true}
                  className="flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    {/* Header info */}
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-3">
                        {tx.customerId?.profilePhoto ? (
                          <img
                            src={`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'}${tx.customerId.profilePhoto}`}
                            alt={tx.customerId.name}
                            className="w-9 h-9 rounded-full object-cover border border-slate-100"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-xs text-slate-600">
                            {tx.customerId?.name ? tx.customerId.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-800 text-sm leading-tight">{tx.customerId?.name || tt('unknown')}</p>
                          <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">{formatDateTime(tx.createdAt)}</p>
                        </div>
                      </div>
                      
                      <Badge variant={isCredit ? 'danger' : 'success'}>
                        {tt(tx.type.toLowerCase())}
                      </Badge>
                    </div>

                    {/* Transaction Note / description details */}
                    {tx.description && (
                      <p className="text-xs text-slate-500 italic bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 font-medium">
                        "{tx.description}"
                      </p>
                    )}

                    {/* Amount & balances spec detail */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100/60 space-y-2 text-xs font-semibold text-slate-500">
                      <div className="flex justify-between items-center">
                        <span>{tt('amountLabel')}</span>
                        <span className={`font-extrabold text-sm ${isCredit ? 'text-rose-600' : 'text-sky-600'}`}>
                          {isCredit ? '+' : '-'}{formatCurrency(tx.amount)}
                        </span>
                      </div>
                      
                      {tx.balanceAfter !== undefined && (
                        <div className="flex justify-between items-center border-t border-slate-100/50 pt-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          <span>{tt('balanceAfterLabel')}</span>
                          <span className="text-slate-700">{formatCurrency(tx.balanceAfter)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex justify-between items-center mt-4 pt-3.5 border-t border-slate-50 text-xs text-slate-400 font-semibold">
                    <span>{tt('receiptTitle')} #{tx.receiptNumber}</span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleDownload(tx)} 
                        className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50/30 transition-colors active:scale-95"
                        title={tt('downloadReceipt')}
                      >
                        <Download size={15} />
                      </button>
                      <button 
                        onClick={() => handleWhatsApp(tx)} 
                        className="p-2 rounded-xl text-slate-400 hover:text-sky-600 hover:bg-sky-50/30 transition-colors active:scale-95"
                        title={tt('shareWhatsApp')}
                      >
                        <MessageCircle size={15} />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

      </div>
    </Layout>
  );
}
