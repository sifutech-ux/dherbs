export type Lang = "bm" | "en"

export type Step = {
  index: string
  title: string
  body: string
}

export type Copy = {
  nav: {
    house: string
    arrangement: string
    mandate: string
    letter: string
    note: string
    menu: string
    close: string
    pages: string
  }
  eyebrow: string
  hero: string
  scroll: string
  plan: {
    label: string
    nodes: Step[]
  }
  principles: {
    label: string
    items: Step[]
  }
  close: {
    title: string
    body: string
    cta: string
  }
  arrangement: {
    label: string
    title: string
    lede: string
    steps: Step[]
  }
  mandate: {
    label: string
    title: string
    lede: string
    formsLabel: string
    forms: Step[]
    boundaryLabel: string
    boundary: string
  }
  letter: {
    label: string
    title: string
    lede: string
    name: string
    nameHint: string
    reply: string
    replyHint: string
    goods: string
    goodsHint: string
    qty: string
    qtyHint: string
    note: string
    noteHint: string
    send: string
    addressLabel: string
    sent: string
    copied: string
    copy: string
    another: string
    required: string
    subject: string
  }
  note: {
    label: string
    title: string
    paragraphs: string[]
  }
  missing: {
    title: string
    body: string
    cta: string
  }
  footer: {
    mark: string
  }
}

export const copy: Record<Lang, Copy> = {
  bm: {
    nav: {
      house: "Rumah",
      arrangement: "Urusan",
      mandate: "Amanah",
      letter: "Surat",
      note: "Nota",
      menu: "Menu",
      close: "Tutup",
      pages: "Muka surat",
    },
    eyebrow: "L&A World · Rumah Belian",
    hero: "Kami membeli secara pukal, supaya harga sumber sampai kepada anda.",
    scroll: "Teruskan",
    plan: {
      label: "Pelan rumah",
      nodes: [
        {
          index: "01",
          title: "Anda",
          body: "Barang dan kuantiti yang anda perlukan.",
        },
        {
          index: "02",
          title: "L&A",
          body: "Rumah ini menghadap sumber bagi pihak anda.",
        },
        {
          index: "03",
          title: "Sumber",
          body: "Syarikat yang memberi harga pada volum.",
        },
      ],
    },
    principles: {
      label: "Tiga prinsip",
      items: [
        {
          index: "01",
          title: "Volum",
          body: "Belian dibuat dalam kuantiti yang pembekal layan dengan serius. Bukan seunit. Bukan runcit.",
        },
        {
          index: "02",
          title: "Harga sumber",
          body: "Nilai datang dari akses kepada harga pukal, harga yang terbuka apabila belian cukup besar.",
        },
        {
          index: "03",
          title: "Diam",
          body: "Yang disebut di atas kertas ini ialah L&A. Urusan tidak memerlukan nama lain.",
        },
      ],
    },
    close: {
      title: "Satu surat sudah memadai.",
      body: "Nyatakan barang dan kuantiti. Rumah membalas apabila amanah itu boleh dibawa kepada sumber.",
      cta: "Tulis kepada rumah",
    },
    arrangement: {
      label: "Cara urusan",
      title: "Rumah ini tidak menjual dari rak.",
      lede: "Setiap urusan bermula sebagai amanah. Anda menyerahkan apa yang hendak dibeli. L&A yang berdiri di hadapan syarikat pembekal.",
      steps: [
        {
          index: "01",
          title: "Nyatakan",
          body: "Barang, kuantiti, dan bila anda memerlukannya.",
        },
        {
          index: "02",
          title: "Nilai",
          body: "L&A menyemak sama ada volum itu layak dibawa kepada sumber.",
        },
        {
          index: "03",
          title: "Sumber",
          body: "Rumah menghadap pembekal atas nama L&A, dan meminta harga belian besar.",
        },
        {
          index: "04",
          title: "Sahkan",
          body: "Harga dan barang disahkan dengan anda sebelum apa-apa bergerak.",
        },
      ],
    },
    mandate: {
      label: "Amanah",
      title: "Apa yang rumah ini pegang.",
      lede: "L&A ialah pihak ketiga. Anda tidak perlu berurusan terus dengan sumber untuk mendapatkan harga yang biasanya hanya terbuka pada belian besar.",
      formsLabel: "Bentuk amanah",
      forms: [
        {
          index: "01",
          title: "Berulang",
          body: "Stok yang diisi semula pada kadar yang tetap.",
        },
        {
          index: "02",
          title: "Sekali",
          body: "Satu penghantaran untuk keperluan yang tertentu.",
        },
        {
          index: "03",
          title: "Tersusun",
          body: "Beberapa barang dikumpulkan dalam satu volum.",
        },
      ],
      boundaryLabel: "Batasan",
      boundary:
        "Rumah ini tidak melayan belian seunit, jualan runcit, atau permintaan yang belum mempunyai kuantiti. Setiap amanah dinilai satu persatu.",
    },
    letter: {
      label: "Surat",
      title: "Tulis kepada rumah.",
      lede: "Nyatakan apa yang hendak dibeli. Beberapa baris sudah memadai untuk memulakan.",
      name: "Nama",
      nameHint: "Nama anda, atau nama syarikat",
      reply: "Untuk dibalas",
      replyHint: "Emel atau nombor telefon",
      goods: "Barang",
      goodsHint: "Apa yang hendak dibeli",
      qty: "Kuantiti",
      qtyHint: "Anggaran volum",
      note: "Nota",
      noteHint: "Masa, tempat, atau apa-apa yang perlu diketahui",
      send: "Hantar surat",
      addressLabel: "Dialamatkan kepada",
      sent: "Surat ini dialamatkan kepada rumah. Ia dibuka dalam aplikasi mel anda.",
      copied: "Surat disalin.",
      copy: "Salin surat",
      another: "Tulis surat lain",
      required: "Perlu diisi.",
      subject: "Amanah belian",
    },
    note: {
      label: "Nota",
      title: "Bagaimana laman ini berkelakuan.",
      paragraphs: [
        "Laman ini tidak memasang penjejak iklan, dan tidak menjual perhatian anda.",
        "Butiran yang anda tulis dalam surat digunakan untuk menilai amanah belian sahaja.",
        "Nama individu di sebalik L&A tidak dipaparkan. Rumah ini yang berurusan.",
      ],
    },
    missing: {
      title: "Muka ini tidak ada.",
      body: "Alamat yang anda buka tidak berada dalam rumah ini.",
      cta: "Kembali ke rumah",
    },
    footer: {
      mark: "Rumah belian",
    },
  },
  en: {
    nav: {
      house: "House",
      arrangement: "Arrangement",
      mandate: "Mandate",
      letter: "Letter",
      note: "Note",
      menu: "Menu",
      close: "Close",
      pages: "Pages",
    },
    eyebrow: "L&A World · Buying House",
    hero: "We buy in volume, so the source price can reach you.",
    scroll: "Continue",
    plan: {
      label: "Plan of the house",
      nodes: [
        {
          index: "01",
          title: "You",
          body: "The goods, and the quantity you need.",
        },
        {
          index: "02",
          title: "L&A",
          body: "The house faces the source on your behalf.",
        },
        {
          index: "03",
          title: "Source",
          body: "The company that prices for volume.",
        },
      ],
    },
    principles: {
      label: "Three principles",
      items: [
        {
          index: "01",
          title: "Volume",
          body: "Purchases are made in quantities a supplier takes seriously. Not a single unit. Not retail.",
        },
        {
          index: "02",
          title: "Source price",
          body: "The value is access to the bulk price, the price that opens when the order is large enough.",
        },
        {
          index: "03",
          title: "Discretion",
          body: "The name on this paper is L&A. The arrangement does not require another.",
        },
      ],
    },
    close: {
      title: "One letter is enough.",
      body: "Name the goods and the quantity. The house replies when the mandate can be carried to the source.",
      cta: "Write to the house",
    },
    arrangement: {
      label: "The arrangement",
      title: "This house does not sell from a shelf.",
      lede: "Every arrangement begins as a mandate. You state what is to be bought. L&A stands in front of the supplying company.",
      steps: [
        {
          index: "01",
          title: "State",
          body: "The goods, the quantity, and when you need them.",
        },
        {
          index: "02",
          title: "Weigh",
          body: "L&A considers whether the volume is fit to carry to the source.",
        },
        {
          index: "03",
          title: "Source",
          body: "The house faces the supplier in the name of L&A, and asks for the bulk price.",
        },
        {
          index: "04",
          title: "Confirm",
          body: "Price and goods are confirmed with you before anything moves.",
        },
      ],
    },
    mandate: {
      label: "Mandate",
      title: "What this house holds.",
      lede: "L&A is the third party. You do not have to face the source yourself to reach a price that usually opens only for a large buy.",
      formsLabel: "Forms of mandate",
      forms: [
        {
          index: "01",
          title: "Repeat",
          body: "Stock restored on a steady rhythm.",
        },
        {
          index: "02",
          title: "Once",
          body: "A single shipment for a particular need.",
        },
        {
          index: "03",
          title: "Composed",
          body: "Several goods gathered into one volume.",
        },
      ],
      boundaryLabel: "Boundary",
      boundary:
        "The house does not take single units, retail sales, or requests that have no quantity yet. Each mandate is weighed on its own.",
    },
    letter: {
      label: "Letter",
      title: "Write to the house.",
      lede: "Say what is to be bought. A few lines are enough to begin.",
      name: "Name",
      nameHint: "Your name, or a company name",
      reply: "Reply to",
      replyHint: "Email or telephone",
      goods: "Goods",
      goodsHint: "What is to be bought",
      qty: "Quantity",
      qtyHint: "Estimated volume",
      note: "Note",
      noteHint: "Timing, place, or anything the house should know",
      send: "Send the letter",
      addressLabel: "Addressed to",
      sent: "This letter is addressed to the house. It opens in your mail app.",
      copied: "Letter copied.",
      copy: "Copy the letter",
      another: "Write another",
      required: "Required.",
      subject: "Buying mandate",
    },
    note: {
      label: "Note",
      title: "How this site behaves.",
      paragraphs: [
        "This site carries no advertising trackers, and it does not sell your attention.",
        "What you write in a letter is used only to weigh a buying mandate.",
        "The name of any person behind L&A is not shown. The house conducts the arrangement.",
      ],
    },
    missing: {
      title: "This page is not in the house.",
      body: "The address you opened does not belong here.",
      cta: "Return to the house",
    },
    footer: {
      mark: "Buying house",
    },
  },
}
