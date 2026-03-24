import { Blessing } from '../models/divine.model';

// â”€â”€â”€ Segen (Blessings) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Source: DSA 5 Regelwiki â€“ https://dsa.ulisses-regelwiki.de/segen.html
// Total: 12 blessings, alphabetically ordered

export const ALL_BLESSINGS: Blessing[] = [
  {
    name: 'eidsegen',
    label: 'Eidsegen',
    aspect: 'Allgemein',
    traditions: ['allgemein', 'Praios', "Chr'Ssir'Ssr", 'Ifirn', 'Kor', 'Marbo', 'Nandus', 'Numinoru', 'Shinxir', 'Swafnir'],
    url: 'https://dsa.ulisses-regelwiki.de/segen.html?segen=Eidsegen',
    sources: [
      { book: 'Regelwerk', page: 322 },
      { book: 'Divinarium Liturgia', page: 10 },
    ],
  },
  {
    name: 'feuersegen',
    label: 'Feuersegen',
    aspect: 'Allgemein',
    traditions: ['allgemein', 'Ingerimm', 'Aves', 'Ifirn', 'Kor', 'Levthan', 'Marbo', 'Shinxir'],
    url: 'https://dsa.ulisses-regelwiki.de/segen.html?segen=Feuersegen',
    sources: [
      { book: 'Regelwerk', page: 322 },
      { book: 'Divinarium Liturgia', page: 10 },
    ],
  },
  {
    name: 'geburtssegen',
    label: 'Geburtssegen',
    aspect: 'Allgemein',
    traditions: ['allgemein', 'Tsa', 'Aves', 'Ifirn', 'Levthan', 'Nandus'],
    url: 'https://dsa.ulisses-regelwiki.de/segen.html?segen=Geburtssegen',
    sources: [
      { book: 'Regelwerk', page: 322 },
      { book: 'Divinarium Liturgia', page: 10 },
    ],
  },
  {
    name: 'glueckssegen',
    label: 'Glückssegen',
    aspect: 'Allgemein',
    traditions: ['allgemein', 'Phex', 'Aves', "Chr'Ssir'Ssr", 'Kor', 'Levthan', 'Nandus', 'Numinoru', 'Swafnir'],
    url: 'https://dsa.ulisses-regelwiki.de/segen.html?segen=Gl%C3%BCckssegen',
    sources: [
      { book: 'Regelwerk', page: 323 },
      { book: 'Divinarium Liturgia', page: 11 },
    ],
  },
  {
    name: 'grabsegen',
    label: 'Grabsegen',
    aspect: 'Allgemein',
    traditions: ['allgemein', 'Boron', 'Ifirn', 'Kor', 'Levthan', 'Marbo', 'Nandus', 'Shinxir', 'Swafnir'],
    url: 'https://dsa.ulisses-regelwiki.de/segen.html?segen=Grabsegen',
    sources: [
      { book: 'Regelwerk', page: 323 },
      { book: 'Divinarium Liturgia', page: 11 },
    ],
  },
  {
    name: 'harmoniesegen',
    label: 'Harmoniesegen',
    aspect: 'Allgemein',
    traditions: ['allgemein', 'Rahja', 'Aves', 'Ifirn', 'Levthan', 'Marbo', 'Nandus', 'Swafnir'],
    url: 'https://dsa.ulisses-regelwiki.de/segen.html?segen=Harmoniesegen',
    sources: [
      { book: 'Regelwerk', page: 323 },
      { book: 'Divinarium Liturgia', page: 12 },
    ],
  },
  {
    name: 'kleinerHeilsegen',
    label: 'Kleiner Heilsegen',
    aspect: 'Allgemein',
    traditions: ['allgemein', 'Peraine', 'Aves', "Chr'Ssir'Ssr", 'Ifirn', 'Levthan', 'Marbo', 'Nandus', 'Numinoru', 'Swafnir'],
    url: 'https://dsa.ulisses-regelwiki.de/segen.html?segen=Kleiner+Heilsegen',
    sources: [
      { book: 'Regelwerk', page: 323 },
      { book: 'Divinarium Liturgia', page: 12 },
    ],
  },
  {
    name: 'kleinerSchutzsegen',
    label: 'Kleiner Schutzsegen',
    aspect: 'Allgemein',
    traditions: ['allgemein', 'Rondra', 'Aves', 'Ifirn', 'Kor', 'Marbo', 'Shinxir', 'Swafnir'],
    url: 'https://dsa.ulisses-regelwiki.de/segen.html?segen=Kleiner+Schutzsegen',
    sources: [
      { book: 'Regelwerk', page: 323 },
      { book: 'Divinarium Liturgia', page: 12 },
    ],
  },
  {
    name: 'speisesegen',
    label: 'Speisesegen',
    aspect: 'Allgemein',
    traditions: ['allgemein', 'Travia', 'Aves', 'Ifirn', 'Kor', 'Levthan', 'Nandus'],
    url: 'https://dsa.ulisses-regelwiki.de/segen.html?segen=Speisesegen',
    sources: [
      { book: 'Regelwerk', page: 323 },
      { book: 'Divinarium Liturgia', page: 13 },
    ],
  },
  {
    name: 'staerkungssegen',
    label: 'Stärkungssegen',
    aspect: 'Allgemein',
    traditions: ['allgemein', 'Firun', 'Aves', "Chr'Ssir'Ssr", 'Ifirn', 'Kor', 'Levthan', 'Marbo', 'Numinoru', 'Shinxir', 'Swafnir'],
    url: 'https://dsa.ulisses-regelwiki.de/segen.html?segen=St%C3%A4rkungssegen',
    sources: [
      { book: 'Regelwerk', page: 323 },
      { book: 'Divinarium Liturgia', page: 13 },
    ],
  },
  {
    name: 'tranksegen',
    label: 'Tranksegen',
    aspect: 'Allgemein',
    traditions: ['allgemein', 'Efferd', 'Aves', "Chr'Ssir'Ssr", 'Kor', 'Levthan', 'Marbo', 'Nandus', 'Numinoru', 'Shinxir', 'Swafnir'],
    url: 'https://dsa.ulisses-regelwiki.de/segen.html?segen=Tranksegen',
    sources: [
      { book: 'Regelwerk', page: 323 },
      { book: 'Divinarium Liturgia', page: 13 },
    ],
  },
  {
    name: 'weisheitssegen',
    label: 'Weisheitssegen',
    aspect: 'Allgemein',
    traditions: ['allgemein', 'Hesinde', "Chr'Ssir'Ssr", 'Kor', 'Marbo', 'Nandus', 'Numinoru', 'Swafnir'],
    url: 'https://dsa.ulisses-regelwiki.de/segen.html?segen=Weisheitssegen',
    sources: [
      { book: 'Regelwerk', page: 323 },
      { book: 'Divinarium Liturgia', page: 14 },
    ],
  },
];
