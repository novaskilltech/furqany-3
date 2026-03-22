
export interface Adhkar {
  id: string;
  category: 'morning' | 'evening' | 'both';
  arabic: string;
  transcription: string;
  translation: {
    fr: string;
    en: string;
    ar: string;
  };
  repeat: number;
  source?: string;
}

export const ADHKARS: Adhkar[] = [
  {
    id: 'morning_1',
    category: 'morning',
    arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    transcription: "Asbahna wa-asbahal-mulku lillahi walhamdu lillahi, la ilaha illallahu wahdahu la sharika lahu, lahul-mulku walahul-hamdu wa huwa 'ala kulli shay'in qadir.",
    translation: {
      fr: "Nous sommes au matin et la royauté appartient à Allah. Louange à Allah. Il n'y a de divinité qu'Allah, Seul, sans associé. À Lui la royauté et la louange, et Il est Omnipotent.",
      en: "We have reached the morning and at this very time unto Allah belongs all sovereignty. Praise be to Allah. None has the right to be worshipped but Allah, alone...",
      ar: "نحن في الصباح والملك لله وحده والحمد لله..."
    },
    repeat: 1,
    source: "Muslim"
  },
  {
    id: 'evening_1',
    category: 'evening',
    arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    transcription: "Amsayna wa-amsal-mulku lillahi walhamdu lillahi, la ilaha illallahu wahdahu la sharika lahu, lahul-mulku walahul-hamdu wa huwa 'ala kulli shay'in qadir.",
    translation: {
      fr: "Nous sommes au soir et la royauté appartient à Allah. Louange à Allah. Il n'y a de divinité qu'Allah, Seul, sans associé. À Lui la royauté et la louange, et Il est Omnipotent.",
      en: "We have reached the evening and at this very time unto Allah belongs all sovereignty...",
      ar: "نحن في المساء والملك لله وحده والحمد لله..."
    },
    repeat: 1,
    source: "Muslim"
  },
  {
    id: 'protection_1',
    category: 'both',
    arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
    transcription: "Bismillahi-lladhi la yadurru ma'as-mihi shay'un fil-ardi wa la fis-sama'i wa huwas-Sami'ul-'Alim.",
    translation: {
      fr: "Au nom d'Allah, tel qu'en compagnie de Son Nom rien ne peut nuire sur terre ni au ciel, et Il est l'Audient, l'Omniscient.",
      en: "In the Name of Allah, Who with His Name nothing can cause harm in the earth nor in the heavens, and He is the All-Hearing, the All-Knowing.",
      ar: "بسم الله الذي لا يضر مع اسمه شيء..."
    },
    repeat: 3,
    source: "Abu Dawud & Tirmidhi"
  },
  {
    id: 'sayyidul_istighfar',
    category: 'both',
    arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي؛ فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
    transcription: "Allahumma anta Rabbi la ilaha illa anta, khalaqtani wa-ana 'abduka, wa-ana 'ala 'ahdika wa-wa'dika ma-stata'tu, a'udhu bika min sharri ma sana'tu, abu'u laka bi-ni'matika 'alayya, wa-abu'u laka bi-dhanbi faghfir li, fa-innahu la yaghfiru-dhunuba illa anta.",
    translation: {
      fr: "Ô Allah ! Tu es mon Seigneur. Il n'y a de divinité que Toi. Tu m'as créé et je suis Ton serviteur, je suis fidèle à mon pacte et ma promesse envers Toi autant que je le puis. Je cherche refuge auprès de Toi contre le mal que j'ai commis. Je reconnais Tes bienfaits sur moi et je reconnais mes péchés. Pardonne-moi donc, car personne ne pardonne les péchés si ce n'est Toi.",
      en: "O Allah, You are my Lord, none has the right to be worshipped but You. You created me and I am Your servant and I abide by Your covenant and promise as best I can. I take refuge in You from the evil which I have committed. I acknowledge Your favor upon me and I acknowledge my sin, so forgive me, for verily none can forgive sin except You.",
      ar: "اللهم أنت ربي لا إله إلا أنت..."
    },
    repeat: 1,
    source: "Bukhari"
  },
  {
    id: 'protection_2',
    category: 'both',
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي، اللَّهُمَّ اسْتُرْ عَوْرَاتِي وَآمِنْ رَوْعَاتِي، اللَّهُمَّ احْفَظْنِي مِنْ بَيْنِ يَدَيَّ وَمِنْ خَلْفِي وَعَنْ يَمِينِي وَعَنْ شِمَالِي وَمِنْ فَوْقِي، وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي",
    transcription: "Allahumma inni as'alukal-'afwa wal-'afiyata fid-dunya wal-akhirah. Allahumma inni as'alukal-'afwa wal-'afiyata fi dini wa dunyaya wa ahli wa mali. Allahumma-stur 'awrati wa-amin raw'ati. Allahumma-hfazni min bayni yadayya wa min khalfi wa 'an yamini wa 'an shimali wa min fawqi, wa a'udhu bi-'azamatika an ughtala min tahti.",
    translation: {
      fr: "Ô Allah ! Je Te demande le pardon et la santé dans ma vie d'ici-bas et dans l'au-delà. Ô Allah ! Je Te demande le pardon et la santé pour ma religion, ma vie, ma famille et mes biens. Ô Allah ! Couvre mes défauts et apaise mes craintes. Ô Allah ! Protège-moi de devant moi, de derrière moi, de ma droite, de ma gauche et d'au-dessus de moi. Et je cherche refuge dans Ta grandeur pour ne pas être englouti par en dessous.",
      en: "O Allah, I ask You for pardon and well-being in this life and the next. O Allah, I ask You for pardon and well-being in my religious and worldly affairs, and my family and my wealth. O Allah, veil my weaknesses and set at ease my dismay. O Allah, preserve me from the front and from behind and on my right and on my left and from above, and I take refuge in Your Greatness lest I be swallowed up from beneath me.",
      ar: "اللهم إني أسألك العفو والعافية..."
    },
    repeat: 1,
    source: "Abu Dawud & Ibn Majah"
  },
  {
    id: 'tasbih_100',
    category: 'both',
    arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
    transcription: "Subhan-Allahi wa bihamdihi.",
    translation: {
      fr: "Gloire et louange à Allah.",
      en: "Glory and praise is to Allah.",
      ar: "سبحان الله وبحمده..."
    },
    repeat: 100,
    source: "Muslim"
  },
  {
    id: 'hasbi_allahu',
    category: 'both',
    arabic: "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
    transcription: "Hasbi-allahu la ilaha illa huwa 'alayhi tawakkaltu wa huwa Rabbul-'Arshil-'Azim.",
    translation: {
      fr: "Allah me suffit. Il n'y a de divinité que Lui. En Lui je place ma confiance. Il est le Seigneur du Trône immense.",
      en: "Allah is sufficient for me. None has the right to be worshipped but Him. In Him I put my trust and He is the Lord of the Mighty Throne.",
      ar: "حسبي الله لا إله إلا هو..."
    },
    repeat: 7,
    source: "Abu Dawud"
  },
  {
    id: 'ayat_alkursi',
    category: 'both',
    arabic: "اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ وَلَا يَئُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ",
    transcription: "Allahu la ilaha illa Huwal-Hayyul-Qayyum. La ta'khudhuhu sinatun wa la nawm. Lahu ma fis-samawati wa ma fil-ard. Man dhal-ladhi yashfa'u 'indahu illa bi-idhnihi. Ya'lamu ma bayna aydihim wa ma khalfahum. Wa la yuhituna bishay'im-min 'ilmihi illa bima sha'. Wasi'a kursiyyuhus-samawati wal-ard. Wa la ya'uduhu hifdhuhuma wa Huwal-'Aliyyul-'Adhim.",
    translation: {
      fr: "Allah ! Point de divinité à part Lui, le Vivant, Celui qui subsiste par Lui-même 'al-Qayyum'. Ni somnolence ni sommeil ne Le saisissent. À Lui appartient tout ce qui est dans les cieux et sur la terre. Qui peut intercéder auprès de Lui sans Sa permission ? Il connaît leur passé et leur futur. Et ils ne cernent de Sa science que ce qu'Il veut. Son Trône 'Kursi' déborde les cieux et la terre, et leur garde ne Lui coûte aucune peine. Et Il est le Très Haut, le Très Grand.",
      en: "Allah! There is no god but He, the Living, the Self-subsisting, the Eternal. No slumber can seize Him nor sleep. His are all things in the heavens and on earth. Who is there can intercede in His presence except as He permits? He knows what (appeareth to His creatures as) before or after or behind them. Nor shall they compass aught of His knowledge except as He willeth. His Throne doth extend over the heavens and the earth, and He feeleth no fatigue in guarding and preserving them for He is the Most High, the Supreme (in glory).",
      ar: "الله لا إله إلا هو الحي القيوم..."
    },
    repeat: 1,
    source: "Bukhari"
  }
];
