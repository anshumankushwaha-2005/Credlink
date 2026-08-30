import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Mic, FileText, MessageCircle, Phone, MapPin, TrendingUp, TrendingDown, Clock, Check, X, Camera } from 'lucide-react';
import Layout from '../components/layout/Layout.jsx';
import { useAuth } from '../hooks/useAuth';
import { getCustomer, updateCustomer, uploadCustomerPhoto } from '../services/customerService';
import { downloadCustomerStatement } from '../services/reportService';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDateTime } from '../utils/formatDate';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import Skeleton from '../components/common/Skeleton.jsx';
import { useTranslation } from '../context/LanguageContext';

const localDetailsTranslations = {
  en: {
    backToCustomers: "Back to Customers",
    noPhone: "No phone number",
    edit: "Edit",
    add: "Add",
    outstandingBalance: "Outstanding Balance",
    addTransaction: "Add Transaction",
    generateStatement: "Generate Statement",
    generatingStatement: "Generating statement...",
    whatsappReminder: "WhatsApp Reminder",
    totalCreditGiven: "Total Credit Given",
    totalPaidBack: "Total Paid Back",
    transactionHistory: "Transaction History",
    noTransactionsTitle: "No ledger transactions found yet.",
    noTransactionsDesc: "Use speech recognition to log first item!",
    creditGiven: "Credit Given",
    paymentReceived: "Payment Received",
    ledgerBalance: "Ledger Balance:",
    phoneUpdated: "Phone number updated successfully! 🎉",
    phoneFailed: "Failed to update phone number",
    statementDownloaded: "Ledger statement downloaded! 📄",
    statementFailed: "Failed to generate statement",
    openingWhatsapp: "Opening WhatsApp for reminder",
    customerNotFound: "Customer ledger not found"
  },
  hi: {
    backToCustomers: "ग्राहकों पर वापस जाएं",
    noPhone: "कोई फ़ोन नंबर नहीं",
    edit: "बदले",
    add: "जोड़ें",
    outstandingBalance: "कुल बकाया राशि",
    addTransaction: "लेन-देन जोड़ें",
    generateStatement: "स्टेटमेंट बनाएं",
    generatingStatement: "स्टेटमेंट बनाई जा रही है...",
    whatsappReminder: "व्हाट्सएप रिमाइंडर",
    totalCreditGiven: "दिया गया कुल उधार",
    totalPaidBack: "प्राप्त कुल भुगतान",
    transactionHistory: "लेन-देन का इतिहास",
    noTransactionsTitle: "अभी तक कोई लेन-देन नहीं मिला।",
    noTransactionsDesc: "पहला आइटम लॉग करने के लिए आवाज़ का उपयोग करें!",
    creditGiven: "उधार दिया (Credit)",
    paymentReceived: "भुगतान मिला (Payment)",
    ledgerBalance: "खाता शेष (Balance):",
    phoneUpdated: "फ़ोन नंबर सफलतापूर्वक बदल दिया गया! 🎉",
    phoneFailed: "फ़ोन नंबर बदलने में विफल",
    statementDownloaded: "खाता विवरण डाउनलोड हो गया! 📄",
    statementFailed: "खाता विवरण बनाने में विफल",
    openingWhatsapp: "रिमाइंडर के लिए व्हाट्सएप खोला जा रहा है",
    customerNotFound: "ग्राहक खाता नहीं मिला"
  },
  hinglish: {
    backToCustomers: "Back to Customers List",
    noPhone: "Koi phone number nahi hai",
    edit: "Edit",
    add: "Add",
    outstandingBalance: "Bakaya Balance",
    addTransaction: "Entry Jodein",
    generateStatement: "Statement Download Karein",
    generatingStatement: "Statement ready ho rahi hai...",
    whatsappReminder: "WhatsApp Reminder Send Karein",
    totalCreditGiven: "Total Credit Given",
    totalPaidBack: "Total Paid Back",
    transactionHistory: "Transaction History",
    noTransactionsTitle: "Abhi tak koi transaction nahi hua hai.",
    noTransactionsDesc: "Speech recognition ka use karke pehla item log karein!",
    creditGiven: "Udhaar Diya",
    paymentReceived: "Payment Mila",
    ledgerBalance: "Ledger Balance:",
    phoneUpdated: "Phone number successfully update ho gaya! 🎉",
    phoneFailed: "Phone number update karne me fail ho gaye",
    statementDownloaded: "Statement download ho gaya! 📄",
    statementFailed: "Statement generate nahi ho paya",
    openingWhatsapp: "Reminder ke liye WhatsApp open ho raha hai",
    customerNotFound: "Customer account nahi mila"
  },
  mr: {
    backToCustomers: "ग्राहकांवर परत जा",
    noPhone: "फोन नंबर नाही",
    edit: "बदला",
    add: "जोडा",
    outstandingBalance: "एकूण थकीत रक्कम",
    addTransaction: "व्यवहार जोडा",
    generateStatement: "अहवाल तयार करा",
    generatingStatement: "अहवाल तयार केला जात आहे...",
    whatsappReminder: "व्हॉट्सॲप स्मरणपत्र",
    totalCreditGiven: "दिलेली एकूण उधारी",
    totalPaidBack: "मिळालेले एकूण पैसे",
    transactionHistory: "व्यवहाराचा इतिहास",
    noTransactionsTitle: "अद्याप कोणतेही व्यवहार आढळले नाहीत.",
    noTransactionsDesc: "पहिले व्यवहार नोंदवण्यासाठी आवाज ओळख वापरा!",
    creditGiven: "उधारी दिली (Credit)",
    paymentReceived: "पैसे मिळाले (Payment)",
    ledgerBalance: "खातेवही शिल्लक:",
    phoneUpdated: "फोन नंबर यशस्वीरित्या अद्ययावत केला! 🎉",
    phoneFailed: "फोन नंबर अद्ययावत करण्यात अयशस्वी",
    statementDownloaded: "खातेवही अहवाल डाउनलोड केला! 📄",
    statementFailed: "अहवाल तयार करण्यात अयशस्वी",
    openingWhatsapp: "स्मरणपत्रासाठी व्हॉट्सॲप उघडत आहे",
    customerNotFound: "ग्राहक खाते आढळले नाही"
  },
  gu: {
    backToCustomers: "ગ્રાહકો પર પાછા જાઓ",
    noPhone: "કોઈ ફોન નંબર નથી",
    edit: "સુધારો",
    add: "ઉમેરો",
    outstandingBalance: "બાકી રકમ",
    addTransaction: "વྱવહાર ઉમેરો",
    generateStatement: "પત્રક બનાવો",
    generatingStatement: "પત્રક બનાવાઈ રહ્યું છે...",
    whatsappReminder: "વોટ્સએપ રીમાઇન્ડર",
    totalCreditGiven: "આપેલ કુલ ક્રેડિટ",
    totalPaidBack: "ચૂકવેલ કુલ ક્રેડિટ",
    transactionHistory: "વ્યવહારોનો ઇતિહાસ",
    noTransactionsTitle: "હજી સુધી કોઈ વ્યવહાર મળ્યો નથી.",
    noTransactionsDesc: "પ્રથમ આઇટમ ઉમેરવા માટે અવાજ ઓળખનો ઉપયોગ કરો!",
    creditGiven: "ધિરાણ આપ્યું (Credit)",
    paymentReceived: "ચુકવણી મળી (Payment)",
    ledgerBalance: "ખાતા વહી બાકી:",
    phoneUpdated: "ફોન નંબર સફળતાપૂર્વક અપડેટ કરવામાં આવ્યો! 🎉",
    phoneFailed: "ફોન નંબર અપડેટ કરવામાં નિષ્ફળ",
    statementDownloaded: "ખાતાવહી પત્રક ડાઉનલોડ થયું! 📄",
    statementFailed: "પત્રક બનાવવામાં નિષ્ફળ",
    openingWhatsapp: "રીમાઇન્ડર માટે વોટ્સએપ ખોલી રહ્યાં છે",
    customerNotFound: "ગ્રાહક ખાતાવહી મળી નથી"
  },
  ta: {
    backToCustomers: "வாடிக்கையாளர்களுக்குத் திரும்பு",
    noPhone: "தொலைபேசி எண் இல்லை",
    edit: "தொகு",
    add: "சேர்",
    outstandingBalance: "நிலுவைத்தொகை",
    addTransaction: "பரிவர்த்தனையைச் சேர்",
    generateStatement: "அறிக்கையை உருவாக்கு",
    generatingStatement: "அறிக்கை உருவாக்கப்படுகிறது...",
    whatsappReminder: "வாட்ஸ்அப் நினைவூட்டல்",
    totalCreditGiven: "வழங்கப்பட்ட மொத்த கடன்",
    totalPaidBack: "திரும்பப் பெறப்பட்ட மொத்த பணம்",
    transactionHistory: "பரிவர்த்தனை வரலாறு",
    noTransactionsTitle: "இன்னும் பரிவர்த்தனைகள் எதுவும் இல்லை.",
    noTransactionsDesc: "முதல் பரிவர்த்தனையை பதிவு செய்ய குரல் அங்கீகாரத்தைப் பயன்படுத்தவும்!",
    creditGiven: "கடன் வழங்கப்பட்டது (Credit)",
    paymentReceived: "பணம் பெறப்பட்டது (Payment)",
    ledgerBalance: "கணக்கு பேரேடு நிலுவை:",
    phoneUpdated: "தொலைபேசி எண் வெற்றிகரமாக புதுப்பிக்கப்பட்டது! 🎉",
    phoneFailed: "தொலைபேసి எண்ணை புதுப்பிப்பதில் தோல்வி",
    statementDownloaded: "பேரேட்டு அறிக்கை பதிவிறக்கம் செய்யப்பட்டது! 📄",
    statementFailed: "அறிக்கையை உருவாக்குவதில் தோல்வி",
    openingWhatsapp: "நினைவூட்டலுக்காக வாட்ஸ்அப் திறக்கப்படுகிறது",
    customerNotFound: "வாடிக்கையாளர் பேரேடு கிடைக்கவில்லை"
  },
  te: {
    backToCustomers: "కస్టమర్లకు తిరిగి వెళ్ళు",
    noPhone: "ఫోన్ నంబర్ లేదు",
    edit: "సవరించు",
    add: "జోడించు",
    outstandingBalance: "బాకీ బ్యాలెన్స్",
    addTransaction: "లావాదేవీని జోడించు",
    generateStatement: "స్టేట్‌మెంట్ సృష్టించు",
    generatingStatement: "స్టేట్‌మెంట్ సృష్టించబడుతోంది...",
    whatsappReminder: "వాట్సాప్ రిమైండర్",
    totalCreditGiven: "ఇచ్చిన మొత్తం అప్పు",
    totalPaidBack: "తిరిగి చెల్లించిన మొత్తం",
    transactionHistory: "లావాదేవీల చరిత్ర",
    noTransactionsTitle: "ఇంకా ఎలాంటి లావాదేవీలు లేవు.",
    noTransactionsDesc: "మొదటి అంశాన్ని నమోదు చేయడానికి వాయిస్ రికగ్నిషన్‌ను ఉపయోగించండి!",
    creditGiven: "అప్పు ఇచ్చారు (Credit)",
    paymentReceived: "చెల్లింపు స్వీకరించారు (Payment)",
    ledgerBalance: "ఖాతా పుస్తకం నిల్వ బ్యాలెన్స్:",
    phoneUpdated: "ఫోన్ నంబర్ విజయవంతంగా నవీకరించబడింది! 🎉",
    phoneFailed: "ఫోన్ నంబర్ నవీకరించడం విఫలమైంది",
    statementDownloaded: "ఖాతా నివేదిక డౌన్‌లోడ్ చేయబడింది! 📄",
    statementFailed: "নিవేదిక నివేదిక సృష్టించడం విఫలమైంది",
    openingWhatsapp: "రిమైండర్ కోసం వాట్సాప్ తెరవబడుతోంది",
    customerNotFound: "కస్టమర్ ఖాతా పుస్తకం కనుగొనబడలేదు"
  },
  bn: {
    backToCustomers: "গ্রাহক তালিকায় ফিরে যান",
    noPhone: "কোনো ফোন নম্বর নেই",
    edit: "সম্পাদনা",
    add: "যোগ করুন",
    outstandingBalance: "বকেয়া ব্যালেন্স",
    addTransaction: "লেনদেন যোগ করুন",
    generateStatement: "বিবরণী তৈরি করুন",
    generatingStatement: "বিবরণী তৈরি হচ্ছে...",
    whatsappReminder: "হোয়াটসঅ্যাপ রিমাইন্ডার",
    totalCreditGiven: "মোট ধার দেওয়া পরিমাণ",
    totalPaidBack: "মোট ফেরত পাওয়া পরিমাণ",
    transactionHistory: "লেনদেনের ইতিহাস",
    noTransactionsTitle: "এখনও কোনো লেনদেন পাওয়া যায়নি।",
    noTransactionsDesc: "প্রথম আইটেম যুক্ত করতে ভয়েস ব্যবহার করুন!",
    creditGiven: "ধার দেওয়া হয়েছে (Credit)",
    paymentReceived: "পরিশোধ পাওয়া গেছে (Payment)",
    ledgerBalance: "হিসাব খাতার ব্যালেন্স:",
    phoneUpdated: "ফোন নম্বর সফলভাবে আপডেট করা হয়েছে! 🎉",
    phoneFailed: "ফোন নম্বর আপডেট করতে ব্যর্থ",
    statementDownloaded: "হিসাব বিবরণী ডাউনলোড হয়েছে! 📄",
    statementFailed: "বিবরণী তৈরি করতে ব্যর্থ",
    openingWhatsapp: "রিমাইন্ডারের জন্য হোয়াটসঅ্যাপ খোলা হচ্ছে",
    customerNotFound: "গ্রাহকের হিসাব পাওয়া যায়নি"
  },
  pa: {
    backToCustomers: "ਗਾਹਕਾਂ 'ਤੇ ਵਾਪਸ ਜਾਓ",
    noPhone: "ਕੋਈ ਫੋਨ ਨੰਬਰ ਨਹੀਂ",
    edit: "ਬਦਲੋ",
    add: "ਜੋੜੋ",
    outstandingBalance: "ਬਕਾਇਆ ਬੈਲੰਸ",
    addTransaction: "ਲੈਣ-ਦੇਣ ਜੋੜੋ",
    generateStatement: "ਸਟੇਟਮੈਂਟ ਬਣਾਓ",
    generatingStatement: "ਸਟੇਟਮੈਂਟ ਤਿਆਰ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ...",
    whatsappReminder: "ਵਟਸਐਪ ਰੀਮਾਈਂਡਰ",
    totalCreditGiven: "ਦਿੱਤਾ ਗਿਆ ਕੁੱਲ ਉਧਾਰ",
    totalPaidBack: "ਪ੍ਰਾਪਤ ਕੁੱਲ ਭੁਗਤਾਨ",
    transactionHistory: "ਲੈਣ-ਦੇਣ ਦਾ ਇਤਿਹਾਸ",
    noTransactionsTitle: "ਅਜੇ ਤੱਕ ਕੋਈ ਲੈਣ-ਦੇਣ ਨਹੀਂ ਮਿਲਿਆ।",
    noTransactionsDesc: "ਪਹਿਲੀ ਚੀਜ਼ ਦਰਜ ਕਰਨ ਲਈ ਆਵਾਜ਼ ਦੀ ਵਰਤੋਂ ਕਰੋ!",
    creditGiven: "ਉਧਾਰ ਦਿੱਤਾ (Credit)",
    paymentReceived: "ਭੁਗਤਾਨ ਮਿਲਿਆ (Payment)",
    ledgerBalance: "ਖਾਤਾ ਵਹੀ ਬੈਲੰਸ:",
    phoneUpdated: "ਫੋਨ ਨੰਬਰ ਸਫਲਤਾਪੂਰਵਕ ਅਪਡੇਟ ਹੋ ਗਿਆ! 🎉",
    phoneFailed: "ਫੋਨ ਨੰਬਰ ਅਪਡੇਟ ਕਰਨ ਵਿੱਚ ਅਸਫਲ",
    statementDownloaded: "ਖਾਤਾ ਸਟੇਟਮੈਂਟ ਡਾਊਨਲੋਡ ਹੋ ਗਈ! 📄",
    statementFailed: "ਸਟੇਟਮੈਂਟ ਬਣਾਉਣ ਵਿੱਚ ਅਸਫਲ",
    openingWhatsapp: "ਰੀਮਾਈਂਡਰ ਲਈ ਵਟਸਐਪ ਖੋਲ੍ਹਿਆ ਜਾ ਰਿਹਾ ਹੈ",
    customerNotFound: "ਗਾਹਕ ਖਾਤਾ ਨਹੀਂ ਲੱਭਿਆ"
  }
};

export default function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { merchant } = useAuth();
  const { language } = useTranslation();

  const lt = (key) => {
    const dict = localDetailsTranslations[language] || localDetailsTranslations['en'];
    return dict[key] || localDetailsTranslations['en'][key] || key;
  };

  const [customer, setCustomer] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [tempPhone, setTempPhone] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size exceeds 2MB limit');
      return;
    }

    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append('profilePhoto', file);

    try {
      const { data: uploadRes } = await uploadCustomerPhoto(formData);
      const newPhotoPath = uploadRes.data.profilePhoto;

      const { data: updateRes } = await updateCustomer(id, { profilePhoto: newPhotoPath });
      setCustomer(updateRes.data.customer);
      toast.success('Profile photo updated successfully! 📸');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handlePhotoRemove = async () => {
    if (!window.confirm('Are you sure you want to remove this profile photo?')) return;
    setUploadingPhoto(true);
    try {
      const { data } = await updateCustomer(id, { profilePhoto: '' });
      setCustomer(data.data.customer);
      toast.success('Profile photo removed! 🗑️');
    } catch (err) {
      toast.error('Failed to remove profile photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getCustomer(id);
      setCustomer(data.data.customer);
      setTransactions(data.data.transactions);
      setSummary(data.data.summary);
    } catch (err) {
      toast.error(lt('customerNotFound'));
      navigate('/customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleStatement = async () => {
    setGenerating(true);
    try {
      await downloadCustomerStatement(id, {}, `Statement-${customer.name}.pdf`);
      toast.success(lt('statementDownloaded'));
    } catch (err) {
      toast.error(lt('statementFailed'));
    } finally {
      setGenerating(false);
    }
  };

  const handlePhoneSave = async (e) => {
    e.preventDefault();
    try {
      const { data } = await updateCustomer(id, { phone: tempPhone });
      setCustomer(data.data.customer);
      setIsEditingPhone(false);
      toast.success(lt('phoneUpdated'));
    } catch (err) {
      toast.error(err.response?.data?.message || lt('phoneFailed'));
    }
  };

  const triggerWhatsAppReminder = () => {
    const shopName = merchant?.businessName || merchant?.name || 'our shop';
    const message = `Hello ${customer.name}, this is a reminder from ${shopName}. Your outstanding balance in our digital ledger is ${formatCurrency(customer.currentBalance)}. Please clear it soon. Thank you!`;
    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/${customer.phone || ''}?text=${encoded}`;
    window.open(url, '_blank');
    toast.success(lt('openingWhatsapp'));
  };

  if (loading || !customer) {
    return (
      <Layout title="Customer Details">
        <div className="space-y-6">
          <Skeleton variant="rect" className="h-44" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Skeleton variant="rect" className="h-20" />
            <Skeleton variant="rect" className="h-20" />
          </div>
          <Skeleton variant="rect" className="h-60" />
        </div>
      </Layout>
    );
  }

  const isOutstanding = customer.currentBalance > 0;

  return (
    <Layout title={customer.name}>
      <div className="space-y-6">
        
        {/* Back Link */}
        <div className="animate-slide-up">
          <button 
            onClick={() => navigate('/customers')} 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ArrowLeft size={14} className="stroke-[3]" />
            <span>{lt('backToCustomers')}</span>
          </button>
        </div>

        {/* Top Profile Dossier Card */}
        <Card animate={true} hoverable={false} className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            
            {/* Identity details */}
            <div className="flex items-center gap-4">
              <div className="relative group w-14 h-14 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                {customer.profilePhoto ? (
                  <img
                    src={`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'}${customer.profilePhoto}`}
                    alt={customer.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-extrabold text-lg text-blue-700">{customer.name.charAt(0).toUpperCase()}</span>
                )}
                {/* Image upload overlay */}
                <label className="absolute inset-0 bg-slate-900/40 rounded-full flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={14} className="text-white mb-0.5" />
                  <span className="text-[8px] text-white font-extrabold uppercase tracking-wider">{uploadingPhoto ? '...' : 'Edit'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={uploadingPhoto}
                    className="hidden"
                  />
                </label>
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">{customer.name}</h2>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-1 text-xs text-slate-405 font-semibold items-center">
                  {isEditingPhone ? (
                    <form onSubmit={handlePhoneSave} className="flex items-center gap-1.5 animate-slide-up bg-slate-50/50 p-1 rounded-xl border border-slate-200">
                      <input
                        type="text"
                        value={tempPhone}
                        onChange={(e) => setTempPhone(e.target.value)}
                        placeholder="10-digit phone..."
                        className="text-xs px-2 py-0.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-400 w-32 font-bold text-slate-700 bg-white"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="bg-blue-650 hover:bg-blue-750 text-white rounded-lg p-1 transition-all active:scale-90"
                        title={lt('edit')}
                      >
                        <Check size={10} className="stroke-[3]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingPhone(false)}
                        className="bg-white hover:bg-slate-100 text-slate-500 border border-slate-200 rounded-lg p-1 transition-all active:scale-90"
                        title={lt('backToCustomers')}
                      >
                        <X size={10} className="stroke-[3]" />
                      </button>
                    </form>
                  ) : (
                    <div className="flex items-center gap-1">
                      <span className="flex items-center gap-1">
                        <Phone size={12} />
                        {customer.phone || lt('noPhone')}
                      </span>
                      <button
                        onClick={() => {
                          setTempPhone(customer.phone || '');
                          setIsEditingPhone(true);
                        }}
                        className="text-[9px] text-blue-600 hover:text-blue-800 font-extrabold uppercase ml-1.5 bg-blue-50/50 hover:bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-lg tracking-wider active:scale-95 transition-all"
                      >
                        {customer.phone ? lt('edit') : lt('add')}
                      </button>
                    </div>
                  )}
                  {customer.address && (
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      {customer.address}
                    </span>
                  )}
                  {customer.profilePhoto && (
                    <button
                      onClick={handlePhotoRemove}
                      disabled={uploadingPhoto}
                      className="text-[9px] text-rose-600 hover:text-rose-800 font-extrabold uppercase ml-1 bg-rose-50/50 hover:bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded-lg tracking-wider active:scale-95 transition-all"
                    >
                      Remove Photo
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Balances detail */}
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl w-full sm:w-auto text-right flex sm:flex-col justify-between items-center sm:items-end gap-2">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{lt('outstandingBalance')}</span>
              <span className={`text-2xl font-extrabold ${isOutstanding ? 'text-rose-600' : 'text-sky-600'} tracking-tight`}>
                {formatCurrency(customer.currentBalance)}
              </span>
            </div>

          </div>

          {/* Quick Actions Buttons */}
          <div className="flex flex-wrap gap-2.5 pt-4 border-t border-slate-100/60">
            <Link 
              to="/voice" 
              state={{ customerId: customer._id, customerName: customer.name }}
            >
              <Button size="sm" icon={Mic} className="shadow-md shadow-blue-500/10">
                {lt('addTransaction')}
              </Button>
            </Link>
            
            <Button 
              variant="secondary"
              size="sm"
              onClick={handleStatement} 
              disabled={generating} 
              icon={FileText}
            >
              {generating ? lt('generatingStatement') : lt('generateStatement')}
            </Button>

            <Button 
              variant="secondary"
              size="sm"
              onClick={triggerWhatsAppReminder}
              icon={MessageCircle}
              className="!text-sky-650 hover:bg-sky-50/30"
            >
              {lt('whatsappReminder')}
            </Button>
          </div>
        </Card>

        {/* Credit Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card hoverable={true} delayIdx={1} className="border-l-4 border-l-rose-500 bg-white">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lt('totalCreditGiven')}</p>
                <p className="text-lg font-extrabold text-rose-600 mt-1">{formatCurrency(summary?.totalCredit || 0)}</p>
              </div>
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 border border-rose-100/50 flex items-center justify-center">
                <TrendingUp size={16} />
              </div>
            </div>
          </Card>

          <Card hoverable={true} delayIdx={1} className="border-l-4 border-l-sky-500 bg-white">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lt('totalPaidBack')}</p>
                <p className="text-lg font-extrabold text-sky-600 mt-1">{formatCurrency(summary?.totalPayment || 0)}</p>
              </div>
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-500 border border-sky-100/50 flex items-center justify-center">
                <TrendingDown size={16} />
              </div>
            </div>
          </Card>
        </div>

        {/* Timeline Transaction History */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-800 animate-slide-up delay-2">{lt('transactionHistory')}</h3>

          {transactions.length === 0 ? (
            <Card hoverable={false} animate={true} delayIdx={2} className="text-center py-12 bg-white">
              <Clock size={32} className="text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400 font-medium">{lt('noTransactionsTitle')}</p>
              <p className="text-xs text-slate-400/80 mt-0.5">{lt('noTransactionsDesc')}</p>
            </Card>
          ) : (
            /* Custom Timeline cards structure */
            <div className="relative border-l-2 border-slate-100 ml-4 pl-6 space-y-6 py-2">
              {transactions.map((tx, idx) => {
                const isCredit = tx.type === 'CREDIT';
                return (
                  <div key={tx._id} style={{ animationDelay: `${idx * 40}ms` }} className="relative group animate-slide-up">
                    
                    {/* Timeline bullet tag indicator */}
                    <span className={`absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white ring-4 ring-white ${
                      isCredit ? 'bg-rose-500 shadow-sm shadow-rose-500/20' : 'bg-sky-500 shadow-sm shadow-sky-500/20'
                    }`}></span>

                    {/* Timeline details card */}
                    <Card hoverable={true} className="!p-5">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          {/* Transaction note / transcript */}
                          <p className="text-sm font-bold text-slate-800 leading-snug">
                            {tx.description || tx.transcript || (isCredit ? lt('creditGiven') : lt('paymentReceived'))}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            <span>{formatDateTime(tx.createdAt)}</span>
                            <span>•</span>
                            <span>ID: {tx.receiptNumber}</span>
                          </div>
                        </div>

                        {/* Amount */}
                        <div className="text-right shrink-0">
                          <p className={`font-extrabold text-base ${isCredit ? 'text-rose-600' : 'text-sky-600'}`}>
                            {isCredit ? '+' : '-'}{formatCurrency(tx.amount)}
                          </p>
                        </div>
                      </div>

                      {/* Timeline Ledger state reference */}
                      <div className="mt-3.5 pt-3.5 border-t border-slate-100/60 flex items-center justify-between text-xs font-semibold text-slate-500 bg-slate-50/50 p-2.5 rounded-xl border border-slate-50">
                        <span>{lt('ledgerBalance')}</span>
                        <strong className="text-slate-800">{formatCurrency(tx.balanceAfter)}</strong>
                      </div>
                    </Card>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
}
