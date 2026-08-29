import { Link } from 'react-router-dom';
import { Mic, FileText, MessageCircle, Wallet, ArrowRight, ArrowDown, Check, Sparkles, Globe } from 'lucide-react';
import { useTranslation, languagesList } from '../context/LanguageContext';

const localTranslations = {
  en: {
    heroTitle: "Your Bahi-Khata,",
    heroSub: "Now Smarter.",
    heroDesc: "Speak your transaction. Track your credit. Send the bill. Manage your shop's credit ledger effortlessly in seconds.",
    ctaStart: "Start Using CredLink",
    ctaHow: "See How It Works",
    loginBtn: "Merchant Login",
    featuresTitle: "Simplify Your Ledger Book",
    featuresDesc: "Ditch paper diaries. Keep your data secure, professional, and accessible instantly on any device.",
    howItWorks: "How it works",
    voiceEntry: "Voice Entry",
    confirmed: "Transaction Confirmed",
    billGenerated: "Bill Generated",
    whatsappSent: "WhatsApp Sent",
    footerText: "Made with ♥ for Indian Shopkeepers."
  },
  hi: {
    heroTitle: "आपका खाता बही,",
    heroSub: "अब हुआ स्मार्टर।",
    heroDesc: "बोलकर लेन-देन दर्ज करें। उधार ट्रैक करें। बिल भेजें। अपने दुकान के क्रेडिट बही-खाते को सेकंडों में प्रबंधित करें।",
    ctaStart: "खोलें अपना डिजिटल खाता",
    ctaHow: "देखें यह कैसे काम करता है",
    loginBtn: "व्यापारी लॉगिन",
    featuresTitle: "अपनी खाता बही को आसान बनाएं",
    featuresDesc: "कागज़ के डायरी छोड़ें। अपना डेटा सुरक्षित, पेशेवर और किसी भी डिवाइस पर तुरंत सुलभ रखें।",
    howItWorks: "यह कैसे काम करता है",
    voiceEntry: "आवाज़ प्रविष्टि",
    confirmed: "लेन-देन की पुष्टि",
    billGenerated: "बिल जनरेट हुआ",
    whatsappSent: "व्हाट्सएप भेजा गया",
    footerText: "भारतीय दुकानदारों के लिए प्रेम के साथ बनाया गया।"
  },
  hinglish: {
    heroTitle: "Aapka Bahi-Khata,",
    heroSub: "Ab hua Smarter.",
    heroDesc: "Transaction bolkar jodein. Udhaar track karein. Customer ko bill bhejein. Apne shop ka ledger bahi-khata seconds me chalayein.",
    ctaStart: "CredLink Shuru Karein",
    ctaHow: "Kaise kaam karta hai",
    loginBtn: "Merchant Login",
    featuresTitle: "Apna Khata Bahi simple banayein",
    featuresDesc: "Kagaz diary chodiye. Apna data safe, professional aur kisi bhi device par turant check karein.",
    howItWorks: "Kaise kaam karta hai",
    voiceEntry: "Voice Entry",
    confirmed: "Transaction Confirm Hua",
    billGenerated: "Bill Generate Hua",
    whatsappSent: "WhatsApp Bhej Diya",
    footerText: "Indian Shopkeepers ke liye ♥ ke saath banaya gaya."
  },
  mr: {
    heroTitle: "तुमची खाते वही,",
    heroSub: "आता अधिक स्मार्ट.",
    heroDesc: "तुमचा व्यवहार बोलून नोंदवा. उधारीचा मागोवा घ्या. बिल पाठवा. तुमच्या दुकानाचे क्रेडिट खाते काही सेकंदात व्यवस्थापित करा.",
    ctaStart: "क्रेडलिंक वापरणे सुरू करा",
    ctaHow: "ते कसे कार्य करते ते पहा",
    loginBtn: "व्यापारी लॉगिन",
    featuresTitle: "तुमचे खाते वही सोपे करा",
    featuresDesc: "कागदी डायऱ्या बंद करा. तुमचा डेटा सुरक्षित, व्यावसायिक आणि कोणत्याही डिव्हाइसवर त्वरित प्रवेशयोग्य ठेवा.",
    howItWorks: "हे कसे कार्य करते",
    voiceEntry: "आवाज नोंदणी",
    confirmed: "व्यवहाराची पुष्टी झाली",
    billGenerated: "बिल तयार केले",
    whatsappSent: "व्हाट्सएप पाठवले",
    footerText: "भारतीय दुकानदारांसाठी प्रेमाने बनवलेले."
  },
  gu: {
    heroTitle: "તમારી ખાતાવહી,",
    heroSub: "હવે સ્માર્ટ.",
    heroDesc: "તમારો વ્યવહાર બોલીને રેકોર્ડ કરો. ઉધાર ટ્રેક કરો. બિલ મોકલો. સેકન્ડોમાં તમારી દુકાનની ક્રેડિટ ખાતાવહી સંચાલિત કરો.",
    ctaStart: "ક્રેડલિંક શરૂ કરો",
    ctaHow: "જુઓ તે કેવી રીતે કામ કરે છે",
    loginBtn: "મર્ચન્ટ લોગિન",
    featuresTitle: "તમારી ખાતાવહી સરળ બનાવો",
    featuresDesc: "કાગળની ડાયરીઓ છોડો. તમારા ડેટાને સુરક્ષિત, વ્યાવસાયિક અને કોઈપણ ઉપકરણ પર તરત જ સુલભ રાખો.",
    howItWorks: "તે કેવી રીતે કામ કરે છે",
    voiceEntry: "અવાજ નોંધણી",
    confirmed: "વ્યવહારની પુષ્ટિ થઈ",
    billGenerated: "બિલ તૈયાર થયું",
    whatsappSent: "વોટ્સએપ મોકલ્યું",
    footerText: "ભારતીય દુકાનદારો માટે પ્રેમ સાથે બનાવેલ."
  },
  ta: {
    heroTitle: "உங்கள் கணக்கு புத்தகம்,",
    heroSub: "இனி ஸ்மார்ட்.",
    heroDesc: "உங்கள் பரிவர்த்தனையைப் பேசுங்கள். கடனைக் கண்காணிக்கவும். பில் அனுப்பவும். உங்கள் கடையின் கணக்கு புத்தகத்தை சில நொடிகளில் நிர்வகிக்கவும்.",
    ctaStart: "தொடங்கவும்",
    ctaHow: "எப்படி வேலை செய்கிறது",
    loginBtn: "வணிகர் உள்நுழைவு",
    featuresTitle: "கணக்கு புத்தகத்தை எளிதாக்குங்கள்",
    featuresDesc: "காகித டைரிகளைத் தவிர்க்கவும். உங்கள் தரவைப் பாதுகாப்பாகவும், தொழில்முறையாகவும், எந்தச் சாதனத்திலும் உடனடியாக அணுகக்கூடியதாகவும் வைத்திருங்கள்.",
    howItWorks: "எப்படி வேலை செய்கிறது",
    voiceEntry: "குரல் பதிவு",
    confirmed: "பரிவர்த்தனை உறுதி செய்யப்பட்டது",
    billGenerated: "பில் உருவாக்கப்பட்டது",
    whatsappSent: "வாட்ஸ்அப் அனுப்பப்பட்டது",
    footerText: "இந்திய கடைக்காரர்களுக்காக அன்புடன் உருவாக்கப்பட்டது."
  },
  te: {
    heroTitle: "మీ ఖాతా పుస్తకం,",
    heroSub: "ఇప్పుడు స్మార్ట్.",
    heroDesc: "మీ లావాదేవీని మాట్లాడి ఎంట్రీ చేయండి. అప్పులను ట్రాక్ చేయండి. బిల్లు పంపండి. మీ షాప్ ఖాతా పుస్తకాన్ని సెకన్లలో నిర్వహించండి.",
    ctaStart: "ప్రారంభించండి",
    ctaHow: "ఎలా పనిచేస్తుందో చూడండి",
    loginBtn: "మర్చంట్ లాగిన్",
    featuresTitle: "మీ ఖాతా పుస్తకాన్ని సరళీకరించండి",
    featuresDesc: "కాగితపు డైరీలను పక్కన పెట్టండి. మీ డేటాను సురక్షితంగా, వృత్తిపరంగా మరియు ఏ పరికరంలోనైనా వెంటనే అందుబాటులో ఉంచండి.",
    howItWorks: "ఎలా పనిచేస్తుంది",
    voiceEntry: "వాయిస్ ఎంట్రీ",
    confirmed: "లావాదేవీ నిర్ధారించబడింది",
    billGenerated: "బిల్లు సృష్టించబడింది",
    whatsappSent: "వాట్సాప్ పంపబడింది",
    footerText: "భారతీయ వ్యాపారుల కోసం ప్రేమతో తయారు చేయబడింది."
  },
  bn: {
    heroTitle: "আপনার খাতা খাতা,",
    heroSub: "এখন আরও স্মার্ট।",
    heroDesc: "কথা বলে আপনার লেনদেন রেকর্ড করুন। ধার ট্র্যাক করুন। বিল পাঠান। কয়েক সেকেন্ডের মধ্যে আপনার দোকানের ক্রেডিট খাতা পরিচালনা করুন।",
    ctaStart: "ব্যবহার শুরু করুন",
    ctaHow: "কীভাবে কাজ করে দেখুন",
    loginBtn: "মার্চেন্ট লগইন",
    featuresTitle: "আপনার খাতা বই সহজ করুন",
    featuresDesc: "কাগজের ডায়েরি বাদ দিন। আপনার ডেটা সুরক্ষিত, পেশাদার এবং যে কোনো ডিভাইসে তাৎক্ষণিকভাবে অ্যাক্সেসযোগ্য রাখুন।",
    howItWorks: "কীভাবে কাজ করে",
    voiceEntry: "ভয়েস এন্ট্রি",
    confirmed: "লেনদেন নিশ্চিত করা হয়েছে",
    billGenerated: "বিল তৈরি করা হয়েছে",
    whatsappSent: "হোয়াটসঅ্যাপ পাঠানো হয়েছে",
    footerText: "আইডিআরআই দোকানদারদের জন্য ভালোবাসা দিয়ে তৈরি।"
  },
  pa: {
    heroTitle: "ਤੁਹਾਡਾ ਖਾਤਾ ਵਹੀ,",
    heroSub: "ਹੁਣ ਸਮਾਰਟ.",
    heroDesc: "ਬੋਲ ਕੇ ਆਪਣਾ ਲੈਣ-ਦੇਣ ਦਰਜ ਕਰੋ। ਉਧਾਰ ਦਾ ਹਿਸਾਬ ਰੱਖੋ। ਬਿੱਲ ਭੇਜੋ। ਆਪਣੀ ਦੁਕਾਨ ਦੀ ਕ੍ਰੈਡਿਟ ਬਹੀ-ਖਾਤੇ ਨੂੰ ਸਕਿੰਟਾਂ ਵਿੱਚ ਚਲਾਓ।",
    ctaStart: "ਕ੍ਰੈਡਲਿੰਕ ਵਰਤਣਾ ਸ਼ੁਰੂ ਕਰੋ",
    ctaHow: "ਦੇਖੋ ਇਹ ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ",
    loginBtn: "ਮਰਚੈਂਟ ਲੌਗਇਨ",
    featuresTitle: "ਆਪਣੀ ਖਾਤਾ ਵਹੀ ਨੂੰ ਸਰਲ ਬਣਾਓ",
    featuresDesc: "ਕਾਗਜ਼ੀ ਡਾਇਰੀਆਂ ਛੱਡੋ। ਆਪਣਾ ਡੇਟਾ ਸੁਰੱਖਿਅਤ, ਪੇਸ਼ੇਵਰ ਅਤੇ ਕਿਸੇ ਵੀ ਡਿਵਾਈਸ 'ਤੇ ਤੁਰੰਤ ਪਹੁੰਚਯੋਗ ਰੱਖੋ।",
    howItWorks: "ਇਹ ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ",
    voiceEntry: "ਆਵਾਜ਼ ਐਂਟਰੀ",
    confirmed: "ਲੈਣ-ਦੇਣ ਦੀ ਪੁਸ਼ਟੀ ਹੋਈ",
    billGenerated: "ਬਿੱਲ ਤਿਆਰ ਕੀਤਾ ਗਿਆ",
    whatsappSent: "ਵਟਸਐਪ ਭੇਜਿਆ ਗਿਆ",
    footerText: "ਭਾਰਤੀ ਦੁਕਾਨਦਾਰਾਂ ਲਈ ਪਿਆਰ ਨਾਲ ਬਣਾਇਆ ਗਿਆ।"
  }
};

const getFeatures = (lang) => {
  const translations = {
    en: [
      { icon: Mic, title: 'Voice Entry', desc: 'Speak naturally in Hindi, Hinglish, or English. No typing needed.' },
      { icon: Wallet, title: 'Credit Ledger', desc: 'Accurately track customer balances, total credits, and payments.' },
      { icon: FileText, title: 'Instant Bills', desc: 'Professional PDF bills are automatically generated in real-time.' },
      { icon: MessageCircle, title: 'WhatsApp Sharing', desc: 'Send digital receipts and statements directly to customers.' },
      { icon: Globe, title: 'Multi-Lingual Bahi-Khata', desc: 'Operate the app in 9 Indian languages (Hindi, Marathi, Gujarati, etc.).' },
    ],
    hi: [
      { icon: Mic, title: 'आवाज़ प्रविष्टि', desc: 'हिंदी, हिंग्लिश या अंग्रेजी में स्वाभाविक रूप से बोलें। टाइपिंग की आवश्यकता नहीं है।' },
      { icon: Wallet, title: 'क्रेडिट लेजर', desc: 'ग्राहक के बकाया, कुल क्रेडिट और भुगतान को सटीक रूप से ट्रैक करें।' },
      { icon: FileText, title: 'त्वरित बिल', desc: 'पेशेवर पीडीएफ बिल वास्तविक समय में स्वचालित रूप से उत्पन्न होते हैं।' },
      { icon: MessageCircle, title: 'व्हाट्सएप साझाकरण', desc: 'डिजिटल रसीदें और विवरण सीधे ग्राहकों को भेजें।' },
      { icon: Globe, title: 'बहुभाषी बही-खाता', desc: '९ भारतीय भाषाओं (हिंदी, मराठी, गुजराती, आदि) में ऐप चलाएं।' },
    ],
    hinglish: [
      { icon: Mic, title: 'Voice Entry', desc: 'Hindi, Hinglish, ya English me bolkar entry karein. Typing ki koi zarurat nahi.' },
      { icon: Wallet, title: 'Credit Ledger', desc: 'Customer balance, total credits aur payments ko aasaani se track karein.' },
      { icon: FileText, title: 'Instant Bills', desc: 'Professional PDF bills real-time me auto-generate ho jaate hain.' },
      { icon: MessageCircle, title: 'WhatsApp Sharing', desc: 'Digital receipts aur statements sidhe customer ke WhatsApp par bhejein.' },
      { icon: Globe, title: 'Multi-Lingual Bahi-Khata', desc: 'App ko 9 Indian languages (Hindi, Marathi, Gujarati, etc.) me chalayein.' },
    ],
    mr: [
      { icon: Mic, title: 'आवाज नोंदणी', desc: 'हिंदी, हिंग्लिश किंवा इंग्रजीमध्ये नैसर्गिकरित्या बोला. टायपिंगची गरज नाही.' },
      { icon: Wallet, title: 'क्रेडिट लेजर', desc: 'ग्राहक शिल्लक, एकूण क्रेडिट आणि पेमेंटचा अचूक मागोवा घ्या.' },
      { icon: FileText, title: 'झटपट बिले', desc: 'व्यावसायिक पीडीएफ बिले रिअल-टाइममध्ये स्वयंचलितपणे तयार केली जातात.' },
      { icon: MessageCircle, title: 'व्हाट्सएप शेअरिंग', desc: 'डिजिटल पावत्या आणि विधाने थेट ग्राहकांना पाठवा.' },
      { icon: Globe, title: 'बहुभाषिक खातेवही', desc: '९ भारतीय भाषांमध्ये (हिंदी, मराठी, गुजराती इ.) ॲप वापरा.' },
    ],
    gu: [
      { icon: Mic, title: 'અવાજ નોંધણી', desc: 'હિન્દી, હિંગ્લિશ અથવા અંગ્રેજીમાં સ્વાભાવિક રીતે બોલો. ટાઇપિંગની જરૂર નથી.' },
      { icon: Wallet, title: 'ક્રેડિટ લેજર', desc: 'ગ્રાહક બાકી રકમ, કુલ ક્રેડિટ અને ચૂકવણીઓને ચોક્કસ રીતે ટ્રૅક કરો.' },
      { icon: FileText, title: 'ત્વરિત બિલ', desc: 'વ્યાવસાયિક પીડીએફ બિલ રીઅલ-ટાઇમમાં આપમેળે જનરેટ થાય છે.' },
      { icon: MessageCircle, title: 'વોટ્સએપ શેરિંગ', desc: 'ડિજિટલ રસીદો અને સ્ટેટમેન્ટ સીધા ગ્રાહકોને મોકલો.' },
      { icon: Globe, title: 'બહુભાષી ખાતાવહી', desc: '૯ ભારતીય ભાષાઓ (હિન્દી, મરાઠી, ગુજરાતી, વગેરે) માં એપ્લિકેશન ચલાવો.' },
    ],
    ta: [
      { icon: Mic, title: 'குரல் பதிவு', desc: 'இந்தி, ஹிங்கிலிஷ் அல்லது ஆங்கிலத்தில் இயல்பாகப் பேசுங்கள். தட்டச்சு செய்யத் தேவையில்லை.' },
      { icon: Wallet, title: 'கடன் பேரேடு', desc: 'வாடிக்கையாளர் நிலுவைகள், மொத்த வரவு மற்றும் கொடுப்பனவுகளைத் துல்லியமாகக் கண்காணிக்கவும்.' },
      { icon: FileText, title: 'உடனடி பில்கள்', desc: 'தொழில்முறை PDF பில்கள் நிகழ்நேரத்தில் தானாகவே உருவாக்கப்படுகின்றன.' },
      { icon: MessageCircle, title: 'வாட்ஸ்அப் பகிர்வு', desc: 'டிஜிட்டல் ரசீதுகள் மற்றும் அறிக்கைகளை வாடிக்கையாளர்களுக்கு நேரடியாக அனுப்பவும்.' },
      { icon: Globe, title: 'பல்மொழி கணக்கு புத்தகம்', desc: '9 இந்திய மொழிகளில் (தமிழ், இந்தி, மராத்தி, குஜராத்தி போன்றவை) பயன்பாட்டை இயக்கவும்.' },
    ],
    te: [
      { icon: Mic, title: 'వాయిస్ ఎంట్రీ', desc: 'హిందీ, హింగ్లీష్ లేదా ఇంగ్లీషులో సహజంగా మాట్లాడండి. టైపింగ్ అవసరం లేదు.' },
      { icon: Wallet, title: 'క్రెడిట్ లెడ్జర్', desc: 'కస్టమర్ బ్యాలెన్స్‌లు, మొత్తం క్రెడిట్‌లు మరియు చెల్లింపులను ఖచ్చితంగా ట్రాక్ చేయండి.' },
      { icon: FileText, title: 'తక్షణ బిల్లులు', desc: 'ప్రొఫెషనల్ పిడిఎఫ్ బిల్లులు నిజ సమయంలో స్వయంచాలకంగా సృష్టించబడతాయి.' },
      { icon: MessageCircle, title: 'వాట్సాప్ షేరింగ్', desc: 'డిజిటల్ రశీదులు మరియు నివేదికలను నేరుగా కస్టమర్లకు పంపండి.' },
      { icon: Globe, title: 'బహుభాషా ఖాతా పుస్తకం', desc: '9 భారతీయ భాషలలో (తెలుగు, హిందీ, మరాఠీ, గుజరాતી మొదలైనవి) యాప్‌ను ఉపయోగించండి.' },
    ],
    bn: [
      { icon: Mic, title: 'ভয়েস এন্ট্রি', desc: 'হিন্দি, হিংলিশ বা ইংরেজিতে স্বাভাবিকভাবে বলুন। টাইপ করার প্রয়োজন নেই।' },
      { icon: Wallet, title: 'ক্রেডিট লেজার', desc: 'গ্রাহকের ব্যালেন্স, মোট ক্রেডিট এবং পেমেন্ট সঠিকভাবে ট্র্যাক করুন।' },
      { icon: FileText, title: 'তাত্ক্ষণিক বিল', desc: 'পেশাদার পিডিএফ বিল রিয়েল-টাইমে স্বয়ংক্রিয়ভাবে তৈরি হয়।' },
      { icon: MessageCircle, title: 'হোয়াটসঅ্যাপ শেয়ারিং', desc: 'ডিজিটাল রসিদ এবং বিবরণ সরাসরি গ্রাহকদের পাঠান।' },
      { icon: Globe, title: 'বহুভাষী খাতা বই', desc: '৯টি ভারতীয় ভাষায় (হিন্দি, মারাঠি, গুজরাটি ইত্যাদি) অ্যাপটি পরিচালনা করুন।' },
    ],
    pa: [
      { icon: Mic, title: 'ਆਵਾਜ਼ ਐਂਟਰੀ', desc: 'ਹਿੰਦੀ, ਹਿੰਗਲਿਸ਼ ਜਾਂ ਅੰਗਰੇਜ਼ੀ ਵਿੱਚ ਕੁਦਰਤੀ ਤੌਰ ਤੇ ਬੋਲੋ। ਟਾਈਪਿੰਗ ਦੀ ਕੋਈ ਲੋੜ ਨਹੀਂ।' },
      { icon: Wallet, title: 'ਕ੍ਰੈਡਿਟ ਲੈਜਰ', desc: 'ਗਾਹਕ ਬਕਾਇਆ, ਕੁੱਲ ਕ੍ਰੈਡਿਟ ਅਤੇ ਭੁਗਤਾਨਾਂ ਨੂੰ ਸਹੀ ਢੰਗ ਨਾਲ ਟ੍ਰੈਕ ਕਰੋ।' },
      { icon: FileText, title: 'ਤੁਰੰਤ ਬਿੱਲ', desc: 'ਪੇਸ਼ੇਵਰ ਪੀਡੀਐਫ ਬਿੱਲ ਰੀਅਲ-ਟਾਈਮ ਵਿੱਚ ਆਪਣੇ ਆਪ ਤਿਆਰ ਹੁੰਦੇ ਹਨ।' },
      { icon: MessageCircle, title: 'ਵਟਸਐਪ ਸ਼ੇਅਰਿੰਗ', desc: 'ਡਿਜੀਟਲ ਰਸੀਦਾਂ ਅਤੇ ਸਟੇਟਮੈਂਟਾਂ ਸਿੱਧੇ ਗ્રાਹਕਾਂ ਨੂੰ ਭੇਜੋ।' },
      { icon: Globe, title: 'ਬਹੁ-ਭਾਸ਼ਾਈ ਖਾਤਾ ਵਹੀ', desc: '੯ ਭਾਰਤੀ ਭਾਸ਼ਾਵਾਂ (ਹਿੰਦੀ, ਮਰਾਠੀ, ਗੁਜਰਾਤੀ, ਆਦਿ) ਵਿੱਚ ਐਪ ਚਲਾਓ।' },
    ]
  };
  return translations[lang] || translations['en'];
};

export default function Landing() {
  const { language, setLanguage } = useTranslation();
  const t = (key) => {
    const dict = localTranslations[language] || localTranslations['en'];
    return dict[key] || localTranslations['en'][key] || key;
  };
  const features = getFeatures(language);
  const voiceRes = (() => {
    const mappings = {
      en: { label: "Voice Confirmation", text: '"Ramesh ke account mein 500 rupaye add kiye gaye hain."' },
      hi: { label: "ऑडियो पुष्टि", text: '"रमेश के अकाउंट में 500 रुपये ऐड किए गए हैं।"' },
      hinglish: { label: "Voice Confirmation", text: '"Ramesh ke account mein 500 rupaye add kiye gaye hain."' },
      mr: { label: "ऑडिओ पुष्टीकरण", text: '"रमेशच्या खात्यात 500 रुपये जमा केले आहेत"' },
      gu: { label: "વૉઇસ પુષ્ટિ", text: '"રમેશના ખાતામાં 500 રૂપિયા ઉમેરવામાં આવ્યા છે"' },
      ta: { label: "குரல் உறுதிப்படுத்தல்", text: '"ரமேஷ் கணக்கில் 500 ரூபாய் சேர்க்கப்பட்டுள்ளது"' },
      te: { label: "వాయిస్ నిర్ధారణ", text: '"రమేష్ ఖాతాలో 500 రూపాయలు జోడించబడ్డాయి"' },
      bn: { label: "ভয়েস নিশ্চিতকরণ", text: '"রমেশের অ্যাকাউন্টে 500 টাকা যোগ করা হয়েছে"' },
      pa: { label: "ਆਵਾਜ਼ ਦੀ ਪੁਸ਼ਟੀ", text: '"ਰਮੇਸ਼ ਦੇ ਖਾਤੇ ਵਿੱਚ 500 ਰੁਪਏ ਜੋੜ ਦਿੱਤੇ ਗਏ ਹਨ"' }
    };
    return mappings[language] || mappings['en'];
  })();
  return (
    <div className="min-h-screen bg-[#FCFBF9] text-slate-800 selection:bg-blue-100">
      {/* Header */}
      <header className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 py-4 sm:py-6 sticky top-0 bg-[#FCFBF9]/90 backdrop-blur-md z-50 border-b border-slate-200/20">
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-blue-600 flex items-center justify-center border border-blue-500/10 shadow-sm shrink-0">
            <Wallet size={16} className="text-white sm:w-5 sm:h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm sm:text-lg font-bold text-slate-800 tracking-tight block leading-tight font-sans">CredLink</span>
            <span className="text-[8px] sm:text-[10px] text-blue-600 font-semibold tracking-wider uppercase leading-none mt-0.5 hidden min-[360px]:block">Bahi-Khata</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Language selector */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-1.5 py-1 sm:px-2.5 sm:py-1.5 transition-all shadow-sm">
            <Globe size={12} className="text-slate-400 shrink-0 sm:w-3.5 sm:h-3.5" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent text-[10px] sm:text-[11px] font-bold text-slate-600 focus:outline-none cursor-pointer border-none pr-1"
            >
              {languagesList.map((lang) => (
                <option key={lang.code} value={lang.code} className="text-slate-700 bg-white text-xs">
                  {lang.code === 'hinglish' ? 'Hinglish' : lang.name.split(' ')[0]}
                </option>
              ))}
            </select>
          </div>

          <Link to="/login" className="btn-primary !py-1.5 sm:!py-2 !px-3 sm:!px-4 text-xs sm:text-sm whitespace-nowrap !rounded-xl sm:!rounded-2xl shrink-0">
            {t('loginBtn')}
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-10 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column (Content) */}
        <div className="lg:col-span-6 space-y-6 text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold">
            <Sparkles size={12} className="animate-spin" />
            <span>Digital Credit Ledger for Indian Merchants</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight">
            {t('heroTitle')}<br />
            <span className="text-blue-600">{t('heroSub')}</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-xl leading-relaxed">
            {t('heroDesc')}
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <Link to="/login" className="btn-primary flex items-center justify-center gap-2">
              {t('ctaStart')} <ArrowRight size={18} />
            </Link>
            <a href="#how-it-works" className="btn-secondary flex items-center justify-center gap-2">
              {t('ctaHow')}
            </a>
          </div>
        </div>

        {/* Right Column (Interactive Visual Demonstration) */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="w-full max-w-md bg-white rounded-[32px] p-6 border border-slate-100 shadow-soft-lg space-y-4">
            
            {/* Visual Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-50">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('howItWorks')}</span>
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-ping"></span>
            </div>

            {/* Workflow Steps Display */}
            <div className="space-y-4 relative">
              {/* Step 1: Voice Input */}
              <div className="flex items-start gap-3 bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50">
                <div className="w-9 h-9 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-sm mic-pulse">
                  <Mic size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">🎙️ {t('voiceEntry')}</p>
                  <p className="text-sm font-semibold text-slate-700 mt-0.5">"Ramesh ko 500 rupaye udhaar diya"</p>
                </div>
              </div>

              <div className="flex justify-center -my-2">
                <ArrowDown size={14} className="text-slate-300" />
              </div>

              {/* Step 2: Confirmation Screen */}
              <div className="flex items-start gap-3 bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                  <Check size={18} className="stroke-[3]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">✓ {t('confirmed')}</p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm font-bold text-slate-800">Ramesh Kumar</span>
                    <span className="text-sm font-extrabold text-rose-600">₹500 Credit</span>
                  </div>
                  
                  {/* Spoken voice response highlight */}
                  <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[10px] text-blue-600 font-bold select-none animate-slide-up">
                    <span>📢 {voiceRes.label}:</span>
                    <span className="italic font-medium text-slate-500">{voiceRes.text}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center -my-2">
                <ArrowDown size={14} className="text-slate-300" />
              </div>

              {/* Step 3: Receipt Generated */}
              <div className="flex items-start gap-3 bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                  <FileText size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">📄 {t('billGenerated')}</p>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">Receipt #CRL-2026-0012</p>
                </div>
              </div>

              <div className="flex justify-center -my-2">
                <ArrowDown size={14} className="text-slate-300" />
              </div>

              {/* Step 4: WhatsApp Share */}
              <div className="flex items-start gap-3 bg-sky-50/50 p-3 rounded-2xl border border-sky-100/50">
                <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-sky-500/10">
                  <MessageCircle size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-sky-600 uppercase tracking-wider">📱 {t('whatsappSent')}</p>
                  <p className="text-xs font-medium text-sky-700/80 mt-0.5">"Hello Ramesh, your credit of ₹500 has been recorded..."</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-20 border-t border-slate-100">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{t('featuresTitle')}</h2>
          <p className="text-slate-500 mt-2">{t('featuresDesc')}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card flex flex-col justify-between h-full bg-white hover:-translate-y-1 transition-transform">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-4 border border-blue-100/50 text-blue-600">
                  <Icon size={22} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8 text-center text-slate-400 text-xs">
        <p>&copy; {new Date().getFullYear()} CredLink. {t('footerText')}</p>
      </footer>
    </div>
  );
}
