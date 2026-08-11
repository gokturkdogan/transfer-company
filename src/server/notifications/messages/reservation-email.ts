import { DEFAULT_LOCALE, type Locale } from "@/config/constants";

export type ReservationEmailMessages = {
  customerSubject: string;
  adminSubject: string;
  brandTagline: string;
  greeting: string;
  customerIntro: string;
  adminIntro: string;
  statusLabel: string;
  statusPending: string;
  referenceLabel: string;
  vehicleSectionLabel: string;
  journeySectionLabel: string;
  extrasSectionLabel: string;
  summarySectionLabel: string;
  routeLabel: string;
  dropoffLabel: string;
  outboundLabel: string;
  returnLabel: string;
  tripTypeLabel: string;
  tripTypeOneWay: string;
  tripTypeRoundTrip: string;
  passengersLabel: string;
  infantsLabel: string;
  luggageLabel: string;
  outboundFlightLabel: string;
  returnFlightLabel: string;
  itemsLabel: string;
  subtotalLabel: string;
  totalLabel: string;
  notesLabel: string;
  customerNameLabel: string;
  emailLabel: string;
  phoneLabel: string;
  whatsappLabel: string;
  capacityPassengers: string;
  capacityLargeLuggage: string;
  capacityCabinLuggage: string;
  largeLuggageValue: string;
  cabinLuggageValue: string;
  includedLabel: string;
  supportTitle: string;
  footerHelp: string;
  footerContact: string;
  timezoneNote: string;
  adminViewReservation: string;
  quantityLabel: string;
};

const MESSAGES: Record<Locale, ReservationEmailMessages> = {
  tr: {
    customerSubject: "Rezervasyonunuz alındı — {reference}",
    adminSubject: "Yeni rezervasyon — {reference}",
    brandTagline: "Premium Havalimanı Transfer Hizmeti",
    greeting: "Sayın {name},",
    customerIntro:
      "Rezervasyon talebiniz başarıyla alındı. Ekibimiz kısa süre içinde sizinle iletişime geçerek transferinizi teyit edecektir.",
    adminIntro: "Yeni bir transfer rezervasyonu oluşturuldu.",
    statusLabel: "Durum",
    statusPending: "Onay bekleniyor",
    referenceLabel: "Rezervasyon numarası",
    vehicleSectionLabel: "Seçilen araç",
    journeySectionLabel: "Yolculuk detayları",
    extrasSectionLabel: "Ek hizmetler",
    summarySectionLabel: "Sipariş özeti",
    routeLabel: "Güzergah",
    dropoffLabel: "Varış noktası",
    outboundLabel: "Gidiş",
    returnLabel: "Dönüş",
    tripTypeLabel: "Yolculuk tipi",
    tripTypeOneWay: "Tek yön",
    tripTypeRoundTrip: "Gidiş-dönüş",
    passengersLabel: "Yolcu",
    infantsLabel: "Bebek",
    luggageLabel: "Bagaj",
    outboundFlightLabel: "Gidiş uçuş no",
    returnFlightLabel: "Dönüş uçuş no",
    itemsLabel: "Hizmetler",
    subtotalLabel: "Ara toplam",
    totalLabel: "Genel toplam",
    notesLabel: "Notlarınız",
    customerNameLabel: "Müşteri",
    emailLabel: "E-posta",
    phoneLabel: "Telefon",
    whatsappLabel: "WhatsApp",
    capacityPassengers: "{count} yolcu",
    capacityLargeLuggage: "{count} valiz",
    capacityCabinLuggage: "{count} el bagajı",
    largeLuggageValue: "{count} valiz",
    cabinLuggageValue: "{count} el bagajı",
    includedLabel: "Dahil",
    supportTitle: "Yardıma mı ihtiyacınız var?",
    footerHelp: "Sorularınız için 7/24 bize ulaşabilirsiniz.",
    footerContact: "İletişim",
    timezoneNote: "Tüm saatler İstanbul (GMT+3) saat dilimine göredir.",
    adminViewReservation: "Admin panelinde görüntüle",
    quantityLabel: "{quantity}×",
  },
  en: {
    customerSubject: "Your reservation is received — {reference}",
    adminSubject: "New reservation — {reference}",
    brandTagline: "Premium Airport Transfer Service",
    greeting: "Dear {name},",
    customerIntro:
      "We have received your reservation request. Our team will contact you shortly to confirm your transfer.",
    adminIntro: "A new transfer reservation has been created.",
    statusLabel: "Status",
    statusPending: "Awaiting confirmation",
    referenceLabel: "Reservation number",
    vehicleSectionLabel: "Selected vehicle",
    journeySectionLabel: "Journey details",
    extrasSectionLabel: "Additional services",
    summarySectionLabel: "Order summary",
    routeLabel: "Route",
    dropoffLabel: "Drop-off",
    outboundLabel: "Outbound",
    returnLabel: "Return",
    tripTypeLabel: "Trip type",
    tripTypeOneWay: "One way",
    tripTypeRoundTrip: "Round trip",
    passengersLabel: "Passengers",
    infantsLabel: "Infants",
    luggageLabel: "Luggage",
    outboundFlightLabel: "Outbound flight",
    returnFlightLabel: "Return flight",
    itemsLabel: "Services",
    subtotalLabel: "Subtotal",
    totalLabel: "Grand total",
    notesLabel: "Your notes",
    customerNameLabel: "Customer",
    emailLabel: "Email",
    phoneLabel: "Phone",
    whatsappLabel: "WhatsApp",
    capacityPassengers: "{count} passengers",
    capacityLargeLuggage: "{count} large bags",
    capacityCabinLuggage: "{count} cabin bags",
    largeLuggageValue: "{count} large",
    cabinLuggageValue: "{count} cabin",
    includedLabel: "Included",
    supportTitle: "Need assistance?",
    footerHelp: "Our team is available 24/7 for any questions.",
    footerContact: "Contact",
    timezoneNote: "All times are shown in Istanbul (GMT+3).",
    adminViewReservation: "View in admin panel",
    quantityLabel: "{quantity}×",
  },
  de: {
    customerSubject: "Ihre Reservierung ist eingegangen — {reference}",
    adminSubject: "Neue Reservierung — {reference}",
    brandTagline: "Premium Flughafen-Transferservice",
    greeting: "Sehr geehrte(r) {name},",
    customerIntro:
      "Wir haben Ihre Reservierungsanfrage erhalten. Unser Team wird sich in Kürze bei Ihnen melden, um Ihren Transfer zu bestätigen.",
    adminIntro: "Eine neue Transferreservierung wurde erstellt.",
    statusLabel: "Status",
    statusPending: "Bestätigung ausstehend",
    referenceLabel: "Reservierungsnummer",
    vehicleSectionLabel: "Ausgewähltes Fahrzeug",
    journeySectionLabel: "Reisedetails",
    extrasSectionLabel: "Zusatzleistungen",
    summarySectionLabel: "Bestellübersicht",
    routeLabel: "Route",
    dropoffLabel: "Ziel",
    outboundLabel: "Hinfahrt",
    returnLabel: "Rückfahrt",
    tripTypeLabel: "Reiseart",
    tripTypeOneWay: "Einfache Fahrt",
    tripTypeRoundTrip: "Hin und zurück",
    passengersLabel: "Passagiere",
    infantsLabel: "Kleinkinder",
    luggageLabel: "Gepäck",
    outboundFlightLabel: "Hinflug",
    returnFlightLabel: "Rückflug",
    itemsLabel: "Leistungen",
    subtotalLabel: "Zwischensumme",
    totalLabel: "Gesamtbetrag",
    notesLabel: "Ihre Anmerkungen",
    customerNameLabel: "Kunde",
    emailLabel: "E-Mail",
    phoneLabel: "Telefon",
    whatsappLabel: "WhatsApp",
    capacityPassengers: "{count} Passagiere",
    capacityLargeLuggage: "{count} große Koffer",
    capacityCabinLuggage: "{count} Handgepäck",
    largeLuggageValue: "{count} groß",
    cabinLuggageValue: "{count} Handgepäck",
    includedLabel: "Inklusive",
    supportTitle: "Brauchen Sie Hilfe?",
    footerHelp: "Unser Team ist rund um die Uhr für Sie erreichbar.",
    footerContact: "Kontakt",
    timezoneNote: "Alle Zeiten in Istanbul (GMT+3).",
    adminViewReservation: "Im Admin-Panel anzeigen",
    quantityLabel: "{quantity}×",
  },
  ru: {
    customerSubject: "Ваша бронь получена — {reference}",
    adminSubject: "Новая бронь — {reference}",
    brandTagline: "Премиальный трансфер из аэропорта",
    greeting: "Уважаемый(ая) {name},",
    customerIntro:
      "Мы получили ваш запрос на бронирование. Наша команда свяжется с вами в ближайшее время для подтверждения трансфера.",
    adminIntro: "Создано новое бронирование трансфера.",
    statusLabel: "Статус",
    statusPending: "Ожидает подтверждения",
    referenceLabel: "Номер брони",
    vehicleSectionLabel: "Выбранный автомобиль",
    journeySectionLabel: "Детали поездки",
    extrasSectionLabel: "Дополнительные услуги",
    summarySectionLabel: "Итоги заказа",
    routeLabel: "Маршрут",
    dropoffLabel: "Пункт назначения",
    outboundLabel: "Туда",
    returnLabel: "Обратно",
    tripTypeLabel: "Тип поездки",
    tripTypeOneWay: "В одну сторону",
    tripTypeRoundTrip: "Туда и обратно",
    passengersLabel: "Пассажиры",
    infantsLabel: "Младенцы",
    luggageLabel: "Багаж",
    outboundFlightLabel: "Рейс туда",
    returnFlightLabel: "Рейс обратно",
    itemsLabel: "Услуги",
    subtotalLabel: "Промежуточный итог",
    totalLabel: "Итого к оплате",
    notesLabel: "Ваши примечания",
    customerNameLabel: "Клиент",
    emailLabel: "Email",
    phoneLabel: "Телефон",
    whatsappLabel: "WhatsApp",
    capacityPassengers: "{count} пассажиров",
    capacityLargeLuggage: "{count} чемодана",
    capacityCabinLuggage: "{count} ручной клади",
    largeLuggageValue: "{count} больших",
    cabinLuggageValue: "{count} ручной клади",
    includedLabel: "Включено",
    supportTitle: "Нужна помощь?",
    footerHelp: "Наша команда доступна круглосуточно.",
    footerContact: "Контакты",
    timezoneNote: "Все время указано по Стамбулу (GMT+3).",
    adminViewReservation: "Открыть в админ-панели",
    quantityLabel: "{quantity}×",
  },
  ar: {
    customerSubject: "تم استلام حجزك — {reference}",
    adminSubject: "حجز جديد — {reference}",
    brandTagline: "خدمة نقل فاخرة من المطار",
    greeting: "عزيزي {name}،",
    customerIntro:
      "لقد استلمنا طلب حجزك. سيتواصل معك فريقنا قريبًا لتأكيد النقل.",
    adminIntro: "تم إنشاء حجز نقل جديد.",
    statusLabel: "الحالة",
    statusPending: "بانتظار التأكيد",
    referenceLabel: "رقم الحجز",
    vehicleSectionLabel: "المركبة المختارة",
    journeySectionLabel: "تفاصيل الرحلة",
    extrasSectionLabel: "الخدمات الإضافية",
    summarySectionLabel: "ملخص الطلب",
    routeLabel: "المسار",
    dropoffLabel: "نقطة الوصول",
    outboundLabel: "الذهاب",
    returnLabel: "العودة",
    tripTypeLabel: "نوع الرحلة",
    tripTypeOneWay: "ذهاب فقط",
    tripTypeRoundTrip: "ذهاب وعودة",
    passengersLabel: "الركاب",
    infantsLabel: "الرضع",
    luggageLabel: "الأمتعة",
    outboundFlightLabel: "رقم رحلة الذهاب",
    returnFlightLabel: "رقم رحلة العودة",
    itemsLabel: "الخدمات",
    subtotalLabel: "المجموع الفرعي",
    totalLabel: "الإجمالي النهائي",
    notesLabel: "ملاحظاتك",
    customerNameLabel: "العميل",
    emailLabel: "البريد الإلكتروني",
    phoneLabel: "الهاتف",
    whatsappLabel: "واتساب",
    capacityPassengers: "{count} ركاب",
    capacityLargeLuggage: "{count} حقائب كبيرة",
    capacityCabinLuggage: "{count} حقائب يد",
    largeLuggageValue: "{count} كبيرة",
    cabinLuggageValue: "{count} حقيبة يد",
    includedLabel: "مشمول",
    supportTitle: "هل تحتاج مساعدة؟",
    footerHelp: "فريقنا متاح على مدار الساعة للإجابة على أسئلتك.",
    footerContact: "تواصل",
    timezoneNote: "جميع الأوقات بتوقيت إسطنبول (GMT+3).",
    adminViewReservation: "عرض في لوحة الإدارة",
    quantityLabel: "{quantity}×",
  },
};

export function getReservationEmailMessages(
  locale: string,
): ReservationEmailMessages {
  if (locale in MESSAGES) {
    return MESSAGES[locale as Locale];
  }

  return MESSAGES[DEFAULT_LOCALE];
}

export function interpolate(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    String(values[key] ?? ""),
  );
}
