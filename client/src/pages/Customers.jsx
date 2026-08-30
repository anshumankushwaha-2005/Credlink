import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, ChevronRight, X, Phone, User, MapPin, Camera, Upload, Trash2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../components/layout/Layout.jsx';
import { listCustomers, createCustomer, uploadCustomerPhoto, deleteCustomer } from '../services/customerService';
import { formatCurrency } from '../utils/formatCurrency';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Input from '../components/common/Input.jsx';
import Badge from '../components/common/Badge.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import Skeleton from '../components/common/Skeleton.jsx';
import Modal from '../components/common/Modal.jsx';
import { useTranslation } from '../context/LanguageContext';

const getVoiceMessages = (langCode, customerName, amount) => {
  const messages = {
    en: {
      credit: `Added ${amount} rupees to ${customerName}'s account.`,
      payment: `Received ${amount} rupees from ${customerName}.`,
      create: `Customer ${customerName} successfully added.`,
      error: "Transaction failed to save. Please try again."
    },
    hi: {
      credit: `${customerName} ke account mein ${amount} rupaye add kiye gaye hain.`,
      payment: `${customerName} se ${amount} rupaye receive kiye gaye hain.`,
      create: `${customerName} naam ka customer successfully add kar diya gaya hai.`,
      error: "Transaction save nahi ho paya. Please dobara try karein."
    },
    hinglish: {
      credit: `${customerName} ke account mein ${amount} rupaye add kiye gaye hain.`,
      payment: `${customerName} se ${amount} rupaye receive kiye gaye hain.`,
      create: `${customerName} naam ka customer successfully add kar diya gaya hai.`,
      error: "Transaction save nahi ho paya. Please dobara try karein."
    },
    mr: {
      credit: `${customerName} च्या खात्यात ${amount} रुपये जमा केले आहेत.`,
      payment: `${customerName} कडून ${amount} रुपये मिळाले आहेत.`,
      create: `${customerName} नावाचा ग्राहक यशस्वीरित्या जोडला गेला आहे.`,
      error: "व्यवहार जतन करण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा."
    },
    gu: {
      credit: `${customerName} ના ખાતામાં ${amount} રૂપિયા ઉમેરવામાં આવ્યા છે.`,
      payment: `${customerName} પાસેથી ${amount} રૂપિયા મળ્યા છે.`,
      create: `${customerName} નામનો ગ્રાહક સફળતાપૂર્વક ઉમેરવામાં આવ્યો છે.`,
      error: "વ્યવહાર સાચવવામાં નિષ્ફળ. કૃપા કરીને ફરીથીપ્રયાસ કરો."
    },
    ta: {
      credit: `${customerName} கணக்கில் ${amount} ரூபாய் சேர்க்கப்பட்டுள்ளது.`,
      payment: `${customerName} இடமிருந்து ${amount} ரூபாய் பெறப்பட்டது.`,
      create: `${customerName} என்ற வாடிக்கையாளர் வெற்றிகரமாக சேர்க்கப்பட்டார்.`,
      error: "பரிவர்த்தனையைச் சேமிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்."
    },
    te: {
      credit: `${customerName} ఖాతాలో ${amount} రూపాయలు జోడించబడ్డాయి.`,
      payment: `${customerName} నుండి ${amount} రూపాయలు స్వీకరించబడ్డాయి.`,
      create: `${customerName} అనే కస్టమర్ విజయవంతంగా జోడించబడ్డారు.`,
      error: "లావాదేవీని సేవ్ చేయడం విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి."
    },
    bn: {
      credit: `${customerName} এর অ্যাকাউন্টে ${amount} টাকা যোগ করা হয়েছে।`,
      payment: `${customerName} এর কাছ থেকে ${amount} টাকা পাওয়া গেছে।`,
      create: `${customerName} নামের গ্রাহক সফলভাবে যোগ করা হয়েছে।`,
      error: "লেনদেন সংরক্ষণ করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।"
    },
    pa: {
      credit: `${customerName} ਦੇ ਖਾਤੇ ਵਿੱਚ ${amount} ਰੁਪਏ ਜੋੜ ਦਿੱਤੇ ਗਏ ਹਨ।`,
      payment: `${customerName} ਤੋਂ ${amount} ਰੁਪਏ ਪ੍ਰਾਪਤ ਹੋਏ ਹਨ।`,
      create: `${customerName} ਨਾਮ ਦਾ ਗਾਹਕ ਸਫਲਤਾਪੂਰਵਕ ਜੋੜਿਆ ਗਿਆ ਹੈ।`,
      error: "ਲੈਣ-ਦੇਣ ਸੁਰੱਖਿਅਤ ਨਹੀਂ ਹੋ ਸਕਿਆ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।"
    }
  };
  return messages[langCode] || messages['en'];
};

const localCustomerTranslations = {
  en: {
    shopCustomers: "Shop Customers",
    manageLedger: "Manage your customer credit ledger easily.",
    searchPlaceholder: "Search customer by name or phone...",
    noCustomersTitle: "No customers yet",
    noCustomersDesc: "Add your first customer and start tracking credit digitally using speech or manual logs.",
    addCustomerBtn: "Add Customer",
    settled: "Settled",
    outstanding: "Outstanding",
    balance: "Balance",
    viewDetails: "View Details",
    addCustomerModalTitle: "Add Customer",
    addCustomerModalSub: "Register a customer to record credit ledger",
    customerNameLabel: "Customer Name *",
    customerNamePlaceholder: "Enter name (e.g. Ramesh Kumar)",
    phoneLabel: "Phone / WhatsApp Number",
    phonePlaceholder: "10-digit mobile (e.g. 9812345678)",
    addressLabel: "Address (Optional)",
    addressPlaceholder: "Enter shop/residential address",
    saveCustomerBtn: "Save Customer Info",
    noPhone: "No phone",
    requiredError: "Customer name is required",
    successMsg: "Customer added successfully! 🎉",
    failedMsg: "Failed to add customer",
    uploadPhoto: "Upload Photo",
    removePhoto: "Remove",
    deleteCustomer: "Delete Customer",
    deleteConfirmTitle: "Delete Customer?",
    deleteConfirmMsg: "Are you sure you want to delete",
    deleteConfirmNote: "All transactions linked to this customer will be hidden.",
    deleteBtn: "Yes, Delete",
    cancelBtn: "Cancel",
    deleteSuccess: "Customer deleted successfully!",
    deleteFailed: "Failed to delete customer"
  },
  hi: {
    shopCustomers: "ग्राहक सूची",
    manageLedger: "अपने ग्राहक क्रेडिट बही-खाते को आसानी से प्रबंधित करें।",
    searchPlaceholder: "नाम या फ़ोन नंबर द्वारा ग्राहक खोजें...",
    noCustomersTitle: "अभी कोई ग्राहक नहीं है",
    noCustomersDesc: "अपना पहला ग्राहक जोड़ें और आवाज़ या मैनुअल लॉग द्वारा उधार ट्रैक करना शुरू करें।",
    addCustomerBtn: "ग्राहक जोड़ें",
    settled: "चुक्ता (Settled)",
    outstanding: "बकाया (Outstanding)",
    balance: "बकाया राशि",
    viewDetails: "विवरण देखें",
    addCustomerModalTitle: "ग्राहक जोड़ें",
    addCustomerModalSub: "क्रेडिट बही-खाता रिकॉर्ड करने के लिए ग्राहक पंजीकृत करें",
    customerNameLabel: "ग्राहक का नाम *",
    customerNamePlaceholder: "नाम दर्ज करें (जैसे रमेश कुमार)",
    phoneLabel: "फ़ोन / व्हाट्सएप नंबर",
    phonePlaceholder: "10-अंकों का मोबाइल (जैसे 9812345678)",
    addressLabel: "पता (वैकल्पिक)",
    addressPlaceholder: "दुकान/घर का पता दर्ज करें",
    saveCustomerBtn: "ग्राहक जानकारी सुरक्षित करें",
    noPhone: "कोई फ़ोन नहीं",
    requiredError: "ग्राहक का नाम आवश्यक है",
    successMsg: "ग्राहक सफलतापूर्वक जोड़ दिया गया है! 🎉",
    failedMsg: "ग्राहक जोड़ने में विफल",
    uploadPhoto: "फ़ोटो अपलोड करें",
    removePhoto: "हटाएं",
    deleteCustomer: "ग्राहक हटाएं",
    deleteConfirmTitle: "ग्राहक हटाएं?",
    deleteConfirmMsg: "क्या आप वाकई इस ग्राहक को हटाना चाहते हैं",
    deleteConfirmNote: "इस ग्राहक से जुड़े सभी लेनदेन छिपा दिए जाएंगे।",
    deleteBtn: "हाँ, हटाएं",
    cancelBtn: "रद्द करें",
    deleteSuccess: "ग्राहक सफलतापूर्वक हटा दिया गया!",
    deleteFailed: "ग्राहक हटाने में विफल"
  },
  hinglish: {
    shopCustomers: "Customers List",
    manageLedger: "Apne customer credit ledger ko aasani se manage karein.",
    searchPlaceholder: "Name ya phone number se customer search karein...",
    noCustomersTitle: "Koi customer nahi hai",
    noCustomersDesc: "Apna pehla customer add karein aur voice ya manual logs se credit track karna shuru karein.",
    addCustomerBtn: "Customer Jodein",
    settled: "Settled",
    outstanding: "Outstanding",
    balance: "Balance / Bakaya",
    viewDetails: "Details Dekhein",
    addCustomerModalTitle: "Customer Jodein",
    addCustomerModalSub: "Credit ledger record karne ke liye customer register karein",
    customerNameLabel: "Customer Name *",
    customerNamePlaceholder: "Name likhein (e.g. Ramesh Kumar)",
    phoneLabel: "Phone / WhatsApp Number",
    phonePlaceholder: "10-digit mobile number (e.g. 9812345678)",
    addressLabel: "Pata / Address (Optional)",
    addressPlaceholder: "Dukan ya ghar ka pata likhein",
    saveCustomerBtn: "Customer Info Save Karein",
    noPhone: "No phone number",
    requiredError: "Customer ka naam likhna compulsory hai",
    successMsg: "Customer successfully add ho gaya! 🎉",
    failedMsg: "Customer add karne me fail ho gaye",
    uploadPhoto: "Photo Upload",
    removePhoto: "Remove",
    deleteCustomer: "Customer Delete Karein",
    deleteConfirmTitle: "Customer Delete Karein?",
    deleteConfirmMsg: "Kya aap sach mein is customer ko delete karna chahte hain",
    deleteConfirmNote: "Is customer ke saare transactions chhupa diye jayenge.",
    deleteBtn: "Haan, Delete Karein",
    cancelBtn: "Cancel",
    deleteSuccess: "Customer successfully delete ho gaya!",
    deleteFailed: "Customer delete nahi ho paya"
  },
  mr: {
    shopCustomers: "ग्राहक",
    manageLedger: "तुमच्या ग्राहकांच्या उधारीचे खातेवही सहजपणे व्यवस्थापित करा.",
    searchPlaceholder: "नाव किंवा फोनद्वारे ग्राहक शोधा...",
    noCustomersTitle: "अद्याप कोणतेही ग्राहक नाहीत",
    noCustomersDesc: "तुमचा पहिला ग्राहक जोडा आणि आवाज किंवा मॅन्युअल लॉग वापरून उधारीचा मागोवा घेणे सुरू करा.",
    addCustomerBtn: "ग्राहक जोडा",
    settled: "निलंबित (Settled)",
    outstanding: "थकीत (Outstanding)",
    balance: "शिल्लक",
    viewDetails: "तपशील पहा",
    addCustomerModalTitle: "ग्राहक जोडा",
    addCustomerModalSub: "उधारीची नोंद करण्यासाठी ग्राहकाची नोंदणी करा",
    customerNameLabel: "ग्राहकाचे नाव *",
    customerNamePlaceholder: "नाव प्रविष्ट करा (उदा. रमेश कुमार)",
    phoneLabel: "फोन / व्हॉट्सॲप नंबर",
    phonePlaceholder: "१०-अंकी मोबाईल (उदा. ९८१२३४५६७८)",
    addressLabel: "पत्ता (पर्यायी)",
    addressPlaceholder: "दुकानाचा/घराचा पत्ता प्रविष्ट करा",
    saveCustomerBtn: "ग्राहकाची माहिती जतन करा",
    noPhone: "फोन नाही",
    requiredError: "ग्राहकाचे नाव आवश्यक आहे",
    successMsg: "ग्राहक यशस्वीरित्या जोडला गेला! 🎉",
    failedMsg: "ग्राहक जोडण्यात अयशस्वी",
    uploadPhoto: "फोटो अपलोड करा",
    removePhoto: "काढून टाका",
    deleteCustomer: "ग्राहक हटवा",
    deleteConfirmTitle: "ग्राहक हटवायचा?",
    deleteConfirmMsg: "तुम्हाला खात्री आहे का की तुम्ही या ग्राहकाला हटवू इच्छिता",
    deleteConfirmNote: "या ग्राहकाशी संबंधित सर्व व्यवहार लपवले जातील.",
    deleteBtn: "होय, हटवा",
    cancelBtn: "रद्द करा",
    deleteSuccess: "ग्राहक यशस्वीरित्या हटवला!",
    deleteFailed: "ग्राहक हटवण्यात अयशस्वी"
  },
  gu: {
    shopCustomers: "ગ્રાહકો",
    manageLedger: "તમારા ગ્રાહકોની ઉધારી ખાતાવહી સરળતાથી સંચાલિત કરો.",
    searchPlaceholder: "નામ અથવા ફોન દ્વારા ગ્રાહક શોધો...",
    noCustomersTitle: "હજી સુધી કોઈ ગ્રાહક નથી",
    noCustomersDesc: "તમારો પ્રથમ ગ્રાહક ઉમેરો અને અવાજ અથવા મેન્યુઅલ લોગ દ્વારા ક્રેડિટ ટ્રેક કરવાનું શરૂ કરો.",
    addCustomerBtn: "ગ્રાહક ઉમેરો",
    settled: "ચૂકતે (Settled)",
    outstanding: "બાકી (Outstanding)",
    balance: "બાકી રકમ",
    viewDetails: "વિગત જુઓ",
    addCustomerModalTitle: "ગ્રાહક ઉમેરો",
    addCustomerModalSub: "ક્રેડિટ ખાતાવહી રેકોર્ડ કરવા માટે ગ્રાહક નોંધણી કરો",
    customerNameLabel: "ગ્રાહકનું નામ *",
    customerNamePlaceholder: "નામ દાખલ કરો (દા.ત. રમેશ કુમાર)",
    phoneLabel: "ફોન / વોટ્સએપ નંબર",
    phonePlaceholder: "10-અંકનો મોબાઈલ (દા.ત. 9812345678)",
    addressLabel: "સરનામું (વૈકલ્પિક)",
    addressPlaceholder: "દુકાન/રહેણાંક સરનામું દાખલ કરો",
    saveCustomerBtn: "ગ્રાહકની માહિતી સાચવો",
    noPhone: "કોઈ ફોન નથી",
    requiredError: "ગ્રાહકનું નામ જરૂરી છે",
    successMsg: "ગ્રાહક સફળતાપૂર્વક ઉમેરવામાં આવ્યો! 🎉",
    failedMsg: "ગ્રાહક ઉમેરવામાં નિષ્ફળ",
    uploadPhoto: "ફોટો અપલોડ કરો",
    removePhoto: "દૂર કરો",
    deleteCustomer: "ગ્રાહક કાઢી નાખો",
    deleteConfirmTitle: "ગ્રાહક કાઢી નાખશો?",
    deleteConfirmMsg: "શું તમે ખરેખર આ ગ્રાહકને કાઢી નાખવા માંગો છો",
    deleteConfirmNote: "આ ગ્રાહક સાથે જોડાયેલા બધા વ્યવહારો છુપાવવામાં આવશે.",
    deleteBtn: "હા, કાઢી નાખો",
    cancelBtn: "રદ કરો",
    deleteSuccess: "ગ્રાહક સફળતાપૂર્વક કાઢી નાખવામાં આવ્યો!",
    deleteFailed: "ગ્રાહક કાઢી નાખવામાં નિષ્ફળ"
  },
  ta: {
    shopCustomers: "வாடிக்கையாளர்கள்",
    manageLedger: "உங்கள் வாடிக்கையாளர் கடன் பேரேட்டை எளிதாக நிர்வகிக்கவும்.",
    searchPlaceholder: "பெயர் அல்லது தொலைபேசி மூலம் வாடிக்கையாளரைத் தேடவும்...",
    noCustomersTitle: "இன்னும் வாடிக்கையாளர்கள் இல்லை",
    noCustomersDesc: "உங்களது முதல் வாடிக்கையாளரைச் சேர்த்து, குரல் அல்லது கையேடு பதிவுகள் மூலம் கடனைக் கண்காணிக்கத் தொடங்குங்கள்.",
    addCustomerBtn: "வாடிக்கையாளரைச் சேர்",
    settled: "தீர்க்கப்பட்டது (Settled)",
    outstanding: "நிலுவையில் உள்ளது (Outstanding)",
    balance: "நிலுவைத்தொகை",
    viewDetails: "விவரங்களைப் பார்",
    addCustomerModalTitle: "வாடிக்கையாளரைச் சேர்",
    addCustomerModalSub: "கடன் பேరేட்டைப் பதிவு செய்ய வாடிக்கையாளரை பதிவு செய்யவும்",
    customerNameLabel: "வாடிக்கையாளர் பெயர் *",
    customerNamePlaceholder: "பெயரை உள்ளிடவும் (எ.கா. ரமேஷ் குமார்)",
    phoneLabel: "தொலைபேசி / வாட்ஸ்அப் எண்",
    phonePlaceholder: "10-இலக்க மொபைல் (எ.கா. 9812345678)",
    addressLabel: "முகவரி (விருப்பத்திற்குரியது)",
    addressPlaceholder: "கடை/வீட்டு முகவரியை உள்ளிடவும்",
    saveCustomerBtn: "தகவலைச் சேਮੀக்கவும்",
    noPhone: "தொலைபேசி இல்லை",
    requiredError: "வாடிக்கையாளர் பெயர் தேவை",
    successMsg: "வாடிக்கையாளர் வெற்றிகரமாக சேர்க்கப்பட்டார்! 🎉",
    failedMsg: "வாடிக்கையாளரைச் சேர்ப்பதில் தோல்வி",
    uploadPhoto: "புகைப்படத்தைப் பதிவேற்றவும்",
    removePhoto: "நீக்கவும்",
    deleteCustomer: "வாடிக்கையாளரை நீக்கு",
    deleteConfirmTitle: "வாடிக்கையாளரை நீக்கவா?",
    deleteConfirmMsg: "இந்த வாடிக்கையாளரை நீக்க விரும்புகிறீர்களா",
    deleteConfirmNote: "இந்த வாடிக்கையாளருடன் இணைக்கப்பட்ட அனைத்து பரிவர்த்தனைகளும் மறைக்கப்படும்.",
    deleteBtn: "ஆம், நீக்கு",
    cancelBtn: "ரத்து செய்",
    deleteSuccess: "வாடிக்கையாளர் வெற்றிகரமாக நீக்கப்பட்டார்!",
    deleteFailed: "வாடிக்கையாளரை நீக்குவதில் தோல்வி"
  },
  te: {
    shopCustomers: "కస్టమర్లు",
    manageLedger: "మీ కస్టమర్ క్రెడిట్ లెడ్జర్‌ను సులभంగా నిర్వహించండి.",
    searchPlaceholder: "పేరు లేదా ఫోన్ ద్వారా కస్టమర్‌ను వెతకండి...",
    noCustomersTitle: "ఇంకా కస్టమర్లు లేరు",
    noCustomersDesc: "మీ మొదటి కస్టమర్‌ను జోడించి, వాయిస్ లేదా మ్యాన్యువల్ లాగ్‌ల ద్వారా అప్పును ట్రాక్ చేయడం ప్రారంభించండి.",
    addCustomerBtn: "కస్టమర్‌ను జోడించు",
    settled: "పూర్తయింది (Settled)",
    outstanding: "బాకీ ఉంది (Outstanding)",
    balance: "బాకీ బ్యాలెన్స్",
    viewDetails: "వివరాలు వీక్షించండి",
    addCustomerModalTitle: "కస్టమర్‌ను జోడించు",
    addCustomerModalSub: "క్రెడిట్ లెడ్జర్ రికార్డ్ చేయడానికి కస్టమర్‌ను నమోదు చేయండి",
    customerNameLabel: "కస్టమర్ పేరు *",
    customerNamePlaceholder: "పేరు నమోదు చేయండి (ఉదా. రమేష్ కుమార్)",
    phoneLabel: "ఫోన్ / వాట్సాప్ నంబర్",
    phonePlaceholder: "10-అంకెర మొబైల్ (ఉదా. 9812345678)",
    addressLabel: "చిరునామా (ఐచ్ఛికం)",
    addressPlaceholder: "షాప్/నివాస చిరునామా నమోదు చేయండి",
    saveCustomerBtn: "కస్టమర్ సమాచారాన్ని సేవ్ చేయి",
    noPhone: "ఫోన్ లేదు",
    requiredError: "కస్టమర్ పేరు అవసరం",
    successMsg: "కస్టమర్ విజయవంతంగా జోడించబడ్డారు! 🎉",
    failedMsg: "కస్టమర్‌ను జోడించడంలో విఫలమైంది",
    uploadPhoto: "ఫోటోను అప్‌లోడ్ చేయండి",
    removePhoto: "తొలగించండి",
    deleteCustomer: "కస్టమర్‌ను తొలగించు",
    deleteConfirmTitle: "కస్టమర్‌ను తొలగించాలా?",
    deleteConfirmMsg: "మీరు ఈ కస్టమర్‌ను తొలగించాలనుకుంటున్నారా",
    deleteConfirmNote: "ఈ కస్టమర్‌కు సంబంధించిన అన్ని లావాదేవీలు దాచబడతాయి.",
    deleteBtn: "అవును, తొలగించు",
    cancelBtn: "రద్దు చేయి",
    deleteSuccess: "కస్టమర్ విజయవంతంగా తొలగించబడ్డారు!",
    deleteFailed: "కస్టమర్‌ను తొలగించడంలో విఫలమైంది"
  },
  bn: {
    shopCustomers: "গ্রাহকগণ",
    manageLedger: "আপনার গ্রাহকদের বাকির খাতা সহজে পরিচালনা করুন।",
    searchPlaceholder: "নাম বা ফোন দ্বারা গ্রাহক খুঁজুন...",
    noCustomersTitle: "এখনও কোনো গ্রাহক নেই",
    noCustomersDesc: "আপনার প্রথম গ্রাহক যোগ করুন এবং ভয়েস বা ম্যানুয়াল লগের সাহায্যে বাকির খাতা ট্র্যাক করা শুরু করুন।",
    addCustomerBtn: "গ্রাহক যোগ করুন",
    settled: "পরিশোধিত (Settled)",
    outstanding: "বকেয়া (Outstanding)",
    balance: "বকেয়া পরিমাণ",
    viewDetails: "বিস্তারিত দেখুন",
    addCustomerModalTitle: "গ্রাহক যোগ করুন",
    addCustomerModalSub: "বাকির খাতা রেকর্ড করতে গ্রাহক নিবন্ধন করুন",
    customerNameLabel: "গ্রাহকের নাম *",
    customerNamePlaceholder: "নাম লিখুন (যেমন রমেশ কুমার)",
    phoneLabel: "ফোন / হোয়াটসঅ্যাপ নম্বর",
    phonePlaceholder: "১০-অঙ্কের মোবাইল (যেমন 9812345678)",
    addressLabel: "ঠিকানা (ঐচ্ছিক)",
    addressPlaceholder: "দোকান/বাসার ঠিকানা লিখুন",
    saveCustomerBtn: "গ্রাহকের তথ্য সংরক্ষণ করুন",
    noPhone: "কোনো ফোন নেই",
    requiredError: "গ্রাহকের নাম আবশ্যক",
    successMsg: "গ্রাহক সফলভাবে যোগ করা হয়েছে! 🎉",
    failedMsg: "গ্রাহক যোগ করতে ব্যর্থ",
    uploadPhoto: "ছবি আপলোড করুন",
    removePhoto: "মুছে ফেলুন",
    deleteCustomer: "গ্রাহক মুছে ফেলুন",
    deleteConfirmTitle: "গ্রাহক মুছে ফেলবেন?",
    deleteConfirmMsg: "আপনি কি সত্যিই এই গ্রাহকটি মুছে ফেলতে চান",
    deleteConfirmNote: "এই গ্রাহকের সাথে সম্পর্কিত সমস্ত লেনদেন লুকানো হবে।",
    deleteBtn: "হ্যাঁ, মুছে ফেলুন",
    cancelBtn: "বাতিল",
    deleteSuccess: "গ্রাহক সফলভাবে মুছে ফেলা হয়েছে!",
    deleteFailed: "গ্রাহক মুছে ফেলতে ব্যর্থ"
  },
  pa: {
    shopCustomers: "ਗਾਹਕ",
    manageLedger: "ਆਪਣੇ ਗਾਹਕਾਂ ਦੀ ਉਧਾਰ ਖਾਤਾ ਵਹੀ ਨੂੰ ਆਸਾਨੀ ਨਾਲ ਸੰਭਾਲੋ।",
    searchPlaceholder: "ਨਾਮ ਜਾਂ ਫੋਨ ਦੁਆਰਾ ਗਾਹਕ ਲੱਭੋ...",
    noCustomersTitle: "ਅਜੇ ਤੱਕ ਕੋਈ ਗਾਹਕ ਨਹੀਂ ਹੈ",
    noCustomersDesc: "ਆਪਣਾ ਪਹਿਲਾ ਗਾਹਕ ਜੋੜੋ ਅਤੇ ਆਵਾਜ਼ ਜਾਂ ਹੱਥੀਂ ਇੰਦਰਾਜਾਂ ਰਾਹੀਂ ਉਧਾਰ ਟਰੈਕ ਕਰਨਾ ਸ਼ੁਰੂ ਕਰੋ।",
    addCustomerBtn: "ਗਾਹਕ ਜੋੜੋ",
    settled: "ਨਿਬਟਾਇਆ (Settled)",
    outstanding: "ਬਕਾਇਆ (Outstanding)",
    balance: "ਬਕਾਇਆ",
    viewDetails: "ਵੇਰਵਾ ਦੇਖੋ",
    addCustomerModalTitle: "ਗਾਹਕ ਜੋੜੋ",
    addCustomerModalSub: "ਉਧਾਰ ਖਾਤਾ ਵਹੀ ਦਰਜ ਕਰਨ ਲਈ ਗਾਹਕ ਰਜਿਸਟਰ ਕਰੋ",
    customerNameLabel: "ਗਾਹਕ ਦਾ ਨਾਮ *",
    customerNamePlaceholder: "ਨਾਮ ਦਰਜ ਕਰੋ (ਜਿਵੇਂ ਰਮੇਸ਼ ਕੁਮਾਰ)",
    phoneLabel: "ਫੋਨ / ਵਟਸਐਪ ਨੰਬਰ",
    phonePlaceholder: "10-ਅੰਕਾਂ ਦਾ ਮੋਬਾਈਲ (ਜਿਵੇਂ 9812345678)",
    addressLabel: "ਪਤਾ (ਵੈਕਲਪਿਕ)",
    addressPlaceholder: "ਦੁਕਾਨ/ਘਰ ਦਾ ਪਤਾ ਦਰਜ ਕਰੋ",
    saveCustomerBtn: "ਗਾਹਕ ਜਾਣਕਾਰੀ ਸੁਰੱਖਿਅਤ ਕਰੋ",
    noPhone: "ਕੋਈ ਫੋਨ ਨਹੀਂ",
    requiredError: "ਗਾਹਕ ਦਾ ਨਾਮ ਜ਼ਰੂਰੀ ਹੈ",
    successMsg: "ਗਾਹਕ ਸਫਲਤਾਪੂਰਵਕ ਜੋੜਿਆ ਗਿਆ! 🎉",
    failedMsg: "ਗਾਹਕ ਜੋੜਨ ਵਿੱਚ ਅਸਫਲ",
    uploadPhoto: "ਫੋਟੋ ਅਪਲੋਡ ਕਰੋ",
    removePhoto: "ਹਟਾਓ",
    deleteCustomer: "ਗਾਹਕ ਮਿਟਾਓ",
    deleteConfirmTitle: "ਗਾਹਕ ਮਿਟਾਉਣਾ ਹੈ?",
    deleteConfirmMsg: "ਕੀ ਤੁਸੀਂ ਸੱਚਮੁੱਚ ਇਸ ਗਾਹਕ ਨੂੰ ਮਿਟਾਉਣਾ ਚਾਹੁੰਦੇ ਹੋ",
    deleteConfirmNote: "ਇਸ ਗਾਹਕ ਨਾਲ ਜੁੜੇ ਸਾਰੇ ਲੈਣ-ਦੇਣ ਲੁਕਾ ਦਿੱਤੇ ਜਾਣਗੇ।",
    deleteBtn: "ਹਾਂ, ਮਿਟਾਓ",
    cancelBtn: "ਰੱਦ ਕਰੋ",
    deleteSuccess: "ਗਾਹਕ ਸਫਲਤਾਪੂਰਵਕ ਮਿਟਾ ਦਿੱਤਾ ਗਿਆ!",
    deleteFailed: "ਗਾਹਕ ਮਿਟਾਉਣ ਵਿੱਚ ਅਸਫਲ"
  }
};

const speakMessage = (text, langCode = 'hi') => {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  const targetVoice = voices.find(
    (v) => v.lang.toLowerCase().includes(langCode.toLowerCase()) || 
           v.lang.toLowerCase().startsWith(langCode.toLowerCase())
  );
  if (targetVoice) {
    utterance.voice = targetVoice;
  }
  window.speechSynthesis.speak(utterance);
};

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', address: '', profilePhoto: '' });
  const [saving, setSaving] = useState(false);
  const { language } = useTranslation();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
  const ct = (key) => {
    const dict = localCustomerTranslations[language] || localCustomerTranslations['en'];
    return dict[key] || localCustomerTranslations['en'][key] || key;
  };

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size exceeds 2MB limit');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
    setPreviewUrl('');
  };

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
      toast.error(ct('requiredError'));
      return;
    }
    setSaving(true);
    try {
      let profilePhotoPath = '';
      if (selectedFile) {
        const formData = new FormData();
        formData.append('profilePhoto', selectedFile);
        const { data } = await uploadCustomerPhoto(formData);
        profilePhotoPath = data.data.profilePhoto;
      }

      await createCustomer({
        ...form,
        profilePhoto: profilePhotoPath
      });

      toast.success(ct('successMsg'));
      const voiceMsgs = getVoiceMessages(language, form.name);
      speakMessage(voiceMsgs.create, language);
      setShowModal(false);
      setForm({ name: '', phone: '', address: '', profilePhoto: '' });
      setSelectedFile(null);
      setPreviewUrl('');
      fetchCustomers(search);
    } catch (err) {
      toast.error(err.response?.data?.message || ct('failedMsg'));
      const voiceMsgs = getVoiceMessages(language, form.name);
      speakMessage(voiceMsgs.error, language);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCustomer(deleteTarget._id);
      toast.success(ct('deleteSuccess'));
      setDeleteTarget(null);
      fetchCustomers(search);
    } catch (err) {
      toast.error(err.response?.data?.message || ct('deleteFailed'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Layout title={ct('shopCustomers')}>
      <div className="space-y-6">
        
        {/* Header Description */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-up">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">{ct('shopCustomers')}</h2>
            <p className="text-sm text-slate-400 mt-0.5">{ct('manageLedger')}</p>
          </div>
          
          <Button 
            onClick={() => setShowModal(true)} 
            icon={Plus}
            className="shadow-md shadow-blue-500/10 shrink-0"
          >
            {ct('addCustomerBtn')}
          </Button>
        </div>

        {/* Search Input Bar */}
        <div className="animate-slide-up delay-1">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={ct('searchPlaceholder')}
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
            title={ct('noCustomersTitle')}
            description={ct('noCustomersDesc')}
            icon={User}
            actionText={ct('addCustomerBtn')}
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
                        {c.profilePhoto ? (
                          <img
                            src={`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'}${c.profilePhoto}`}
                            alt={c.name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-100"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-sm text-slate-600">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-800 text-sm truncate leading-tight group-hover:text-blue-600 transition-colors">{c.name}</h4>
                          <span className="text-[10px] text-slate-450 mt-1 flex items-center gap-1">
                            <Phone size={10} />
                            {c.phone || ct('noPhone')}
                          </span>
                        </div>
                      </div>

                      {/* Balance Badge status */}
                      <Badge variant={hasOutstanding ? 'danger' : 'success'}>
                        {hasOutstanding ? ct('outstanding') : ct('settled')}
                      </Badge>
                    </div>
 
                    {/* Balance display */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100/60 flex justify-between items-center">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{ct('balance')}</span>
                      <span className={`font-extrabold text-sm ${hasOutstanding ? 'text-rose-600' : 'text-sky-600'}`}>
                        {formatCurrency(c.currentBalance)}
                      </span>
                    </div>
                  </div>
 
                  {/* Actions footer */}
                  <div className="mt-4 pt-3.5 border-t border-slate-50 flex justify-between items-center">
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(c); }}
                      className="p-2.5 rounded-xl text-slate-350 hover:text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all duration-200 active:scale-95"
                      title={ct('deleteCustomer')}
                    >
                      <Trash2 size={15} />
                    </button>
                    <Link 
                      to={`/customers/${c._id}`} 
                      className="btn-secondary !py-2.5 !px-4 text-xs font-bold hover:bg-blue-55/55 hover:text-blue-700 hover:border-blue-100/50 flex items-center gap-1"
                    >
                      <span>{ct('viewDetails')}</span>
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
        onClose={() => {
          setShowModal(false);
          setForm({ name: '', phone: '', address: '', profilePhoto: '' });
          setSelectedFile(null);
          setPreviewUrl('');
        }}
        title={ct('addCustomerModalTitle')}
        subtitle={ct('addCustomerModalSub')}
        icon={Plus}
      >
        <form onSubmit={handleCreate} className="space-y-4 pt-2">
          {/* Profile Photo Upload Field */}
          <div className="flex flex-col space-y-2 pb-2">
            <label className="text-xs font-bold text-slate-500">{ct('uploadPhoto')}</label>
            <div className="flex items-center gap-4 w-full">
              <div className="relative group w-14 h-14 shrink-0 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-5 h-5 text-slate-400" />
                )}
              </div>
              <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                <div className="flex gap-2">
                  <label className="btn-secondary !py-2 !px-3 text-xs font-bold cursor-pointer hover:bg-slate-100 flex items-center gap-1.5 border border-slate-250 rounded-xl">
                    <Upload size={13} />
                    <span>Choose Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  {previewUrl && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="btn-danger-secondary !py-2 !px-3 text-xs font-bold hover:bg-rose-50 hover:text-rose-600 flex items-center gap-1 border border-rose-100 rounded-xl"
                    >
                      <X size={13} />
                      <span>{ct('removePhoto')}</span>
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-slate-400">Max size: 2MB. JPG, PNG formats only.</p>
              </div>
            </div>
          </div>

          <Input
            label={ct('customerNameLabel')}
            placeholder={ct('customerNamePlaceholder')}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            autoFocus
          />
 
          <Input
            label={ct('phoneLabel')}
            type="tel"
            placeholder={ct('phonePlaceholder')}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
 
          <Input
            label={ct('addressLabel')}
            placeholder={ct('addressPlaceholder')}
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
 
          <Button 
            type="submit" 
            loading={saving} 
            className="w-full py-4 text-sm font-bold shadow-md shadow-blue-500/10"
          >
            {ct('saveCustomerBtn')}
          </Button>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={ct('deleteConfirmTitle')}
        icon={AlertTriangle}
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100">
            <p className="text-sm text-slate-700">
              {ct('deleteConfirmMsg')} <span className="font-bold text-slate-900">{deleteTarget?.name}</span>?
            </p>
            <p className="text-xs text-slate-400 mt-2">{ct('deleteConfirmNote')}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteTarget(null)}
              className="flex-1 py-3 px-4 text-sm font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl transition-all duration-200 active:scale-[0.98]"
            >
              {ct('cancelBtn')}
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 py-3 px-4 text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-2xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-rose-500/20"
            >
              {deleting ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Trash2 size={15} />
              )}
              {ct('deleteBtn')}
            </button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
