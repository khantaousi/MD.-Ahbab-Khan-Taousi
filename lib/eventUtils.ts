
export const EVENTS = [
  { month: 0, day: 1, en: "HAPPY NEW YEAR", bn: "শুভ নববর্ষ", subEn: "Wishing you a year full of joy and success!", subBn: "আপনার নতুন বছর আনন্দ ও সাফল্যে ভরে উঠুক!", theme: 'party', priority: 2 },
  { month: 1, day: 21, en: "LANGUAGE MARTYRS' DAY", bn: "মহান শহীদ দিবস", subEn: "Tribute to the heroes who fought for our mother tongue.", subBn: "মাতৃভাষার জন্য প্রাণ উৎসর্গকারী বীরদের প্রতি বিনম্র শ্রদ্ধা।", theme: 'minimal', priority: 1 },
  { month: 2, day: 8, en: "INTERNATIONAL WOMEN'S DAY", bn: "আন্তর্জাতিক নারী দিবস", subEn: "Celebrating the social, economic, cultural, and political achievements of women.", subBn: "নারীদের সামাজিক, অর্থনৈতিক, সাংস্কৃতিক এবং রাজনৈতিক অর্জন উদযাপন।", theme: 'party', priority: 2 },
  { month: 2, day: 17, en: "NATIONAL CHILDREN'S DAY", bn: "জাতীয় শিশু দিবস", subEn: "Celebrating the birthday of the Father of the Nation, Bangabandhu Sheikh Mujibur Rahman.", subBn: "জাতির পিতা বঙ্গবন্ধু শেখ মুজিবুর রহমানের জন্মদিন ও জাতীয় শিশু দিবস উদযাপন।", theme: 'party', priority: 1 },
  { month: 2, day: 26, en: "INDEPENDENCE DAY", bn: "স্বাধীনতা দিবস", subEn: "Celebrating the glorious independence of Bangladesh.", subBn: "বাংলাদেশের গৌরবময় স্বাধীনতা দিবস উদযাপন।", theme: 'minimal', priority: 1 },
  { month: 3, day: 14, en: "PAHELA BAISHAKH", bn: "পহেলা বৈশাখ", subEn: "Wishing you a colorful and prosperous Bengali New Year!", subBn: "আপনাকে জানাই শুভ নববর্ষের রঙিন শুভেচ্ছা!", theme: 'party', priority: 1 },
  { month: 3, day: 22, en: "EARTH DAY", bn: "ধরিত্রী দিবস", subEn: "Invest in our planet for a sustainable future.", subBn: "একটি টেকসই ভবিষ্যতের জন্য আমাদের গ্রহে বিনিয়োগ করুন।", theme: 'minimal', priority: 2 },
  { month: 3, day: 23, en: "WORLD BOOK DAY", bn: "বিশ্ব বই দিবস", subEn: "A room without books is like a body without a soul.", subBn: "বই ছাড়া ঘর অনেকটা আত্মাহীন শরীরের মতো।", theme: 'minimal', priority: 2 },
  { month: 4, day: 1, en: "MAY DAY", bn: "মে দিবস", subEn: "Honoring the hard work and dedication of workers worldwide.", subBn: "বিশ্বজুড়ে শ্রমিকদের কঠোর পরিশ্রম ও উৎসর্গের প্রতি সম্মান।", theme: 'minimal', priority: 2 },
  { month: 5, day: 5, en: "ENVIRONMENT DAY", bn: "পরিবেশ দিবস", subEn: "Join the movement to restore our ecosystem.", subBn: "আমাদের ইকোসিস্টেম পুনরুদ্ধারের আন্দোলনে যোগ দিন।", theme: 'minimal', priority: 2 },
  { month: 8, day: 21, en: "PEACE DAY", bn: "শান্তি দিবস", subEn: "End racism. Build peace. Worldwide.", subBn: "বর্ণবাদ বন্ধ করুন। শান্তি গড়ুন। বিশ্বব্যাপী।", theme: 'minimal', priority: 2 },
  { month: 9, day: 31, en: "HALLOWEEN", bn: "হ্যালোইন", subEn: "Wishing you a spooktacular night of tricks and treats!", subBn: "আপনাকে জানাই হ্যালোইনের রোমাঞ্চকর শুভেচ্ছা!", theme: 'party', priority: 2 },
  { month: 11, day: 14, en: "MARTYRED INTELLECTUALS DAY", bn: "শহীদ বুদ্ধিজীবী দিবস", subEn: "Paying deep respect to the martyred intellectuals of 1971.", subBn: "১৯৭১ সালের শহীদ বুদ্ধিজীবীদের প্রতি গভীর শ্রদ্ধা নিবেদন।", theme: 'minimal', priority: 1 },
  { month: 11, day: 16, en: "VICTORY DAY", bn: "বিজয় দিবস", subEn: "Commemorating the victory of Bangladesh in 1971.", subBn: "১৯ ১৯৭১ সালের বাংলাদেশের বিজয় উদযাপন।", theme: 'minimal', priority: 1 },
  { month: 11, day: 25, en: "MERRY CHRISTMAS", bn: "শুভ বড়দিন", subEn: "Wishing you a season of peace, love, and happiness!", subBn: "আপনার জীবন শান্তি, ভালোবাসা ও সুখে ভরে উঠুক!", theme: 'party', priority: 2 },
  { month: 11, day: 31, en: "NEW YEAR'S EVE", bn: "থ্রিল অফ টুয়েন্টি ফোর", subEn: "Ready to welcome another year of possibilities!", subBn: "সম্ভাবনার আরও একটি বছরকে স্বাগত জানাতে প্রস্তুত!", theme: 'party', priority: 2 },
];

export const getAutoEvent = () => {
  const now = new Date();
  const month = now.getMonth();
  const day = now.getDate();
  const matches = EVENTS.filter(e => e.month === month && e.day === day);
  if (matches.length === 0) return undefined;
  return matches.sort((a, b) => a.priority - b.priority)[0];
};
