import { HOMEPAGE_IMAGES } from "@/config/homepage-images";

import type { BlogPostDefinition } from "@/content/blog/types";

export const transferPricingGuidePost: BlogPostDefinition = {
  slug: "antalya-transfer-fiyatlari",
  publishedAt: "2026-07-25",
  coverImage: HOMEPAGE_IMAGES.fleet.VITO,
  coverImageAlt: {
    tr: "Mercedes Vito ile Antalya havalimanı transferi",
    en: "Mercedes Vito Antalya airport transfer vehicle",
  },
  content: {
    tr: {
      title: "Antalya transfer fiyatları: sabit fiyat gerçekten ne demek?",
      metaDescription:
        "Havalimanı transferinde fiyat nasıl hesaplanır, gece ve bekleme ücreti var mı, ödeme ne zaman yapılır, net ve kısa açıklama.",
      excerpt:
        "“Sabit fiyat” söylenince herkesin aklına farklı şeyler geliyor. Bizim sistemde ve Antalya piyasasında bu kelimenin pratikte ne anlama geldiğini açıkladık.",
      readingMinutes: 6,
      intro:
        "Transfer fiyatı konusunda en çok kırılan kredi, taksimetre ile gidilen son dakika taksilerde yaşanıyor. Özel transferde ise fiyat çoğu zaman rezervasyon öncesinde kilitlenir. Yine de misafirler “gece ek ücreti var mı?”, “bekleme ücreti çıkar mı?” diye soruyor, haklı sorular. Kısaca ve dürüstçe yanıtlayalım.",
      sections: [
        {
          title: "Fiyatı ne belirler?",
          paragraphs: [
            "Antalya Havalimanı’ndan fiyat öncelikle güzergaha göre belirlenir: Lara, Belek, Kemer, Side, Alanya… her bölgenin mesafesi farklı. İkinci belirleyici araç sınıfı, sedan, Vito, Sprinter. Üçüncüsü yolculuk tipi: tek yön veya gidiş-dönüş.",
            "Rezervasyon ekranında araç ve bölge seçtiğinizde gördüğünüz tutar, sunucu tarafında yeniden hesaplanır ve onaylanır. Müşteri tarafında gördüğünüz rakam bilgilendirme amaçlıdır; nihai tutar her zaman sistemdeki aktif fiyat listesinden gelir.",
          ],
        },
        {
          title: "Gece, bekleme ve trafik",
          paragraphs: [
            "Royal Rhein Transfers tarafında gece varışı için ek “gece tarifesi” uygulanmaz. Uçuşunuz 02:00’de inse de rezervasyondaki fiyat geçerlidir. Bekleme süresi de uçuş takibiyle yönetilir: gecikme operasyon ekibine iletilir, şoför programı kayar.",
            "Trafik tek yönlü olarak fiyatı değiştirmez. Kemer yönünde yaz akşamı yoğunluk olabilir; süre uzar ama önceden onayladığınız tutar değişmez. Bu, “sabit fiyat” vaadinin özü.",
          ],
        },
        {
          title: "Dahil olanlar ve isteğe bağlı ekstralar",
          paragraphs: [
            "Standart pakete karşılama, uçuş takibi ve bagaj yardımı dahildir. Çocuk koltuğu, ekstra bagaj aracı veya meet & greet plus gibi kalemler rezervasyonda seçilirse fiyata eklenir, gizli değil, satır satır görünür.",
            "Oteliniz listede yoksa özel adres girebilirsiniz; fiyat yine bölge (district) bazlı kalır. Otel seçimi fiyatı değiştirmez, sadece drop-off noktasını netleştirir.",
          ],
        },
        {
          title: "Ödeme ne zaman?",
          paragraphs: [
            "Online ödeme zorunluluğu yok. Rezervasyon bir talep; onay e-postası gelir, transfer günü ödemeyi şoföre nakit veya kartla yaparsınız. Bu model Antalya’da hâlâ çok yaygın, özellikle aileler kart limiti veya döviz konusunda rahat olsun istiyor.",
            "Faturaya ihtiyaç varsa rezervasyon notlarına yazın; çoğu operasyon bunu önceden bilir ve hazırlar.",
          ],
        },
      ],
      pullQuote:
        "Sabit fiyat, taksimetre şoku yaşamamak demek, özellikle gece varış ve aile gruplarında.",
      tips: [
        "Gidiş-dönüş seçerseniz tek seferde iki bacak fiyatı görünür; ayrı ayrı rezervasyon genelde daha pahalı olur.",
        "Araç kapasitesini yolcu + bagaj için kontrol edin; sistem uygun olmayan kombinasyonu zaten engeller.",
        "Fiyat değişti uyarısı alırsanız genelde araç veya tarih değişmiştir, yeni tutarı onaylayıp devam edin.",
      ],
      faq: [
        {
          question: "Taksi ile özel transfer arasındaki fark nedir?",
          answer:
            "Taksi taksimetreyle gider; yoğun saat ve bekleme ekleyebilir. Özel transferde araç ve sürücü sizin için ayrılır, fiyat önceden bellidir, karşılama dahildir.",
        },
        {
          question: "İptal veya değişiklik ücretli mi?",
          answer:
            "Politika operasyona göre değişir; genelde erken bildirimde esneklik vardır. Değişiklik için WhatsApp veya e-posta en hızlı kanal.",
        },
      ],
    },
    en: {
      title: "Antalya transfer prices: what “fixed price” actually means",
      metaDescription:
        "How airport transfer pricing works in Antalya, night fees, waiting time, extras and when you pay. Clear and honest.",
      excerpt:
        "Everyone hears “fixed price” differently. Here’s what it means in practice for Antalya airport transfers.",
      readingMinutes: 6,
      intro:
        "Most pricing disputes happen with meter taxis at the last minute. Private transfers usually lock the rate before you fly. Guests still ask about night surcharges and waiting fees, fair questions. Here’s a straight answer.",
      sections: [
        {
          title: "What drives the price?",
          paragraphs: [
            "From Antalya Airport the main factor is destination: Lara, Belek, Kemer, Side, Alanya, each distance differs. Next is vehicle class: sedan, Vito, Sprinter. Then trip type: one-way or round trip.",
            "When you pick district and vehicle online, the total is recalculated server-side on booking. What you see on screen is informational; the authoritative list lives in the active route prices.",
          ],
        },
        {
          title: "Night, waiting and traffic",
          paragraphs: [
            "We don’t add a separate night tariff for late arrivals. Landing at 02:00 doesn’t change the confirmed quote. Delays are tracked via your flight number; the driver schedule shifts accordingly.",
            "Traffic doesn’t move the price either. Summer evenings towards Kemer can be slow, the duration grows, not the amount you agreed.",
          ],
        },
        {
          title: "Included vs optional extras",
          paragraphs: [
            "Meet & greet, flight tracking and luggage help are included in the standard package. Child seats, luggage vehicles or premium meet extras are line items if you select them, visible before you submit.",
            "If your hotel isn’t listed, you can enter a custom address. Pricing stays district-based; the hotel field only clarifies drop-off.",
          ],
        },
        {
          title: "When do you pay?",
          paragraphs: [
            "No mandatory online payment. The booking is a request; after confirmation you pay the driver on arrival, cash or card. Common in Antalya, especially for families who prefer it.",
            "Need an invoice? Note it in the booking comments; ops usually prepares it ahead.",
          ],
        },
      ],
      pullQuote:
        "Fixed price is about avoiding meter shock, especially at night with kids and luggage.",
      tips: [
        "Round-trip booking shows both legs together; two separate bookings often cost more.",
        "Match passengers and luggage to vehicle capacity; the system blocks impossible combos.",
        "If a price-update warning appears, vehicle or date likely changed, review and confirm.",
      ],
      faq: [
        {
          question: "Taxi vs private transfer?",
          answer:
            "Taxis run on the meter; queues and waiting add up. Private transfer assigns vehicle and driver to you, price is set upfront, meet & greet included.",
        },
        {
          question: "Cancellation or changes?",
          answer:
            "Policies vary; early notice is usually flexible. WhatsApp or email is fastest for changes.",
        },
      ],
    },
  },
};
