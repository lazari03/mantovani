export interface ServiceDetail {
  num: string;
  title: string;
  desc: string;
  image: string;
  fullDescription: string;
  features: string[];
  applications: string[];
  benefits: string[];
}

export const servicesData: ServiceDetail[] = [
  {
    num: '01',
    title: 'Prodhim betoni',
    desc: 'Beton i prodhuar sipas standardeve të kërkuara për ndërtime rezidenciale, industriale dhe infrastrukturore.',
    image: '/assets/services/service-1.jpg',
    fullDescription: 'Ne ofrojmë beton të cilësisë së lartë, të prodhuar me teknologjinë më të fundit dhe në përputhje të plotë me standardet ndërkombëtare. Procesi ynë i prodhimit garanton homogjenitet, qëndrueshmëri dhe rezistencë maksimale ndaj kushteve atmosferike. Çdo porosi trajtohet me kujdes të veçantë për të siguruar përputhjen e përmbajtjes dhe karakteristikave teknike me kërkesat specifike të projektit tuaj.',
    features: [
      'Beton m100 - m500 në përputhje me standardet europiane',
      'Sisteme automatike të dozimit për precizion maksimal',
      'Kontroll cilësie në çdo fazë të prodhimit',
      'Përzjerje homogjene me mikserë të teknologjisë së fundit',
      'Prodhim sipas formulave specifike të klientit',
    ],
    applications: [
      'Bazamentet dhe themelet e ndërtesave',
      'Kolonat dhe trarët strukturorë',
      'Dyshemetë industriale dhe tregtare',
      'Përrodat dhe sistemet hidraulike',
      'Rrugët dhe parkimet',
    ],
    benefits: [
      'Cilësi e garantuar me certifikata ndërkombëtare',
      'Dorëzim i shpejtë në kantier',
      'Këshillim teknik falas nga inxhinierët tanë',
      'Çmime konkurruese në treg',
      'Disponueshmëri 24/7 për projekte urgjente',
    ],
  },
  {
    num: '02',
    title: 'Elemente betoni',
    desc: 'Prodhim dhe furnizim me produkte betoni për nevoja të ndryshme ndërtimi.',
    image: '/assets/services/service-2.jpg',
    fullDescription: 'Produkte betoni të prefabrikuara për çdo nevojë ndërtimi. Ofrojmë një gamë të gjerë elementesh që shkurtojnë kohën e ndërtimit dhe garantojnë cilësi të qëndrueshme. Elementet tona prodhohen në ambiente të kontrolluara, duke eliminuar faktorët e motit nga procesi i prodhimit.',
    features: [
      'Tulla betoni të ndryshme madhësi dhe densiteti',
      'Rrjete dhe kolona betoni të armuara',
      'Kanale dhe gypa betoni për infrastrukturë',
      'Dysheme dhe mure prefabrikuar',
      'Elemente dekorative betoni',
    ],
    applications: [
      'Mure mbajtëse dhe ndarëse',
      'Sisteme hidraulike dhe kullimi',
      'Rrugë dhe trotuare',
      'Kopshte dhe ambient të jashtëm',
      'Vila dhe ndërtesa rezidenciale',
    ],
    benefits: [
      'Shkurtim i kohës së ndërtimit deri në 40%',
      'Cilësi e qëndrueshme pa variacione',
      'Mos-ekspozim ndaj motit gjatë prodhimit',
      'Montohen shpejt dhe lehtë',
      'Jetëgjatësi e lartë dhe kosto e ulët mirëmbajtjeje',
    ],
  },
  {
    num: '03',
    title: 'Punime ndërtimi',
    desc: 'Realizim punimesh ndërtimore për objekte private, biznese dhe projekte publike.',
    image: '/assets/services/service-3.jpg',
    fullDescription: 'Ekipi ynë i specializuar ofron shërbime të plota ndërtimi, duke filluar nga themelimi deri në dorëzimin përfundimtar të objektit. Puna jonë karakterizohet nga profesionalizmi, respektimi i afateve dhe cilësia e pa kompromis në çdo detaj.',
    features: [
      'Ndërtim objektesh rezidenciale dhe komerciale',
      'Rikonstruksion dhe rinovim i ndërtesave ekzistuese',
      'Punime gipsi, molerimi dhe fasade',
      'Instalime hidraulike dhe elektrike',
      'Punime finiture dhe dekorimi i brendshëm',
    ],
    applications: [
      'Shtëpi private dhe vila luksoze',
      'Zyre, dyqane dhe qendra tregtare',
      'Shkolla, çerdhe dhe institucione publike',
      'Magazina dhe hale industriale',
      'Objekte turistike dhe hoteleri',
    ],
    benefits: [
      'Ekip i certifikuar dhe me përvojë shumëvjeçare',
      'Respektim strikt i afateve të kontraktuara',
      'Transparencë totale në kosto dhe proces',
      'Materiale cilësore nga furnitorë të certifikuar',
      'Garanci për të gjitha punimet e kryera',
    ],
  },
  {
    num: '04',
    title: 'Punime infrastrukturore',
    desc: 'Zgjidhje për rrugë, kanalizime, rikonstruksione dhe ndërhyrje të tjera infrastrukturore.',
    image: '/assets/services/service-4.jpg',
    fullDescription: 'Specialistë në projekte infrastrukturore të shkallës së mesme dhe të madhe. Ofronim zgjidhje të qëndrueshme për rrjetet rrugore, sistemet e ujërave dhe projektet publike që përmirësojnë cilësinë e jetës në komunitet.',
    features: [
      'Ndërtim dhe rikonstruksion rrugësh',
      'Sisteme kanalizimesh dhe kolektoresh',
      'Rrjete ujësjellësi dhe ujëmbledhësish',
      'Muratura mbajtëse dhe inxhinieri tokësore',
      'Sheshe publike dhe hapësira të gjelbërta',
    ],
    applications: [
      'Rrugë qytetase dhe rurale',
      'Parkingje dhe qendra logjistike',
      'Parqe dhe zona rekreative',
      'Sisteme kullimi në zona malore',
      'Platforma industriale dhe depo',
    ],
    benefits: [
      'Ekspertizë në projekte komplekse infrastrukturore',
      'Pajisje të specializuara dhe moderne',
      'Përputhje me normat e mbrojtjes mjedisore',
      'Koordinim me autoritetet vendore për leje',
      'Qëndrueshmëri e provuar në vite',
    ],
  },
  {
    num: '05',
    title: 'Transport dhe furnizim',
    desc: 'Transport i materialeve dhe shërbim i shpejtë për furnizim në kantier.',
    image: '/assets/services/service-5.jpg',
    fullDescription: 'Shërbim i shpejtë dhe i sigurt transporti për çdo lloj materiali ndërtimi. Flota jonë moderne e kamionëve të betonit dhe mjeteve të tjera të transportit garanton që materiali të mbërrijë në kantier në kohë dhe në gjendje perfekte.',
    features: [
      'Kamionë betonierë me kapacitet 7-9 m³',
      'Transport materialesh të rënda dhe të lehta',
      'Sisteme GPS për ndjekje në kohë reale',
      'Makinje ngarkimi dhe shkarkimi',
      'Shërbim emergjent 24 orë',
    ],
    applications: [
      'Dorëzim betoni i freskët në kantier',
      'Transport agregatesh dhe inertesh',
      'Furnizim me elemente betoni të prefabrikuara',
      'Evakuim mbeturinash ndërtimi',
      'Zhvendosje makinerish ndërtimi',
    ],
    benefits: [
      'Kursim kohe dhe kosto logjistike',
      'Saktësi në oraret e dorëzimit',
      'Mbrojtje e ngarkesës gjatë transportit',
      'Çmime transparente pa kosto të fshehura',
      'Mbulesë në të gjithë territorin e vendit',
    ],
  },
];

export const getServiceById = (id: string): ServiceDetail | undefined => {
  return servicesData.find((service) => service.num === id);
};
