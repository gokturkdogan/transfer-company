import { HOMEPAGE_IMAGES } from "@/config/homepage-images";

import type { BlogPostDefinition } from "@/content/blog/types";

export const antalyaArrivalGuidePost: BlogPostDefinition = {
  slug: "antalya-havalimani-varis-rehberi",
  publishedAt: "2026-07-18",
  coverImage: HOMEPAGE_IMAGES.howItWorks.meetGreet,
  coverImageAlt: {
    tr: "Antalya Havalimanı varış salonunda isim tabelasıyla karşılama",
    en: "Meet and greet with name sign at Antalya Airport arrivals",
  },
  content: {
    tr: {
      title: "Antalya Havalimanı varış rehberi: ilk kez inenler için",
      metaDescription:
        "AYT'ye ilk kez inecek misafirler için terminal çıkışı, karşılama noktası, bagaj ve özel transfer süreci, pratik ve sade.",
      excerpt:
        "Terminalden çıkışa kadar ne beklemeniz gerektiğini, şoförünüzle nerede buluşacağınızı ve uçuş gecikmesinde sürecin nasıl işlediğini adım adım anlattık.",
      readingMinutes: 7,
      intro:
        "Antalya Havalimanı (AYT) yaz sezonunda yoğun bir tempo tutar; terminal biraz kalabalık gelebilir ama akış aslında düzenli. Yıllardır bu havalimanında karşılama yapan ekiplerle aynı masada oturan biri olarak söyleyebilirim: en çok sorulan şey “şoförü nerede bulacağım?”, geri kalanı genelde sorunsuz ilerler.",
      sections: [
        {
          title: "İnişten sonra ilk 10 dakika",
          paragraphs: [
            "Uçaktan indikten sonra önce pasaport kontrolüne gidersiniz. Uluslararası hatlarda yoğunluk saatlere göre değişir; sabah erken ve gece geç saatler genelde daha rahattır. Kontrol bittiğinde bagaj alanına geçin; ekranda uçuş numaranızı takip etmek yeterli.",
            "Bagajınızı aldıktan sonra gümrük çıkışına gelirsiniz. Turistik transfer için ekstra bir prosedür yok; yeşil veya kırmızı hat ayrımı standart. Çıkış kapısına yaklaştığınızda telefonunuzda internet yoksa endişelenmeyin, karşılama ekibi sizi terminal içinde bekler, dışarıda yağmur altında arama yapmazsınız.",
          ],
        },
        {
          title: "Karşılama nerede olur?",
          paragraphs: [
            "Özel transfer rezervasyonunda şoför veya karşılama görevlisi, varış salonunda isminizin yazılı olduğu tabelayla bekler. Tabela genelde el yazısı veya baskı, ikisi de normal. Sizi gördüğünde bagajınıza yardım eder ve araca kadar eşlik eder.",
            "Bazen misafirler “dış kapıda mı, içeride mi?” diye soruyor. Standart meet & greet hizmeti terminal çıkışına kadar içeride devam eder. Otel shuttle’larıyla karıştırmayın; onlar çoğu zaman dış park alanında toplanır. Bizim süreçte amaç, yorgun argın otopark aramak değil.",
          ],
        },
        {
          title: "Uçuş gecikirse ne olur?",
          paragraphs: [
            "Rezervasyon formuna yazdığınız uçuş numarası operasyon ekibine iletilir. Gecikme olduğunda şoförünüzün programı güncellenir; ek ücret talep edilmez. Bu, Antalya’da sık yaşanan bir senaryo, özellikle Avrupa’dan gece uçuşlarında.",
            "Yine de uçaktan inince mümkünse WhatsApp veya telefonla kısa bir “indiğim” mesajı iyi olur. Hat yoğun olduğunda bu, ekip için küçük ama faydalı bir sinyal.",
          ],
        },
        {
          title: "Gece varışlar ve çocuklu aileler",
          paragraphs: [
            "Gece 23:00 sonrası inişlerde terminal sakinleşir; karşılama süreci aynı. Bebek veya çocuk koltuğu talep ettiyseniz, rezervasyon sırasında belirtmeniz yeterli, araç hazırlanırken takılır.",
            "Uzun uçuş sonrası en sık duyduğumuz şey: “Otele ne kadar sürer?” Lara ve Kundu hattı genelde 15–25 dakika, Belek 35–50 dakika, Kemer biraz daha uzun. Rezervasyon ekranında gördüğünüz fiyat bu mesafeye göre zaten sabitlenmiş olur.",
          ],
        },
      ],
      pullQuote:
        "İsim tabelasıyla karşılama, Antalya’da taksi sırası veya uygulama aramaktan çok daha az stresli bir başlangıç.",
      tips: [
        "Pasaport kontrolünden sonra bagaj fişinizi bir yere koymayın, nadiren ama kontrol isteyebilirler.",
        "SIM kart alacaksanız terminal içindeki standlar pratik; transfer beklerken halledebilirsiniz.",
        "Rezervasyonda WhatsApp numaranızı doğru girin; operasyon ekibi gecikmede size ulaşır.",
      ],
      faq: [
        {
          question: "Havalimanında ATM ve döviz bürosu var mı?",
          answer:
            "Evet, çıkış öncesi ve sonrası birkaç noktada bulunur. Transfer ücretini çoğu misafir varışta nakit veya kartla öder; önceden döviz çevirmek şart değil.",
        },
        {
          question: "Şoförü tanımazsam ne yapmalıyım?",
          answer:
            "Rezervasyon onay e-postasındaki numarayı arayın. Karşılama görevlisi genelde birkaç dakika içinde yanınıza gelir; tabela bazen kalabalıkta birkaç metre geride duruyor olabilir.",
        },
      ],
    },
    en: {
      title: "Antalya Airport arrival guide for first-time visitors",
      metaDescription:
        "A practical walkthrough of AYT arrivals: terminals, meet & greet, baggage and private transfer, without the fluff.",
      excerpt:
        "What to expect from touchdown to the arrivals hall, where your driver waits, and how delays are handled, step by step.",
      readingMinutes: 7,
      intro:
        "Antalya Airport (AYT) gets busy in summer, but the flow is well organised once you know what comes next. After years of coordinating meet & greets here, the number one question is still “where exactly do I find my driver?”, everything else usually falls into place.",
      sections: [
        {
          title: "The first ten minutes after landing",
          paragraphs: [
            "After landing you head to passport control. International queues vary by time of day; early morning and late night tend to be calmer. Once through, follow the screens to baggage reclaim for your flight number.",
            "After collecting luggage you pass customs, standard green/red routing, nothing extra for tourist transfers. If your mobile has no signal near the exit, don’t worry: meet & greet staff wait inside the terminal, not in a rainy car park.",
          ],
        },
        {
          title: "Where meet & greet happens",
          paragraphs: [
            "With a pre-booked private transfer, your chauffeur or greeter waits in the arrivals hall with a name sign. Handwritten or printed, both are normal. They help with bags and walk you to the vehicle.",
            "Guests often ask “inside or outside?” Standard meet & greet stays inside until you reach the public exit. Hotel shuttles usually gather outside; our process is designed so you don’t hunt for a car while tired.",
          ],
        },
        {
          title: "If your flight is delayed",
          paragraphs: [
            "The flight number on your booking is monitored. When delays happen, your pickup window shifts, no extra charge for that. Night flights from Europe are the usual scenario in Antalya.",
            "A quick WhatsApp or call after landing still helps on busy days. Small signal, big relief for the operations desk.",
          ],
        },
        {
          title: "Late arrivals and families",
          paragraphs: [
            "After 23:00 the terminal quiets down; the process is the same. Child seats are fitted before pickup if you requested them when booking.",
            "The question we hear most after a long flight: “How long to the hotel?” Lara/Kundu often 15–25 minutes, Belek 35–50, Kemer a bit longer. The price you confirmed online already reflects that distance.",
          ],
        },
      ],
      pullQuote:
        "A name-sign pickup beats queueing for a taxi or negotiating on an app when you just want to get to the hotel.",
      tips: [
        "Keep your baggage tag until you leave the hall, occasional checks happen.",
        "SIM cards at airport stands are convenient while you wait.",
        "Double-check WhatsApp on your booking; ops can reach you if plans change.",
      ],
      faq: [
        {
          question: "Are there ATMs and exchange offices?",
          answer:
            "Yes, before and after customs. Most guests pay the driver on arrival by card or cash; exchanging beforehand is not required.",
        },
        {
          question: "I cannot spot my driver, what now?",
          answer:
            "Call the number on your confirmation email. Greeters are usually within a few minutes; in crowds the sign might be a few metres behind you.",
        },
      ],
    },
  },
};
