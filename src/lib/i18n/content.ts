// Public-site phrase translation layer.
//
// Marketing/section text across the public website is defined as English
// constants inside the section components (Solution, Modules, Contact, etc.).
// Rather than restructuring every component into CMS-managed Localized objects,
// this module provides a single English → Sinhala phrase map plus a
// `translatePhrase` helper.
//
// Behaviour (mirrors getLocalizedText):
//   - active language "en"            → return the original English string
//   - active language "si" + match    → return the Sinhala translation
//   - active language "si" + no match → fall back to the original English
//
// Because it keys on the exact English text, it translates BOTH the hardcoded
// component constants AND the default published CMS values (hero, navigation,
// contact) with one lookup. Custom admin text that has no Sinhala entry simply
// falls back to English — the required "safe final fallback" behaviour.
//
// Keep English keys byte-identical to what the components render (after trim).

import type { LanguageCode } from "@/lib/cms/model";
import { PARKING_PHRASES } from "./parking-phrases";

export const PHRASES: Record<string, string> = {
  /* ---------------- Hero (status bar + CMS defaults) ---------------- */
  "Real-Time Availability": "තත්‍ය කාලීන ලබා ගැනීම",
  "ANPR Automation": "ANPR ස්වයංක්‍රීයකරණය",
  "Dynamic Pricing": "ගතික මිල නියම කිරීම",
  "Secure QR Payments": "සුරක්ෂිත QR ගෙවීම්",
  "Multi-Location Control": "බහු-ස්ථාන පාලනය",
  "AI-Powered Smart Parking Ecosystem": "AI බලයෙන් යුත් බුද්ධිමත් රථගාල පරිසර පද්ධතිය",
  "Intelligent Parking. Seamless Mobility.": "බුද්ධිමත් රථගාල් කළමනාකරණය. පහසු ගමනාගමනය.",
  "SPM ECO System connects real-time parking availability, advance reservations, ANPR-powered access, dynamic pricing, secure payments, retail parking control, and multi-location analytics through one intelligent platform.":
    "SPM ECO System මඟින් තත්‍ය කාලීන රථගාල ලබා ගැනීම, කලින් වෙන් කිරීම්, ANPR පදනම් වූ ප්‍රවේශය, ගතික මිල නියම කිරීම, සුරක්ෂිත ගෙවීම්, සිල්ලර රථගාල පාලනය සහ බහු-ස්ථාන විශ්ලේෂණ එකම බුද්ධිමත් වේදිකාවක් හරහා සම්බන්ධ කරයි.",
  "Request a System Demo": "පද්ධති ඩෙමෝවක් ඉල්ලන්න",
  "Explore the Platform": "වේදිකාව ගවේෂණය කරන්න",
  "Built for modern parking facilities, retail chains, commercial properties, and multi-location operators across Sri Lanka.":
    "ශ්‍රී ලංකාව පුරා නවීන රථගාල පහසුකම්, සිල්ලර වෙළඳ ජාල, වාණිජ දේපල සහ බහු-ස්ථාන ක්‍රියාකරුවන් සඳහා නිර්මාණය කර ඇත.",

  /* ---------------- Navigation + header ---------------- */
  Home: "මුල් පිටුව",
  Problem: "ගැටලුව",
  Solution: "විසඳුම",
  Features: "විශේෂාංග",
  Dashboard: "පාලන පුවරුව",
  Contact: "සම්බන්ධ වන්න",
  "Request Demo": "ඩෙමෝවක් ඉල්ලන්න",
  "Smart Parking": "බුද්ධිමත් රථගාල",
  "SPM ECO System": "SPM ECO System",

  /* ---------------- Problem ---------------- */
  "The Problem": "ගැටලුව",
  "The Parking Problem in Urban Sri Lanka": "නාගරික ශ්‍රී ලංකාවේ රථගාල ගැටලුව",
  "Parking facilities in Colombo and commercial zones still depend heavily on manual and paper-based operations.":
    "කොළඹ සහ වාණිජ කලාපවල රථගාල පහසුකම් තවමත් අත්කම් සහ කඩදාසි පදනම් වූ ක්‍රියාවලීන් මත දැඩිව රඳා පවතී.",
  "Peak-Hour Parking Discovery": "උච්ච වේලාවේ රථගාල සොයා ගැනීම",
  "Drivers have no reliable way to know whether spaces are available before reaching a location, causing repeated circling, wasted time, congestion, and frustration during peak hours.":
    "ස්ථානයකට ළඟා වීමට පෙර ඉඩ තිබේද යන්න දැන ගැනීමට රියදුරන්ට විශ්වාසදායක ක්‍රමයක් නොමැති නිසා, උච්ච වේලාවන්හිදී නැවත නැවත වට කිරීම, කාලය නාස්තිය, තදබදය සහ කලකිරීම ඇති වේ.",
  "No Advance Booking System": "කලින් වෙන් කිරීමේ ක්‍රමයක් නැත",
  "Most locations run first-come, first-served. Drivers cannot reserve ahead, and operators miss revenue from premium, guaranteed parking.":
    "බොහෝ ස්ථාන පළමුව පැමිණෙන අයට පළමුව සේවය කරයි. රියදුරන්ට කලින් වෙන් කර ගත නොහැකි අතර, ක්‍රියාකරුවන්ට සහතික කළ premium රථගාලෙන් ලැබෙන ආදායම අහිමි වේ.",
  "Manual Ticketing & Revenue Leakage": "අත්කම් ටිකට් නිකුතුව සහ ආදායම් කාන්දුව",
  "Paper tickets and hand calculations create human errors, fake tickets, slow vehicle movement, and poor revenue tracking.":
    "කඩදාසි ටිකට් සහ අත් ගණනය කිරීම් මගින් මානව දෝෂ, ව්‍යාජ ටිකට්, මන්දගාමී වාහන ගමන් සහ දුර්වල ආදායම් නිරීක්ෂණය ඇති කරයි.",
  "Unclassified & Unauthorized Vehicles": "වර්ගීකරණය නොකළ සහ අනවසර වාහන",
  "Staff, delivery, walk-in, and unauthorized vehicles are not properly identified, causing security issues and operational confusion.":
    "කාර්ය මණ්ඩල, බෙදාහැරීම්, පැමිණෙන සහ අනවසර වාහන නිසි ලෙස හඳුනා නොගැනීම ආරක්ෂක ගැටලු සහ ක්‍රියාකාරී ව්‍යාකූලත්වයට හේතු වේ.",
  "Retail Free Parking Abuse": "සිල්ලර නොමිලේ රථගාල අනිසි භාවිතය",
  "Retail spaces are misused by non-customers who park for long hours, reducing availability for genuine shoppers and affecting store revenue.":
    "දිගු පැය ගණනක් නවතා තබන පාරිභෝගිකයන් නොවන අය විසින් සිල්ලර ඉඩ අනිසි ලෙස භාවිතා කරන අතර, එය සැබෑ පාරිභෝගිකයන්ට ඉඩ අඩු කර වෙළඳසැල් ආදායමට බලපායි.",
  "1 platform": "වේදිකා 1ක්",
  "SPM ECO System replaces fragmented manual operations with one integrated, automated ecosystem.":
    "SPM ECO System මගින් විසිරුණු අත්කම් ක්‍රියාකාරකම් එකම ඒකාබද්ධ, ස්වයංක්‍රීය පරිසර පද්ධතියකින් ප්‍රතිස්ථාපනය කරයි.",

  /* ---------------- Solution (feature grid) ---------------- */
  "The Solution": "විසඳුම",
  "What is SPM ECO System?": "SPM ECO System යනු කුමක්ද?",
  "A smart parking management platform combining a mobile application, ANPR camera automation, dynamic pricing, QR payment, vehicle classification, retail parking control, and a web-based operator dashboard into one integrated ecosystem.":
    "ජංගම යෙදුමක්, ANPR කැමරා ස්වයංක්‍රීයකරණය, ගතික මිල නියම කිරීම, QR ගෙවීම, වාහන වර්ගීකරණය, සිල්ලර රථගාල පාලනය සහ වෙබ් පදනම් වූ ක්‍රියාකරු පාලන පුවරුවක් එකම ඒකාබද්ධ පරිසර පද්ධතියකට සම්බන්ධ කරන බුද්ධිමත් රථගාල කළමනාකරණ වේදිකාවකි.",
  "Real-time Parking Availability": "තත්‍ය කාලීන රථගාල ලබා ගැනීම",
  "Advance Slot Booking": "කලින් ඉඩ වෙන් කිරීම",
  "Dynamic Peak-Hour Pricing": "ගතික උච්ච වේලා මිල නියම කිරීම",
  "ANPR Number Plate Recognition": "ANPR අංක තහඩු හඳුනාගැනීම",
  "Automated Gate Control": "ස්වයංක්‍රීය දොරටු පාලනය",
  "QR-based Payment": "QR පදනම් වූ ගෙවීම",
  "Retail Overstay Detection": "සිල්ලර අධික නැවතුම හඳුනාගැනීම",
  "Multi-location Dashboard": "බහු-ස්ථාන පාලන පුවරුව",
  "Security Alerts": "ආරක්ෂක ඇඟවීම්",
  "Revenue Analytics": "ආදායම් විශ්ලේෂණ",

  /* ---------------- How It Works ---------------- */
  "How It Works": "එය ක්‍රියා කරන ආකාරය",
  "Complete Parking Lifecycle Automation": "සම්පූර්ණ රථගාල ජීවන චක්‍ර ස්වයංක්‍රීයකරණය",
  "From driver booking to gate automation and live operator monitoring — every step is connected.":
    "රියදුරු වෙන් කිරීමේ සිට දොරටු ස්වයංක්‍රීයකරණය සහ සජීවී ක්‍රියාකරු නිරීක්ෂණය දක්වා — සෑම පියවරක්ම සම්බන්ධ වී ඇත.",
  "Driver Opens Mobile App": "රියදුරු ජංගම යෙදුම විවෘත කරයි",
  "Checks nearby parking locations, distance, live availability, and price.":
    "අවට රථගාල ස්ථාන, දුර, සජීවී ලබා ගැනීම සහ මිල පරීක්ෂා කරයි.",
  "Driver Books a Slot": "රියදුරු ඉඩක් වෙන් කරයි",
  "Selects arrival time and duration; the system calculates the fee with dynamic pricing.":
    "පැමිණීමේ වේලාව සහ කාලසීමාව තෝරයි; පද්ධතිය ගතික මිල නියම කිරීම සමඟ ගාස්තුව ගණනය කරයි.",
  "QR Confirmation Issued": "QR තහවුරු කිරීම නිකුත් කරයි",
  "After payment, the user receives a QR-coded booking confirmation.":
    "ගෙවීමෙන් පසු, පරිශීලකයාට QR කේත සහිත වෙන් කිරීමේ තහවුරුවක් ලැබේ.",
  "Vehicle Arrives at Gate": "වාහනය දොරටුවට පැමිණේ",
  "The ANPR camera reads the vehicle number plate automatically.":
    "ANPR කැමරාව වාහන අංක තහඩුව ස්වයංක්‍රීයව කියවයි.",
  "System Verifies Vehicle": "පද්ධතිය වාහනය තහවුරු කරයි",
  "Checks whether the vehicle is pre-booked, staff, walk-in, delivery, or unauthorized.":
    "වාහනය කලින් වෙන් කළ, කාර්ය මණ්ඩල, පැමිණෙන, බෙදාහැරීම් හෝ අනවසර දැයි පරීක්ෂා කරයි.",
  "Gate Opens Automatically": "දොරටුව ස්වයංක්‍රීයව විවෘත වේ",
  "If verified, the barrier lifts and the vehicle is directed to its allocated slot.":
    "තහවුරු කළහොත්, බාධකය ඉහළට ඔසවා වාහනය එයට වෙන් කළ ඉඩට යොමු කරයි.",
  "Parking Duration Tracked": "රථගාල කාලසීමාව නිරීක්ෂණය කරයි",
  "The system tracks entry time, exit time, overtime, and parking charges.":
    "පද්ධතිය පිවිසුම් වේලාව, පිටවීමේ වේලාව, අතිකාල සහ රථගාල ගාස්තු නිරීක්ෂණය කරයි.",
  "Payment & Checkout": "ගෙවීම සහ පිටවීම",
  "At exit, the final or overtime fee is calculated; pay via QR or card.":
    "පිටවීමේදී, අවසාන හෝ අතිකාල ගාස්තුව ගණනය කරයි; QR හෝ කාඩ්පත මගින් ගෙවන්න.",
  "Reports Generated": "වාර්තා ජනනය කරයි",
  "The dashboard updates occupancy, vehicle count, revenue, and security logs in real time.":
    "පාලන පුවරුව ආක්‍රමණය, වාහන ගණන, ආදායම සහ ආරක්ෂක ලොග තත්‍ය කාලීනව යාවත්කාලීන කරයි.",

  /* ---------------- Modules ---------------- */
  "Core Modules": "මූලික මොඩියුල",
  "Core Modules of SPM ECO System": "SPM ECO System හි මූලික මොඩියුල",
  "Five deeply integrated modules covering the driver, the gate, pricing, retail, and operations.":
    "රියදුරු, දොරටුව, මිල නියම කිරීම, සිල්ලර සහ මෙහෙයුම් ආවරණය කරන ගැඹුරින් ඒකාබද්ධ මොඩියුල පහක්.",
  "SmartPark Mobile Application": "SmartPark ජංගම යෙදුම",
  "A mobile app for Android and iOS that helps drivers view live availability, compare nearby locations, reserve slots in advance, receive dynamic pricing, pay, and get QR confirmation.":
    "රියදුරන්ට සජීවී ලබා ගැනීම බැලීමට, අවට ස්ථාන සැසඳීමට, කලින් ඉඩ වෙන් කිරීමට, ගතික මිල ලබා ගැනීමට, ගෙවීමට සහ QR තහවුරුව ලබා ගැනීමට උදව් වන Android සහ iOS සඳහා ජංගම යෙදුමකි.",
  "Live parking map": "සජීවී රථගාල සිතියම",
  "Nearby parking search": "අවට රථගාල සෙවීම",
  "Available slot count": "ලබා ගත හැකි ඉඩ ගණන",
  "Advance booking": "කලින් වෙන් කිරීම",
  "Dynamic price quote": "ගතික මිල උපුටනය",
  "QR booking confirmation": "QR වෙන් කිරීමේ තහවුරුව",
  "Payment history": "ගෙවීම් ඉතිහාසය",
  "Overtime notification": "අතිකාල දැනුම්දීම",
  "Cross-branch recommendation": "අන්තර්-ශාඛා නිර්දේශය",
  "ANPR Automated Gate System": "ANPR ස්වයංක්‍රීය දොරටු පද්ධතිය",
  "Entry and exit gates use cameras and number-plate recognition to identify vehicles automatically, verify the category, and control the gate without manual intervention.":
    "පිවිසුම් සහ පිටවීමේ දොරටු කැමරා සහ අංක තහඩු හඳුනාගැනීම භාවිතයෙන් වාහන ස්වයංක්‍රීයව හඳුනාගෙන, වර්ගය තහවුරු කර, අත්කම් මැදිහත්වීමකින් තොරව දොරටුව පාලනය කරයි.",
  "Pre-booked: verify booking & open gate": "කලින් වෙන් කළ: වෙන් කිරීම තහවුරු කර දොරටුව විවෘත කරයි",
  "Staff: match registered plate & open": "කාර්ය මණ්ඩල: ලියාපදිංචි තහඩුව ගැලපී විවෘත කරයි",
  "Walk-in: check space & issue QR ticket": "පැමිණෙන: ඉඩ පරීක්ෂා කර QR ටිකට් නිකුත් කරයි",
  "Delivery: verify access & log entry": "බෙදාහැරීම්: ප්‍රවේශය තහවුරු කර පිවිසුම ලොග් කරයි",
  "Unauthorized: keep closed & alert security": "අනවසර: වසා තබා ආරක්ෂාවට ඇඟවීම කරයි",
  "Dynamic Pricing Engine": "ගතික මිල නියම කිරීමේ එන්ජිම",
  "Calculates parking fees based on time, duration, demand, peak hours, weekends, holidays, and overtime.":
    "වේලාව, කාලසීමාව, ඉල්ලුම, උච්ච වේලාවන්, සති අන්ත, නිවාඩු සහ අතිකාල මත රථගාල ගාස්තු ගණනය කරයි.",
  "Off-peak pricing": "අඩු-ඉල්ලුම් මිල නියම කිරීම",
  "Peak-hour premium pricing": "උච්ච වේලා premium මිල නියම කිරීම",
  "Weekend pricing": "සති අන්ත මිල නියම කිරීම",
  "Holiday pricing": "නිවාඩු මිල නියම කිරීම",
  "Overtime charges": "අතිකාල ගාස්තු",
  "Pre-booking charges": "කලින් වෙන් කිරීමේ ගාස්තු",
  "Retail overstay charges": "සිල්ලර අධික නැවතුම් ගාස්තු",
  "Retail Parking Management": "සිල්ලර රථගාල කළමනාකරණය",
  "Designed for retail chains like supermarkets and shopping outlets. Detects vehicles that exceed the free parking threshold and automatically generates an overstay bill.":
    "සුපිරි වෙළඳසැල් සහ සාප්පු වැනි සිල්ලර ජාල සඳහා නිර්මාණය කර ඇත. නොමිලේ රථගාල සීමාව ඉක්මවන වාහන හඳුනාගෙන ස්වයංක්‍රීයව අධික නැවතුම් බිල්පතක් ජනනය කරයි.",
  "ANPR vehicle entry log": "ANPR වාහන පිවිසුම් ලොගය",
  "Free parking time limit": "නොමිලේ රථගාල කාල සීමාව",
  "Overstay detection": "අධික නැවතුම හඳුනාගැනීම",
  "QR payment at exit": "පිටවීමේදී QR ගෙවීම",
  "Customer slot booking": "පාරිභෝගික ඉඩ වෙන් කිරීම",
  "Retail abuse prevention": "සිල්ලර අනිසි භාවිතය වැළැක්වීම",
  "Operator Dashboard": "ක්‍රියාකරු පාලන පුවරුව",
  "A web dashboard for parking owners and operators to manage multiple parking locations from one place.":
    "රථගාල හිමිකරුවන්ට සහ ක්‍රියාකරුවන්ට එක් තැනකින් රථගාල ස්ථාන කිහිපයක් කළමනාකරණය කිරීමට වෙබ් පාලන පුවරුවකි.",
  "Live occupancy map": "සජීවී ආක්‍රමණ සිතියම",
  "Available & occupied slots": "ලබා ගත හැකි සහ භාවිත ඉඩ",
  "Daily vehicle count": "දෛනික වාහන ගණන",
  "Vehicle category breakdown": "වාහන වර්ග විස්තරය",
  "Revenue summary": "ආදායම් සාරාංශය",
  "Peak-hour analytics": "උච්ච වේලා විශ්ලේෂණ",
  "Overstay reports": "අධික නැවතුම් වාර්තා",
  "Security alerts & unauthorized logs": "ආරක්ෂක ඇඟවීම් සහ අනවසර ලොග",
  "Multi-location management": "බහු-ස්ථාන කළමනාකරණය",
  "Historical trend reports": "ඓතිහාසික ප්‍රවණතා වාර්තා",

  /* ---------------- Vehicle Classification ---------------- */
  "ANPR System": "ANPR පද්ධතිය",
  "Intelligent Vehicle Classification": "බුද්ධිමත් වාහන වර්ගීකරණය",
  "SPM ECO System automatically classifies every vehicle at the gate and applies the correct access rule.":
    "SPM ECO System දොරටුවේදී සෑම වාහනයක්ම ස්වයංක්‍රීයව වර්ගීකරණය කර නිවැරදි ප්‍රවේශ නීතිය යොදයි.",
  "Pre-booked Vehicles": "කලින් වෙන් කළ වාහන",
  "Vehicles with a confirmed mobile app booking and QR confirmation.":
    "තහවුරු කළ ජංගම යෙදුම් වෙන් කිරීමක් සහ QR තහවුරුවක් සහිත වාහන.",
  "Staff Vehicles": "කාර්ය මණ්ඩල වාහන",
  "Registered staff plates are verified automatically through the database.":
    "ලියාපදිංචි කාර්ය මණ්ඩල තහඩු දත්ත ගබඩාව හරහා ස්වයංක්‍රීයව තහවුරු කරයි.",
  "Walk-in Vehicles": "පැමිණෙන වාහන",
  "Vehicles without booking can enter if spaces are available and receive QR ticketing.":
    "වෙන් කිරීමක් නොමැති වාහනවලට ඉඩ තිබේ නම් ඇතුළු විය හැකි අතර QR ටිකට් ලැබේ.",
  "Delivery Vehicles": "බෙදාහැරීම් වාහන",
  "Delivery vehicles are logged and allowed based on configured access rules.":
    "බෙදාහැරීම් වාහන ලොග් කර වින්‍යාස කළ ප්‍රවේශ නීති අනුව අවසර දෙයි.",
  "Unauthorized Vehicles": "අනවසර වාහන",
  "Unrecognized or restricted vehicles trigger real-time security alerts and gate blocking.":
    "හඳුනා නොගත් හෝ සීමා කළ වාහන තත්‍ය කාලීන ආරක්ෂක ඇඟවීම් සහ දොරටු අවහිර කිරීම් ඇති කරයි.",

  /* ---------------- Booking (mobile app) ---------------- */
  "Mobile App": "ජංගම යෙදුම",
  "Find, Book, and Park Faster": "වේගයෙන් සොයන්න, වෙන් කරන්න, නවතන්න",
  "The mobile app reduces driver search time by showing live parking availability before arrival.":
    "ජංගම යෙදුම පැමිණීමට පෙර සජීවී රථගාල ලබා ගැනීම පෙන්වීමෙන් රියදුරු සෙවුම් කාලය අඩු කරයි.",
  "Live parking location map": "සජීවී රථගාල ස්ථාන සිතියම",
  "Distance from driver": "රියදුරාගෙන් දුර",
  "Estimated fee": "ඇස්තමේන්තුගත ගාස්තුව",
  "Arrival time selection": "පැමිණීමේ වේලාව තේරීම",
  "Duration selection": "කාලසීමාව තේරීම",
  "Guaranteed slot reservation": "සහතික කළ ඉඩ වෙන් කිරීම",
  "QR confirmation": "QR තහවුරුව",
  "Payment before arrival": "පැමිණීමට පෙර ගෙවීම",
  "Good afternoon": "සුබ දහවලක්",
  "Nearby Parking": "අවට රථගාල",
  "Book Now": "දැන් වෙන් කරන්න",
  Peak: "උච්ච",
  slots: "ඉඩ",

  /* ---------------- Pricing ---------------- */
  "Smart Pricing for Peak and Off-Peak Demand": "උච්ච සහ අඩු ඉල්ලුම සඳහා බුද්ධිමත් මිල නියම කිරීම",
  "Instead of flat-rate pricing, a flexible pricing engine lets operators increase revenue during high-demand periods and encourage better usage off-peak.":
    "සමතලා-අනුපාත මිලකරණය වෙනුවට, නම්‍යශීලී මිල එන්ජිමක් ක්‍රියාකරුවන්ට ඉහළ ඉල්ලුම් කාලවලදී ආදායම වැඩි කිරීමට සහ අඩු ඉල්ලුම් වේලාවන්හි වඩා හොඳ භාවිතයක් දිරිගැන්වීමට ඉඩ දෙයි.",
  "Example rate card": "උදාහරණ අනුපාත කාඩ්පත",
  "Off-peak weekday": "අඩු-ඉල්ලුම් සතියේ දිනය",
  "Morning peak": "උදෑසන උච්චය",
  "Evening peak": "සවස උච්චය",
  Weekend: "සති අන්තය",
  Holiday: "නිවාඩු දිනය",
  Overtime: "අතිකාලය",
  "Retail overstay": "සිල්ලර අධික නැවතුම",
  "Illustrative rates only — every operator configures their own pricing rules.":
    "නිදර්ශන අනුපාත පමණි — සෑම ක්‍රියාකරුවෙක්ම තමන්ගේම මිල නීති වින්‍යාස කරයි.",
  Benefits: "ප්‍රතිලාභ",
  "Improves operator revenue": "ක්‍රියාකරු ආදායම වැඩි කරයි",
  "Controls demand": "ඉල්ලුම පාලනය කරයි",
  "Reduces parking abuse": "රථගාල අනිසි භාවිතය අඩු කරයි",
  "Supports guaranteed booking": "සහතික කළ වෙන් කිරීම සඳහා සහාය දෙයි",
  "Makes pricing transparent for drivers": "රියදුරන්ට මිල නියම කිරීම විනිවිද පෙනෙන කරයි",

  /* ---------------- Retail Abuse ---------------- */
  "Retail Parking": "සිල්ලර රථගාල",
  "Protect Retail Parking for Genuine Customers":
    "සැබෑ පාරිභෝගිකයන් සඳහා සිල්ලර රථගාල ආරක්ෂා කරන්න",
  "Retail spaces are often used by commuters and office workers for long hours. SPM ECO System tracks vehicle duration and charges overstays automatically.":
    "සිල්ලර ඉඩ බොහෝ විට ගමන් කරන්නන් සහ කාර්යාල සේවකයන් දිගු පැය ගණනක් භාවිත කරයි. SPM ECO System වාහන කාලසීමාව නිරීක්ෂණය කර අධික නැවතුම් සඳහා ස්වයංක්‍රීයව ගාස්තු අය කරයි.",
  "Overstay Workflow": "අධික නැවතුම් වැඩ ප්‍රවාහය",
  "Vehicle enters retail car park": "වාහනය සිල්ලර රථගාලට ඇතුළු වේ",
  "ANPR camera logs number plate": "ANPR කැමරාව අංක තහඩුව ලොග් කරයි",
  "System starts free parking timer": "පද්ධතිය නොමිලේ රථගාල කාල ගණකය අරඹයි",
  "Vehicle exceeds free threshold": "වාහනය නොමිලේ සීමාව ඉක්මවයි",
  "Overstay charge is calculated": "අධික නැවතුම් ගාස්තුව ගණනය කරයි",
  "Driver pays through QR at exit": "රියදුරු පිටවීමේදී QR හරහා ගෙවයි",
  "Gate opens after payment": "ගෙවීමෙන් පසු දොරටුව විවෘත වේ",
  "Prevents long-term parking abuse": "දිගුකාලීන රථගාල අනිසි භාවිතය වළක්වයි",
  "Improves parking availability for shoppers": "සාප්පු යන්නන්ට රථගාල ලබා ගැනීම වැඩි කරයි",
  "Increases customer convenience": "පාරිභෝගික පහසුව වැඩි කරයි",
  "Supports branch-level parking monitoring": "ශාඛා මට්ටමේ රථගාල නිරීක්ෂණයට සහාය දෙයි",
  "Provides data for retail management": "සිල්ලර කළමනාකරණය සඳහා දත්ත සපයයි",

  /* ---------------- Security ---------------- */
  Security: "ආරක්ෂාව",
  "Real-time Security Monitoring": "තත්‍ය කාලීන ආරක්ෂක නිරීක්ෂණය",
  "Help security teams identify unauthorized vehicles, suspicious activity, overstays, and manual override cases.":
    "ආරක්ෂක කණ්ඩායම්වලට අනවසර වාහන, සැක සහිත ක්‍රියාකාරකම්, අධික නැවතුම් සහ අත්කම් අභිබවා යාමේ අවස්ථා හඳුනා ගැනීමට උදව් කරයි.",
  "Unauthorized Vehicle Alert": "අනවසර වාහන ඇඟවීම",
  "Instant alerts when an unrecognized or restricted plate is detected.":
    "හඳුනා නොගත් හෝ සීමා කළ තහඩුවක් හඳුනාගත් විට ක්ෂණික ඇඟවීම්.",
  "Blacklist Support": "කළු ලැයිස්තු සහාය",
  "Maintain a blacklist to automatically deny flagged vehicles.":
    "සලකුණු කළ වාහන ස්වයංක්‍රීයව ප්‍රතික්ෂේප කිරීමට කළු ලැයිස්තුවක් පවත්වා ගන්න.",
  "Gate-blocking Action": "දොරටු අවහිර කිරීමේ ක්‍රියාව",
  "Keep the barrier closed until security clears the vehicle.":
    "ආරක්ෂාව වාහනය නිදහස් කරන තෙක් බාධකය වසා තබන්න.",
  "Entry & Exit Image Logs": "පිවිසුම් සහ පිටවීමේ රූප ලොග",
  "Every gate event captures a timestamped plate image.":
    "සෑම දොරටු සිදුවීමක්ම වේලා මුද්‍රිත තහඩු රූපයක් ග්‍රහණය කරයි.",
  "Security Officer Notification": "ආරක්ෂක නිලධාරී දැනුම්දීම",
  "Push notifications route incidents to the right officer.":
    "තල්ලු දැනුම්දීම් සිදුවීම් නිවැරදි නිලධාරියාට යොමු කරයි.",
  "Manual Approval Option": "අත්කම් අනුමැති විකල්පය",
  "Officers can approve or override access when needed.":
    "අවශ්‍ය විට නිලධාරීන්ට ප්‍රවේශය අනුමත කිරීමට හෝ අභිබවා යාමට හැකිය.",
  "Audit History": "විගණන ඉතිහාසය",
  "Full audit trail of overrides, approvals, and access events.":
    "අභිබවා යාම්, අනුමැති සහ ප්‍රවේශ සිදුවීම්වල සම්පූර්ණ විගණන මාවත.",
  "Vehicle Movement Records": "වාහන චලන වාර්තා",
  "Track entry, exit, and movement across all locations.":
    "සියලුම ස්ථාන හරහා පිවිසුම, පිටවීම සහ චලනය නිරීක්ෂණය කරයි.",

  /* ---------------- Hardware ---------------- */
  Hardware: "දෘඪාංග",
  "Smart Parking Hardware Integration": "බුද්ධිමත් රථගාල දෘඪාංග ඒකාබද්ධ කිරීම",
  "A complete on-site hardware stack that pairs with the SPM ECO software platform.":
    "SPM ECO මෘදුකාංග වේදිකාව සමඟ යුගල වන සම්පූර්ණ ස්ථානීය දෘඪාංග එකතුවකි.",
  "ANPR Camera": "ANPR කැමරාව",
  "Captures number plates at entry and exit gates.":
    "පිවිසුම් සහ පිටවීමේ දොරටුවල අංක තහඩු ග්‍රහණය කරයි.",
  "Barrier Gate Controller": "බාධක දොරටු පාලකය",
  "Automatically opens and closes gates on system approval.":
    "පද්ධති අනුමැතිය මත දොරටු ස්වයංක්‍රීයව විවෘත කර වසයි.",
  "QR Scanner": "QR ස්කෑනරය",
  "Scans booking confirmations, QR tickets, and payment codes.":
    "වෙන් කිරීමේ තහවුරු, QR ටිකට් සහ ගෙවීම් කේත ස්කෑන් කරයි.",
  "Thermal Printer": "තාප මුද්‍රණ යන්ත්‍රය",
  "Prints tickets and bills for walk-in users.":
    "පැමිණෙන පරිශීලකයන් සඳහා ටිකට් සහ බිල්පත් මුද්‍රණය කරයි.",
  "Payment Terminal": "ගෙවීම් පර්යන්තය",
  "Supports card and QR-based payments.": "කාඩ්පත් සහ QR පදනම් ගෙවීම් සඳහා සහාය දෙයි.",
  "Operator Control Device": "ක්‍රියාකරු පාලන උපකරණය",
  "Used by officers for manual approval and alert handling.":
    "අත්කම් අනුමැතිය සහ ඇඟවීම් හැසිරවීම සඳහා නිලධාරීන් විසින් භාවිතා කරයි.",

  /* ---------------- Tech Stack ---------------- */
  Technology: "තාක්ෂණය",
  "Technology Stack": "තාක්ෂණ එකතුව",
  "A modern, scalable architecture spanning mobile, web, backend, computer vision, and cloud.":
    "ජංගම, වෙබ්, පසුබිම, පරිගණක දර්ශනය සහ වලාකුළ පුරා විහිදෙන නවීන, පරිමාණය කළ හැකි වාස්තු විද්‍යාවකි.",
  "React Native for Android and iOS": "Android සහ iOS සඳහා React Native",
  "Web Dashboard": "වෙබ් පාලන පුවරුව",
  "React.js / Next.js": "React.js / Next.js",
  "Backend API": "පසුබිම් API",
  "Node.js / Express.js or NestJS": "Node.js / Express.js හෝ NestJS",
  Database: "දත්ත ගබඩාව",
  "PostgreSQL for relational data": "සම්බන්ධිත දත්ත සඳහා PostgreSQL",
  "Real-time Layer": "තත්‍ය කාලීන ස්තරය",
  "Redis for live occupancy & caching": "සජීවී ආක්‍රමණය සහ හැඹිලි සඳහා Redis",
  "ANPR / Computer Vision": "ANPR / පරිගණක දර්ශනය",
  "Python, OpenCV, Tesseract OCR & custom model": "Python, OpenCV, Tesseract OCR සහ අභිරුචි ආකෘතිය",
  Payments: "ගෙවීම්",
  "QR & card payment gateway integration": "QR සහ කාඩ්පත් ගෙවීම් ද්වාර ඒකාබද්ධ කිරීම",
  Cloud: "වලාකුළ",
  "AWS or GCP hosting, storage & notifications": "AWS හෝ GCP සත්කාරකත්වය, ගබඩාව සහ දැනුම්දීම්",
  "Version Control": "අනුවාද පාලනය",
  "Git and GitHub": "Git සහ GitHub",
  Design: "නිර්මාණය",
  "Figma for UI/UX design & prototyping": "UI/UX නිර්මාණය සහ මූලාකෘති සඳහා Figma",

  /* ---------------- Dashboard (site) ---------------- */
  "A Central Dashboard for Parking Operators": "රථගාල ක්‍රියාකරුවන් සඳහා මධ්‍යම පාලන පුවරුවක්",
  "Manage every location, vehicle, payment, and alert in real time from one web dashboard.":
    "එක් වෙබ් පාලන පුවරුවකින් සෑම ස්ථානයක්ම, වාහනයක්ම, ගෙවීමක්ම සහ ඇඟවීමක්ම තත්‍ය කාලීනව කළමනාකරණය කරන්න.",
  "Total Parking Slots": "මුළු රථගාල ඉඩ",
  "across 6 branches": "ශාඛා 6ක් පුරා",
  "Available Slots": "ලබා ගත හැකි ඉඩ",
  "25% free": "25% නිදහස්",
  "Occupied Slots": "භාවිත ඉඩ",
  "68% in use": "68% භාවිතයේ",
  "Reserved Slots": "වෙන් කළ ඉඩ",
  "pre-booked": "කලින් වෙන් කළ",
  "Today's Revenue": "අද ආදායම",
  "+12% vs avg": "සාමාන්‍යයට වඩා +12%",
  "Today's Vehicles": "අද වාහන",
  "entries logged": "පිවිසුම් ලොග් කළා",
  "Live Map": "සජීවී සිතියම",
  Bookings: "වෙන් කිරීම්",
  Vehicles: "වාහන",
  "Retail Overstay": "සිල්ලර අධික නැවතුම",
  Reports: "වාර්තා",
  Settings: "සැකසුම්",
  Branches: "ශාඛා",
  "Branch-wise Occupancy": "ශාඛා අනුව ආක්‍රමණය",
  "Live Alerts": "සජීවී ඇඟවීම්",
  "Unauthorized vehicle · Gate 2": "අනවසර වාහනය · දොරටුව 2",
  Blocked: "අවහිර කළා",
  "Peak-hour usage": "උච්ච වේලා භාවිතය",
  "Overstay vehicles today": "අද අධික නැවතුම් වාහන",

  /* ---------------- Benefits ---------------- */
  "Why SPM ECO System Matters": "SPM ECO System වැදගත් වන්නේ ඇයි",
  "Clear value for everyone in the parking ecosystem — drivers, operators, and retailers.":
    "රථගාල පරිසර පද්ධතියේ සැමට පැහැදිලි වටිනාකමක් — රියදුරන්, ක්‍රියාකරුවන් සහ සිල්ලර වෙළෙන්දන්.",
  "For Drivers": "රියදුරන් සඳහා",
  "For Operators": "ක්‍රියාකරුවන් සඳහා",
  "For Retailers": "සිල්ලර වෙළෙන්දන් සඳහා",
  "Find parking faster": "වේගයෙන් රථගාල සොයන්න",
  "Reserve parking in advance": "කලින් රථගාල වෙන් කරන්න",
  "Avoid unnecessary searching": "අනවශ්‍ය සෙවීම වළක්වන්න",
  "Transparent pricing": "විනිවිද පෙනෙන මිල නියම කිරීම",
  "QR-based easy access": "QR පදනම් වූ පහසු ප්‍රවේශය",
  "Reduced waiting time": "අඩු වූ රැඳී සිටීමේ කාලය",
  "Reduce manual work": "අත්කම් වැඩ අඩු කරන්න",
  "Prevent revenue leakage": "ආදායම් කාන්දුව වළක්වන්න",
  "Improve vehicle throughput": "වාහන ප්‍රවාහය වැඩි කරන්න",
  "Track revenue in real time": "ආදායම තත්‍ය කාලීනව නිරීක්ෂණය කරන්න",
  "Manage multiple locations": "ස්ථාන කිහිපයක් කළමනාකරණය කරන්න",
  "Get historical reports": "ඓතිහාසික වාර්තා ලබා ගන්න",
  "Improve security": "ආරක්ෂාව වැඩි කරන්න",
  "Increase revenue with dynamic pricing": "ගතික මිල නියම කිරීමෙන් ආදායම වැඩි කරන්න",
  "Prevent free parking abuse": "නොමිලේ රථගාල අනිසි භාවිතය වළක්වන්න",
  "Improve customer parking availability": "පාරිභෝගික රථගාල ලබා ගැනීම වැඩි කරන්න",
  "Reduce non-customer parking": "පාරිභෝගික නොවන රථගාල අඩු කරන්න",
  "Monitor branch parking activity": "ශාඛා රථගාල ක්‍රියාකාරකම් නිරීක්ෂණය කරන්න",
  "Generate overstay revenue": "අධික නැවතුම් ආදායම ජනනය කරන්න",

  /* ---------------- Use Cases ---------------- */
  "Use Cases": "භාවිත අවස්ථා",
  "Where SPM ECO System Can Be Used": "SPM ECO System භාවිත කළ හැකි ස්ථාන",
  "One adaptable platform for every kind of parking facility in Sri Lanka.":
    "ශ්‍රී ලංකාවේ සෑම ආකාරයකම රථගාල පහසුකමක් සඳහා එක් අනුවර්තනය කළ හැකි වේදිකාවක්.",
  "Colombo Commercial Parking": "කොළඹ වාණිජ රථගාල",
  "Automates ticketing and gate flow in high-demand Fort and Pettah zones.":
    "ඉහළ ඉල්ලුම් කොටුව සහ පිටකොටුව කලාපවල ටිකට් සහ දොරටු ප්‍රවාහය ස්වයංක්‍රීය කරයි.",
  "Retail Chain Parking": "සිල්ලර ජාල රථගාල",
  "Protects customer parking with overstay detection across every branch.":
    "සෑම ශාඛාවක්ම පුරා අධික නැවතුම් හඳුනාගැනීමෙන් පාරිභෝගික රථගාල ආරක්ෂා කරයි.",
  "Shopping Mall Parking": "සාප්පු සංකීර්ණ රථගාල",
  "Guides shoppers to free slots and speeds up peak-hour entry and exit.":
    "සාප්පු යන්නන් නිදහස් ඉඩවලට යොමු කර උච්ච වේලා පිවිසුම සහ පිටවීම වේගවත් කරයි.",
  "Office Building Parking": "කාර්යාල ගොඩනැගිලි රථගාල",
  "Verifies staff and visitor vehicles automatically for secure access.":
    "සුරක්ෂිත ප්‍රවේශය සඳහා කාර්ය මණ්ඩල සහ අමුත්තන්ගේ වාහන ස්වයංක්‍රීයව තහවුරු කරයි.",
  "Hospital Parking": "රෝහල් රථගාල",
  "Prioritizes emergency and staff access while managing visitor flow.":
    "අමුත්තන්ගේ ප්‍රවාහය කළමනාකරණය කරමින් හදිසි සහ කාර්ය මණ්ඩල ප්‍රවේශයට ප්‍රමුඛත්වය දෙයි.",
  "University Parking": "විශ්වවිද්‍යාල රථගාල",
  "Classifies student, staff, and visitor vehicles across campus lots.":
    "කැම්පස් භූමිය පුරා ශිෂ්‍ය, කාර්ය මණ්ඩල සහ අමුත්තන්ගේ වාහන වර්ගීකරණය කරයි.",
  "Apartment Parking": "මහල් නිවාස රථගාල",
  "Grants residents automatic access and blocks unauthorized vehicles.":
    "පදිංචිකරුවන්ට ස්වයංක්‍රීය ප්‍රවේශය ලබා දී අනවසර වාහන අවහිර කරයි.",
  "Hotel Parking": "හෝටල් රථගාල",
  "Offers guests pre-booking, valet logging, and seamless QR checkout.":
    "අමුත්තන්ට කලින් වෙන් කිරීම, valet ලොග් කිරීම සහ පහසු QR පිටවීම ලබා දෙයි.",
  "Public Parking Area": "පොදු රථගාල ප්‍රදේශය",
  "Brings real-time availability and cashless payment to public lots.":
    "පොදු භූමිවලට තත්‍ය කාලීන ලබා ගැනීම සහ මුදල් රහිත ගෙවීම ගෙන එයි.",
  "Multi-branch Operator": "බහු-ශාඛා ක්‍රියාකරු",
  "Centralizes occupancy, revenue, and security across all locations.":
    "සියලුම ස්ථාන පුරා ආක්‍රමණය, ආදායම සහ ආරක්ෂාව මධ්‍යගත කරයි.",

  /* ---------------- Outcomes ---------------- */
  Outcomes: "ප්‍රතිඵල",
  "Expected Project Outcomes": "අපේක්ෂිත ව්‍යාපෘති ප්‍රතිඵල",
  "What SPM ECO System delivers as a complete software + hardware solution.":
    "සම්පූර්ණ මෘදුකාංග + දෘඪාංග විසඳුමක් ලෙස SPM ECO System ලබා දෙන දේ.",
  "A fully functional smart parking mobile application":
    "සම්පූර්ණයෙන් ක්‍රියාත්මක බුද්ධිමත් රථගාල ජංගම යෙදුමක්",
  "ANPR-based automated entry and exit gate system":
    "ANPR පදනම් වූ ස්වයංක්‍රීය පිවිසුම් සහ පිටවීමේ දොරටු පද්ධතිය",
  "Dynamic pricing and QR payment workflow": "ගතික මිල නියම කිරීම සහ QR ගෙවීම් වැඩ ප්‍රවාහය",
  "Retail parking overstay detection module": "සිල්ලර රථගාල අධික නැවතුම් හඳුනාගැනීමේ මොඩියුලය",
  "Web-based operator dashboard": "වෙබ් පදනම් වූ ක්‍රියාකරු පාලන පුවරුව",
  "Multi-location parking management": "බහු-ස්ථාන රථගාල කළමනාකරණය",
  "Revenue analytics and trend reports": "ආදායම් විශ්ලේෂණ සහ ප්‍රවණතා වාර්තා",
  "Improved driver parking experience": "වැඩිදියුණු කළ රියදුරු රථගාල අත්දැකීම",
  "Reduced manual errors and revenue leakage": "අඩු වූ අත්කම් දෝෂ සහ ආදායම් කාන්දුව",
  "Better parking security and control": "වඩා හොඳ රථගාල ආරක්ෂාව සහ පාලනය",
  "User searches parking location": "පරිශීලක රථගාල ස්ථානය සොයයි",
  "User books a parking slot": "පරිශීලක රථගාල ඉඩක් වෙන් කරයි",
  "QR confirmation is generated": "QR තහවුරුව ජනනය කරයි",
  "Vehicle number plate is recognized": "වාහන අංක තහඩුව හඳුනා ගනී",
  "Gate access is approved": "දොරටු ප්‍රවේශය අනුමත කරයි",
  "Parking duration is tracked": "රථගාල කාලසීමාව නිරීක්ෂණය කරයි",
  "Overtime fee is calculated": "අතිකාල ගාස්තුව ගණනය කරයි",
  "QR payment is completed": "QR ගෙවීම සම්පූර්ණ කරයි",
  "Operator dashboard updates live data": "ක්‍රියාකරු පාලන පුවරුව සජීවී දත්ත යාවත්කාලීන කරයි",
  "Security alert is shown for unauthorized vehicle": "අනවසර වාහනය සඳහා ආරක්ෂක ඇඟවීම පෙන්වයි",
  "Prototype Demonstration Plan": "මූලාකෘති නිරූපණ සැලැස්ම",
  "The prototype demonstrates the full journey from driver booking to gate automation and operator monitoring.":
    "මූලාකෘතිය රියදුරු වෙන් කිරීමේ සිට දොරටු ස්වයංක්‍රීයකරණය සහ ක්‍රියාකරු නිරීක්ෂණය දක්වා සම්පූර්ණ ගමන නිරූපණය කරයි.",

  /* ---------------- About ---------------- */
  About: "අප ගැන",
  "A University Technology Challenge Competition Project":
    "විශ්වවිද්‍යාල තාක්ෂණ අභියෝග තරඟ ව්‍යාපෘතියක්",
  "SPM ECO System is a software and hardware-based smart parking management solution developed for a University Technology Challenge Competition — engineered with real commercial potential.":
    "SPM ECO System යනු විශ්වවිද්‍යාල තාක්ෂණ අභියෝග තරඟයක් සඳහා සංවර්ධනය කරන ලද මෘදුකාංග සහ දෘඪාංග පදනම් වූ බුද්ධිමත් රථගාල කළමනාකරණ විසඳුමකි — සැබෑ වාණිජ විභවයකින් යුක්තව නිර්මාණය කර ඇත.",
  "The system focuses on solving real parking problems in urban Sri Lanka using modern digital technologies, automation, computer vision, and cloud-based management — combining a driver mobile app, ANPR gate automation, dynamic pricing, retail parking control, and a multi-location operator dashboard into a single ecosystem.":
    "පද්ධතිය නවීන ඩිජිටල් තාක්ෂණ, ස්වයංක්‍රීයකරණය, පරිගණක දර්ශනය සහ වලාකුළු පදනම් වූ කළමනාකරණය භාවිතයෙන් නාගරික ශ්‍රී ලංකාවේ සැබෑ රථගාල ගැටලු විසඳීම කෙරෙහි අවධානය යොමු කරයි — රියදුරු ජංගම යෙදුමක්, ANPR දොරටු ස්වයංක්‍රීයකරණය, ගතික මිල නියම කිරීම, සිල්ලර රථගාල පාලනය සහ බහු-ස්ථාන ක්‍රියාකරු පාලන පුවරුවක් එකම පරිසර පද්ධතියකට ඒකාබද්ධ කරමින්.",
  "University Project · Real Commercial Potential": "විශ්වවිද්‍යාල ව්‍යාපෘතිය · සැබෑ වාණිජ විභවය",
  "Project Team & Roles": "ව්‍යාපෘති කණ්ඩායම සහ භූමිකා",
  "Mobile App Development": "ජංගම යෙදුම් සංවර්ධනය",
  "Backend & System Integration": "පසුබිම සහ පද්ධති ඒකාබද්ධ කිරීම",
  "Web Dashboard Development": "වෙබ් පාලන පුවරු සංවර්ධනය",
  "ANPR & Hardware Integration": "ANPR සහ දෘඪාංග ඒකාබද්ධ කිරීම",
  "UI/UX & Documentation": "UI/UX සහ ලේඛනගත කිරීම",

  /* ---------------- Footer ---------------- */
  "A smart parking platform that combines real-time booking, ANPR gate automation, dynamic pricing, QR payment, retail parking control, and operator analytics for modern parking facilities in Sri Lanka.":
    "ශ්‍රී ලංකාවේ නවීන රථගාල පහසුකම් සඳහා තත්‍ය කාලීන වෙන් කිරීම, ANPR දොරටු ස්වයංක්‍රීයකරණය, ගතික මිල නියම කිරීම, QR ගෙවීම, සිල්ලර රථගාල පාලනය සහ ක්‍රියාකරු විශ්ලේෂණ ඒකාබද්ධ කරන බුද්ධිමත් රථගාල වේදිකාවකි.",
  Explore: "ගවේෂණය කරන්න",

  /* ---------------- Contact (CMS defaults + form) ---------------- */
  "Let's Modernize Your Parking Operations": "ඔබේ රථගාල මෙහෙයුම් නවීකරණය කරමු",
  "Speak with the SPM ECO System team to discuss smart parking automation, ANPR access, booking, payments, and multi-location parking management.":
    "බුද්ධිමත් රථගාල ස්වයංක්‍රීයකරණය, ANPR ප්‍රවේශය, වෙන් කිරීම, ගෙවීම් සහ බහු-ස්ථාන රථගාල කළමනාකරණය සාකච්ඡා කිරීමට SPM ECO System කණ්ඩායම සමඟ කතා කරන්න.",
  "I agree to be contacted by SPM ECO System regarding my inquiry and consent to my details being stored for this purpose.":
    "මගේ විමසීම සම්බන්ධයෙන් SPM ECO System විසින් සම්බන්ධ වීමට මම එකඟ වන අතර, මෙම කාර්යය සඳහා මගේ තොරතුරු ගබඩා කිරීමට කැමැත්ත දෙමි.",
  "Software + Hardware Ecosystem": "මෘදුකාංග + දෘඪාංග පරිසර පද්ධතිය",
  "We tailor the mobile app, ANPR gates, pricing rules, and dashboard to your facility.":
    "අපි ජංගම යෙදුම, ANPR දොරටු, මිල නීති සහ පාලන පුවරුව ඔබේ පහසුකමට ගැලපෙන ලෙස සකසමු.",
  "Full Name": "සම්පූර්ණ නම",
  Organization: "ආයතනය",
  "Business Email": "ව්‍යාපාරික විද්‍යුත් තැපෑල",
  "Phone / WhatsApp": "දුරකථනය / WhatsApp",
  "Facility Type": "පහසුකම් වර්ගය",
  "Estimated Parking Capacity": "ඇස්තමේන්තුගත රථගාල ධාරිතාව",
  "Number of Locations": "ස්ථාන ගණන",
  "Preferred Contact Person": "කැමති සම්බන්ධතා පුද්ගලයා",
  "Preferred Contact Method": "කැමති සම්බන්ධතා ක්‍රමය",
  "Project Requirement": "ව්‍යාපෘති අවශ්‍යතාව",
  Message: "පණිවිඩය",
  "Your full name": "ඔබේ සම්පූර්ණ නම",
  "Company / facility name": "සමාගම / පහසුකම් නම",
  "Select type": "වර්ගය තෝරන්න",
  "No Preference": "කැමැත්තක් නැත",
  "Tell us about your parking facility and what you'd like to improve.":
    "ඔබේ රථගාල පහසුකම සහ ඔබ වැඩිදියුණු කිරීමට කැමති දේ අපට කියන්න.",
  "Send Inquiry": "විමසීම යවන්න",
  "Sending...": "යවමින්...",
  "Your details are stored securely and never shared.":
    "ඔබේ තොරතුරු ආරක්ෂිතව ගබඩා කර ඇති අතර කිසිවිටෙක බෙදා නොගනී.",
  "Thank you": "ස්තූතියි",
  "Your inquiry has been submitted successfully. Our team will contact you shortly.":
    "ඔබේ විමසීම සාර්ථකව ඉදිරිපත් කර ඇත. අපගේ කණ්ඩායම ඉක්මනින් ඔබ හා සම්බන්ධ වනු ඇත.",
  "Submit another inquiry": "තවත් විමසීමක් යවන්න",
  Email: "විද්‍යුත් තැපෑල",
  Phone: "දුරකථනය",
  WhatsApp: "WhatsApp",
  "Phone Call": "දුරකථන ඇමතුම",
  "Shopping Mall": "සාප්පු සංකීර්ණය",
  "Office Building": "කාර්යාල ගොඩනැගිල්ල",
  Hospital: "රෝහල",
  Hotel: "හෝටලය",
  Apartment: "මහල් නිවාසය",
  University: "විශ්වවිද්‍යාලය",
  Factory: "කර්මාන්තශාලාව",
  "Retail Chain": "සිල්ලර ජාලය",
  "Public Parking": "පොදු රථගාල",
  Other: "වෙනත්",
  "Please enter your full name.": "කරුණාකර ඔබේ සම්පූර්ණ නම ඇතුළත් කරන්න.",
  "Please enter a valid business email.":
    "කරුණාකර වලංගු ව්‍යාපාරික විද්‍යුත් තැපෑලක් ඇතුළත් කරන්න.",
  "Please enter a phone or WhatsApp number.": "කරුණාකර දුරකථන හෝ WhatsApp අංකයක් ඇතුළත් කරන්න.",
  "Please select a facility type.": "කරුණාකර පහසුකම් වර්ගයක් තෝරන්න.",
  "Please tell us about your requirement.": "කරුණාකර ඔබේ අවශ්‍යතාව ගැන අපට කියන්න.",
  "Please accept the privacy consent to continue.":
    "ඉදිරියට යාමට කරුණාකර පෞද්ගලිකත්ව එකඟතාව පිළිගන්න.",
  "Capacity cannot be negative.": "ධාරිතාව ඍණ විය නොහැක.",
  "Must be at least 1.": "අවම වශයෙන් 1ක් විය යුතුය.",
  "Please correct the highlighted fields.": "කරුණාකර උද්දීපනය කළ ක්ෂේත්‍ර නිවැරදි කරන්න.",
  "Please wait a moment before submitting again.": "නැවත ඉදිරිපත් කිරීමට පෙර මොහොතක් රැඳී සිටින්න.",
  "Inquiry submitted": "විමසීම ඉදිරිපත් කළා",
  "Thank you. Our team will contact you shortly.":
    "ස්තූතියි. අපගේ කණ්ඩායම ඉක්මනින් ඔබ හා සම්බන්ධ වනු ඇත.",
  "Your inquiry was saved. Email notification is temporarily unavailable, but we've received it.":
    "ඔබේ විමසීම සුරකින ලදී. විද්‍යුත් තැපැල් දැනුම්දීම තාවකාලිකව නොමැත, නමුත් අපට එය ලැබී ඇත.",
  "Could not submit inquiry": "විමසීම ඉදිරිපත් කළ නොහැකි විය",

  /* ---------------- WhatsApp button ---------------- */
  "Chat on WhatsApp": "WhatsApp හි කතාබස් කරන්න",
  "Chat with us": "අප සමඟ කතා කරන්න",
  "We're online": "අපි සබැඳිව සිටිමු",
  "Leave a message": "පණිවිඩයක් තබන්න",
  "Choose a contact": "සම්බන්ධතාවක් තෝරන්න",

  /* ---------------- 404 / error ---------------- */
  "Page not found": "පිටුව හමු නොවීය",
  "The page you're looking for doesn't exist or has been moved.":
    "ඔබ සොයන පිටුව නොපවතී හෝ ගෙන ගොස් ඇත.",
  "Go home": "මුල් පිටුවට යන්න",
  "This page didn't load": "මෙම පිටුව පූරණය නොවීය",
  "Something went wrong on our end. You can try refreshing or head back home.":
    "අපගේ පැත්තෙන් යමක් වැරදී ඇත. ඔබට නැවුම් කිරීමට හෝ මුල් පිටුවට ආපසු යාමට උත්සාහ කළ හැක.",
  "Try again": "නැවත උත්සාහ කරන්න",

  /* ---------------- Hero visual (ANPR + occupancy cards) ---------------- */
  "Live System Preview": "සජීවී පද්ධති පෙරදසුන",
  "Scanning Vehicle": "වාහනය පරිලෝකනය කරමින්",
  "ANPR Detected": "ANPR හඳුනාගත්තා",
  Category: "වර්ගය",
  "Pre-Booked": "කලින් වෙන් කළ",
  Booking: "වෙන් කිරීම",
  Verified: "තහවුරු කළා",
  Access: "ප්‍රවේශය",
  Approved: "අනුමත කළා",
  "Barrier Opening": "බාධකය විවෘත වෙමින්",
  "Awaiting Verification": "තහවුරු කිරීම බලාපොරොත්තුවෙන්",
  "Live Occupancy": "සජීවී ආක්‍රමණය",
  Available: "ලබා ගත හැකි",
  "Colombo Fort · Zone A": "කොළඹ කොටුව · කලාපය A",
  Capacity: "ධාරිතාව",
  Occupied: "භාවිතයේ",
  Reserved: "වෙන් කළ",
  "Demonstration data — not verified live facility information.":
    "නිරූපණ දත්ත — තහවුරු කළ සජීවී පහසුකම් තොරතුරු නොවේ.",

  /* ---------------- Booking phone mock ---------------- */
  "Colombo Fort, Sri Lanka": "කොළඹ කොටුව, ශ්‍රී ලංකාව",

  /* ---------------- Pricing / Dashboard extras ---------------- */
  "/ hour": "/ පැය",
  Overstay: "අධික නැවතුම",

  /* ---------------- Contact / WhatsApp extras ---------------- */
  Call: "අමතන්න",
  "Chat with": "සමඟ කතා කරන්න",
  "Inquiry Reference": "විමසුම් යොමුව",

  /* ---------------- Footer copyright ---------------- */
  "A University Technology Challenge Competition Project. All rights reserved.":
    "විශ්වවිද්‍යාල තාක්ෂණ අභියෝග තරඟ ව්‍යාපෘතියකි. සියලු හිමිකම් ඇවිරිණි.",
};

/**
 * Translate a rendered English phrase for the active language.
 *
 * - English active → original text unchanged.
 * - Sinhala active → mapped translation, or the original text as a safe
 *   fallback when no translation exists.
 * - Non-string / empty input → returned as-is (never "undefined").
 */
export function translatePhrase(text: string, lang: LanguageCode): string {
  if (typeof text !== "string" || text.trim() === "") return text;
  if (lang !== "si") return text;
  const hit = PARKING_PHRASES[text.trim()] ?? PHRASES[text.trim()];
  return hit && hit.trim() !== "" ? hit : text;
}
