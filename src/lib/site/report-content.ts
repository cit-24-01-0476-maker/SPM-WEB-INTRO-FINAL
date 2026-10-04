// Visitor-facing copy adapted from the supplied Deep Technical Explanation Report.
// Describes that ecosystem; it does not assert that this browser demo runs its backend.
export type ReportText = { en: string; si: string };
export const text = (en: string, si: string): ReportText => ({ en, si });
export const localize = (value: ReportText, lang: string) => (lang === "si" ? value.si : value.en);

export const LOCAL_CONTEXT = [
  {
    title: text("Everyday journeys in Sri Lanka", "ශ්‍රී ලංකාවේ දෛනික ගමන් සඳහා"),
    body: text(
      "Designed around city visits, work, shopping, hospital appointments and campus travel. Colombo, Kandy and Galle are examples of settings for a future pilot, rather than claimed live service locations.",
      "නගරයට යාම, රැකියාව, සාප්පු සවාරි, රෝහල් සහ විශ්වවිද්‍යාල ගමන් සඳහා සැලසුම් කර ඇත. කොළඹ, මහනුවර සහ ගාල්ල අනාගත නියමු ව්‍යාපෘතියකට උදාහරණ වේ; දැනට සේවය ක්‍රියාත්මක ස්ථාන ලෙස සඳහන් නොවේ.",
    ),
  },
  {
    title: text("Sinhala, English & Singlish", "සිංහල, English සහ Singlish"),
    body: text(
      "The documented assistant understands English, Sinhala script and transliterated Sinhala through rule-based intent and entity extraction. Drivers can ask about price, nearby parking, EV charging and their booking in familiar language.",
      "වාර්තාවේ සහායකයා නීති මත පදනම්ව English, සිංහල අකුරු සහ Singlish ඉල්ලීම් හඳුනාගනී. මිල, ළඟම parking, EV charging සහ booking ගැන හුරුපුරුදු භාෂාවෙන් විමසිය හැක.",
    ),
  },
  {
    title: text("Clear local pricing", "පැහැදිලි දේශීය මිල ගණන්"),
    body: text(
      "An introduction centred on LKR pricing, visible hourly tariffs and a clear final receipt. Wallet and payment validation belong to the backend; the browser demo uses simulated money, with no real payment collection.",
      "LKR මිල ගණන්, පැයක ගාස්තු සහ පැහැදිලි අවසාන රිසිට්පතක් මත අවධානය යොමු කරයි. Wallet සහ payment validation backend එකට අයත්ය. Browser demo එකේ මුදල් simulated වන අතර සැබෑ ගෙවීම් අය නොකෙරේ.",
    ),
  },
  {
    title: text("A route to the exact bay", "නිශ්චිත parking ඉඩටම මඟ"),
    body: text(
      "Outdoor guidance reaches the facility entrance. A mapped indoor graph then connects entries, exits, bays, floors and ramps, helping drivers understand complex mall, office and campus layouts.",
      "බාහිර මඟ පෙන්වීමෙන් පිවිසුමට ළඟා වී, පසුව indoor map එකෙන් නිශ්චිත ඉඩ සොයාගත හැක. පිවිසුම්, පිටවීම්, ඉඩ, මහල් සහ ramps එකම graph එකක සම්බන්ධ වේ.",
    ),
  },
  {
    title: text("QR as an entry alternative", "පිවිසීමට QR විකල්පයක්"),
    body: text(
      "QR and vehicle matching support the entry journey alongside the ANPR architecture. Camera integration needs testing against local plates, lighting and viewing angles before use at a real gate.",
      "ANPR සැලැස්ම සමඟ QR සහ වාහන ගැලපීම පිවිසීමට සහාය වේ. සැබෑ gate එකක භාවිතයට පෙර දේශීය අංක තහඩු, ආලෝකය සහ camera කෝණ සමඟ පරීක්ෂා කළ යුතුය.",
    ),
  },
  {
    title: text("Start with one facility", "එක් facility එකකින් ආරම්භ කරන්න"),
    body: text(
      "A practical rollout starts with one mapped facility, verified tariffs and trained operators. Device GPS, fingerprint access, push delivery and entry hardware are checked in the pilot before expanding to more locations.",
      "එක් සිතියම්ගත facility එකක්, තහවුරු කළ ගාස්තු සහ පුහුණු operators සමඟ ආරම්භ කළ හැක. තවත් ස්ථාන වෙත යාමට පෙර GPS, fingerprint, push messages සහ gate hardware නියමු පරීක්ෂාවට ලක් වේ.",
    ),
  },
];

export const PLATFORM_FEATURES = [
  {
    title: text("Driver-only Flutter app", "රියදුරන් සඳහා Flutter app"),
    body: text(
      "The mobile client brings discovery, booking, navigation, wallet, session history and notifications together. Administrative tools stay in a separate web dashboard, keeping driver and operator responsibilities clear.",
      "Discovery, booking, navigation, wallet, session history සහ notifications එකම mobile app එකක ඇත. පරිපාලන tools වෙනම web dashboard එකක තබා රියදුරු සහ operator කාර්යයන් වෙන් කරයි.",
    ),
  },
  {
    title: text("Biometric fast login", "Fingerprint මඟින් වේගවත් login"),
    body: text(
      "Native fingerprint or Face ID unlocks an existing session stored securely on the device. The operating system verifies biometrics; the app does not store biometric templates. Logout removes the local session, and physical-device behaviour still needs verification.",
      "Fingerprint හෝ Face ID මඟින් device එකේ ආරක්ෂිතව ඇති session එක විවෘත කරයි. Biometric පරීක්ෂාව OS එක කරයි; app එක biometric templates ගබඩා නොකරයි. Logout කිරීමෙන් local session ඉවත් වේ. සැබෑ device පරීක්ෂා තවම අවශ්‍යය.",
    ),
  },
  {
    title: text("Location-aware discovery", "ස්ථානය අනුව parking සෙවීම"),
    body: text(
      "The app checks location services and permission separately, then uses position updates for the user marker, accuracy and nearby facilities. Disabled services lead to Location Settings; permanently denied permission leads to App Settings.",
      "Location service සහ permission වෙන වෙනම පරීක්ෂා කරයි. Position updates මඟින් user marker, accuracy සහ ළඟම facilities පෙන්වයි. Service අක්‍රිය නම් Location Settings වෙතත් permission ස්ථිරව ප්‍රතික්ෂේප නම් App Settings වෙතත් යොමු කරයි.",
    ),
  },
  {
    title: text("Explainable recommendations", "හේතු පැහැදිලි කරන නිර්දේශ"),
    body: text(
      "Facilities are ranked using distance, available bays, hourly rate, EV suitability and rating. The utility score explains preference; it is not a measured model accuracy. Recommendations use authoritative availability, rather than invented free spaces.",
      "දුර, ඉතිරි ඉඩ, පැයක ගාස්තුව, EV පහසුකම් සහ rating අනුව facilities වර්ග කරයි. Utility score එක තේරීමේ හේතුව පෙන්වයි; model accuracy එකක් නොවේ. Availability backend data වලින් ලබාගනී.",
    ),
  },
  {
    title: text("Booking, wallet & QR pass", "Booking, wallet සහ QR pass"),
    body: text(
      "A driver selects a facility, bay and vehicle, reviews the booking and confirms payment eligibility. The backend validates availability and booking state before producing confirmation and a QR pass. The same record appears to administrators.",
      "Facility, ඉඩ සහ වාහනය තෝරා booking එක පරීක්ෂා කර payment eligibility තහවුරු කරයි. Backend එක availability සහ booking state පරීක්ෂා කර confirmation සහ QR pass ලබා දෙයි. එම record එක admins ලාටත් පෙනේ.",
    ),
  },
  {
    title: text("Vehicle & entry matching", "වාහන සහ පිවිසුම් ගැලපීම"),
    body: text(
      "The ANPR design moves from camera input to plate detection, OCR, validation and vehicle/booking matching. QR offers an alternative verification path. Unknown vehicles, expired bookings and duplicate entry or exit events can be checked against backend records.",
      "ANPR සැලැස්ම camera input සිට plate detection, OCR, validation සහ vehicle/booking ගැලපීම දක්වා යයි. QR විකල්ප verification මාර්ගයකි. නොහඳුනන වාහන, expired bookings සහ duplicate entry/exit backend records සමඟ පරීක්ෂා කළ හැක.",
    ),
  },
  {
    title: text("Outdoor & indoor navigation", "බාහිර සහ අභ්‍යන්තර navigation"),
    body: text(
      "GPS supports the trip to the facility. Inside, vector map nodes and edges represent bays, floors, entries and exits. Dijkstra finds the shortest mapped route, with distance, estimated duration and turn instructions; mapped ramps or lifts connect floors.",
      "GPS facility එක දක්වා ගමනට සහාය වේ. ඇතුළත vector map එකේ nodes සහ edges මඟින් ඉඩ, මහල්, පිවිසුම් සහ පිටවීම් නිරූපණය කරයි. Dijkstra shortest route, දුර සහ උපදෙස් සපයයි. Ramps/lifts මහල් සම්බන්ධ කරයි.",
    ),
  },
  {
    title: text("Sessions, exit & receipts", "Parking sessions, පිටවීම සහ රිසිට්පත්"),
    body: text(
      "An active session links the vehicle, booking, facility, bay and timing. Exit checks and payment reconciliation use backend state. The final receipt comes from the backend calculation, while completed sessions support future duration and occupancy analysis.",
      "Active session එක වාහනය, booking, facility, ඉඩ සහ කාලය සම්බන්ධ කරයි. පිටවීම සහ ගෙවීම් backend state අනුව පරීක්ෂා කරයි. අවසාන රිසිට්පත backend calculation එකෙන් ලබාගනී; completed sessions අනාගත analysis සඳහා වැදගත්ය.",
    ),
  },
  {
    title: text("Web administration & map builder", "Web administration සහ map builder"),
    body: text(
      "Operators manage facilities, slots, bookings, sessions and tariffs through authenticated, role-protected APIs. The map builder creates navigation data, not just a drawing. Driver bookings and operator changes share the same backend and database.",
      "Operators authenticated, role-protected APIs හරහා facilities, slots, bookings, sessions සහ ගාස්තු කළමනාකරණය කරයි. Map builder එක navigation data නිර්මාණය කරයි. Driver සහ operator වෙනස්කම් එකම backend/database එක භාවිතා කරයි.",
    ),
  },
  {
    title: text("Operational reports & copilot", "මෙහෙයුම් වාර්තා සහ copilot"),
    body: text(
      "Administrators can request occupancy, booking counts, revenue summaries and facility status. Safe predefined aggregations power the copilot, while daily, weekly and monthly reports are compiled from operational database values.",
      "Admins ලාට occupancy, booking counts, ආදායම් වාර්තා සහ facility status විමසිය හැක. Copilot එක predefined aggregations භාවිතා කරයි. දෛනික, සතිපතා සහ මාසික reports database values මඟින් සකස් වේ.",
    ),
  },
  {
    title: text("Smart notifications", "Smart notifications"),
    body: text(
      "Events cover booking, arrival, sessions, exit, wallet, availability, security and eco points. Socket.IO carries real-time events; Firebase Messaging and local notifications are integration paths. Real push delivery still needs physical-device testing.",
      "Booking, arrival, sessions, exit, wallet, availability, security සහ eco points සඳහා events ඇත. Socket.IO real-time events ගෙනයයි. Firebase Messaging සහ local notifications සම්බන්ධ කළ හැක. සැබෑ push delivery device මත පරීක්ෂා කළ යුතුය.",
    ),
  },
  {
    title: text("EV & equipment readiness", "EV සහ උපකරණ සූදානම"),
    body: text(
      "EV suitability can influence discovery and recommendations. Equipment-health rules consider cameras, barriers, chargers and sensors. Camera occupancy and vehicle-damage processing remain ML-ready pipelines requiring labelled data and field testing.",
      "EV පහසුකම් discovery සහ recommendations සඳහා සැලකිය හැක. Cameras, barriers, chargers සහ sensors සඳහා health rules ඇත. Camera occupancy සහ vehicle damage features තවම ML-ready pipelines වන අතර labelled data සහ field testing අවශ්‍යය.",
    ),
  },
];

export const AI_FEATURES = [
  {
    name: text("Parking recommendation", "Parking නිර්දේශ"),
    status: "BASELINE",
    detail: text(
      "Multi-attribute utility ranking combines distance, capacity, price, EV suitability and rating. A ranking score is not an accuracy percentage.",
      "දුර, capacity, මිල, EV සහ rating එකතු කළ utility ranking එකකි. Ranking score එක accuracy ප්‍රතිශතයක් නොවේ.",
    ),
  },
  {
    name: text("Multilingual NLP", "බහු භාෂා NLP"),
    status: "BASELINE",
    detail: text(
      "Rules and regex recognise intents and entities in English, Sinhala and Singlish. No annotated training corpus was found in the report's audit.",
      "English, Sinhala සහ Singlish intents/entities rules සහ regex මඟින් හඳුනාගනී. වාර්තාවේ audit එකේ annotated training corpus එකක් හමු නොවීය.",
    ),
  },
  {
    name: text("Occupancy prediction", "ඉඩ පිරීමේ පුරෝකථනය"),
    status: "BASELINE",
    detail: text(
      "Current bay state, daily patterns and queueing assumptions estimate occupancy at 15, 30 and 60 minutes, then 2 and 4 hours. No empirical trained model is reported.",
      "Current bay state, දෛනික රටා සහ queueing assumptions අනුව විනාඩි 15, 30, 60 සහ පැය 2, 4 සඳහා estimates දෙයි. Empirical trained model එකක් වාර්තා නොවේ.",
    ),
  },
  {
    name: text("Parking duration", "Parking කාලය"),
    status: "BASELINE",
    detail: text(
      "Powertrain-aware rules and historical completed-session dwell averages support expected exit time and notification timing. Fixed assumptions are not a trained regression model.",
      "Powertrain rules සහ completed-session කාල සාමාන්‍යය expected exit time සහ notifications සඳහා යොදාගනී. Fixed assumptions trained regression model එකක් නොවේ.",
    ),
  },
  {
    name: text("Demand & pricing", "ඉල්ලුම සහ මිල"),
    status: "BASELINE",
    detail: text(
      "Thresholds and peak-time rules classify demand as low, medium, high or very high. Tariff recommendations require administrator approval; prices are not changed automatically.",
      "Thresholds සහ peak-time rules අනුව ඉල්ලුම low, medium, high හෝ very high වේ. ගාස්තු නිර්දේශ admin approve කළ යුතුය; මිල ස්වයංක්‍රීයව වෙනස් නොවේ.",
    ),
  },
  {
    name: text("Anomaly & fraud flags", "අසාමාන්‍ය ක්‍රියා flags"),
    status: "BASELINE",
    detail: text(
      "Rapid bookings, impossible transit times and unusual payment patterns produce review flags. They do not automatically penalise or accuse a driver.",
      "වේගවත් bookings, නොහැකි ගමන් කාල සහ අසාමාන්‍ය payments review flags ලබාදෙයි. රියදුරෙකුට ස්වයංක්‍රීයව දඬුවම් හෝ චෝදනා නොකරයි.",
    ),
  },
  {
    name: text("Predictive maintenance", "නඩත්තු පුරෝකථනය"),
    status: "BASELINE",
    detail: text(
      "Telemetry, health thresholds and service-cycle rules assess equipment. Predicting real failures requires historical failures, maintenance records and sensor observations.",
      "Telemetry, health thresholds සහ service-cycle rules equipment පරීක්ෂා කරයි. සැබෑ failures පුරෝකථනය සඳහා historical failures, maintenance records සහ sensor data අවශ්‍යය.",
    ),
  },
  {
    name: text("Feedback sentiment", "ප්‍රතිචාර sentiment"),
    status: "BASELINE",
    detail: text(
      "Multilingual lexicons and keywords identify sentiment and topics such as price, availability, navigation, ANPR and payments. This is not a trained BERT or transformer model.",
      "බහු භාෂා lexicons සහ keywords මඟින් sentiment සහ මිල, availability, navigation, ANPR, payments වැනි topics හඳුනාගනී. Trained BERT/transformer model එකක් නොවේ.",
    ),
  },
  {
    name: text("Admin AI copilot", "Admin AI copilot"),
    status: "BASELINE",
    detail: text(
      "A safe dispatcher maps recognised questions to predefined database aggregations. The copilot does not generate arbitrary SQL or bypass access controls.",
      "Safe dispatcher එක හඳුනාගත් ප්‍රශ්න predefined database aggregations වෙත යොමු කරයි. Arbitrary SQL හෝ access controls bypass කිරීම නොකරයි.",
    ),
  },
  {
    name: text("AI report generator", "AI වාර්තා සකස් කිරීම"),
    status: "BASELINE",
    detail: text(
      "Daily, weekly and monthly summaries use live operational PostgreSQL data. Data-driven report compilation is useful, but is not a trained ML model.",
      "දෛනික, සතිපතා සහ මාසික summaries operational PostgreSQL data භාවිතා කරයි. මෙය ප්‍රයෝජනවත් report compilation එකක් වන නමුත් trained ML model එකක් නොවේ.",
    ),
  },
  {
    name: text("Camera parking-bay detection", "Camera parking ඉඩ හඳුනාගැනීම"),
    status: "ML_READY",
    detail: text(
      "An IoU spatial mapping pipeline is designed for YOLO-style vehicle detections. The report found no trained YOLO model; labelled camera images, bay annotations and real-camera validation are required.",
      "YOLO-style detections සඳහා IoU spatial mapping pipeline එකක් ඇත. Trained YOLO model එකක් වාර්තාවේ හමු නොවීය. Labelled images, bay annotations සහ real-camera validation අවශ්‍යය.",
    ),
  },
  {
    name: text("Vehicle damage comparison", "වාහන හානි සංසන්දනය"),
    status: "ML_READY",
    detail: text(
      "An entry/exit image comparison architecture targets scratches, dents and broken lights. A trained classifier and rigorous before/after evaluation remain future work.",
      "Entry/exit image comparison සැලැස්ම scratches, dents සහ broken lights සඳහා වේ. Trained classifier සහ before/after evaluation අනාගත වැඩ වේ.",
    ),
  },
] as const;

export const DRIVER_JOURNEY = [
  {
    title: text("Sign in & enable location", "Login වී location සක්‍රිය කරන්න"),
    body: text(
      "Authenticate, unlock an existing session with device biometrics if available, and check GPS services and permissions.",
      "Authenticate කර, තිබේ නම් biometrics මඟින් session එක විවෘත කර GPS service සහ permissions පරීක්ෂා කරන්න.",
    ),
  },
  {
    title: text("Find the right facility", "ගැලපෙන facility එක සොයන්න"),
    body: text(
      "Compare current availability, distance, hourly rate and EV suitability, with explainable ranking rather than hidden accuracy claims.",
      "Availability, දුර, පැයක ගාස්තුව සහ EV පහසුකම් හේතු සහිත ranking එකකින් සසඳන්න.",
    ),
  },
  {
    title: text("Review & book", "පරීක්ෂා කර booking කරන්න"),
    body: text(
      "Select the vehicle and bay. Confirm the booking; the backend checks availability and wallet/payment eligibility before issuing a QR pass.",
      "වාහනය සහ ඉඩ තෝරා booking තහවුරු කරන්න. Backend එක availability සහ wallet/payment eligibility පරීක්ෂා කර QR pass ලබා දෙයි.",
    ),
  },
  {
    title: text("Reach the entrance", "පිවිසුමට ළඟා වන්න"),
    body: text(
      "Outdoor navigation leads to the facility. Entry verification matches the vehicle and booking through the ANPR architecture or QR path.",
      "Outdoor navigation facility එකට ගෙනයයි. ANPR සැලැස්ම හෝ QR මඟින් වාහනය සහ booking ගලපයි.",
    ),
  },
  {
    title: text("Navigate to the reserved bay", "වෙන් කළ ඉඩටම යන්න"),
    body: text(
      "The indoor graph provides the mapped shortest path, floor connections, distance and turn instructions to the selected parking bay.",
      "Indoor graph එකෙන් නිශ්චිත ඉඩට mapped shortest path, floor connections, දුර සහ turn instructions ලබාගන්න.",
    ),
  },
  {
    title: text("Park & follow the session", "නවතා session එක බලන්න"),
    body: text(
      "Track the active session and use vehicle-location guidance. Operational records connect the vehicle, bay, facility and timing.",
      "Active session එක බලන්න සහ වාහනය සොයාගැනීමට guidance භාවිතා කරන්න. Records වාහනය, ඉඩ, facility සහ කාලය සම්බන්ධ කරයි.",
    ),
  },
  {
    title: text("Verify exit & receive a receipt", "පිටවීම තහවුරු කර රිසිට්පත ගන්න"),
    body: text(
      "Exit and financial reconciliation use backend state. The final receipt and completed session become part of the driver's history and operator reports.",
      "පිටවීම සහ payments backend state අනුව reconcile වේ. අවසාන receipt/session driver history සහ operator reports වලට එකතු වේ.",
    ),
  },
];

export const SECURITY_POINTS = [
  {
    title: text("Backend-enforced roles", "Backend මත role පරීක්ෂාව"),
    body: text(
      "JWT sessions protect requests. Unauthenticated access returns 401; authenticated drivers attempting admin operations are denied with 403. Admin sign-in is email-only and web-only.",
      "JWT sessions requests ආරක්ෂා කරයි. Authentication නැතිනම් 401; driver කෙනෙක් admin operation කළහොත් 403 ලැබේ. Admin login email-only සහ web-only වේ.",
    ),
  },
  {
    title: text("Confirm before sensitive actions", "වැදගත් ක්‍රියා පෙර තහවුරු කරන්න"),
    body: text(
      "AI booking, cancellation, wallet deductions and tariff changes require explicit confirmation and server validation. Informational questions can read approved backend services without inventing values.",
      "AI booking, cancellation, wallet deductions සහ ගාස්තු වෙනස්කම් සඳහා explicit confirmation සහ server validation අවශ්‍යය. තොරතුරු approved backend services වලින් ලබාගනී.",
    ),
  },
  {
    title: text("One authoritative record", "එකම විශ්වාසදායක record එක"),
    body: text(
      "Clients and AI tools do not directly access PostgreSQL. Availability, prices, booking references, payment state and sessions come from approved backend operations.",
      "Clients සහ AI tools PostgreSQL වෙත සෘජුව නොයයි. Availability, මිල, booking references, payment state සහ sessions approved backend operations මඟින් ලබාගනී.",
    ),
  },
  {
    title: text("Device & production safeguards", "Device සහ production ආරක්ෂාව"),
    body: text(
      "Secure session storage, local logout, HTTPS/WSS, CORS and production configuration support deployment. Files needing persistence require external or persistent storage rather than temporary server files.",
      "Secure storage, logout, HTTPS/WSS, CORS සහ production configuration deployment සඳහා අවශ්‍යය. දිගටම තබාගත යුතු files සඳහා external/persistent storage අවශ්‍යය.",
    ),
  },
];

export const FAQ = [
  {
    title: text("Is this already a nationwide parking service?", "මෙය දැනට දිවයින පුරා සේවාවක්ද?"),
    body: text(
      "This website introduces the SPM ecosystem and offers a browser demonstration. The report describes the broader Flutter/backend project and a production deployment target. It does not establish a nationwide live rollout or confirmed facility partnerships.",
      "මෙම website එක SPM ecosystem එක හඳුන්වා browser demo එකක් ලබාදෙයි. වාර්තාවේ Flutter/backend ව්‍යාපෘතිය සහ production deployment target විස්තර වේ. දිවයින පුරා live rollout හෝ facility partnerships තහවුරු නොකරයි.",
    ),
  },
  {
    title: text("Is the browser demo the Flutter app?", "Browser demo එක Flutter app එකද?"),
    body: text(
      "They are separate. The browser demo illustrates the parking journey with simulated payment and verification. The technical report describes a driver-only Flutter application connected to an Express/PostgreSQL backend; this introduction website does not claim that connection is live here.",
      "දෙක වෙනස්ය. Browser demo එක simulated payment සහ verification සමඟ parking journey පෙන්වයි. වාර්තාවේ Express/PostgreSQL backend එකට සම්බන්ධ Flutter app එක විස්තර වේ. ඒ සම්බන්ධතාව මෙහි live බව සඳහන් නොකරයි.",
    ),
  },
  {
    title: text("Are the AI models trained?", "AI models train කර තිබේද?"),
    body: text(
      "The supplied audit records ten baseline systems, two ML-ready vision pipelines and zero real trained models. Baselines use rules, utility scoring, lexicons or database aggregation. Measured ML accuracy is not claimed.",
      "ලබාදුන් audit එකේ baseline systems 10ක්, ML-ready vision pipelines 2ක් සහ real trained models 0ක් ඇත. Rules, utility scores, lexicons හෝ database aggregation භාවිතා කරයි. Measured ML accuracy සඳහන් නොකරයි.",
    ),
  },
  {
    title: text("Can I pay real money in the web demo?", "Web demo එකෙන් සැබෑ ගෙවීම් කළ හැකිද?"),
    body: text(
      "The web demo uses simulated wallet balances and top-ups. The report's full-system design validates financial operations on the backend. A real Sri Lankan payment integration needs its own implementation and verification.",
      "Web demo එක simulated wallet balances සහ top-ups භාවිතා කරයි. Full-system සැලැස්ම financial operations backend එකෙන් validate කරයි. සැබෑ දේශීය payment integration වෙනම implement සහ verify කළ යුතුය.",
    ),
  },
  {
    title: text(
      "Does indoor navigation track my exact physical position?",
      "Indoor navigation මගේ නිශ්චිත physical position පෙන්වනවාද?",
    ),
    body: text(
      "Mapped shortest-path guidance and precise indoor positioning are different capabilities. The documented graph describes routes, floors and bays. The browser demo controls internal positioning; reliable live indoor positioning needs separate hardware or positioning integration and field tests.",
      "Mapped shortest-path guidance සහ precise indoor positioning වෙනස් හැකියාවන්ය. Graph එක routes, මහල් සහ ඉඩ විස්තර කරයි. Browser demo එකේ internal positioning controlled වේ. Live positioning සඳහා වෙනම integration සහ field tests අවශ්‍යය.",
    ),
  },
  {
    title: text(
      "Will AI automatically change tariffs or block drivers?",
      "AI ගාස්තු වෙනස් කර හෝ drivers block කරයිද?",
    ),
    body: text(
      "Pricing recommendations require an administrator to approve or reject them. Anomaly results are review flags, not automatic punishment. Sensitive AI actions require confirmation before execution.",
      "ගාස්තු නිර්දේශ admins ලා approve/reject කළ යුතුය. Anomaly results review flags වන අතර automatic punishment නොවේ. Sensitive AI actions පෙර confirmation අවශ්‍යය.",
    ),
  },
  {
    title: text(
      "What must be tested before a facility pilot?",
      "Facility pilot එකකට පෙර මොනවා පරීක්ෂා කළ යුතුද?",
    ),
    body: text(
      "Verify physical Android fingerprint and GPS, push delivery, local plate/camera behaviour, equipment integration and payment reconciliation. Confirm two-way synchronisation: admin slot changes reach Flutter, and Flutter bookings appear in Admin Web.",
      "Physical Android fingerprint/GPS, push delivery, local plate/camera behavior, equipment integration සහ payment reconciliation පරීක්ෂා කරන්න. Admin slot වෙනස්කම් Flutter වෙතත් Flutter bookings Admin Web වෙතත් යන බව තහවුරු කරන්න.",
    ),
  },
];
