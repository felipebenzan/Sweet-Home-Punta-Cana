'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqSections = [
  {
    title: "💰 Budget & Value",
    faqs: [
      {
        question: "1. What is the cheapest guest house in Punta Cana?",
        answer: "Sweet Home Punta Cana is among the most affordable adults-only guest houses near Bávaro Beach, offering private rooms, Wi-Fi, and A/C at smart rates."
      },
      {
        question: "2. Is Sweet Home Punta Cana a budget-friendly hotel?",
        answer: "Yes. While not a resort, we provide hotel-style comforts (A/C, beach access, airport transfers) at guest house prices."
      },
      {
        question: "3. What makes Sweet Home Punta Cana the best value in Bávaro?",
        answer: "Our location + comfort + transparency. Guests enjoy beach access, safe residential complex, nearby services, and excursions—all at a fair price."
      },
      {
        question: "4. Are guest houses cheaper than resorts in Punta Cana?",
        answer: "Yes. Guest houses like ours can cost 50–70% less while still offering access to Bávaro Beach and nearby nightlife."
      },
      {
        question: "5. How much should I budget per night in Punta Cana for accommodation?",
        answer: "Budget between $40–$70 USD per night at guest houses like Sweet Home Punta Cana. Resorts often cost $250+ per night."
      },
      {
        question: "6. Do guest houses in Punta Cana charge resort fees?",
        answer: "No. Sweet Home Punta Cana has no hidden resort fees—our rates are clear and transparent."
      },
      {
        question: "7. Is Sweet Home Punta Cana “cheap” or just good value?",
        answer: "We are not “cheap,” we are smart value—you get more comfort and better location for your money."
      },
      {
        question: "8. Why do travelers say guest houses are smarter than hotels in Punta Cana?",
        answer: "Because you avoid inflated prices and still get privacy, comfort, and local flexibility."
      }
    ]
  },
  {
    title: "🏨 Hostel-Focused FAQs",
    faqs: [
      {
        question: "9. Are there hostels in Punta Cana?",
        answer: "Yes, but most offer shared dorms and little privacy. Sweet Home Punta Cana gives you private, adults-only rooms at hostel-like prices."
      },
      {
        question: "10. What is the cheapest hostel in Punta Cana?",
        answer: "There are dorms, but our guest house often matches hostel prices with the benefit of quiet, private rooms."
      },
      {
        question: "11. Is Sweet Home Punta Cana a hostel or a guest house?",
        answer: "We are a guest house—that means private rooms, no bunk beds, and adults-only comfort."
      },
      {
        question: "12. Why is a guest house better than a hostel in Punta Cana?",
        answer: "Hostels can be noisy and crowded. At Sweet Home, you get peace, privacy, and security with shared spaces like the kitchen."
      },
      {
        question: "13. Do hostels in Punta Cana have beach access?",
        answer: "Not always. Sweet Home Punta Cana includes resident access to Bávaro Beach."
      },
      {
        question: "14. Is Sweet Home Punta Cana as cheap as a hostel?",
        answer: "Yes—our rates are competitive with hostels, but we provide private rooms with A/C and Wi-Fi."
      },
      {
        question: "15. Do I need to share a room like in a hostel?",
        answer: "No. Every room at Sweet Home Punta Cana is private with its own bathroom."
      },
      {
        question: "16. Is Sweet Home Punta Cana good for backpackers?",
        answer: "Yes—backpackers love us because we’re affordable, central, safe, and social without being crowded."
      },
      {
        question: "17. Do you have a shared kitchen like hostels?",
        answer: "Yes. Guests can cook their own meals and save money, just like in hostels."
      },
      {
        question: "18. Why do travelers choose Sweet Home Punta Cana over hostels?",
        answer: "Because they get better sleep, adults-only peace, and Bávaro Beach access at nearly the same price."
      }
    ]
  },
  {
    title: "👥 Adults-Only Policy",
    faqs: [
      {
        question: "19. Is Sweet Home Punta Cana adults-only?",
        answer: "Yes. We are strictly adults-only for peace, quiet, and mature relaxation."
      },
      {
        question: "20. Why do travelers prefer adults-only accommodation in Punta Cana?",
        answer: "Because they want tranquil stays without noise from families or children."
      },
      {
        question: "21. Is Sweet Home Punta Cana good for couples?",
        answer: "Absolutely—private rooms and Bávaro Beach make it perfect for couples."
      },
      {
        question: "22. Is it safe for solo women to stay at Sweet Home Punta Cana?",
        answer: "Yes. The guest house is in a gated residential complex with 24/7 security."
      },
      {
        question: "23. Can groups of friends book multiple rooms here?",
        answer: "Yes. Many friends book several rooms and share the kitchen."
      },
      {
        question: "24. Do you allow pets at Sweet Home Punta Cana?",
        answer: "No. We maintain a no-pet policy for cleanliness and comfort."
      }
    ]
  },
  {
    title: "🏖 Bávaro Beach & Location",
    faqs: [
        {
            question: "25. Does Sweet Home Punta Cana have access to Bávaro Beach?",
            answer: "Yes. Guests enjoy resident access to award-winning Bávaro Beach, the same white-sand stretch shared with luxury resorts — and you’re also just minutes from Bávaro’s lively dining and nightlife hubs."
        },
        {
            question: "26. How far is the beach from the guest house?",
            answer: "Just a short walk from the property."
        },
        {
            question: "27. Is Bávaro Beach public or private?",
            answer: "It’s public, but access points are controlled. We provide a pass."
        },
        {
            question: "28. Can I walk from Sweet Home Punta Cana to Bávaro Beach?",
            answer: "Yes—5–10 minutes on foot."
        },
        {
            question: "29. What restaurants are near Bávaro Beach?",
            answer: "Bávaro has great dining: from beachfront Jellyfish to the Bibijagua food & shop area — and just a short ride away you’ll find downtown restaurants, and the lively Los Corales / The Soho dining strip."
        },
        {
            question: "30. Is Bávaro Beach better than Macao Beach or Uvero Alto?",
            answer: "For swimming and convenience, Bávaro is best. Macao is for surfing; Uvero Alto is more secluded."
        },
        {
            question: "31. Is Sweet Home Punta Cana near Jellyfish restaurant?",
            answer: "Yes—walking distance. You’re also only minutes from downtown nightlife and dining in Los Corales and The Soho."
        },
        {
            question: "32. What is the best budget accommodation close to Cocotal Golf?",
            answer: "Sweet Home Punta Cana is right next to Cocotal Golf & Country Club."
        }
    ]
  },
  {
    title: "🚕 Transportation & Getting Around",
    faqs: [
        {
            question: "33. How far is Sweet Home Punta Cana from Punta Cana International Airport?",
            answer: "Only 20 minutes by car."
        },
        {
            question: "34. Do you provide airport transfers?",
            answer: "Yes—private, reliable, and affordable transfers are available."
        },
        {
            question: "35. Is Uber available in Punta Cana?",
            answer: "Yes, Uber works here."
        },
        {
            question: "36. Is Uber safe in Punta Cana?",
            answer: "Yes—safe if you check driver details before riding."
        },
        {
            question: "37. What are motoconchos in the Dominican Republic?",
            answer: "They’re motorbike taxis—fast and cheap for short trips."
        },
        {
            question: "38. Is public transportation available near Sweet Home Punta Cana?",
            answer: "Yes—local buses (guaguas) run close by."
        },
        {
            question: "39. Can I rent a scooter in Punta Cana?",
            answer: "Yes—through our partner Scooters Punta Cana."
        },
        {
            question: "40. How much is a taxi from the airport to Bávaro?",
            answer: "Typically $25–$35 USD depending on time and provider."
        },
        {
            question: "41. Is it better to rent a scooter or car in Punta Cana?",
            answer: "For Bávaro area: scooter. For longer day trips: car."
        },
        {
            question: "42. Do excursions include pickup at Sweet Home Punta Cana?",
            answer: "Yes—all major excursions include pickup/drop-off."
        }
    ]
  },
  {
    title: "🛒 Nearby Services & Essentials",
    faqs: [
        {
            question: "43. Is there a supermarket near Sweet Home Punta Cana?",
            answer: "Yes—supermarkets within 5 minutes. Downtown convenience stores and Los Corales shops are also close."
        },
        {
            question: "44. Where can I find a pharmacy nearby?",
            answer: "Pharmacies are just a few minutes away."
        },
        {
            question: "45. Is there a hospital close to Bávaro?",
            answer: "Yes—international clinics and hospitals nearby."
        },
        {
            question: "46. Where can I exchange money in Punta Cana?",
            answer: "Local banks and money exchanges near Bávaro."
        },
        {
            question: "47. Do ATMs in Punta Cana give US dollars or Dominican pesos?",
            answer: "Mostly DOP pesos, some tourist ATMs offer USD."
        },
        {
            question: "48. Is there nightlife near Sweet Home Punta Cana?",
            answer: "Yes—bars and lounges nearby, plus Los Corales / The Soho nightlife district just minutes away."
        },
        {
            question: "49. Are there gyms or fitness centers nearby?",
            answer: "Yes—several gyms within 10 minutes."
        },
        {
            question: "50. Is there a laundromat near the guest house?",
            answer: "Yes—and we also offer on-site laundry service."
        },
        {
            question: "51. Does Sweet Home Punta Cana offer laundry service?",
            answer: "Yes—fast and affordable."
        },
        {
            question: "52. Is there a bakery or coffee shop nearby?",
            answer: "Yes—cafés and bakeries in Bávaro."
        }
    ]
  },
  {
    title: "🎾 Lifestyle & Activities",
    faqs: [
        {
            question: "53. Is Sweet Home Punta Cana next to Cocotal Golf & Country Club?",
            answer: "Yes—just steps away."
        },
        {
            question: "54. Can guests play tennis near the guest house?",
            answer: "Yes—tennis courts in the complex."
        },
        {
            question: "55. Are there football (soccer) fields inside the complex?",
            answer: "Yes—football fields are available."
        },
        {
            question: "56. What excursions are affordable from Bávaro?",
            answer: "Popular choices: Isla Saona, buggy adventures, catamaran snorkeling."
        },
        {
            question: "57. Can I walk to local bars and restaurants?",
            answer: "Yes—many are close by."
        },
        {
            question: "58. Are there casinos near Bávaro?",
            answer: "Yes—several options nearby."
        },
        {
            question: "59. Can I go snorkeling or diving near Bávaro Beach?",
            answer: "Yes—many excursions depart from Bávaro."
        },
        {
            question: "60. Is fishing popular in Punta Cana?",
            answer: "Yes—deep-sea fishing charters are widely available."
        },
        {
            question: "61. What cultural attractions are near Punta Cana?",
            answer: "The Higüey Basilica and Santo Domingo’s Colonial Zone."
        },
        {
            question: "62. Where can I dance bachata or merengue near Sweet Home Punta Cana?",
            answer: "Local bars and clubs in Bávaro."
        }
    ]
  },
  {
    title: "🛡 Safety & Travel Basics",
    faqs: [
        {
            question: "63. Is Punta Cana safe for tourists?",
            answer: "Yes—especially in tourist areas like Bávaro."
        },
        {
            question: "64. Is Bávaro safer than other areas of Punta Cana?",
            answer: "Yes—it’s one of the safest, most developed areas."
        },
        {
            question: "65. Can I drink tap water in Punta Cana?",
            answer: "No—use bottled water."
        },
        {
            question: "66. Should I use bottled water for brushing teeth?",
            answer: "Yes—recommended."
        },
        {
            question: "67. Are mosquitoes a problem in Punta Cana?",
            answer: "Yes—use repellent."
        },
        {
            question: "68. What vaccines are recommended before traveling to the Dominican Republic?",
            answer: "Routine vaccines; check with your doctor."
        },
        {
            question: "69. Are power outages common in Punta Cana?",
            answer: "Occasional, but not frequent in our complex."
        },
        {
            question: "70. Does Sweet Home Punta Cana have backup power?",
            answer: "Yes—we plan around local conditions."
        },
        {
            question: "71. Is it safe to walk at night in Bávaro?",
            answer: "Yes in main areas; avoid isolated spots."
        },
        {
            question: "72. Do I need to worry about hurricanes in Punta Cana?",
            answer: "Hurricane season is June–Nov, but resorts and guest houses prepare well."
        }
    ]
  },
  {
    title: "💳 Money & Payments",
    faqs: [
        {
            question: "73. Do you accept credit cards at Sweet Home Punta Cana?",
            answer: "Yes."
        },
        {
            question: "74. Is it better to bring cash or card to Punta Cana?",
            answer: "Both—cards for larger, cash for small shops."
        },
        {
            question: "75. Can I pay in US dollars?",
            answer: "Yes, but pesos often get better rates."
        },
        {
            question: "76. Do I need Dominican pesos for local shops?",
            answer: "Yes—recommended."
        },
        {
            question: "77. How much cash should I carry daily in Punta Cana?",
            answer: "Around $30–50 USD in pesos."
        },
        {
            question: "78. Are tips expected in the Dominican Republic?",
            answer: "Yes—common and appreciated."
        },
        {
            question: "79. How much should I tip in Punta Cana?",
            answer: "10% at restaurants; smaller tips for services."
        },
        {
            question: "80. Can I use PayPal or online payments to book?",
            answer: "Yes—ask us for details."
        }
    ]
  },
  {
    title: "📜 Travel Requirements & Logistics",
    faqs: [
        {
            question: "81. Do I need a visa to visit the Dominican Republic?",
            answer: "Most visitors don’t for stays under 30 days."
        },
        {
            question: "82. How long can tourists stay in Punta Cana without a visa?",
            answer: "Usually up to 30 days; extensions available."
        },
        {
            question: "83. Do I need a return ticket when entering the Dominican Republic?",
            answer: "Yes—sometimes required."
        },
        {
            question: "84. What language is spoken in Punta Cana?",
            answer: "Spanish, with English widely spoken in tourist areas."
        },
        {
            question: "85. Do I need to speak Spanish to visit Punta Cana?",
            answer: "No, but basics help."
        },
        {
            question: "86. What is the local currency in Punta Cana?",
            answer: "Dominican peso (DOP)."
        },
        {
            question: "87. What is the electrical outlet type in the Dominican Republic?",
            answer: "Type A/B, 110V."
        },
        {
            question: "88. Do I need an adapter for my electronics?",
            answer: "Only if coming from Europe/Asia."
        },
        {
            question: "89. Is the Dominican Republic part of the US?",
            answer: "No—it’s an independent country."
        },
        {
            question: "90. Do I need travel insurance for Punta Cana?",
            answer: "Yes—recommended."
        },
        {
            question: "91. What is the emergency number in the Dominican Republic?",
            answer: "911."
        },
        {
            question: "92. Can I use my cell phone in Punta Cana?",
            answer: "Yes—with roaming or a local SIM."
        }
    ]
  },
  {
    title: "🌦 Weather & Seasons",
    faqs: [
        {
            question: "93. What is the best time to visit Punta Cana?",
            answer: "December–April (dry season)."
        },
        {
            question: "94. Is Punta Cana hot all year round?",
            answer: "Yes—tropical weather year-round."
        },
        {
            question: "95. Does it rain a lot in Bávaro?",
            answer: "Brief showers, mostly sunny."
        },
        {
            question: "96. Is December high season in Punta Cana?",
            answer: "Yes—peak travel season."
        },
        {
            question: "97. Is summer too hot for tourists in the Dominican Republic?",
            answer: "It’s hot and humid, but manageable."
        },
        {
            question: "98. What’s the hurricane season in Punta Cana?",
            answer: "June–November."
        },
        {
            question: "99. Can I swim at Bávaro Beach all year?",
            answer: "Yes—waters are warm year-round."
        }
    ]
  },
  {
    title: "🏠 Guest Experience at Sweet Home Punta Cana",
    faqs: [
        {
            question: "100. Do all rooms have air conditioning?",
            answer: "Yes."
        },
        {
            question: "101. Is Wi-Fi free and fast?",
            answer: "Yes—high-speed included."
        },
        {
            question: "102. Do rooms have private bathrooms?",
            answer: "Yes—all are private."
        },
        {
            question: "103. Is there a shared kitchen?",
            answer: "Yes—fully equipped."
        },
        {
            question: "104. Is laundry available on-site?",
            answer: "Yes."
        },
        {
            question: "105. Do you provide airport pickup?",
            answer: "Yes—affordable transfers."
        },
        {
            question: "106. Can I book excursions through Sweet Home Punta Cana?",
            answer: "Yes—at local rates."
        },
        {
            question: "107. Do you offer long-stay discounts?",
            answer: "Yes—weekly/monthly rates."
        },
        {
            question: "108. Can digital nomads work comfortably here?",
            answer: "Yes—Wi-Fi is reliable."
        },
        {
            question: "109. Do you have quiet hours?",
            answer: "Yes—for a calm stay."
        },
        {
            question: "110. Why is Sweet Home Punta Cana different from a hostel?",
            answer: "Private, adults-only comfort with beach access—better than noisy hostels."
        },
        {
            question: "111. What makes Sweet Home Punta Cana the best adults-only guest house in Punta Cana?",
            answer: "Location + value + beach access + trusted services."
        }
    ]
  },
  {
    title: "🚤 Excursions & Experiences",
    faqs: [
        {
            question: "112. Does Sweet Home Punta Cana organize excursions?",
            answer: "Yes—Saona, Santo Domingo, buggies, catamarans, and more."
        },
        {
            question: "113. What is the most famous excursion from Punta Cana?",
            answer: "Isla Saona."
        },
        {
            question: "114. Can I book an Isla Saona tour while staying here?",
            answer: "Yes—pickup included."
        },
        {
            question: "115. How long is the Isla Saona excursion?",
            answer: "Full-day trip."
        },
        {
            question: "116. Is Isla Saona worth it compared to Catalina Island?",
            answer: "Saona = iconic beaches; Catalina = snorkeling."
        },
        {
            question: "117. Do Saona tours include food and drinks?",
            answer: "Yes—buffet and drinks."
        },
        {
            question: "118. Can I book a Santo Domingo city tour from Sweet Home?",
            answer: "Yes—day trips available."
        },
        {
            question: "119. What does the Santo Domingo excursion include?",
            answer: "Guided visit to Colonial Zone, museums, landmarks."
        },
        {
            question: "120. How far is Santo Domingo from Punta Cana?",
            answer: "2–3 hours each way."
        },
        {
            question: "121. Are buggy or ATV adventures available near Bávaro?",
            answer: "Yes."
        },
        {
            question: "122. Do buggy tours pick up from Sweet Home Punta Cana?",
            answer: "Yes."
        },
        {
            question: "123. Are buggy tours safe for beginners?",
            answer: "Yes—with helmets and guide."
        },
        {
            question: "124. Can couples ride together on a buggy?",
            answer: "Yes—two-seaters available."
        },
        {
            question: "125. Are catamaran party cruises available?",
            answer: "Yes—day and sunset."
        },
        {
            question: "126. Can I go snorkeling on a catamaran trip?",
            answer: "Yes—gear included."
        },
        {
            question: "127. Are there private catamaran options for couples?",
            answer: "Yes—romantic/private charters."
        },
        {
            question: "128. Is there fishing or boat rental available?",
            answer: "Yes—deep-sea or private boats."
        },
        {
            question: "129. Are excursions cheaper if booked outside resorts?",
            answer: "Yes—guest houses offer local prices."
        },
        {
            question: "130. What’s the best excursion for couples staying at Sweet Home Punta Cana?",
            answer: "Saona or a sunset catamaran."
        },
        {
            question: "131. What’s the best adventure tour for groups of friends?",
            answer: "Buggy/ATV tours."
        },
        {
            question: "132. Is it safe to book excursions through a guest house?",
            answer: "Yes—with licensed operators."
        },
        {
            question: "133. Can I pay for excursions with credit card or cash?",
            answer: "Yes—both accepted."
        },
        {
            question: "134. Do excursions include hotel pickup from Sweet Home Punta Cana?",
            answer: "Yes—standard."
        }
    ]
  },
  {
    title: "🧭 Platform Users: Airbnb & Booking",
    faqs: [
        {
            question: "135. Are Airbnb listings in Punta Cana reliable?",
            answer: "Some are, but many lack maintenance or are in noisy areas. Sweet Home Punta Cana guarantees clean rooms, working A/C, and quiet nights in a secure complex near Bávaro Beach."
        },
        {
            question: "136. What should I do if an Airbnb is noisy or in a bad area?",
            answer: "Rebook somewhere vetted. We’re in a gated residential community minutes from Los Corales / The Soho dining and nightlife, with easy Uber access back after midnight."
        },
        {
            question: "137. How can I find clean, well-maintained rentals near Bávaro on Booking or Airbnb?",
            answer: "Scrutinize recent reviews and maps. Or book direct with us to avoid surprises—what you see is what you get."
        },
        {
            question: "138. Why are some apartment listings not as pictured on Booking/Airbnb?",
            answer: "Photos can be old or staged. We keep our listings current and the property professionally maintained."
        },
        {
            question: "139. How do I avoid Airbnb scams or inaccurate listings in Punta Cana?",
            answer: "Choose established properties with verifiable presence and support. We’re a real guest house with on-site staff and direct contacts."
        },
        {
            question: "140. What if the host won’t respond on Airbnb or Booking?",
            answer: "It happens. We provide fast replies, clear check-in, and a direct WhatsApp line for guests."
        },
        {
            question: "141. Can I cancel with a full refund if a rental is misrepresented?",
            answer: "Platform policies vary and can take time. With us, you get a clear, fair cancellation policy up front."
        },
        {
            question: "142. How do I check a property’s neighborhood before booking an apartment?",
            answer: "Use Street View and look for landmarks. We’re near Cocotal Golf, Bávaro Beach access, and a quick ride to Cocobongo-style venues, Los Corales, and The Soho."
        },
        {
            question: "143. Are security deposits refundable on Booking/Airbnb in the Dominican Republic?",
            answer: "Usually yes, but delays happen. We keep pricing transparent with no surprise fees."
        },
        {
            question: "144. What rights do I have if I arrive and the place is unclean or broken?",
            answer: "Platforms require evidence and claims. At Sweet Home, issues are handled immediately on site."
        },
        {
            question: "145. How common are noisy neighbors in Punta Cana apartments listed on platforms?",
            answer: "Common in mixed-use buildings. Our location is quiet by design with adults-only policy."
        },
        {
            question: "146. Can Sweet Home Punta Cana help travelers who’ve been let down by Airbnb?",
            answer: "Yes—many guests switch to us same-day. We assist with transfers and late check-ins when possible."
        },
        {
            question: "147. How do I report fraudulent listings on Airbnb or Booking?",
            answer: "Use the in-app reporting tools. Or avoid the hassle: book a verified guest house like ours."
        },
        {
            question: "148. Should I trust reviews on Booking and Airbnb for Punta Cana properties?",
            answer: "Take them with context. Look for recent, detailed reviews and consistent themes—then cross-check on Google Maps."
        },
        {
            question: "149. Are platform cleaning standards enforced in Punta Cana rentals?",
            answer: "Standards vary. We maintain hotel-grade housekeeping and proactive maintenance."
        },
        {
            question: "150. Can I request maintenance or repairs if a booked apartment is rundown?",
            answer: "You can, but responses vary. We handle maintenance in-house and on schedule."
        },
        {
            question: "151. What payment protections do Booking and Airbnb provide for international guests?",
            answer: "Some, but disputes can take weeks. Booking directly with us offers instant confirmations and direct support."
        },
        {
            question: "152. How do I find apartments close to Bávaro Beach on Airbnb/Booking?",
            answer: "Filter by map and “beachfront.” Or skip the guesswork—Sweet Home is already steps from beach access."
        },
        {
            question: "153. What to do if the host tries to charge extra fees upon arrival?",
            answer: "Refuse and contact platform support. With us, no surprise fees—only clear prices."
        },
        {
            question: "154. Why choose Sweet Home Punta Cana over renting an apartment through Airbnb or Booking?",
            answer: "Because you’ll get quiet, adults-only comfort, prime location near beach and nightlife (Los Corales, The Soho, downtown shows like Cocobongo), reliable service, and the unique option to rent a real Vespa right from the property."
        }
    ]
  },
];


export default function FaqsClient() {
  return (
    <div className="bg-shpc-sand py-12 sm:py-16 pt-[calc(var(--header-height)+3rem)]">
      <div className="max-w-3xl mx-auto px-6">
        <Card className="shadow-soft rounded-2xl">
          <CardHeader>
            <CardTitle className="text-3xl">🌴 Sweet Home Punta Cana – Ultimate FAQ Guide (154 Q&As)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {faqSections.map((section) => (
              <div key={section.title}>
                <h3 className="text-xl font-semibold mb-4">{section.title}</h3>
                <Accordion type="single" collapsible className="w-full">
                  {section.faqs.map((faq, index) => (
                    <AccordionItem value={`${section.title}-item-${index}`} key={index}>
                      <AccordionTrigger className="text-left font-semibold">{faq.question}</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
