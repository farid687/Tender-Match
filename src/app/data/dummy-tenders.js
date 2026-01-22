// Dummy data matching the screenshot structure
export const dummyTenders = [
  {
    id: 1,
    firstExpiryDate: '28-12-2025 (Initieel)',
    tenderName: 'Raamovereenkomst turn key inhuren woon-/w...',
    contractingAuthority: 'Commando Landstrijdkrachten (CLAS)',
    value: '€ 1.371.900',
    startDate: '28-12-2021',
    initialDuration: '4 Jaar',
    ini: '28',
  },
  {
    id: 2,
    firstExpiryDate: '',
    tenderName: 'Europese openbare aanbesteding Technisch ICT ...',
    contractingAuthority: 'Gemeente Zaanstad',
    value: '',
    startDate: '',
    initialDuration: '',
    ini: '',
    isParent: true,
  },
  {
    id: 3,
    firstExpiryDate: '29-12-2025 (Definitief)',
    tenderName: 'Perceel 1: Netwerkbeheer',
    contractingAuthority: '',
    value: '€ 2.200.000',
    startDate: '29-12-2017',
    initialDuration: '3 Jaar',
    ini: '29',
    parentId: 2,
  },
  {
    id: 4,
    firstExpiryDate: '29-12-2025 (Definitief)',
    tenderName: 'Perceel 2: Databasebeheer',
    contractingAuthority: '',
    value: '€ 1.500.000',
    startDate: '29-12-2017',
    initialDuration: '3 Jaar',
    ini: '29',
    parentId: 2,
  },
  {
    id: 5,
    firstExpiryDate: '29-12-2025 (Definitief)',
    tenderName: 'Perceel 3: Unixbeheer',
    contractingAuthority: '',
    value: '€ 800.000',
    startDate: '29-12-2017',
    initialDuration: '3 Jaar',
    ini: '29',
    parentId: 2,
  },
  {
    id: 6,
    firstExpiryDate: '29-12-2025 (Initieel)',
    tenderName: 'Groenonderhoud Nijmegen Noord',
    contractingAuthority: 'Gemeente Nijmegen',
    value: '€ 5.500.000',
    startDate: '29-08-2022',
    initialDuration: '40 Maanden',
    ini: '29',
  },
  {
    id: 7,
    firstExpiryDate: '30-12-2025 (Optioneel)',
    tenderName: 'Aankondiging vrijwillige transparantie vooraf - ...',
    contractingAuthority: 'Gemeente Almere',
    value: '--',
    startDate: '01-01-2025',
    initialDuration: '6 Maanden',
    ini: '30',
  },
  {
    id: 8,
    firstExpiryDate: '30-12-2025 (Optioneel)',
    tenderName: 'Aggregaat gemeentelijk opvang Oekraïense vlu...',
    contractingAuthority: 'Gemeente Katwijk',
    value: '--',
    startDate: '01-09-2024',
    initialDuration: '0,3 Jaar',
    ini: '31',
  },
  {
    id: 9,
    firstExpiryDate: '30-12-2025 (Optioneel)',
    tenderName: 'Bestrijding Eikenprocessierups',
    contractingAuthority: 'Gemeente Ede',
    value: '€ 800.000',
    startDate: '30-12-2022',
    initialDuration: '2 Jaar',
    ini: '30',
  },
  {
    id: 10,
    firstExpiryDate: '30-12-2025 (Optioneel)',
    tenderName: 'Beveiliging Gemeentelijke opvanglocaties Oekr...',
    contractingAuthority: 'Gemeente Emmen',
    value: '€ 6.000.000',
    startDate: '15-04-2024',
    initialDuration: '8,5 Maanden',
    ini: '31',
  },
]

// Generate more dummy data to test pagination (618 pages worth)
export const generateTenders = (count = 6180) => {
  const tenders = [...dummyTenders]
  const authorities = [
    'Gemeente Amsterdam',
    'Gemeente Rotterdam',
    'Gemeente Den Haag',
    'Gemeente Utrecht',
    'Gemeente Eindhoven',
    'Gemeente Groningen',
    'Gemeente Tilburg',
    'Gemeente Almere',
    'Gemeente Breda',
    'Gemeente Nijmegen',
  ]

  const types = ['Initieel', 'Definitief', 'Optioneel']
  const durations = ['1 Jaar', '2 Jaar', '3 Jaar', '4 Jaar', '6 Maanden', '12 Maanden', '18 Maanden', '24 Maanden']

  for (let i = 11; i <= count; i++) {
    const date = new Date(2025, 11, Math.floor(Math.random() * 28) + 1)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    const type = types[Math.floor(Math.random() * types.length)]
    const authority = authorities[Math.floor(Math.random() * authorities.length)]
    const value = Math.random() > 0.1 ? `€ ${(Math.random() * 10000000).toLocaleString('nl-NL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : '--'
    const startDate = `${day}-${month}-${2020 + Math.floor(Math.random() * 5)}`
    const duration = durations[Math.floor(Math.random() * durations.length)]

    tenders.push({
      id: i,
      firstExpiryDate: `${day}-${month}-${year} (${type})`,
      tenderName: `Tender ${i}: ${['ICT', 'Bouw', 'Onderhoud', 'Diensten', 'Materiaal', 'Consultancy'][Math.floor(Math.random() * 6)]} project voor ${authority}`,
      contractingAuthority: authority,
      value: value,
      startDate: startDate,
      initialDuration: duration,
      ini: day,
    })
  }

  return tenders
}
