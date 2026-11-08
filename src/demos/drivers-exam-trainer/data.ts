// Original practice questions written for this demo from Brazil's public traffic code,
// the Código de Trânsito Brasileiro (Lei nº 9.503/1997), current compiled text on planalto.gov.br,
// checked on 2026-11-08. Each question cites the article it was checked against.
// None come from any study book or from the live app's question bank.

export interface Q {
  pt: string;
  en: string;
  opts: [string, string][]; // [Portuguese, English]
  answer: number;           // index into opts
  signal: string;           // the Portuguese words that decide it (highlighted in the question)
  why: string;              // English explanation
  art: string;              // CTB article
}

export interface Section {
  id: string;
  pt: string;
  en: string;
  words: [string, string][];      // signal word, meaning
  rules: { en: string; pt: string }[]; // rule in English, the deciding Portuguese words
  qs: Q[];
}

export const SECTIONS: Section[] = [
  {
    id: "circ",
    pt: "Circulação e ultrapassagem",
    en: "Road rules and overtaking",
    words: [["exceto", "except"], ["salvo", "unless, except"], ["não poderá", "may not"], ["pela direita", "from the right"], ["preferência", "right of way"]],
    rules: [
      { en: "Overtake on the left, except when the vehicle ahead is signaling a left turn.", pt: "pela esquerda ... exceto" },
      { en: "On a two-way, single-carriageway road, no overtaking on bridges, viaducts, level crossings, pedestrian crossings, or blind bends and hills, unless signs allow it.", pt: "não poderá ... exceto quando houver sinalização" },
      { en: "At an unsigned crossing with no highway or roundabout involved, the vehicle coming from your right has right of way.", pt: "o que vier pela direita" },
      { en: "Pedestrians on a crosswalk have priority, except where there are traffic lights.", pt: "prioridade ... exceto nos locais com sinalização semafórica" },
    ],
    qs: [
      {
        pt: "Em uma pista com várias faixas no mesmo sentido, sem faixa especial, as faixas da esquerda são destinadas:",
        en: "On a road with several lanes in the same direction and no special lane, the left lanes are meant for:",
        opts: [["à ultrapassagem e aos veículos de maior velocidade", "overtaking and faster vehicles"], ["aos veículos mais lentos e de maior porte", "slower and larger vehicles"], ["ao estacionamento", "parking"], ["exclusivamente aos ônibus", "buses only"]],
        answer: 0, signal: "esquerda",
        why: "The right lanes are for slower, larger vehicles; the left lanes for overtaking and faster traffic.", art: "Art. 29, IV",
      },
      {
        pt: "A ultrapassagem de outro veículo em movimento deve ser feita pela esquerda, exceto quando:",
        en: "Overtaking a moving vehicle must be done on the left, except when:",
        opts: [["o veículo à frente estiver sinalizando que vai entrar à esquerda", "the vehicle ahead is signaling a left turn"], ["a rodovia for de pista dupla", "the highway is dual carriageway"], ["for à noite", "it is night"], ["não houver tráfego em sentido contrário", "there is no oncoming traffic"]],
        answer: 0, signal: "exceto",
        why: "The only exception in the rule is a vehicle signaling that it will turn left.", art: "Art. 29, IX",
      },
      {
        pt: "Em via de duplo sentido e pista única, o condutor não poderá ultrapassar, salvo sinalização que permita:",
        en: "On a two-way, single-carriageway road, the driver may not overtake, unless signs allow it:",
        opts: [["nas pontes e viadutos", "on bridges and viaducts"], ["em retas com boa visibilidade", "on straight stretches with good visibility"], ["durante o dia", "during the day"], ["quando o veículo da frente for lento", "when the vehicle ahead is slow"]],
        answer: 0, signal: "não poderá",
        why: "Bridges and viaducts are on the list, with blind bends and hills, level crossings and pedestrian crossings.", art: "Art. 32",
      },
      {
        pt: "Em cruzamento não sinalizado, sem rodovia nem rotatória, tem preferência de passagem o veículo que vier:",
        en: "At an unsigned crossing, with no highway or roundabout, right of way goes to the vehicle coming:",
        opts: [["pela direita do condutor", "from the driver's right"], ["pela esquerda do condutor", "from the driver's left"], ["em maior velocidade", "at higher speed"], ["de maior porte", "that is larger"]],
        answer: 0, signal: "pela direita",
        why: "Highway traffic and roundabout traffic have priority in their own cases; in all other cases, the vehicle from the right.", art: "Art. 29, III, c",
      },
      {
        pt: "Os pedestres que estiverem atravessando sobre a faixa terão prioridade de passagem, exceto:",
        en: "Pedestrians crossing on the crosswalk have priority, except:",
        opts: [["nos locais com sinalização semafórica", "where there are traffic lights"], ["à noite", "at night"], ["em vias arteriais", "on arterial roads"], ["diante de veículos de carga", "in front of cargo vehicles"]],
        answer: 0, signal: "exceto",
        why: "At traffic lights the signals decide. Even then, pedestrians who haven't finished crossing keep preference when the light changes.", art: "Art. 70",
      },
    ],
  },
  {
    id: "vel",
    pt: "Velocidade e luzes",
    en: "Speed and lights",
    words: [["máxima", "maximum"], ["onde não existir sinalização", "where there are no signs"], ["mesmo durante o dia", "even during the day"], ["superior", "above"], ["mais de", "more than"]],
    rules: [
      { en: "With no speed signs, urban limits are 80 (fast-transit roads), 60 (arterial), 40 (collector) and 30 km/h (local).", pt: "onde não existir sinalização regulamentadora" },
      { en: "With no signs, on a single-carriageway highway, cars and motorcycles may do 100 km/h; other vehicles 90.", pt: "rodovias de pista simples" },
      { en: "Low-beam headlights on at night, and even by day in tunnels and in rain, fog or mist.", pt: "mesmo durante o dia" },
      { en: "Speeding by more than 50 percent is a very serious (gravíssima) infraction with a triple fine and suspension.", pt: "mais de 50%" },
    ],
    qs: [
      {
        pt: "Onde não existir sinalização regulamentadora, a velocidade máxima numa via urbana arterial é de:",
        en: "Where there are no regulatory signs, the maximum speed on an urban arterial road is:",
        opts: [["60 km/h", "60 km/h"], ["40 km/h", "40 km/h"], ["80 km/h", "80 km/h"], ["30 km/h", "30 km/h"]],
        answer: 0, signal: "arterial",
        why: "80 fast-transit, 60 arterial, 40 collector, 30 local.", art: "Art. 61, § 1º, I, b",
      },
      {
        pt: "Onde não existir sinalização regulamentadora, a velocidade máxima numa via urbana local é de:",
        en: "Where there are no regulatory signs, the maximum speed on a local urban road is:",
        opts: [["30 km/h", "30 km/h"], ["40 km/h", "40 km/h"], ["50 km/h", "50 km/h"], ["60 km/h", "60 km/h"]],
        answer: 0, signal: "local",
        why: "Local roads are the slowest category: 30 km/h.", art: "Art. 61, § 1º, I, d",
      },
      {
        pt: "Em rodovia de pista simples, sem sinalização, a velocidade máxima para automóveis é de:",
        en: "On a single-carriageway highway with no signs, the maximum speed for cars is:",
        opts: [["100 km/h", "100 km/h"], ["110 km/h", "110 km/h"], ["90 km/h", "90 km/h"], ["80 km/h", "80 km/h"]],
        answer: 0, signal: "pista simples",
        why: "110 km/h is for dual-carriageway highways. On single carriageways, cars get 100 and other vehicles 90.", art: "Art. 61, § 1º, II, b",
      },
      {
        pt: "O condutor deve manter os faróis acesos, com luz baixa, mesmo durante o dia:",
        en: "The driver must keep low-beam headlights on, even during the day:",
        opts: [["em túneis e sob chuva, neblina ou cerração", "in tunnels and in rain, fog or mist"], ["em qualquer via urbana", "on any urban road"], ["somente em rodovias de pista dupla", "only on dual-carriageway highways"], ["nunca; só à noite", "never; only at night"]],
        answer: 0, signal: "mesmo durante o dia",
        why: "Low beam at night, and by day in tunnels and in rain, fog or mist.", art: "Art. 40, I",
      },
      {
        pt: "Transitar em velocidade superior à máxima permitida em mais de 50% é infração:",
        en: "Driving more than 50 percent above the speed limit is an infraction that is:",
        opts: [["gravíssima", "very serious"], ["grave", "serious"], ["média", "medium"], ["leve", "light"]],
        answer: 0, signal: "mais de 50%",
        why: "Up to 20% over is média; over 20% up to 50% is grave; over 50% is gravíssima, with a triple fine and suspension.", art: "Art. 218, III",
      },
    ],
  },
  {
    id: "seg",
    pt: "Segurança",
    en: "Safety",
    words: [["obrigatório", "mandatory"], ["todas", "all"], ["só poderão", "may only"], ["traseiros", "rear"], ["segurando ou manuseando", "holding or handling"]],
    rules: [
      { en: "Seat belts are mandatory for the driver and all passengers, on all roads in the country.", pt: "obrigatório ... em todas as vias" },
      { en: "Children under 10 who are under 1.45 m ride in the back, in a restraint suited to their age, weight and height.", pt: "bancos traseiros" },
      { en: "Motorcyclists may only ride with a helmet with a visor or protective goggles.", pt: "só poderão ... capacete" },
      { en: "Headphones or a phone while driving is a medium infraction. Driving one-handed while holding or handling a phone is very serious.", pt: "segurando ou manuseando" },
    ],
    qs: [
      {
        pt: "O uso do cinto de segurança é obrigatório:",
        en: "Wearing a seat belt is mandatory:",
        opts: [["para condutor e passageiros, em todas as vias do território nacional", "for the driver and passengers, on all roads in the country"], ["apenas para o condutor", "for the driver only"], ["apenas em rodovias", "on highways only"], ["apenas nos bancos dianteiros", "in the front seats only"]],
        answer: 0, signal: "todas",
        why: "Everyone, on every road, except in situations regulated by CONTRAN.", art: "Art. 65",
      },
      {
        pt: "Crianças com idade inferior a 10 anos que não tenham atingido 1,45 m de altura devem ser transportadas:",
        en: "Children under 10 who are not yet 1.45 m tall must travel:",
        opts: [["nos bancos traseiros, em dispositivo de retenção adequado", "in the rear seats, in a suitable restraint"], ["no banco dianteiro, com cinto", "in the front seat, with a belt"], ["no colo de um adulto", "on an adult's lap"], ["em qualquer banco, se houver cinto", "in any seat that has a belt"]],
        answer: 0, signal: "traseiros",
        why: "Rear seats, in a restraint suited to age, weight and height, with exceptions only as CONTRAN regulates.", art: "Art. 64",
      },
      {
        pt: "Os condutores de motocicletas só poderão circular nas vias:",
        en: "Motorcycle riders may only ride on the roads:",
        opts: [["utilizando capacete de segurança, com viseira ou óculos protetores", "wearing a helmet with a visor or protective goggles"], ["usando capacete apenas em rodovias", "with a helmet on highways only"], ["usando luvas, dispensado o capacete", "with gloves instead of a helmet"], ["usando colete refletivo, dispensado o capacete", "with a reflective vest instead of a helmet"]],
        answer: 0, signal: "só poderão",
        why: "A helmet with a visor or goggles, both hands on the handlebars, and protective clothing as CONTRAN specifies.", art: "Art. 54, I",
      },
      {
        pt: "Dirigir utilizando-se de fones nos ouvidos conectados a aparelhagem sonora é infração:",
        en: "Driving with headphones connected to a sound device is an infraction that is:",
        opts: [["média", "medium"], ["leve", "light"], ["grave", "serious"], ["gravíssima", "very serious"]],
        answer: 0, signal: "fones",
        why: "Headphones or a phone while driving: média, with a fine.", art: "Art. 252, VI",
      },
      {
        pt: "Dirigir com apenas uma das mãos, segurando ou manuseando telefone celular, é infração:",
        en: "Driving with one hand while holding or handling a mobile phone is an infraction that is:",
        opts: [["gravíssima", "very serious"], ["média", "medium"], ["leve", "light"], ["grave", "serious"]],
        answer: 0, signal: "segurando ou manuseando",
        why: "Same topic as the headphones question, different words: holding or handling the phone makes it gravíssima.", art: "Art. 252, parágrafo único",
      },
    ],
  },
  {
    id: "inf",
    pt: "Infrações e habilitação",
    en: "Infractions and the license",
    words: [["gravíssima", "very serious"], ["nenhuma", "none"], ["desde que", "provided that"], ["podendo fazê-lo", "when able to"], ["suspensão", "suspension"]],
    rules: [
      { en: "Points per infraction: gravíssima 7, grave 5, média 4, leve 3.", pt: "sete, cinco, quatro, três" },
      { en: "Suspension at 20 points in 12 months with two or more gravíssimas, 30 with one, 40 with none.", pt: "nenhuma infração gravíssima" },
      { en: "New drivers get a one-year permit, and the full license only if they commit no grave or gravíssima infraction and don't repeat a média.", pt: "desde que" },
      { en: "A driver in a crash with a victim who fails to help when able to commits a gravíssima infraction.", pt: "podendo fazê-lo" },
    ],
    qs: [
      {
        pt: "A penalidade para quem dirige sob a influência de álcool é:",
        en: "The penalty for driving under the influence of alcohol is:",
        opts: [["multa (dez vezes) e suspensão do direito de dirigir por 12 meses", "a tenfold fine and a 12-month suspension"], ["apenas advertência por escrito", "a written warning only"], ["multa simples, sem suspensão", "a simple fine, no suspension"], ["suspensão por 30 dias, sem multa", "a 30-day suspension, no fine"]],
        answer: 0, signal: "álcool",
        why: "Gravíssima, a tenfold fine and 12 months' suspension. The fine doubles for a repeat within 12 months.", art: "Art. 165",
      },
      {
        pt: "Uma infração de natureza grave soma quantos pontos?",
        en: "How many points does a serious (grave) infraction add?",
        opts: [["5", "5"], ["7", "7"], ["4", "4"], ["3", "3"]],
        answer: 0, signal: "grave",
        why: "Gravíssima 7, grave 5, média 4, leve 3.", art: "Art. 259, II",
      },
      {
        pt: "Caso não conste nenhuma infração gravíssima, a suspensão do direito de dirigir ocorre ao atingir, em 12 meses:",
        en: "If there is no very serious infraction on record, suspension happens on reaching, within 12 months:",
        opts: [["40 pontos", "40 points"], ["20 pontos", "20 points"], ["30 pontos", "30 points"], ["50 pontos", "50 points"]],
        answer: 0, signal: "nenhuma",
        why: "20 points with two or more gravíssimas, 30 with one, 40 with none.", art: "Art. 261, I, c",
      },
      {
        pt: "A CNH será conferida ao término de um ano da Permissão para Dirigir, desde que o condutor não tenha cometido:",
        en: "The full license is granted at the end of the one-year permit, provided the driver has not committed:",
        opts: [["nenhuma infração grave ou gravíssima, nem seja reincidente em infração média", "any serious or very serious infraction, nor repeated a medium one"], ["nenhuma infração leve", "any light infraction"], ["mais de 40 pontos", "more than 40 points"], ["nenhuma infração de qualquer natureza", "any infraction of any kind"]],
        answer: 0, signal: "desde que",
        why: "Grave or gravíssima rules it out, and so does a repeated média. Otherwise the process starts again.", art: "Art. 148, §§ 2º e 3º",
      },
      {
        pt: "Deixar o condutor envolvido em sinistro com vítima de prestar ou providenciar socorro, podendo fazê-lo, é infração:",
        en: "A driver involved in a crash with a victim who fails to give or arrange help, when able to, commits an infraction that is:",
        opts: [["gravíssima", "very serious"], ["grave", "serious"], ["média", "medium"], ["leve", "light"]],
        answer: 0, signal: "podendo fazê-lo",
        why: "Gravíssima, a fivefold fine and suspension.", art: "Art. 176, I",
      },
    ],
  },
];

export const PASS = 0.7;
/** Demo mock exam: 2 per section, 1 minute per question. The real one is 30 in 30 minutes, 21 to pass. */
export const MOCK_PER_SECTION = 2;
