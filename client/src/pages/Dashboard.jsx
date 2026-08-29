import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Wallet, TrendingUp, TrendingDown, Mic, Plus, FileText, ArrowRight, UserPlus, ChevronRight, Square, Loader2 } from 'lucide-react';
import Layout from '../components/layout/Layout.jsx';
import { listCustomers } from '../services/customerService';
import { listTransactions, searchCustomerVoice } from '../services/transactionService';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDateTime } from '../utils/formatDate';
import { useAuth } from '../hooks/useAuth';
import { useVoice } from '../hooks/useVoice';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Skeleton from '../components/common/Skeleton.jsx';
import Modal from '../components/common/Modal.jsx';
import toast from 'react-hot-toast';
import { useTranslation } from '../context/LanguageContext';

const localDashboardTranslations = {
  en: {
    todaysOverview: "Here's how your shop is doing today.",
    activeCredit: "Active credit in ledger",
    totalAccounts: "Total registered shop accounts",
    recordedInLedger: "Recorded in ledger",
    receivedUPI: "Received in cash/UPI",
    addVoiceDescription: "Speak naturally in Hindi, Hinglish, or English and get instant spoken confirmations.",
    exampleCommandLabel: "Example Command:",
    voiceConfirmationLabel: "Instant Spoken Confirmation:",
    tapToSpeak: "Tap to Speak",
    addCustomerSub: "Register a new shop customer",
    voiceSearchSub: "Say customer name to open profile",
    statementsTitle: "Customer Statements",
    statementsSub: "Generate and share PDF statements",
    viewAllHistory: "View All History",
    noTransactionsSub: "Tap the microphone card above to start voice entry!",
    customerSearchTitle: "Voice Search Customer",
    outstanding: "Outstanding",
    customers: "Customers",
    recentTransactions: "Recent Transactions",
    addCustomer: "Add Customer",
    voiceSearch: "Voice Search",
  },
  hi: {
    todaysOverview: "यहाँ आपके दुकान का आज का लेखा-जोखा है।",
    activeCredit: "लेजर में सक्रिय उधार",
    totalAccounts: "कुल पंजीकृत दुकान खाते",
    recordedInLedger: "बही-खाते में दर्ज",
    receivedUPI: "नकद/UPI में प्राप्त",
    addVoiceDescription: "हिंदी, हिंग्लिश या अंग्रेजी में स्वाभाविक रूप से बोलें और तुरंत ऑडियो पुष्टि प्राप्त करें।",
    exampleCommandLabel: "उदाहरण कमांड:",
    voiceConfirmationLabel: "त्वरित ऑडियो पुष्टि:",
    tapToSpeak: "बोलने के लिए टैप करें",
    addCustomerSub: "नया दुकान ग्राहक पंजीकृत करें",
    voiceSearchSub: "प्रोफ़ाइल खोलने के लिए ग्राहक का नाम बोलें",
    statementsTitle: "ग्राहक विवरण (Statements)",
    statementsSub: "पीडीएफ विवरण बनाएं और साझा करें",
    viewAllHistory: "पूरा इतिहास देखें",
    noTransactionsSub: "वॉयस एंट्री शुरू करने के लिए ऊपर माइक कार्ड पर टैप करें!",
    customerSearchTitle: "ग्राहक आवाज़ खोज",
    outstanding: "कुल बकाया (Outstanding)",
    customers: "ग्राहक सूची",
    recentTransactions: "हाल के लेन-देन",
    addCustomer: "ग्राहक जोड़ें",
    voiceSearch: "आवाज़ खोज",
  },
  hinglish: {
    todaysOverview: "Apne shop ka aaj ka ledger check karein.",
    activeCredit: "Active credit ledger book me",
    totalAccounts: "Total registered accounts",
    recordedInLedger: "Ledger book me saved",
    receivedUPI: "Cash ya UPI me received",
    addVoiceDescription: "Speak naturally in Hindi, Hinglish, or English and get instant spoken confirmations.",
    exampleCommandLabel: "Example Command:",
    voiceConfirmationLabel: "Instant Spoken Confirmation:",
    tapToSpeak: "Tap to Speak",
    addCustomerSub: "Register a new shop customer",
    voiceSearchSub: "Say customer name to open profile",
    statementsTitle: "Customer Statements",
    statementsSub: "Generate and share PDF statements",
    viewAllHistory: "View All History",
    noTransactionsSub: "Tap the microphone card above to start voice entry!",
    customerSearchTitle: "Voice Search Customer",
    outstanding: "Outstanding",
    customers: "Customers",
    recentTransactions: "Recent Transactions",
    addCustomer: "Add Customer",
    voiceSearch: "Voice Search",
  },
  mr: {
    todaysOverview: "तुमच्या दुकानाची आजची स्थिती खालीलप्रमाणे आहे.",
    activeCredit: "खातेवहीमध्ये सक्रिय उधार",
    totalAccounts: "एकूण नोंदणीकृत दुकानाचे खाते",
    recordedInLedger: "खातेवहीत नोंदवले गेले",
    receivedUPI: "रोख/UPI मध्ये प्राप्त झाले",
    addVoiceDescription: "हिंदी, हिंग्लिश किंवा इंग्रजीमध्ये नैसर्गिकरित्या बोला आणि झटपट ऑडिओ पुष्टीकरण मिळवा.",
    exampleCommandLabel: "उदाहरण कमांड:",
    voiceConfirmationLabel: "झटपट ऑडिओ पुष्टीकरण:",
    tapToSpeak: "बोलण्यासाठी टॅप करा",
    addCustomerSub: "नवीन दुकान ग्राहक नोंदवा",
    voiceSearchSub: "प्रोफाइल उघडण्यासाठी ग्राहकाचे नाव बोला",
    statementsTitle: "ग्राहक अहवाल (Statements)",
    statementsSub: "पीडीएफ अहवाल तयार करा आणि शेअर करा",
    viewAllHistory: "सर्व इतिहास पहा",
    noTransactionsSub: "आवाज नोंदणी सुरू करण्यासाठी वरील माइक कार्डवर टॅप करा!",
    customerSearchTitle: "ग्राहक आवाज शोध",
    outstanding: "थकीत (Outstanding)",
    customers: "ग्राहक",
    recentTransactions: "अलीकडील व्यवहार",
    addCustomer: "ग्राहक जोडा",
    voiceSearch: "आवाज शोध",
  },
  gu: {
    todaysOverview: "અહીં તમારી દુકાનનું આજનું સરવૈયું છે.",
    activeCredit: "ખાતાવહીમાં સક્રિય ઉધાર",
    totalAccounts: "કુલ નોંધાયેલા દુકાનના ખાતા",
    recordedInLedger: "ખાતાવહીમાં નોંધાયેલ છે",
    receivedUPI: "રોકડ/UPI માં મળેલ",
    addVoiceDescription: "હિન્દી, હિંગ્લિશ અથવા અંગ્રેજીમાં સ્વાભાવિક રીતે બોલો અને ત્વરિત વૉઇસ કન્ફર્મેશન મેળવો.",
    exampleCommandLabel: "ઉદાહરણ કમાન્ડ:",
    voiceConfirmationLabel: "અવાજ પ્રતિસાદ:",
    tapToSpeak: "બોલવા માટે ટેપ કરો",
    addCustomerSub: "નવો દુકાન ગ્રાહક નોંધો",
    voiceSearchSub: "પ્રોફાઇલ ખોલવા માટે ગ્રાહકનું નામ બોલો",
    statementsTitle: "ગ્રાહક પત્રકો (Statements)",
    statementsSub: "પીડીએફ પત્રક બનાવો અને શેર કરો",
    viewAllHistory: "બધો ઇતિહાસ જુઓ",
    noTransactionsSub: "અવાજ નોંધણી શરૂ કરવા માટે ઉપરના માઇક કાર્ડ પર ટેપ કરો!",
    customerSearchTitle: "ગ્રાહક અવાજ શોધ",
    outstanding: "બાકી (Outstanding)",
    customers: "ગ્રાહકો",
    recentTransactions: "તાજેતરના વ્યવહારો",
    addCustomer: "ગ્રાહક ઉમેરો",
    voiceSearch: "અવાજ શોધ",
  },
  ta: {
    todaysOverview: "இன்று உங்கள் கடையின் செயல்பாடுகள் இதோ.",
    activeCredit: "கணக்கு புத்தகத்தில் செயலில் உள்ள கடன்",
    totalAccounts: "பதிவுசெய்யப்பட்ட மொத்த கணக்குகள்",
    recordedInLedger: "கணக்கு புத்தகத்தில் பதிவு செய்யப்பட்டது",
    receivedUPI: "பணம்/UPI மூலம் பெறப்பட்டது",
    addVoiceDescription: "இந்தி, ஹிங்கிலிஷ் அல்லது ஆங்கிலத்தில் இயல்பாகப் பேசுங்கள் மற்றும் உடனடி குரல் உறுதிப்படுத்தலைப் பெறுங்கள்.",
    exampleCommandLabel: "உதாரண கட்டளை:",
    voiceConfirmationLabel: "உடனடி குரல் உறுதிப்படுத்தல்:",
    tapToSpeak: "பேச தட்டவும்",
    addCustomerSub: "புதிய வாடிக்கையாளரை பதிவு செய்யவும்",
    voiceSearchSub: "விவரக்குறிப்பைத் திறக்க வாடிக்கையாளர் பெயரைக் கூறவும்",
    statementsTitle: "வாடிக்கையாளர் அறிக்கைகள்",
    statementsSub: "PDF அறிக்கைகளை உருவாக்கி பகிரவும்",
    viewAllHistory: "முழு வரலாற்றையும் காண்க",
    noTransactionsSub: "குരல் பதிவைத் தொடங்க மேலே உள்ள மைக் கார்டைத் தட்டவும்!",
    customerSearchTitle: "வாடிக்கையாளர் குரல் தேடல்",
    outstanding: "நிலுவையில் உள்ளது (Outstanding)",
    customers: "வாடிக்கையாளர்கள்",
    recentTransactions: "சமீபத்திய பரிவர்த்தனைகள்",
    addCustomer: "வாடிக்கையாளரைச் சேர்",
    voiceSearch: "குரல் தேடல்",
  },
  te: {
    todaysOverview: "ఈ రోజు మీ షాప్ పనితీరు ఇక్కడ ఉంది.",
    activeCredit: "ఖాతా పుస్తకంలో సక్రియ అప్పు",
    totalAccounts: "మొత్తం నమోదైన షాప్ ఖాతాలు",
    recordedInLedger: "ఖాతా పుస్తకంలో నమోదైనది",
    receivedUPI: "నగదు/UPI లో స్వీకరించబడింది",
    addVoiceDescription: "హిందీ, హింగ్లీష్ లేదా ఇంగ్లీషులో సహజంగా మాట్లాడండి మరియు తక్షణ వాయిస్ నిర్ధారణను పొందండి.",
    exampleCommandLabel: "ఉదాహరణ కమాండ్:",
    voiceConfirmationLabel: "తక్షణ వాయిస్ నిర్ధారణ:",
    tapToSpeak: "మాట్లాడటానికి ట్యాప్ చేయండి",
    addCustomerSub: "కొత్త షాప్ కస్టమర్‌ను నమోదు చేయండి",
    voiceSearchSub: "ప్రొఫైల్ తెరవడానికి కస్టమర్ పేరు చెప్పండి",
    statementsTitle: "కస్టమర్ నివేదికలు (Statements)",
    statementsSub: "PDF నివేదికలను సృష్టించండి మరియు భాగస్వామ్యం చేయండి",
    viewAllHistory: "మొత్తం చరిత్రను వీక్షించండి",
    noTransactionsSub: "వాయిస్ ఎంట్రీని ప్రారంభించడానికి పైన ఉన్న మైక్ కార్డ్‌ను ట్యాప్ చేయండి!",
    customerSearchTitle: "కస్టమర్ వాయిస్ శోధన",
    outstanding: "బాకీ ఉంది (Outstanding)",
    customers: "కస్టమర్లు",
    recentTransactions: "ఇటీవలి లావాదేవీలు",
    addCustomer: "కస్టమర్‌ను జోడించు",
    voiceSearch: "వాయిస్ శోధన",
  },
  bn: {
    todaysOverview: "আজকে আপনার দোকানের হিসাব এখানে রয়েছে।",
    activeCredit: "খাতায় সক্রিয় ধার",
    totalAccounts: "মোট নিবন্ধিত দোকান অ্যাকাউন্ট",
    recordedInLedger: "খাতায় সংরক্ষিত হয়েছে",
    receivedUPI: "নগদ/UPI তে প্রাপ্ত হয়েছে",
    addVoiceDescription: "হিন্দি, হিংলিশ বা ইংরেজিতে স্বাভাবিকভাবে বলুন এবং তাৎক্ষণিক ভয়েস নিশ্চিতকরণ পান।",
    exampleCommandLabel: "उदाहरण कमांड:",
    voiceConfirmationLabel: "তাৎক্ষণিক ভয়েস নিশ্চিতকরণ:",
    tapToSpeak: "বলার জন্য ট্যাপ করুন",
    addCustomerSub: "নতুন দোকান গ্রাহক নিবন্ধন করুন",
    voiceSearchSub: "প্রোফাইল খুলতে গ্রাহকের নাম বলুন",
    statementsTitle: "গ্রাহক বিবরণী (Statements)",
    statementsSub: "পিডিএফ বিবরণী তৈরি এবং শেয়ার করুন",
    viewAllHistory: "সব ইতিহাস দেখুন",
    noTransactionsSub: "ভয়েস এন্ট্রি শুরু করতে উপরের মাইক কার্ডে ট্যাপ করুন!",
    customerSearchTitle: "গ্রাহক ভয়েস অনুসন্ধান",
    outstanding: "বকেয়া (Outstanding)",
    customers: "গ্রাহকগণ",
    recentTransactions: "সাম্প্রতিক লেনদেন",
    addCustomer: "গ্রাহক যোগ করুন",
    voiceSearch: "ভয়েস অনুসন্ধান",
  },
  pa: {
    todaysOverview: "ਅੱਜ ਤੁਹਾਡੀ ਦੁਕਾਨ ਦਾ ਹਿਸਾਬ-ਕਿਤਾਬ ਇੱਥੇ ਹੈ।",
    activeCredit: "ਖਾਤਾ ਵਹੀ ਵਿੱਚ ਸਰਗਰਮ ਉਧਾਰ",
    totalAccounts: "ਕੁੱਲ ਰਜਿਸਟਰਡ ਦੁਕਾਨ ਖਾਤੇ",
    recordedInLedger: "ਖਾਤਾ ਵਹੀ ਵਿੱਚ ਦਰਜ",
    receivedUPI: "ਨਕਦ/UPI ਵਿੱਚ ਪ੍ਰਾਪਤ ਹੋਇਆ",
    addVoiceDescription: "ਹਿੰਦੀ, ਹਿੰਗਲਿਸ਼ ਜਾਂ ਅੰਗਰੇਜ਼ੀ ਵਿੱਚ ਕੁਦਰਤੀ ਤੌਰ ਤੇ ਬੋਲੋ ਅਤੇ ਤੁਰੰਤ ਆਵਾਜ਼ ਦੀ ਪੁਸ਼ਟੀ ਪ੍ਰਾਪਤ ਕਰੋ।",
    exampleCommandLabel: "ਉਦਾਹਰਣ ਕਮਾਂਡ:",
    voiceConfirmationLabel: "ਤੁਰੰਤ ਆਵਾਜ਼ ਦੀ ਪੁਸ਼ਟੀ:",
    tapToSpeak: "ਬੋਲਣ ਲਈ ਟੈਪ ਕਰੋ",
    addCustomerSub: "ਨਵਾਂ ਦੁਕਾਨ ਗਾਹਕ ਰਜਿਸਟਰ ਕਰੋ",
    voiceSearchSub: "ਪ੍ਰੋਫਾਈਲ ਖੋਲ੍ਹਣ ਲਈ ਗ੍ਰਾਹਕ ਦਾ ਨਾਮ ਬੋਲੋ",
    statementsTitle: "ਗਾਹਕ ਸਟੇਟਮੈਂਟਾਂ (Statements)",
    statementsSub: "PDF ਸਟੇਟਮੈਂਟਾਂ ਬਣਾਓ ਅਤੇ ਸਾਂਝੀਆਂ ਕਰੋ",
    viewAllHistory: "ਸਾਰਾ ਇਤਿਹਾਸ ਦੇਖੋ",
    noTransactionsSub: "ਆਵਾਜ਼ ਐਂਟਰੀ ਸ਼ੁਰੂ ਕਰਨ ਲਈ ਉੱਪਰ ਦਿੱਤੇ ਮਾਈਕ ਕਾਰਡ 'ਤੇ ਟੈਪ ਕਰੋ!",
    customerSearchTitle: "ਗਾਹਕ ਆਵਾਜ਼ ਖੋਜ",
    outstanding: "ਬਕਾਇਆ (Outstanding)",
    customers: "ਗਾਹਕ",
    recentTransactions: "ਤਾਜ਼ਾ ਲੈਣ-ਦੇਣ",
    addCustomer: "ਗਾਹਕ ਜੋੜੋ",
    voiceSearch: "ਆਵਾਜ਼ ਖੋਜ",
  }
};

export default function Dashboard() {
  const { merchant } = useAuth();
  const navigate = useNavigate();
  const { language, t } = useTranslation();

  const dt = (key) => {
    const dict = localDashboardTranslations[language] || localDashboardTranslations['en'];
    return dict[key] || localDashboardTranslations['en'][key] || key;
  };

  const getGreeting = () => {
    const hrs = new Date().getHours();
    const greetings = {
      en: { morning: 'Good Morning', afternoon: 'Good Afternoon', evening: 'Good Evening' },
      hi: { morning: 'शुभ प्रभात', afternoon: 'नमस्कार', evening: 'शुभ संध्या' },
      hinglish: { morning: 'Good Morning', afternoon: 'Good Afternoon', evening: 'Good Evening' },
      mr: { morning: 'शुभ प्रभात', afternoon: 'शुभ दुपार', evening: 'शुभ संध्या' },
      gu: { morning: 'શુભ પ્રભાત', afternoon: 'શુભ બપોર', evening: 'શુભ સાંજ' },
      ta: { morning: 'காலை வணக்கம்', afternoon: 'மதிய வணக்கம்', evening: 'மாலை வணக்கம்' },
      te: { morning: 'శుభోదయం', afternoon: 'మధ్యాహ్న వందనం', evening: 'సాయంత్ర వందనం' },
      bn: { morning: 'সুপ্রভাত', afternoon: 'शुभ दोपहर', evening: 'शुभ संध्या' },
      pa: { morning: 'ਸ਼ੁਭ ਪ੍ਰਭਾਤ', afternoon: 'ਸ਼ੁਭ ਦੁਪਹਿਰ', evening: 'ਸ਼ੁਭ ਸ਼ਾਮ' }
    };
    
    const langGreetings = greetings[language] || greetings['en'];
    if (hrs < 12) return langGreetings.morning;
    if (hrs < 17) return langGreetings.afternoon;
    return langGreetings.evening;
  };
  const [stats, setStats] = useState({
    totalCustomers: 0,
    outstandingCredit: 0,
    todayCredit: 0,
    todayPayment: 0,
    todayCount: 0,
  });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showVoiceSearch, setShowVoiceSearch] = useState(false);
  const [searchTranscribing, setSearchTranscribing] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const {
    isListening: searchListening,
    error: searchError,
    duration: searchDuration,
    audioBlob: searchAudioBlob,
    startListening: startSearchListening,
    stopListening: stopSearchListening,
    resetTranscript: resetSearchTranscript,
  } = useVoice();



  useEffect(() => {
    (async () => {
      try {
        const [customersRes, txRes] = await Promise.all([
          listCustomers({ limit: 100 }),
          listTransactions({ limit: 5 }),
        ]);

        const customers = customersRes.data.data.customers;
        const outstandingCredit = customers.reduce((s, c) => s + c.currentBalance, 0);

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const todayTxRes = await listTransactions({ limit: 200 });
        const todayTx = todayTxRes.data.data.transactions.filter((t) => new Date(t.createdAt) >= startOfDay);
        const todayCredit = todayTx.filter((t) => t.type === 'CREDIT').reduce((s, t) => s + t.amount, 0);
        const todayPayment = todayTx.filter((t) => t.type === 'PAYMENT').reduce((s, t) => s + t.amount, 0);

        setStats({
          totalCustomers: customersRes.data.data.total,
          outstandingCredit,
          todayCredit,
          todayPayment,
          todayCount: todayTx.length,
        });
        setRecent(txRes.data.data.transactions);
      } catch (err) {
        // quiet error
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Trigger voice customer search upload when audio recording completes
  useEffect(() => {
    if (searchAudioBlob) {
      handleVoiceSearchUpload(searchAudioBlob);
    }
  }, [searchAudioBlob]);

  const handleVoiceSearchUpload = async (blob) => {
    setSearchTranscribing(true);
    setSuggestions([]);
    try {
      const mime = blob.type || 'audio/webm';
      const parts = mime.split(';')[0].split('/');
      let ext = parts[1] || 'webm';
      if (ext === 'mpeg' || ext === 'mpga') ext = 'mp3';

      const formData = new FormData();
      formData.append('audio', blob, `search.${ext}`);
      
      const { data } = await searchCustomerVoice(formData);
      const customer = data.data.customer;
      const transcript = data.data.transcript;
      const suggs = data.data.suggestions || [];
      
      if (customer) {
        toast.success(`Found Customer: ${customer.name}! Opening profile... 🚀`);
        setShowVoiceSearch(false);
        navigate(`/customers/${customer._id}`);
      } else if (suggs.length > 0) {
        setSuggestions(suggs);
        toast.success(`Select from suggested matching names below!`);
      } else {
        toast.error(`No customer found matching "${transcript}". Please try again.`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Voice search failed. Please speak clearly.');
    } finally {
      setSearchTranscribing(false);
      resetSearchTranscript();
    }
  };

  const handleVoiceSearchToggle = () => {
    if (searchListening) {
      stopSearchListening();
    } else {
      resetSearchTranscript();
      startSearchListening();
    }
  };

  const closeVoiceSearch = () => {
    stopSearchListening();
    setShowVoiceSearch(false);
    resetSearchTranscript();
    setSuggestions([]);
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <Layout title={t('dashboard')}>
      <div className="space-y-6">
        
        {/* Dynamic Welcomer Header with Voice Search Quick Action */}
        <div className="flex justify-between items-center animate-slide-up">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight">
              {getGreeting()}, {merchant?.name || 'Merchant'} 👋
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mt-0.5 font-medium">{dt('todaysOverview')}</p>
          </div>
          <button
            onClick={() => setShowVoiceSearch(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-2xl border border-blue-100/50 text-xs font-bold active:scale-95 transition-all shadow-sm shadow-blue-500/5"
          >
            <Mic size={14} className="animate-pulse" />
            <span>{dt('voiceSearch')}</span>
          </button>
        </div>

        {/* Stats Cards Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          
          {/* Stats Card 1: Outstanding Credit */}
          <Card hoverable={true} delayIdx={1} className="!p-3.5 sm:!p-5 border-l-4 border-l-rose-500 relative overflow-hidden group">
            <div className="flex justify-between items-start gap-1">
              <div className="min-w-0">
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">{dt('outstanding')}</p>
                {loading ? (
                  <Skeleton variant="text" className="w-16 h-6 mt-1.5" />
                ) : (
                  <p className="text-base sm:text-2xl font-extrabold text-rose-600 mt-1 truncate tracking-tight">
                    {formatCurrency(stats.outstandingCredit)}
                  </p>
                )}
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 border border-rose-100/50 shrink-0">
                <Wallet size={16} className="sm:w-5 sm:h-5" />
              </div>
            </div>
            <p className="text-[10px] sm:text-xs text-rose-600/80 font-semibold mt-2.5 truncate">
              <span>{dt('activeCredit')}</span>
            </p>
          </Card>

          {/* Stats Card 2: Total Customers */}
          <Card hoverable={true} delayIdx={1} className="!p-3.5 sm:!p-5 border-l-4 border-l-blue-500 relative overflow-hidden group">
            <div className="flex justify-between items-start gap-1">
              <div className="min-w-0">
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">{dt('customers')}</p>
                {loading ? (
                  <Skeleton variant="text" className="w-12 h-6 mt-1.5" />
                ) : (
                  <p className="text-base sm:text-2xl font-extrabold text-blue-600 mt-1 truncate tracking-tight">
                    {stats.totalCustomers}
                  </p>
                )}
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 border border-blue-100/50 shrink-0">
                <Users size={16} className="sm:w-5 sm:h-5" />
              </div>
            </div>
            <p className="text-[10px] sm:text-xs text-blue-650 font-semibold mt-2.5 truncate">
              <span>{dt('totalAccounts')}</span>
            </p>
          </Card>

          {/* Stats Card 3: Today's Credit */}
          <Card hoverable={true} delayIdx={2} className="!p-3.5 sm:!p-5 border-l-4 border-l-amber-500 relative overflow-hidden group">
            <div className="flex justify-between items-start gap-1">
              <div className="min-w-0">
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">{t('todaysCredit')}</p>
                {loading ? (
                  <Skeleton variant="text" className="w-16 h-6 mt-1.5" />
                ) : (
                  <p className="text-base sm:text-2xl font-extrabold text-amber-600 mt-1 truncate tracking-tight">
                    {formatCurrency(stats.todayCredit)}
                  </p>
                )}
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 border border-amber-100/50 shrink-0">
                <TrendingUp size={16} className="sm:w-5 sm:h-5" />
              </div>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-2.5 truncate">
              {dt('recordedInLedger')}
            </p>
          </Card>

          {/* Stats Card 4: Today's Payments */}
          <Card hoverable={true} delayIdx={2} className="!p-3.5 sm:!p-5 border-l-4 border-l-sky-500 relative overflow-hidden group">
            <div className="flex justify-between items-start gap-1">
              <div className="min-w-0">
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">{t('todaysPayments')}</p>
                {loading ? (
                  <Skeleton variant="text" className="w-16 h-6 mt-1.5" />
                ) : (
                  <p className="text-base sm:text-2xl font-extrabold text-sky-600 mt-1 truncate tracking-tight">
                    {formatCurrency(stats.todayPayment)}
                  </p>
                )}
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-500 border border-sky-100/50 shrink-0">
                <TrendingDown size={16} className="sm:w-5 sm:h-5" />
              </div>
            </div>
            <p className="text-[10px] sm:text-xs text-sky-655 font-semibold mt-2.5 truncate">
              {dt('receivedUPI')}
            </p>
          </Card>
        </div>

        {/* Floating Voice Action Card */}
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none shadow-md shadow-blue-500/10 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden animate-slide-up delay-2">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-400/10 rounded-full blur-2xl"></div>

          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-3.5 relative z-10 w-full md:w-auto">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider">
              <span>🎙️ {dt('voiceSearch')}</span>
            </div>
            <h3 className="text-xl md:text-2xl font-extrabold tracking-tight">{t('addTransactionVoice')}</h3>
            <p className="text-blue-100 text-xs md:text-sm max-w-md leading-relaxed font-semibold">
              {dt('addVoiceDescription')}
            </p>
            <div className="flex flex-col gap-1.5 text-[11px] text-blue-100 bg-white/10 p-4 rounded-2xl border border-white/5 max-w-md w-full font-bold text-left animate-slide-up">
              <span className="text-white uppercase tracking-wider text-[9px] opacity-70">{dt('exampleCommandLabel')}</span>
              <span className="bg-white/10 px-2.5 py-1.5 rounded-xl font-mono text-white select-all">
                "Ramesh ko 500 rupaye udhaar diya"
              </span>
              <span className="text-white uppercase tracking-wider text-[9px] opacity-70 mt-1">{dt('voiceConfirmationLabel')}</span>
              <span className="text-blue-200 italic font-medium">
                📢 "Ramesh ke account mein 500 rupaye add kiye gaye hain."
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 shrink-0 relative z-10">
            <button 
              onClick={() => navigate('/voice')}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white hover:bg-blue-50 text-teal-600 flex items-center justify-center shadow-lg active:scale-95 transition-all duration-300 mic-pulse animate-bounce"
            >
              <Mic size={28} className="text-blue-600 md:w-8 md:h-8" />
            </button>
            <span className="text-[10px] sm:text-xs font-bold text-blue-55 tracking-wide uppercase">{dt('tapToSpeak')}</span>
          </div>
        </div>

        {/* Quick Links & Recent Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Quick Actions Shortcuts */}
          <div className="lg:col-span-4 space-y-4 animate-slide-up delay-3">
            <h3 className="text-base font-bold text-slate-800">{t('quickActions')}</h3>
            
            <Link to="/customers" className="card p-4 flex items-center gap-3.5 hover:-translate-y-0.5 transition-all bg-white">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <UserPlus size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 leading-none">{dt('addCustomer')}</p>
                <p className="text-xs text-slate-400 mt-1.5">{dt('addCustomerSub')}</p>
              </div>
              <ChevronRight size={16} className="text-slate-400" />
            </Link>

            <button
              onClick={() => setShowVoiceSearch(true)}
              className="w-full text-left card p-4 flex items-center gap-3.5 hover:-translate-y-0.5 transition-all bg-white"
            >
              <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <Mic size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 leading-none">{dt('customerSearchTitle')}</p>
                <p className="text-xs text-slate-400 mt-1.5">{dt('voiceSearchSub')}</p>
              </div>
              <ChevronRight size={16} className="text-slate-400" />
            </button>

            <Link to="/reports" className="card p-4 flex items-center gap-3.5 hover:-translate-y-0.5 transition-all bg-white">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <FileText size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 leading-none">{dt('statementsTitle')}</p>
                <p className="text-xs text-slate-400 mt-1.5">{dt('statementsSub')}</p>
              </div>
              <ChevronRight size={16} className="text-slate-400" />
            </Link>
          </div>

          {/* Recent Ledger List */}
          <div className="lg:col-span-8 space-y-4 animate-slide-up delay-3">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-800">{dt('recentTransactions')}</h3>
              <Link to="/transactions" className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-0.5">
                <span>{dt('viewAllHistory')}</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            <Card hoverable={false} className="!p-0 bg-white">
              {loading ? (
                <div className="py-8 px-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <Skeleton variant="avatar" />
                    <div className="flex-1 space-y-2">
                      <Skeleton variant="text" className="w-24 h-4" />
                      <Skeleton variant="text" className="w-36 h-3" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Skeleton variant="avatar" />
                    <div className="flex-1 space-y-2">
                      <Skeleton variant="text" className="w-20 h-4" />
                      <Skeleton variant="text" className="w-32 h-3" />
                    </div>
                  </div>
                </div>
              ) : recent.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-400">
                  <p>{t('noTransactions')}</p>
                  <p className="text-xs text-slate-400/80 mt-1">{dt('noTransactionsSub')}</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100/60 px-5">
                  {recent.map((tx) => (
                    <div key={tx._id} className="py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/50 px-2 rounded-xl transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 border border-slate-100 font-bold text-xs shrink-0">
                          {tx.customerId?.name ? tx.customerId.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 text-sm truncate leading-tight">{tx.customerId?.name || 'Unknown Customer'}</p>
                          <p className="text-[10px] text-slate-450 mt-1 truncate">{formatDateTime(tx.createdAt)} · Receipt #{tx.receiptNumber}</p>
                        </div>
                      </div>
                      <span className={`font-extrabold text-sm shrink-0 ${tx.type === 'CREDIT' ? 'text-rose-600' : 'text-sky-600'}`}>
                        {tx.type === 'CREDIT' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

        </div>

      </div>

      {/* VOICE SEARCH CUSTOMER MODAL */}
      <Modal
        isOpen={showVoiceSearch}
        onClose={closeVoiceSearch}
        title={dt('customerSearchTitle')}
        subtitle={dt('voiceSearchSub')}
        icon={Mic}
      >
        <div className="flex flex-col items-center py-6 space-y-5 text-center">
          
          <button
            type="button"
            onClick={handleVoiceSearchToggle}
            disabled={searchTranscribing}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95 ${
              searchListening
                ? 'bg-rose-500 text-white mic-pulse'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/10'
            } ${searchTranscribing ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            {searchListening ? <Square size={22} className="fill-white" /> : <Mic size={24} />}
          </button>

          {/* Soundwave animation */}
          {searchListening && (
            <div className="flex justify-center items-center h-10 space-x-1">
              <div className="soundwave-bar"></div>
              <div className="soundwave-bar"></div>
              <div className="soundwave-bar"></div>
              <div className="soundwave-bar flex-1"></div>
              <div className="soundwave-bar"></div>
              <div className="soundwave-bar"></div>
            </div>
          )}

          {/* Status text */}
          <p className="text-xs font-semibold text-slate-400 max-w-xs leading-relaxed">
            {searchListening ? (
              <span className="text-rose-500 animate-pulse font-bold uppercase tracking-wider block">
                Listening ({formatTimer(searchDuration)})...
              </span>
            ) : searchTranscribing ? (
              <span className="text-blue-500 animate-pulse font-bold uppercase tracking-wider block flex items-center gap-1.5 justify-center">
                <Loader2 size={12} className="animate-spin" />
                Searching ledger via Groq Whisper...
              </span>
            ) : (
              <span>Tap the mic and speak a customer's name<br />(e.g., "Ramesh Kumar" or "Suresh")</span>
            )}
          </p>

          {/* Error display */}
          {searchError && (
            <div className="text-center p-3 bg-rose-50 rounded-2xl border border-rose-100 text-rose-600 text-xs font-medium max-w-xs animate-shake">
              ⚠️ {searchError}
            </div>
          )}

          {/* Suggestions List */}
          {suggestions.length > 0 && (
            <div className="w-full max-w-xs space-y-2 pt-2 animate-fade-in">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center">
                Suggested Matches
              </p>
              <div className="flex flex-col gap-1.5 border border-slate-100 rounded-2xl p-2 bg-slate-50/40 max-h-40 overflow-y-auto">
                {suggestions.map((s) => (
                  <button
                    key={s._id}
                    type="button"
                    onClick={() => {
                      setShowVoiceSearch(false);
                      setSuggestions([]);
                      navigate(`/customers/${s._id}`);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100 rounded-xl text-xs font-bold text-slate-700 flex justify-between items-center transition-all duration-200 active:scale-[0.98]"
                  >
                    <span>👤 {s.name}</span>
                    <span className="text-[10px] font-medium text-slate-450">{formatCurrency(s.currentBalance)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </Modal>

    </Layout>
  );
}
