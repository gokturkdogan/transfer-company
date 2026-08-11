import type { ReservationStatus } from "@/db/schema/enums";
import type { TripType } from "@/db/schema/enums";
import type { ExtraPricingMode } from "@/db/schema/enums";
import type { AdminLocationType } from "@/features/admin/types/location";

export const ADMIN_LOCALE = "tr-TR";

export const adminCopy = {
  common: {
    back: "Geri",
  },
  brand: {
    panel: "Yönetim",
    title: "Transfer Company",
    pageTitle: "Yönetim | Transfer Company",
  },
  sidebar: {
    dashboard: "Genel bakış",
    locations: "Konumlar",
    currencies: "Nakit ödeme kurları",
    extras: "Extralar",
    vehicles: "Araçlar",
    pricing: "Fiyatlandırma",
    reservations: "Rezervasyonlar",
    contact: "İletişim bilgileri",
    locales: "Dil seçenekleri",
    signOut: "Çıkış yap",
  },
  login: {
    title: "Yönetim paneli girişi",
    email: "E-posta",
    password: "Şifre",
    submit: "Giriş yap",
    submitting: "Giriş yapılıyor...",
  },
  locations: {
    title: "Konumlar",
    subtitle: "Havalimanları, şehirler, bölgeler ve otelleri yönetin.",
    tabs: {
      airports: "Havalimanları",
      cities: "Şehirler",
      districts: "Bölgeler",
      hotels: "Oteller",
    },
    addNew: "Yeni ekle",
    table: {
      name: "Ad",
      code: "Kod",
      parent: "Üst konum",
      homepageFeatured: "Anasayfa vitrini",
      status: "Durum",
      actions: "İşlemler",
      edit: "Düzenle",
    },
    featuredStatus: {
      shown: "Gösteriliyor",
      hidden: "Gösterilmiyor",
    },
    status: {
      active: "Aktif",
      inactive: "Pasif",
    },
    newSubtitle: "Yeni bir konum kaydı oluşturun.",
    editSubtitle: "Konum bilgilerini ve hiyerarşiyi güncelleyin.",
    newTitle: "Yeni",
    editTitle: "Düzenle",
  },
  locationForm: {
    code: "Kod",
    name: "Ad",
    city: "Şehir",
    cityOptional: "Şehir (isteğe bağlı)",
    district: "Bölge",
    noCity: "Şehir yok",
    address: "Adres",
    sortOrder: "Sıralama",
    active: "Aktif",
    create: "Oluştur",
    save: "Kaydet",
    saving: "Kaydediliyor...",
    cancel: "İptal",
    featured: {
      sectionTitle: "Anasayfa vitrini",
      sectionDescription:
        "İşaretlenen bölgeler ana sayfadaki popüler destinasyonlar carousel'inde görünür.",
      showOnHomepage: "Anasayfada göster",
      uploadImage: "Görsel yükle",
      changeImage: "Görseli değiştir",
      removeImage: "Görseli kaldır",
      imageRequiredHint: "Anasayfada gösterilecek bölgeler için görsel zorunludur.",
      cropTitle: "Destinasyon görselini kırp",
      cropHint: "Görsel kare (1:1) olarak kırpılır ve CDN'e yüklenir.",
      codeRequiredForImage: "Görsel yüklemeden önce bölge kodunu girin.",
      uploadFailed: "Görsel yüklenemedi. Lütfen tekrar deneyin.",
      startingPrice: "Başlangıç fiyatı",
      startingPriceHint:
        "Anasayfada gösterilecek başlangıç fiyatı (EUR) zorunludur.",
    },
  },
  pricing: {
    title: "Fiyatlandırma",
    subtitle:
      "Havalimanından bölgeye, araç kategorisine göre rota fiyatları (EUR).",
    airport: "Havalimanı",
    selectAirport: "Havalimanı seçin",
    selectVehicle: "Araç kategorisi",
    filterDistrict: "Bölge ara",
    filterDistrictPlaceholder: "Bölge adı veya kodu...",
    editingContext: (vehicle: string) => `${vehicle} fiyatları düzenleniyor`,
    pricesFilled: "fiyat girildi",
    noDistrictMatch: "Aramanızla eşleşen bölge bulunamadı.",
    emptyVehicles:
      "Fiyat girebilmek için önce en az bir aktif araç kategorisi ekleyin.",
    saveHint:
      "Kaydet tüm havalimanı, bölge ve araç kombinasyonlarındaki dolu EUR fiyatlarını günceller.",
    load: "Yükle",
    emptyAirport: "Fiyat tanımlamadan önce bir havalimanı konumu ekleyin.",
    district: "Bölge",
    oneWay: "Tek yön",
    roundTrip: "Gidiş-dönüş",
    savePrices: "Fiyatları kaydet",
    saving: "Kaydediliyor...",
    saved: "Fiyatlar kaydedildi.",
  },
  currencies: {
    title: "Nakit ödeme kurları",
    subtitle:
      "Araç başında nakit olarak kabul edilen para birimleri. Fiyatlandırmayı etkilemez; sitede yalnızca bilgilendirme amaçlı gösterilir.",
    formTitle: "Kabul edilen nakit para birimleri",
    hint: "Tüm fiyatlar EUR olarak hesaplanır. Seçilen kurlar rezervasyon sayfasında nakit ödeme seçenekleri olarak gösterilir.",
    saveHint:
      "Değişiklikler rezervasyon akışındaki nakit ödeme bilgilendirmesini günceller.",
    activeCount: (active: number, total: number) => `${active}/${total} seçili`,
    activeLabel: "Seçili",
    save: "Kaydet",
    saving: "Kaydediliyor...",
    saved: "Nakit ödeme kurları güncellendi.",
    open: "Nakit ödeme kurlarını yönet",
  },
  extras: {
    title: "Extralar",
    subtitle:
      "Ek hizmetleri ve para birimine göre fiyatlarını yönetin. Müşteri seçilebilir veya otomatik önerilen extralar tanımlayabilirsiniz.",
    addNew: "Yeni extra",
    newTitle: "Yeni extra",
    editTitle: "Extra düzenle",
    newSubtitle: "Yeni bir ek hizmet kaydı oluşturun.",
    editSubtitle: "Ek hizmet bilgilerini ve fiyatlarını güncelleyin.",
    table: {
      name: "Ad",
      code: "Kod",
      pricingMode: "Fiyatlandırma",
      prices: "Fiyatlar",
      status: "Durum",
      actions: "İşlemler",
      edit: "Düzenle",
      delete: "Sil",
    },
    delete: {
      button: "Sil",
      confirm: (name: string) =>
        `"${name}" ekstrasını silmek istediğinize emin misiniz? Geçmiş rezervasyonlarda kullanıldıysa kayıt arşivlenir.`,
      deleting: "Siliniyor...",
    },
    form: {
      code: "Kod",
      name: "Ad",
      pricingMode: "Fiyatlandırma tipi",
      customerSelectable: "Müşteri seçebilir",
      autoSuggested: "Otomatik önerilir (bagaj vb.)",
      minQuantity: "Minimum adet",
      maxQuantity: "Maksimum adet",
      maxQuantityHint: "Boş bırakılırsa sınırsız",
      includedQuantity: "Ücretsiz dahil adet",
      includedQuantityHint:
        "Adet başına fiyatlandırmada ücretsiz sayılacak adet (ör. 1 = ilk adet ücretsiz). Sabit fiyatta yok sayılır.",
      luggageCapacityPerUnit: "Birim bagaj kapasitesi",
      luggageCapacityHint: "Otomatik önerilen bagaj extraları için",
      sortOrder: "Sıralama",
      active: "Aktif",
      pricesTitle: "Fiyatlar",
      pricesHint: "EUR cinsinden fiyat girin.",
      priceLabel: (currency: string) => `Fiyat (${currency})`,
      create: "Oluştur",
      save: "Kaydet",
      saving: "Kaydediliyor...",
      cancel: "İptal",
    },
    pricingModes: {
      FIXED: "Sabit fiyat",
      PER_UNIT: "Birim başına",
    },
  },
  contact: {
    title: "İletişim bilgileri",
    subtitle:
      "Sitede gösterilecek e-posta, telefon ve WhatsApp numaralarını yönetin. Her kanaldan birden fazla kayıt ekleyebilirsiniz.",
    formTitle: "İletişim kanalları",
    hint: "Pasif işaretlenen kayıtlar sitede gösterilmez.",
    saveHint: "Kaydettiğinizde iletişim bilgileri sitede güncellenir.",
    summary: (total: number, active: number) =>
      `${total} kayıt · ${active} aktif`,
    save: "Kaydet",
    saving: "Kaydediliyor...",
    saved: "İletişim bilgileri güncellendi.",
    addEmail: "E-posta ekle",
    addPhone: "Telefon ekle",
    addWhatsapp: "WhatsApp ekle",
    sections: {
      email: "E-posta",
      phone: "Telefon",
      whatsapp: "WhatsApp",
    },
    sectionHints: {
      email: "Müşteri ve rezervasyon bildirimleri için.",
      phone: "Arama ve genel iletişim hatları.",
      whatsapp: "Hızlı mesajlaşma numaraları.",
    },
    fields: {
      value: "Değer",
      active: "Aktif",
      remove: "Kaldır",
    },
    placeholders: {
      email: "ornek@sirket.com",
      phone: "+90 242 123 45 67",
      whatsapp: "+905551234567",
    },
    empty: "Henüz kayıt yok",
    emailTest: {
      title: "E-posta testi",
      description:
        "SMTP ayarlarınızı doğrulamak için örnek bir rezervasyon maili gönderin. Veritabanına kayıt oluşturulmaz.",
      button: "Mail gönder",
      sending: "Gönderiliyor...",
      hint: "Müşteri şablonu TEST_NOTIFICATION_EMAIL adresine, admin şablonu ADMIN_NOTIFICATION_EMAIL adresine gider.",
      openPreview: "Şablonu önizle",
      success: (customerEmail: string, adminEmail: string) =>
        `Test mailleri gönderildi. Müşteri: ${customerEmail} · Admin: ${adminEmail}`,
    },
    emailPreview: {
      title: "E-posta şablon önizleme",
      subtitle:
        "Rezervasyon maillerinin tarayıcıda nasıl görüneceğini inceleyin. Örnek verilerle oluşturulur.",
      customerTab: "Müşteri maili",
      adminTab: "Admin maili",
      localeLabel: "Dil",
      backToContact: "İletişim ayarlarına dön",
      subjectLabel: "Konu satırı",
      iframeTitle: "E-posta şablon önizlemesi",
    },
  },
  locales: {
    title: "Dil seçenekleri",
    subtitle:
      "Sitedeki dil seçicisinde hangi dillerin görüneceğini yönetin. Desteklenen diller sabittir; yalnızca aktif/pasif durumunu değiştirebilirsiniz.",
    formTitle: "Desteklenen diller",
    hint: "Pasif diller dil seçicisinde gösterilmez. Varsayılan dil (Türkçe) her zaman aktiftir.",
    saveHint: "Değişiklikler kaydedildiğinde site dil seçicisi güncellenir.",
    defaultBadge: "Varsayılan dil",
    activeCount: (active: number, total: number) => `${active}/${total} aktif`,
    save: "Kaydet",
    saving: "Kaydediliyor...",
    saved: "Dil seçenekleri güncellendi.",
    fields: {
      active: "Aktif",
    },
  },
  translations: {
    sectionTitle: "Çeviriler",
    hint: "Sistemde aktif olan her dil için metin girin. Varsayılan dil zorunludur.",
    name: "Ad",
    required: "zorunlu",
  },
  vehicles: {
    title: "Araçlar",
    subtitle:
      "Filo araçlarını yönetin. Aktif araçlar anasayfa ve filo sayfasında görünür; rezervasyon için Fiyatlandırma matrisinde rota fiyatları girilmelidir.",
    addNew: "Yeni araç",
    newTitle: "Yeni araç",
    editTitle: "Araç düzenle",
    newSubtitle: "Yeni bir araç kategorisi oluşturun.",
    editSubtitle: "Araç bilgilerini ve görsellerini güncelleyin.",
    table: {
      vehicle: "Araç",
      code: "Kod",
      capacity: "Kapasite",
      features: "Özellikler",
      status: "Durum",
      startingPrice: "Başlangıç fiyatı",
      actions: "İşlemler",
      edit: "Düzenle",
      delete: "Sil",
      passengers: (count: number) => `${count} kişi`,
    },
    delete: {
      button: "Sil",
      confirm: (name: string) =>
        `"${name}" aracını silmek istediğinize emin misiniz? Geçmiş rezervasyonlarda kullanıldıysa kayıt arşivlenir.`,
      deleting: "Siliniyor...",
    },
    form: {
      code: "Kod",
      brand: "Marka",
      model: "Model",
      displayName: "Görünen ad",
      passengerCapacity: "Maksimum yolcu",
      largeLuggageCapacity: "Bagaj kapasitesi",
      featuresTitle: "Özellikler",
      featuresHint:
        "Araçta bulunan özellikleri her dil için ayrı ayrı girin. En fazla 5 özellik ekleyebilirsiniz.",
      featuresLimit: (count: number, max: number) => `${count}/${max} özellik`,
      addFeature: "Özellik ekle",
      featureLabel: "Özellik",
      removeFeature: "Kaldır",
      featuresEmpty: "Henüz özellik eklenmedi.",
      coverImage: "Kapak fotoğrafı",
      coverImageHint: "16:9 oranında kırpılarak Cloudinary'ye yüklenir.",
      galleryImages: "Ek fotoğraflar (en fazla 10)",
      galleryImagesHint:
        "Kapak görseli rezervasyonda her zaman görünür. Ek fotoğraflardan en fazla 3 tanesini carousel önizlemesine ekleyebilirsiniz. Seçim yapmazsanız ilk 3 ek fotoğraf otomatik kullanılır.",
      galleryImageLabel: (index: number) => `Fotoğraf ${index}`,
      bulkUploadGallery: "Toplu görsel yükle",
      bulkUploadGalleryHint: (remaining: number) =>
        `Tek seferde en fazla ${remaining} görsel seçebilirsiniz.`,
      gallerySlotsUsed: (used: number, max: number) => `${used}/${max} fotoğraf`,
      cropProgress: (current: number, total: number) =>
        `Görseli kırp (${current}/${total})`,
      showInBookingPreview: "Rezervasyonda göster",
      bookingPreviewLimit: (count: number, max: number) =>
        `${count}/${max} ek fotoğraf seçildi (kapak her zaman görünür)`,
      uploadImage: "Görsel yükle",
      replaceImage: "Görseli değiştir",
      removeImage: "Kaldır",
      uploadPlaceholder: "16:9 görsel yükleyin",
      uploading: "Yükleniyor...",
      cropping: "Kırpılıyor...",
      cropTitle: "Görseli kırp",
      cropHint: "Araç detaylarında kullanılacak 16:9 görseli ayarlayın.",
      cropZoom: "Yakınlaştırma",
      cropConfirm: "Kırp ve yükle",
      identityRequiredForUpload:
        "Görsel yüklemeden önce kod, marka ve model alanlarını doldurun.",
      uploadFailed: "Görsel yüklenemedi. Lütfen tekrar deneyin.",
      sortOrder: "Sıralama",
      active: "Aktif",
      startingPrice: "Başlangıç fiyatı",
      startingPriceHint:
        "Sitede \"X €'dan başlayan\" metni olarak gösterilir. Boş bırakılırsa rota fiyatlarından otomatik hesaplanır. Rezervasyonda görünmesi için Fiyatlandırma sayfasında rota fiyatları da girilmelidir.",
      create: "Oluştur",
      save: "Kaydet",
      saving: "Kaydediliyor...",
      cancel: "İptal",
    },
  },
  dashboard: {
    title: "Genel bakış",
    subtitle:
      "Rezervasyon, gelir ve operasyonel özet — tüm gelirler EUR cinsinden.",
    kpi: {
      totalReservations: "Toplam rezervasyon",
      upcoming: "Gelecek seferler",
      completed: "Tamamlanan / geçmiş",
      cancelled: "İptal edilen",
      cancellationRate: "İptal oranı",
      totalPassengers: "Toplam yolcu",
      oneWay: "Tek yön",
      roundTrip: "Gidiş-dönüş",
    },
    revenueSection: {
      title: "Toplam gelir (EUR)",
      hint: "Muhasebe kayıtları yalnızca EUR cinsinden gösterilir.",
      upcoming: "Gelecek",
      completed: "Tamamlanan",
      cancelled: "İptal",
      reservations: (count: number) => `${count} rezervasyon`,
    },
    charts: {
      trendTitle: "Rezervasyon trendi",
      trendWeekly: "Haftalık",
      trendMonthly: "Aylık",
      trendCount: "Rezervasyon",
      vehiclesTitle: "Araç dağılımı",
      vehiclesHint: "En çok tercih edilen araç kategorileri",
      routesTitle: "Popüler rotalar",
      routesHint: "En çok rezervasyon alan güzergâhlar",
      statusTitle: "Durum dağılımı",
      currencyTitle: "Para birimi tercihi",
      currencyHint: "İptal hariç rezervasyonların para birimi dağılımı",
      weekdayTitle: "Haftanın günleri",
      weekdayHint: "Kalkış tarihine göre yoğunluk",
      empty: "Henüz veri yok",
    },
    recent: {
      title: "Son rezervasyonlar",
      viewAll: "Tümünü gör",
      reference: "Referans",
      customer: "Müşteri",
      route: "Rota",
      date: "Tarih",
      status: "Durum",
      total: "Toplam",
    },
  },
  reservations: {
    title: "Rezervasyonlar",
    subtitle: "Rezervasyon taleplerini ve varış noktası bilgilerini inceleyin.",
    recent: "Son rezervasyonlar",
    view: "Görüntüle",
    detailSubtitle: "Rezervasyon detayları ve fiyatlandırma bağlamı.",
    trip: "Yolculuk",
    customer: "Müşteri",
    routeAndDropoff: "Rota ve varış",
    lineItems: "Kalemler",
    table: {
      reference: "Referans",
      customer: "Müşteri",
      origin: "Kalkış",
      pricingDestination: "Fiyatlandırma bölgesi",
      actualDropoff: "Gerçek varış",
      status: "Durum",
      total: "Toplam",
      actions: "İşlemler",
      item: "Kalem",
      qty: "Adet",
      unit: "Birim",
    },
    fields: {
      status: "Durum",
      tripType: "Yolculuk tipi",
      outbound: "Gidiş",
      return: "Dönüş",
      passengers: "Yolcu",
      luggage: "Bagaj",
      name: "Ad",
      email: "E-posta",
      phone: "Telefon",
      hotel: "Otel",
      customDestination: "Özel varış",
      customAddress: "Özel adres",
      routeSnapshot: "Rota özeti",
      dropoffSnapshot: "Varış özeti",
      subtotal: "Ara toplam",
      total: "Toplam",
    },
  },
} as const;

export const LOCATION_TYPE_LABELS: Record<AdminLocationType, string> = {
  AIRPORT: "Havalimanı",
  CITY: "Şehir",
  DISTRICT: "Bölge",
  HOTEL: "Otel",
};

const RESERVATION_STATUS_LABELS: Record<ReservationStatus, string> = {
  PENDING: "Beklemede",
  CONFIRMED: "Onaylandı",
  CANCELLED: "İptal edildi",
  COMPLETED: "Tamamlandı",
};

const TRIP_TYPE_LABELS: Record<TripType, string> = {
  ONE_WAY: "Tek yön",
  ROUND_TRIP: "Gidiş-dönüş",
};

const ADMIN_ERROR_MESSAGES: Record<string, string> = {
  "Geçersiz e-posta veya şifre": "Geçersiz e-posta veya şifre",
  "Doğrulama başarısız": "Doğrulama başarısız",
  "Validation failed": "Doğrulama başarısız",
  "Geçerli bir e-posta adresi girin": "Geçerli bir e-posta adresi girin",
  "En az bir aktif dil olmalıdır": "En az bir aktif dil olmalıdır",
  "Varsayılan dil pasif yapılamaz": "Varsayılan dil pasif yapılamaz",
  "Varsayılan dil için çeviri zorunludur": "Varsayılan dil için çeviri zorunludur",
  "Geçersiz dil kodu": "Geçersiz dil kodu",
  "Aynı dil birden fazla kez eklenemez": "Aynı dil birden fazla kez eklenemez",
  "An unexpected error occurred": "Beklenmeyen bir hata oluştu",
  "Reservation not found": "Rezervasyon bulunamadı",
  "Location not found": "Konum bulunamadı",
  "Parent location not found": "Üst konum bulunamadı",
  "Unauthorized": "Yetkisiz erişim",
  "Expected a hotel location": "Bir otel konumu bekleniyordu",
  "Hotel is not active": "Otel aktif değil",
  "Hotel does not belong to the selected district":
    "Otel seçilen bölgeye ait değil",
  "Origin must be an active airport": "Kalkış noktası aktif bir havalimanı olmalı",
  "Destination must be an active district":
    "Varış noktası aktif bir bölge olmalı",
  "En az bir para birimi seçmelisiniz": "En az bir para birimi seçmelisiniz",
  "En az bir geçerli fiyat girmelisiniz": "En az bir geçerli fiyat girmelisiniz",
  "Extra not found": "Extra bulunamadı",
  "Vehicle not found": "Araç bulunamadı",
  INVALID_IMAGE_DATA: "Geçersiz görsel verisi",
  SMTP_NOT_CONFIGURED:
    "SMTP yapılandırılmamış. .env.local dosyasında SMTP_HOST, SMTP_PORT, SMTP_USER ve SMTP_PASSWORD değerlerini ayarlayın.",
  UNSUPPORTED_IMAGE_TYPE: "Desteklenmeyen görsel formatı",
  IMAGE_TOO_LARGE: "Görsel boyutu çok büyük (en fazla 10 MB)",
  EMPTY_IMAGE: "Boş görsel yüklenemez",
  VEHICLE_IDENTITY_REQUIRED: "Kod, marka ve model zorunludur",
  VEHICLE_BOOKING_PREVIEW_LIMIT:
    "Rezervasyon carousel'ine en fazla 3 ek fotoğraf seçebilirsiniz",
  FEATURED_IMAGE_REQUIRED:
    "Anasayfada gösterilecek bölgeler için görsel zorunludur",
  FEATURED_PRICE_REQUIRED:
    "Anasayfada gösterilecek bölgeler için tüm para birimlerinde başlangıç fiyatı girilmelidir",
  LOCATION_NOT_FOUND: "Konum bulunamadı",
};

export function formatReservationStatus(status: string): string {
  return (
    RESERVATION_STATUS_LABELS[status as ReservationStatus] ?? status
  );
}

export function formatTripType(tripType: string): string {
  return TRIP_TYPE_LABELS[tripType as TripType] ?? tripType;
}

export function formatExtraPricingMode(mode: string): string {
  return (
    adminCopy.extras.pricingModes[mode as ExtraPricingMode] ?? mode
  );
}

export function translateAdminError(message: string): string {
  if (ADMIN_ERROR_MESSAGES[message]) {
    return ADMIN_ERROR_MESSAGES[message];
  }

  if (message.startsWith("Invalid parent type")) {
    return "Seçilen üst konum bu konum tipi için geçerli değil";
  }

  if (
    message.includes("535") ||
    message.includes("Invalid login") ||
    message.includes("BadCredentials")
  ) {
    return "Gmail girişi reddedildi. SMTP_USER için tam Gmail adresinizi ve bu hesap için oluşturulmuş geçerli bir App Password kullanın. SMTP_FROM_EMAIL, Gmail ile aynı adres olmalıdır.";
  }

  return message;
}
