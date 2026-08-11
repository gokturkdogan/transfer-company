import { DEFAULT_LOCALE, type Locale } from "@/config/constants";

export type ReservationEmailMessages = {
  customerSubject: string;
  adminSubject: string;
  greeting: string;
  customerIntro: string;
  adminIntro: string;
  referenceLabel: string;
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
    greeting: "Merhaba {name},",
    customerIntro:
      "Rezervasyon talebiniz başarıyla alındı. Ekibimiz kısa süre içinde sizinle iletişime geçecektir.",
    adminIntro: "Yeni bir transfer rezervasyonu oluşturuldu.",
    referenceLabel: "Rezervasyon No",
    routeLabel: "Güzergah",
    dropoffLabel: "Varış noktası",
    outboundLabel: "Gidiş",
    returnLabel: "Dönüş",
    tripTypeLabel: "Yolculuk tipi",
    tripTypeOneWay: "Tek yön",
    tripTypeRoundTrip: "Gidiş-dönüş",
    passengersLabel: "Yolcular",
    infantsLabel: "Bebek",
    luggageLabel: "Bagaj",
    outboundFlightLabel: "Gidiş uçuş no",
    returnFlightLabel: "Dönüş uçuş no",
    itemsLabel: "Hizmetler",
    subtotalLabel: "Ara toplam",
    totalLabel: "Toplam",
    notesLabel: "Notlar",
    customerNameLabel: "Müşteri",
    emailLabel: "E-posta",
    phoneLabel: "Telefon",
    whatsappLabel: "WhatsApp",
    footerHelp: "Sorularınız için bize ulaşabilirsiniz.",
    footerContact: "İletişim",
    timezoneNote: "Tüm saatler İstanbul (GMT+3) saatine göredir.",
    adminViewReservation: "Admin panelinde görüntüle",
    quantityLabel: "{quantity}×",
  },
  en: {
    customerSubject: "Your reservation is confirmed — {reference}",
    adminSubject: "New reservation — {reference}",
    greeting: "Hello {name},",
    customerIntro:
      "We have received your reservation request. Our team will contact you shortly.",
    adminIntro: "A new transfer reservation has been created.",
    referenceLabel: "Reservation No",
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
    totalLabel: "Total",
    notesLabel: "Notes",
    customerNameLabel: "Customer",
    emailLabel: "Email",
    phoneLabel: "Phone",
    whatsappLabel: "WhatsApp",
    footerHelp: "If you have any questions, feel free to contact us.",
    footerContact: "Contact",
    timezoneNote: "All times are shown in Istanbul (GMT+3).",
    adminViewReservation: "View in admin panel",
    quantityLabel: "{quantity}×",
  },
  de: {
    customerSubject: "Ihre Reservierung wurde erhalten — {reference}",
    adminSubject: "Neue Reservierung — {reference}",
    greeting: "Hallo {name},",
    customerIntro:
      "Wir haben Ihre Reservierungsanfrage erhalten. Unser Team wird sich in Kürze bei Ihnen melden.",
    adminIntro: "Eine neue Transferreservierung wurde erstellt.",
    referenceLabel: "Reservierungsnr.",
    routeLabel: "Route",
    dropoffLabel: "Ziel",
    outboundLabel: "Hinfahrt",
    returnLabel: "Rückfahrt",
    tripTypeLabel: "Reiseart",
    tripTypeOneWay: "Einfach",
    tripTypeRoundTrip: "Hin und zurück",
    passengersLabel: "Passagiere",
    infantsLabel: "Kleinkinder",
    luggageLabel: "Gepäck",
    outboundFlightLabel: "Hinflug",
    returnFlightLabel: "Rückflug",
    itemsLabel: "Leistungen",
    subtotalLabel: "Zwischensumme",
    totalLabel: "Gesamt",
    notesLabel: "Anmerkungen",
    customerNameLabel: "Kunde",
    emailLabel: "E-Mail",
    phoneLabel: "Telefon",
    whatsappLabel: "WhatsApp",
    footerHelp: "Bei Fragen können Sie uns gerne kontaktieren.",
    footerContact: "Kontakt",
    timezoneNote: "Alle Zeiten sind in Istanbul (GMT+3).",
    adminViewReservation: "Im Admin-Panel anzeigen",
    quantityLabel: "{quantity}×",
  },
  ru: {
    customerSubject: "Ваша бронь получена — {reference}",
    adminSubject: "Новая бронь — {reference}",
    greeting: "Здравствуйте, {name},",
    customerIntro:
      "Мы получили ваш запрос на бронирование. Наша команда свяжется с вами в ближайшее время.",
    adminIntro: "Создано новое бронирование трансфера.",
    referenceLabel: "Номер брони",
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
    totalLabel: "Итого",
    notesLabel: "Примечания",
    customerNameLabel: "Клиент",
    emailLabel: "Email",
    phoneLabel: "Телефон",
    whatsappLabel: "WhatsApp",
    footerHelp: "Если у вас есть вопросы, свяжитесь с нами.",
    footerContact: "Контакты",
    timezoneNote: "Все время указано по Стамбулу (GMT+3).",
    adminViewReservation: "Открыть в админ-панели",
    quantityLabel: "{quantity}×",
  },
  ar: {
    customerSubject: "تم استلام حجزك — {reference}",
    adminSubject: "حجز جديد — {reference}",
    greeting: "مرحبًا {name}،",
    customerIntro:
      "لقد استلمنا طلب حجزك. سيتواصل معك فريقنا قريبًا.",
    adminIntro: "تم إنشاء حجز نقل جديد.",
    referenceLabel: "رقم الحجز",
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
    totalLabel: "الإجمالي",
    notesLabel: "ملاحظات",
    customerNameLabel: "العميل",
    emailLabel: "البريد الإلكتروني",
    phoneLabel: "الهاتف",
    whatsappLabel: "واتساب",
    footerHelp: "إذا كان لديك أي أسئلة، لا تتردد في التواصل معنا.",
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
