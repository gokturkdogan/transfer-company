import { DEFAULT_LOCALE, type Locale } from "@/config/constants";
import type { ReservationStatus } from "@/db/schema/enums";

export type ReservationEmailMessages = {
  customerSubject: string;
  adminSubject: string;
  statusUpdateSubject: string;
  brandTagline: string;
  greeting: string;
  customerIntro: string;
  adminIntro: string;
  statusLabel: string;
  statusPending: string;
  statusConfirmed: string;
  statusCancelled: string;
  statusCompleted: string;
  previousStatusLabel: string;
  statusPendingIntro: string;
  statusConfirmedIntro: string;
  statusCancelledIntro: string;
  statusCompletedIntro: string;
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
  passengerDetailsLabel: string;
  passengerAdultLabel: string;
  passengerChildLabel: string;
  passengerInfantLabel: string;
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
    statusUpdateSubject: "Rezervasyon durumu güncellendi — {reference}",
    brandTagline: "Premium Havalimanı Transfer Hizmeti",
    greeting: "Sayın {name},",
    customerIntro:
      "Rezervasyon talebiniz başarıyla alındı. Ekibimiz kısa süre içinde sizinle iletişime geçerek transferinizi teyit edecektir.",
    adminIntro: "Yeni bir transfer rezervasyonu oluşturuldu.",
    statusLabel: "Durum",
    statusPending: "Onay bekleniyor",
    statusConfirmed: "Onaylandı",
    statusCancelled: "İptal edildi",
    statusCompleted: "Tamamlandı",
    previousStatusLabel: "Önceki durum",
    statusPendingIntro:
      "Rezervasyonunuz tekrar inceleme aşamasına alındı. Ekibimiz kısa süre içinde sizinle iletişime geçecektir.",
    statusConfirmedIntro:
      "Rezervasyonunuz onaylandı. Transferiniz planlandığı şekilde gerçekleştirilecektir.",
    statusCancelledIntro:
      "Rezervasyonunuz iptal edilmiştir. Sorularınız için bizimle iletişime geçebilirsiniz.",
    statusCompletedIntro:
      "Transferiniz başarıyla tamamlandı. Bizi tercih ettiğiniz için teşekkür ederiz.",
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
    passengerDetailsLabel: "Yolcu bilgileri",
    passengerAdultLabel: "{index}. Yolcu",
    passengerChildLabel: "{index}. Çocuk",
    passengerInfantLabel: "{index}. Bebek",
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
    statusUpdateSubject: "Reservation status updated — {reference}",
    brandTagline: "Premium Airport Transfer Service",
    greeting: "Dear {name},",
    customerIntro:
      "We have received your reservation request. Our team will contact you shortly to confirm your transfer.",
    adminIntro: "A new transfer reservation has been created.",
    statusLabel: "Status",
    statusPending: "Awaiting confirmation",
    statusConfirmed: "Confirmed",
    statusCancelled: "Cancelled",
    statusCompleted: "Completed",
    previousStatusLabel: "Previous status",
    statusPendingIntro:
      "Your reservation has been moved back to review. Our team will contact you shortly.",
    statusConfirmedIntro:
      "Your reservation has been confirmed. Your transfer will proceed as scheduled.",
    statusCancelledIntro:
      "Your reservation has been cancelled. Please contact us if you have any questions.",
    statusCompletedIntro:
      "Your transfer has been completed successfully. Thank you for choosing us.",
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
    passengerDetailsLabel: "Passenger details",
    passengerAdultLabel: "Passenger {index}",
    passengerChildLabel: "Child {index}",
    passengerInfantLabel: "Infant {index}",
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
    statusUpdateSubject: "Reservierungsstatus aktualisiert — {reference}",
    brandTagline: "Premium Flughafen-Transferservice",
    greeting: "Sehr geehrte(r) {name},",
    customerIntro:
      "Wir haben Ihre Reservierungsanfrage erhalten. Unser Team wird sich in Kürze bei Ihnen melden, um Ihren Transfer zu bestätigen.",
    adminIntro: "Eine neue Transferreservierung wurde erstellt.",
    statusLabel: "Status",
    statusPending: "Bestätigung ausstehend",
    statusConfirmed: "Bestätigt",
    statusCancelled: "Storniert",
    statusCompleted: "Abgeschlossen",
    previousStatusLabel: "Vorheriger Status",
    statusPendingIntro:
      "Ihre Reservierung wurde erneut zur Prüfung vorgelegt. Unser Team wird sich in Kürze bei Ihnen melden.",
    statusConfirmedIntro:
      "Ihre Reservierung wurde bestätigt. Ihr Transfer findet wie geplant statt.",
    statusCancelledIntro:
      "Ihre Reservierung wurde storniert. Bei Fragen kontaktieren Sie uns bitte.",
    statusCompletedIntro:
      "Ihr Transfer wurde erfolgreich abgeschlossen. Vielen Dank für Ihr Vertrauen.",
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
    passengerDetailsLabel: "Passagierinformationen",
    passengerAdultLabel: "Passagier {index}",
    passengerChildLabel: "Kind {index}",
    passengerInfantLabel: "Kleinkind {index}",
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
    statusUpdateSubject: "Статус брони обновлён — {reference}",
    brandTagline: "Премиальный трансфер из аэропорта",
    greeting: "Уважаемый(ая) {name},",
    customerIntro:
      "Мы получили ваш запрос на бронирование. Наша команда свяжется с вами в ближайшее время для подтверждения трансфера.",
    adminIntro: "Создано новое бронирование трансфера.",
    statusLabel: "Статус",
    statusPending: "Ожидает подтверждения",
    statusConfirmed: "Подтверждено",
    statusCancelled: "Отменено",
    statusCompleted: "Завершено",
    previousStatusLabel: "Предыдущий статус",
    statusPendingIntro:
      "Ваша бронь снова находится на рассмотрении. Наша команда свяжется с вами в ближайшее время.",
    statusConfirmedIntro:
      "Ваша бронь подтверждена. Трансфер будет выполнен по расписанию.",
    statusCancelledIntro:
      "Ваша бронь отменена. Если у вас есть вопросы, свяжитесь с нами.",
    statusCompletedIntro:
      "Ваш трансфер успешно завершён. Спасибо, что выбрали нас.",
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
    passengerDetailsLabel: "Данные пассажиров",
    passengerAdultLabel: "Пассажир {index}",
    passengerChildLabel: "Ребёнок {index}",
    passengerInfantLabel: "Младенец {index}",
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
    statusUpdateSubject: "تم تحديث حالة الحجز — {reference}",
    brandTagline: "خدمة نقل فاخرة من المطار",
    greeting: "عزيزي {name}،",
    customerIntro:
      "لقد استلمنا طلب حجزك. سيتواصل معك فريقنا قريبًا لتأكيد النقل.",
    adminIntro: "تم إنشاء حجز نقل جديد.",
    statusLabel: "الحالة",
    statusPending: "بانتظار التأكيد",
    statusConfirmed: "مؤكد",
    statusCancelled: "ملغى",
    statusCompleted: "مكتمل",
    previousStatusLabel: "الحالة السابقة",
    statusPendingIntro:
      "تمت إعادة حجزك إلى مرحلة المراجعة. سيتواصل معك فريقنا قريبًا.",
    statusConfirmedIntro:
      "تم تأكيد حجزك. سيتم تنفيذ النقل كما هو مخطط.",
    statusCancelledIntro:
      "تم إلغاء حجزك. يرجى التواصل معنا إذا كانت لديك أي أسئلة.",
    statusCompletedIntro:
      "تم إكمال النقل بنجاح. شكرًا لاختياركم لنا.",
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
    passengerDetailsLabel: "معلومات الركاب",
    passengerAdultLabel: "الراكب {index}",
    passengerChildLabel: "الطفل {index}",
    passengerInfantLabel: "الرضيع {index}",
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

export function getReservationStatusLabel(
  status: ReservationStatus,
  messages: ReservationEmailMessages,
): string {
  switch (status) {
    case "PENDING":
      return messages.statusPending;
    case "CONFIRMED":
      return messages.statusConfirmed;
    case "CANCELLED":
      return messages.statusCancelled;
    case "COMPLETED":
      return messages.statusCompleted;
    default:
      return status;
  }
}

export function getReservationStatusIntro(
  status: ReservationStatus,
  messages: ReservationEmailMessages,
): string {
  switch (status) {
    case "PENDING":
      return messages.statusPendingIntro;
    case "CONFIRMED":
      return messages.statusConfirmedIntro;
    case "CANCELLED":
      return messages.statusCancelledIntro;
    case "COMPLETED":
      return messages.statusCompletedIntro;
    default:
      return messages.statusConfirmedIntro;
  }
}

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
