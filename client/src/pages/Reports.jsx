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
import { useTranslation } from '../context/LanguageContext';

const localReportTranslations = {
  en: {
    ledgerReports: "Ledger Reports",
    financialReports: "Financial Reports",
    reportsDesc: "Filter customer ledgers and export PDF statements.",
    reportFilters: "Report Filters",
    customerNameLabel: "Customer Name",
    selectCustomerOption: "Select customer",
    fromDateLabel: "From Date",
    toDateLabel: "To Date",
    generateReportBtn: "Generate Report",
    generating: "Generating...",
    downloadStatementPdf: "Download Statement PDF",
    downloading: "Downloading...",
    totalCreditGiven: "Total Credit Given",
    totalPaidBack: "Total Paid Back",
    netOutstanding: "Net Outstanding Balance",
    statementEntries: "Statement Entries",
    noTransactionsRange: "No transactions found in selected date range.",
    noReportTitle: "No report generated",
    noReportDesc: "Select a customer and click \"Generate Report\" above to review statements and history details.",
    selectCustomerError: "Please select a customer first",
    reportSuccess: "Report generated successfully!",
    reportFailed: "Failed to generate report",
    pdfSuccess: "Statement downloaded successfully!",
    pdfFailed: "Failed to download statement",
    statementPeriod: "Statement:",
    creditEntry: "Credit Entry",
    paymentReceived: "Payment Received"
  },
  hi: {
    ledgerReports: "बही-खाता रिपोर्ट",
    financialReports: "वित्तीय रिपोर्ट",
    reportsDesc: "ग्राहक लेजर को फ़िल्टर करें और पीडीएफ विवरण (PDF Statement) निर्यात करें।",
    reportFilters: "रिपोर्ट फ़िल्टर्स",
    customerNameLabel: "ग्राहक का नाम",
    selectCustomerOption: "ग्राहक चुनें",
    fromDateLabel: "प्रारंभ तिथि",
    toDateLabel: "अंतिम तिथि",
    generateReportBtn: "रिपोर्ट बनाएं",
    generating: "बनाई जा रही है...",
    downloadStatementPdf: "स्टेटमेंट पीडीएफ डाउनलोड करें",
    downloading: "डाउनलोड हो रहा है...",
    totalCreditGiven: "दिया गया कुल उधार",
    totalPaidBack: "प्राप्त कुल भुगतान",
    netOutstanding: "कुल बकाया राशि",
    statementEntries: "विवरण प्रविष्टियां (Entries)",
    noTransactionsRange: "चयनित तिथि सीमा में कोई लेन-देन नहीं मिला।",
    noReportTitle: "कोई रिपोर्ट नहीं बनाई गई",
    noReportDesc: "कथन और इतिहास विवरणों की समीक्षा करने के लिए एक ग्राहक चुनें और ऊपर \"रिपोर्ट बनाएं\" पर क्लिक करें।",
    selectCustomerError: "कृपया पहले एक ग्राहक चुनें",
    reportSuccess: "रिपोर्ट सफलतापूर्वक बन गई!",
    reportFailed: "रिपोर्ट बनाने में विफल",
    pdfSuccess: "खाता विवरण सफलतापूर्वक डाउनलोड हो गया!",
    pdfFailed: "खाता विवरण डाउनलोड करने में विफल",
    statementPeriod: "अवधि विवरण:",
    creditEntry: "उधार प्रविष्टि (Credit)",
    paymentReceived: "भुगतान मिला (Payment)"
  },
  hinglish: {
    ledgerReports: "Ledger Reports",
    financialReports: "Financial Reports",
    reportsDesc: "Customer ledger filter karein aur PDF statement export karein.",
    reportFilters: "Report Filters",
    customerNameLabel: "Customer Name",
    selectCustomerOption: "Customer select karein",
    fromDateLabel: "From Date",
    toDateLabel: "To Date",
    generateReportBtn: "Report Generate Karein",
    generating: "Report generate ho rahi hai...",
    downloadStatementPdf: "Statement PDF Download Karein",
    downloading: "Download ho raha hai...",
    totalCreditGiven: "Total Credit Given",
    totalPaidBack: "Total Paid Back",
    netOutstanding: "Net Outstanding Balance",
    statementEntries: "Statement Entries",
    noTransactionsRange: "Selected date range me koi transaction nahi mila.",
    noReportTitle: "Koi report generate nahi ki gayi",
    noReportDesc: "Ek customer select karein aur upar \"Report Generate Karein\" par click karein statement aur history dekhne ke liye.",
    selectCustomerError: "Pehle customer select karein",
    reportSuccess: "Report successfully generate ho gayi!",
    reportFailed: "Report generate karne me fail ho gaye",
    pdfSuccess: "Statement successfully download ho gaya!",
    pdfFailed: "Statement download failed",
    statementPeriod: "Period:",
    creditEntry: "Udhaar Entry",
    paymentReceived: "Payment Received"
  },
  mr: {
    ledgerReports: "खातेवही अहवाल",
    financialReports: "वित्तीय अहवाल",
    reportsDesc: "ग्राहक खातेवही फिल्टर करा आणि पीडीएफ अहवाल निर्यात करा.",
    reportFilters: "अहवाल फिल्टर",
    customerNameLabel: "ग्राहकाचे नाव",
    selectCustomerOption: "ग्राहक निवडा",
    fromDateLabel: "या तारखेपासून",
    toDateLabel: "या तारखेपर्यंत",
    generateReportBtn: "अहवाल तयार करा",
    generating: "तयार होत आहे...",
    downloadStatementPdf: "अहवाल पीडीएफ डाउनलोड करा",
    downloading: "डाउनलोड होत आहे...",
    totalCreditGiven: "दिलेली एकूण उधारी",
    totalPaidBack: "मिळालेले एकूण पैसे",
    netOutstanding: "एकूण थकीत रक्कम",
    statementEntries: "अहवाल नोंदी",
    noTransactionsRange: "निवडलेल्या तारीख श्रेणीमध्ये कोणतेही व्यवहार आढळले नाहीत.",
    noReportTitle: "कोणताही अहवाल तयार केला नाही",
    noReportDesc: "अहवाल आणि इतिहास पुनरावलोकनासाठी ग्राहक निवडा आणि वरील \"अहवाल तयार करा\" वर क्लिक करा.",
    selectCustomerError: "कृपया आधी ग्राहक निवडा",
    reportSuccess: "अहवाल यशस्वीरित्या तयार केला!",
    reportFailed: "अहवाल तयार करण्यात अयशस्वी",
    pdfSuccess: "अहवाल यशस्वीरित्या डाउनलोड केला!",
    pdfFailed: "अहवाल डाउनलोड करण्यात अयशस्वी",
    statementPeriod: "कालावधी:",
    creditEntry: "उधारीची नोंद (Credit)",
    paymentReceived: "पैसे मिळाले (Payment)"
  },
  gu: {
    ledgerReports: "ખાતાવહી અહેવાলো",
    financialReports: "નાણાકીય અહેવાલો",
    reportsDesc: "ગ્રાહક ખાતાવહી ફિલ્ટર કરો અને પીડીએફ પત્રક નિકાસ કરો.",
    reportFilters: "અહેવાલ ફિલ્ટર્સ",
    customerNameLabel: "ગ્રાહકનું નામ",
    selectCustomerOption: "ગ્રાહક પસંદ કરો",
    fromDateLabel: "આ તારીખથી",
    toDateLabel: "આ તારીખ સુધી",
    generateReportBtn: "અહેવાલ બનાવો",
    generating: "બનાવાઈ રહ્યું છે...",
    downloadStatementPdf: "પત્રક પીડીએફ ડાઉનલોડ કરો",
    downloading: "ડાઉનલોડ થઈ રહ્યું છે...",
    totalCreditGiven: "આપેલ કુલ ક્રેડિટ",
    totalPaidBack: "ચૂકવેલ કુલ ક્રેડિટ",
    netOutstanding: "કુલ બાકી રકમ",
    statementEntries: "પત્રક વ્યવહારો",
    noTransactionsRange: "પસંદ કરેલ તારીખ મર્યાદામાં કોઈ વ્યવહાર મળ્યો નથી.",
    noReportTitle: "કોઈ અહેવાલ બનાવાયો નથી",
    noReportDesc: "પત્રક અને ઇતિહાસ સમીક્ષા માટે ગ્રાહક પસંદ કરો અને ઉપર \"અહેવાલ બનાવો\" પર ક્લિક કરો.",
    selectCustomerError: "કૃપા કરીને પહેલા ગ્રાહક પસંદ કરો",
    reportSuccess: "અહેવાલ સફળતાપૂર્વક બન્યો!",
    reportFailed: "અહેવાલ બનાવવામાં નિષ્ફળ",
    pdfSuccess: "પત્રક સફળતાપૂર્વક ડાઉનલોડ થયું!",
    pdfFailed: "પત્રક ડાઉનલોડ કરવામાં નિષ્ફળ",
    statementPeriod: "ગાળો:",
    creditEntry: "ઉધાર વ્યવહાર (Credit)",
    paymentReceived: "ચૂકવણી મળી (Payment)"
  },
  ta: {
    ledgerReports: "பேரேடு அறிக்கைகள்",
    financialReports: "நிதி அறிக்கைகள்",
    reportsDesc: "வாடிக்கையாளர் பேரேடுகளை வடிகட்டி, PDF அறிக்கைகளை ஏற்றுமதி செய்யவும்.",
    reportFilters: "அறிக்கை வடிகட்டிகள்",
    customerNameLabel: "வாடிக்கையாளர் பெயர்",
    selectCustomerOption: "வாடிக்கையாளரைத் தேர்ந்தெடு",
    fromDateLabel: "தொடக்கத் தேதி",
    toDateLabel: "முடிவுத் தேதி",
    generateReportBtn: "அறிக்கையை உருவாக்கு",
    generating: "உருவாக்கப்படுகிறது...",
    downloadStatementPdf: "அறிக்கை PDF-ஐப் பதிவிறக்கு",
    downloading: "பதிவிறக்கப்படுகிறது...",
    totalCreditGiven: "வழங்கப்பட்ட மொத்த கடன்",
    totalPaidBack: "திரும்பப் பெறப்பட்ட மொத்த பணம்",
    netOutstanding: "நிலுவைத்தொகை",
    statementEntries: "அறிக்கை பதிவுகள்",
    noTransactionsRange: "தேர்ந்தெடுக்கப்பட்ட தேதி வரம்பில் பரிவர்த்தனைகள் எதுவும் இல்லை.",
    noReportTitle: "அறிக்கை எதுவும் உருவாக்கப்படவில்லை",
    noReportDesc: "விவரங்களை மதிப்பாய்வு செய்ய வாடிக்கையாளரைத் தேர்ந்தெடுத்து மேலே உள்ள \"அறிக்கையை உருவாக்கு\" என்பதைக் கிளிக் செய்யவும்.",
    selectCustomerError: "தயவுசெய்து முதலில் வாடிக்கையாளரைத் தேர்ந்தெடுக்கவும்",
    reportSuccess: "அறிக்கை வெற்றிகரமாக உருவாக்கப்பட்டது!",
    reportFailed: "அறிக்கையை உருவாக்குவதில் தோல்வி",
    pdfSuccess: "அறிக்கை வெற்றிகரமாக பதிவிறக்கம் செய்யப்பட்டது!",
    pdfFailed: "அறிக்கையைப் பதிவிறக்குவதில் தோல்வி",
    statementPeriod: "கால அளவு:",
    creditEntry: "கடன் பதிவு (Credit)",
    paymentReceived: "பணம் பெறப்பட்டது (Payment)"
  },
  te: {
    ledgerReports: "ఖాతా పుస్తక నివేదికలు",
    financialReports: "ఆర్థిక నివేదికలు",
    reportsDesc: "కస్టమర్ ఖాతా పుస్తకాలను ఫిల్టర్ చేయండి మరియు PDF స్టేట్‌మెంట్‌లను డౌన్‌లోడ్ చేయండి.",
    reportFilters: "నివేదిక ఫిల్టర్లు",
    customerNameLabel: "కస్టమర్ పేరు",
    selectCustomerOption: "కస్టమర్‌ను ఎంచుకోండి",
    fromDateLabel: "ప్రారంభ తేదీ",
    toDateLabel: "ముగింపు తేదీ",
    generateReportBtn: "నివేదికను సృష్టించు",
    generating: "సృష్టించబడుతోంది...",
    downloadStatementPdf: "స్టేట్‌మెంట్ PDF ని డౌన్‌లోడ్ చేయి",
    downloading: "డౌన్‌లోడ్ అవుతోంది...",
    totalCreditGiven: "ఇచ్చిన మొత్తం అప్పు",
    totalPaidBack: "తిరిగి చెల్లించిన మొత్తం",
    netOutstanding: "బాకీ బ్యాలెన్స్",
    statementEntries: "స్టేట్‌మెంట్ ఎంట్రీలు",
    noTransactionsRange: "ఎంచుకున్న తేదీ పరిధిలో ఎలాంటి లావాదేవీలు లేవు.",
    noReportTitle: "ఏ నివేదిక సృష్టించబడలేదు",
    noReportDesc: "స్టేట్‌మెంట్స్ మరియు చరిత్రను సమీక్షించడానికి కస్టమర్‌ను ఎంచుకుని పైన \"నివేదికను సృష్టించు\" క్లిక్ చేయండి.",
    selectCustomerError: "దయచేసి మొదట కస్టమర్‌ను ఎంచుకోండి",
    reportSuccess: "నివేదిక విజయవంతంగా సృష్టించబడింది!",
    reportFailed: "నిвеదిక సృష్టించడం విఫలమైంది",
    pdfSuccess: "నివేదిక విజయవంతంగా డౌన్‌లోడ్ చేయబడింది!",
    pdfFailed: "నివేదిక డౌన్‌లోడ్ చేయడం విఫలమైంది",
    statementPeriod: "సమయం:",
    creditEntry: "అప్పు నమోదు (Credit)",
    paymentReceived: "చెల్లింపు స్వీకరించారు (Payment)"
  },
  bn: {
    ledgerReports: "হিসাব বিবরণীসমূহ",
    financialReports: "আর্থিক বিবরণী",
    reportsDesc: "গ্রাহক হিসাব ফিল্টার করুন এবং পিডিএফ বিবরণী রপ্তানি করুন।",
    reportFilters: "বিবরণী ফিল্টার",
    customerNameLabel: "গ্রাহকের নাম",
    selectCustomerOption: "গ্রাহক নির্বাচন করুন",
    fromDateLabel: "শুরুর তারিখ",
    toDateLabel: "শেষের তারিখ",
    generateReportBtn: "বিবরণী তৈরি করুন",
    generating: "তৈরি হচ্ছে...",
    downloadStatementPdf: "বিবরণী পিডিএফ ডাউনলোড করুন",
    downloading: "ডাউনলোড হচ্ছে...",
    totalCreditGiven: "মোট ধার দেওয়া পরিমাণ",
    totalPaidBack: "মোট ফেরত পাওয়া পরিমাণ",
    netOutstanding: "বকেয়া ব্যালেন্স",
    statementEntries: "বিবরণী এন্ট্রি সমূহ",
    noTransactionsRange: "নির্বাচিত তারিখ সীমার মধ্যে কোনো লেনদেন পাওয়া যায়নি।",
    noReportTitle: "কোনো বিবরণী তৈরি করা হয়নি",
    noReportDesc: "বিবরণী ও ইতিহাস দেখতে একজন গ্রাহক নির্বাচন করুন এবং উপরে \"বিবরণী তৈরি করুন\"-এ ক্লিক করুন।",
    selectCustomerError: "অনুগ্রহ করে প্রথমে একজন গ্রাহক নির্বাচন করুন",
    reportSuccess: "বিবরণী সফলভাবে তৈরি হয়েছে!",
    reportFailed: "বিবরণী তৈরি করতে ব্যর্থ",
    pdfSuccess: "বিবরণী সফলভাবে ডাউনলোড হয়েছে!",
    pdfFailed: "বিবরণী ডাউনলোড করতে ব্যর্থ",
    statementPeriod: "সময়কাল:",
    creditEntry: "ধার দেওয়া (Credit)",
    paymentReceived: "পরিশোধ (Payment)"
  },
  pa: {
    ledgerReports: "ਖਾਤਾ ਵਹੀ ਦੀਆਂ ਰਿਪੋਰਟਾਂ",
    financialReports: "ਵਿੱਤੀ ਰਿਪੋਰਟਾਂ",
    reportsDesc: "ਗਾਹਕ ਖਾਤਾ ਵਹੀਆਂ ਨੂੰ ਫਿਲਟਰ ਕਰੋ ਅਤੇ PDF ਸਟੇਟਮੈਂਟਾਂ ਨਿਰਯਾਤ ਕਰੋ।",
    reportFilters: "ਰਿਪੋਰਟ ਫਿਲਟਰ",
    customerNameLabel: "ਗਾਹਕ ਦਾ ਨਾਮ",
    selectCustomerOption: "ਗਾਹਕ ਚੁਣੋ",
    fromDateLabel: "ਇਸ ਮਿਤੀ ਤੋਂ",
    toDateLabel: "ਇਸ ਮਿਤੀ ਤੱਕ",
    generateReportBtn: "ਰਿਪੋਰਟ ਤਿਆਰ ਕਰੋ",
    generating: "ਤਿਆਰ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ...",
    downloadStatementPdf: "ਸਟੇਟਮੈਂਟ PDF ਡਾਊਨਲੋਡ ਕਰੋ",
    downloading: "ਡਾਊਨਲੋਡ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...",
    totalCreditGiven: "ਦਿੱਤਾ ਗਿਆ ਕੁੱਲ ਉਧਾਰ",
    totalPaidBack: "ਪ੍ਰਾਪਤ ਕੁੱਲ ਭੁਗਤਾਨ",
    netOutstanding: "ਬਕਾਇਆ ਬੈਲੰਸ",
    statementEntries: "ਸਟੇਟਮੈਂਟ ਇੰਦਰਾਜ",
    noTransactionsRange: "ਚੁਣੀ ਗਈ ਮਿਤੀ ਸੀਮਾ ਵਿੱਚ ਕੋਈ ਲੈਣ-ਦੇਣ ਨਹੀਂ ਮਿਲਿਆ।",
    noReportTitle: "ਕੋਈ ਰਿਪੋਰਟ ਨਹੀਂ ਬਣੀ",
    noReportDesc: "ਵੇਰਵਿਆਂ ਦੀ ਸਮੀਖਿਆ ਕਰਨ ਲਈ ਇੱਕ ਗਾਹਕ ਚੁਣੋ ਅਤੇ ਉੱਪਰ \"ਰਿਪੋਰਟ ਤਿਆਰ ਕਰੋ\" 'ਤੇ ਕਲਿੱਕ ਕਰੋ।",
    selectCustomerError: "ਕਿਰਪਾ ਕਰਕੇ ਪਹਿਲਾਂ ਗਾਹਕ ਚੁਣੋ",
    reportSuccess: "ਰਿਪੋਰਟ ਸਫਲਤਾਪੂਰਵਕ ਤਿਆਰ ਹੋ ਗਈ!",
    reportFailed: "ਰਿਪੋਰਟ ਤਿਆਰ ਕਰਨ ਵਿੱਚ ਅਸਫਲ",
    pdfSuccess: "ਖਾਤਾ ਸਟੇਟਮੈਂਟ ਸਫਲਤਾਪੂਰਵਕ ਡਾਊਨਲੋਡ ਹੋ ਗਈ!",
    pdfFailed: "ਸਟੇਟਮੈਂਟ ਡਾਊਨਲੋਡ ਕਰਨ ਵਿੱਚ ਅਸਫਲ",
    statementPeriod: "ਸਮਾਂ ਸੀਮਾ:",
    creditEntry: "ਉਧਾਰ ਇੰਦਰਾਜ (Credit)",
    paymentReceived: "ਭੁਗਤਾਨ ਮਿਲਿਆ (Payment)"
  }
};

export default function Reports() {
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const { language } = useTranslation();

  const rt = (key) => {
    const dict = localReportTranslations[language] || localReportTranslations['en'];
    return dict[key] || localReportTranslations['en'][key] || key;
  };

  useEffect(() => {
    listCustomers({ limit: 100 }).then(({ data }) => setCustomers(data.data.customers));
  }, []);

  const handleGenerate = async () => {
    if (!customerId) {
      toast.error(rt('selectCustomerError'));
      return;
    }
    setLoading(true);
    try {
      const { data } = await getCustomerReport(customerId, { from, to });
      setReport(data.data);
      toast.success(rt('reportSuccess'));
    } catch (err) {
      toast.error(rt('reportFailed'));
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
      toast.success(rt('pdfSuccess'));
    } catch (err) {
      toast.error(rt('pdfFailed'));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Layout title={rt('ledgerReports')}>
      <div className="space-y-6">
        
        {/* Title Description */}
        <div className="animate-slide-up">
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">{rt('financialReports')}</h2>
          <p className="text-sm text-slate-400 mt-0.5">{rt('reportsDesc')}</p>
        </div>

        {/* Filter Card Section */}
        <Card animate={true} delayIdx={1} hoverable={false} className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
            <Filter size={16} className="text-blue-600" />
            <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider">{rt('reportFilters')}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Customer select */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{rt('customerNameLabel')}</label>
              <select 
                value={customerId} 
                onChange={(e) => setCustomerId(e.target.value)} 
                className="input py-3 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-brand-500"
              >
                <option value="">{rt('selectCustomerOption')}</option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Date from */}
            <Input 
              label={rt('fromDateLabel')}
              type="date" 
              value={from} 
              onChange={(e) => setFrom(e.target.value)} 
            />

            {/* Date to */}
            <Input 
              label={rt('toDateLabel')}
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
              {loading ? rt('generating') : rt('generateReportBtn')}
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
                    {rt('statementPeriod')} {formatDate(report.period.from)} – {formatDate(report.period.to)}
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
                {downloading ? rt('downloading') : rt('downloadStatementPdf')}
              </Button>
            </Card>

            {/* Financial Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Total Credit */}
              <Card hoverable={true} className="border-l-4 border-l-rose-500 bg-white">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{rt('totalCreditGiven')}</p>
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
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{rt('totalPaidBack')}</p>
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
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{rt('netOutstanding')}</p>
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
              <h4 className="text-sm font-bold text-slate-800 px-1">{rt('statementEntries')}</h4>
              
              <Card hoverable={false} className="bg-white divide-y divide-slate-100 !p-0">
                {report.transactions.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-8">{rt('noTransactionsRange')}</p>
                ) : (
                  <div className="divide-y divide-slate-100 px-6">
                    {report.transactions.map((tx) => {
                      const isCredit = tx.type === 'CREDIT';
                      return (
                        <div key={tx._id} className="py-3.5 flex justify-between items-center gap-3 text-sm">
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 text-sm leading-tight truncate">
                              {tx.description || tx.transcript || (isCredit ? rt('creditEntry') : rt('paymentReceived'))}
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
              <h3 className="text-sm font-bold text-slate-800">{rt('noReportTitle')}</h3>
              <p className="text-xs text-slate-400 leading-relaxed px-6">
                {rt('noReportDesc')}
              </p>
            </div>
          </Card>
        )}

      </div>
    </Layout>
  );
}
