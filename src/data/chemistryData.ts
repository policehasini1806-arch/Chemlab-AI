import { ElementData, QuizQuestion, Badge } from '../types';

export const ELEMENTS_DATA: ElementData[] = [
  {
    number: 1,
    symbol: 'H',
    name: 'Hydrogen',
    mass: 1.008,
    category: 'nonmetal',
    group: 1,
    period: 1,
    electronConfig: '1s¹',
    shells: [1],
    funFact: 'Hydrogen is the most abundant element in the universe, making up 75% of all baryonic mass!'
  },
  {
    number: 2,
    symbol: 'He',
    name: 'Helium',
    mass: 4.0026,
    category: 'noble-gas',
    group: 18,
    period: 1,
    electronConfig: '1s²',
    shells: [2],
    funFact: 'Helium is so light that Earth\'s gravity cannot hold it; it slowly escapes into space!'
  },
  {
    number: 3,
    symbol: 'Li',
    name: 'Lithium',
    mass: 6.94,
    category: 'metal',
    group: 1,
    period: 2,
    electronConfig: '[He] 2s¹',
    shells: [2, 1],
    funFact: 'Lithium has the lowest density of all solid elements and is lighter than water!'
  },
  {
    number: 4,
    symbol: 'Be',
    name: 'Beryllium',
    mass: 9.0122,
    category: 'metal',
    group: 2,
    period: 2,
    electronConfig: '[He] 2s²',
    shells: [2, 2],
    funFact: 'Beryllium is transparent to X-rays, making it crucial for X-ray tube windows!'
  },
  {
    number: 5,
    symbol: 'B',
    name: 'Boron',
    mass: 10.81,
    category: 'metalloid',
    group: 13,
    period: 2,
    electronConfig: '[He] 2s² 2p¹',
    shells: [2, 3],
    funFact: 'Boron is used in boric acid and also flares green in pyrotechnics and fireworks!'
  },
  {
    number: 6,
    symbol: 'C',
    name: 'Carbon',
    mass: 12.011,
    category: 'nonmetal',
    group: 14,
    period: 2,
    electronConfig: '[He] 2s² 2p²',
    shells: [2, 4],
    funFact: 'Carbon forms up to four stable covalent bonds, making it the chemical backbone of all organic life!'
  },
  {
    number: 7,
    symbol: 'N',
    name: 'Nitrogen',
    mass: 14.007,
    category: 'nonmetal',
    group: 15,
    period: 2,
    electronConfig: '[He] 2s² 2p³',
    shells: [2, 5],
    funFact: 'Liquid nitrogen boils at -196°C and is widely used for instant-freezing food and biological samples!'
  },
  {
    number: 8,
    symbol: 'O',
    name: 'Oxygen',
    mass: 15.999,
    category: 'nonmetal',
    group: 16,
    period: 2,
    electronConfig: '[He] 2s² 2p⁴',
    shells: [2, 6],
    funFact: 'Liquid oxygen is highly paramagnetic and can be suspended between polar ends of a powerful magnet!'
  },
  {
    number: 9,
    symbol: 'F',
    name: 'Fluorine',
    mass: 18.998,
    category: 'nonmetal',
    group: 17,
    period: 2,
    electronConfig: '[He] 2s² 2p⁵',
    shells: [2, 7],
    funFact: 'Fluorine is the most electronegative element, reacting instantly with almost all other substances!'
  },
  {
    number: 10,
    symbol: 'Ne',
    name: 'Neon',
    mass: 20.180,
    category: 'noble-gas',
    group: 18,
    period: 2,
    electronConfig: '[He] 2s² 2p⁶',
    shells: [2, 8],
    funFact: 'Neon glows with a distinct reddish-orange discharge light when simulated in gas tube signs!'
  },
  {
    number: 11,
    symbol: 'Na',
    name: 'Sodium',
    mass: 22.990,
    category: 'metal',
    group: 1,
    period: 3,
    electronConfig: '[Ne] 3s¹',
    shells: [2, 8, 1],
    funFact: 'Sodium is a soft alkali metal that can easily be sliced with a butter knife, but explodes in water!'
  },
  {
    number: 12,
    symbol: 'Mg',
    name: 'Magnesium',
    mass: 24.305,
    category: 'metal',
    group: 2,
    period: 3,
    electronConfig: '[Ne] 3s²',
    shells: [2, 8, 2],
    funFact: 'Magnesium burns with an incredibly bright, blinding white flame and is used in marine rescue flares!'
  },
  {
    number: 17,
    symbol: 'Cl',
    name: 'Chlorine',
    mass: 35.45,
    category: 'nonmetal',
    group: 17,
    period: 3,
    electronConfig: '[Ne] 3s² 3p⁵',
    shells: [2, 8, 7],
    funFact: 'Chlorine gas is highly toxic, yet the chloride ion (Cl⁻) is essential for maintaining hydration levels in cells!'
  },
  {
    number: 18,
    symbol: 'Ar',
    name: 'Argon',
    mass: 39.948,
    category: 'noble-gas',
    group: 18,
    period: 3,
    electronConfig: '[Ne] 3s² 3p⁶',
    shells: [2, 8, 8],
    funFact: 'Argon is used inside incandescent incandescent lightbulbs to prevent the high-temp tungsten filament from oxidizing!'
  }
];

export interface Alkane {
  name: string;
  formula: string;
  carbons: number;
  hydrogens: number;
  state: string;
  description: string;
}

export const ALKANE_SERIES: Alkane[] = [
  { name: 'Methane', formula: 'CH₄', carbons: 1, hydrogens: 4, state: 'Gas', description: 'The simplest alkane and primary component of natural gas. Highly flammable!' },
  { name: 'Ethane', formula: 'C₂H₆', carbons: 2, hydrogens: 6, state: 'Gas', description: 'Mainly used for ethylene production, key in plastics and synthetics.' },
  { name: 'Propane', formula: 'C₃H₈', carbons: 3, hydrogens: 8, state: 'Gas', description: 'Commonly compressed into liquid or gas cylinders as fuel for grills and heaters.' },
  { name: 'Butane', formula: 'C₄H₁₀', carbons: 4, hydrogens: 10, state: 'Gas', description: 'Highly volatile, commonly utilized as fuel in pocket lighters and camping stoves.' },
  { name: 'Pentane', formula: 'C₅H₁₂', carbons: 5, hydrogens: 12, state: 'Liquid', description: 'A highly volatile liquid used as a laboratory solvent and blowing agent for foams.' },
  { name: 'Hexane', formula: 'C₆H₁₄', carbons: 6, hydrogens: 14, state: 'Liquid', description: 'An organic solvent frequently used safely for oil extractions from seeds.' },
  { name: 'Heptane', formula: 'C₇H₁₆', carbons: 7, hydrogens: 16, state: 'Liquid', description: 'A standard reference substance used in testing the knock rating of petrol engines.' },
  { name: 'Octane', formula: 'C₈H₁₈', carbons: 8, hydrogens: 18, state: 'Liquid', description: 'Key ingredient of petroleum fuel. Higher octane decreases engine knocking!' },
  { name: 'Nonane', formula: 'C₉H₂₀', carbons: 9, hydrogens: 20, state: 'Liquid', description: 'A clear colorless liquid component of gasoline and kerosene fuels.' },
  { name: 'Decane', formula: 'C₁₀H₂₂', carbons: 10, hydrogens: 22, state: 'Liquid', description: 'The ten-carbon hydrocarbon fluid, a major constituent of engine propellant blends.' }
];

export const BADGES: Badge[] = [
  {
    id: 'badge_m1',
    name: 'Atomic Explorer',
    description: 'Explore details and orbitals inside Module 1.',
    icon: '⚛️',
    criteria: 'Completed Module 1'
  },
  {
    id: 'badge_m2',
    name: 'Bond Breaker',
    description: 'Achieve a score of 5/5 on the Chemical Bonding quiz.',
    icon: '⚡',
    criteria: 'Score 5/5 on Module 2 Quiz'
  },
  {
    id: 'badge_m3',
    name: 'Phase Shifter',
    description: 'Unlock and observe all four physical phases (Solid, Liquid, Gas, and Plasma).',
    icon: '🔥',
    criteria: 'Trigger all 4 phases in Module 3 simulation'
  },
  {
    id: 'badge_m4',
    name: 'Equation Ace',
    description: 'Successfully complete and balance multiple equations in Module 4.',
    icon: '⚖️',
    criteria: 'Balance 3 chemical equations correctly'
  },
  {
    id: 'badge_m5',
    name: 'pH Pioneer',
    description: 'Precisely drip titration acid/base to stop on the exact equivalency threshold.',
    icon: '🧪',
    criteria: 'Achieve full score in Titration'
  },
  {
    id: 'badge_m6',
    name: 'Organic Architect',
    description: 'Form a heavy organic chain with at least 4 contiguous carbons.',
    icon: '💎',
    criteria: 'Build a valid 4-carbon chain in Module 6 builder'
  },
  {
    id: 'badge_all',
    name: 'Master Chemist',
    description: 'Demonstrate elite dedication by visiting and completing all interactive units.',
    icon: '👑',
    criteria: 'Unlock completions across all 6 modules'
  }
];

export const QUIZ_QUESTIONS: Record<string, QuizQuestion[]> = {
  m1: [
    {
      id: 101,
      type: 'mcq',
      question: 'Which of the following subatomic particles contains a positive electrical charge?',
      options: ['Neutron', 'Proton', 'Electron', 'Positron'],
      answer: 1, // proton is index 1
      reinforcement: 'Exactly right! Protons carry +1 charge, while electrons carry -1 charge.',
      explanation: 'Protons are found inside the nucleus alongside neutral neutrons.',
      hint: 'The word resembles "positive"!'
    },
    {
      id: 102,
      type: 'tf',
      question: 'Helium belongs to group 18 and acts as a noble gas because its single outer shell is completely occupied.',
      answer: true,
      reinforcement: 'Exactly right! Helium has a duplet of electrons in its 1s orbital, sealing its outermost (and only) energy shell.',
      explanation: 'Group 18 elements have complete outer valence shells, leading to high chemical stability.',
      hint: 'Noble gases are renowned for being chemically non-reactive!'
    },
    {
      id: 103,
      type: 'blank',
      question: 'The chemical element with the atomic number of six is ___ .',
      wordBank: ['Hydrogen', 'Carbon', 'Oxygen', 'Neon'],
      answer: 'Carbon',
      reinforcement: 'Exactly right! Carbon possesses 6 protons which sets its position as atomic number six.',
      explanation: 'Atomic numbers indicate the exact quantity of protons inside an element\'s nucleus.',
      hint: 'This element forms the primary basis of all organic macromolecule chains!'
    },
    {
      id: 104,
      type: 'match',
      question: 'Match the atomic structures to their correct designations:',
      pairs: [
        { left: 'Electrons', right: 'Orbiting in shells' },
        { left: 'Protons', right: 'Positive nuclear centers' },
        { left: 'Neutrons', right: 'Neutral nuclear centers' }
      ],
      answer: {
        'Electrons': 'Orbiting in shells',
        'Protons': 'Positive nuclear centers',
        'Neutrons': 'Neutral nuclear centers'
      },
      reinforcement: 'Exactly right! You cleanly mapped the respective duties of all three foundational subatomic particles!',
      explanation: 'Lightweight negative electrons spin within outer cloud shells while heavy heavy protons and neutrons cluster together in the core nucleus.',
      hint: 'Observe the relative placement and charge values of the atomic structural nodes.'
    },
    {
      id: 105,
      type: 'image',
      question: 'Identify the electron shell layout [2, 8] represented below. Under standard conditions, which group do elements showing this configuration belong to?',
      options: ['Alkali Metals (Group 1)', 'Halogens (Group 17)', 'Noble Gases (Group 18)', 'Transition Metals'],
      answer: 2, // Group 18
      diagramType: 'bohr',
      reinforcement: 'Exactly right! 2 in the first shell plus 8 in the second adds up to 10 total electrons: Neon, which is a noble gas!',
      explanation: 'A filled valence octet (8 outermost electrons) provides excellent stability, characteristic of Group 18 Noble Gases.',
      hint: 'Count the valence shell nodes (outermost contains eight complete nodes!)'
    }
  ],
  m2: [
    {
      id: 201,
      type: 'mcq',
      question: 'What specific physical event triggers ionic bonding between neighboring metallic and non-metallic atoms?',
      options: ['Equal sharing of orbital paths', 'Instantaneous transfer of outer valence electrons', 'Disassociation of central nuclei', 'Rapid formation of free-flowing sea of protons'],
      answer: 1,
      reinforcement: 'Exactly right! Ionic bonding relies on the transfer of electrons from a metal (forming a cation) to a non-metal (forming an anion).',
      explanation: 'Oppositely charged ions attract each other through strong electrostatic forces.',
      hint: 'Think about electrostatic attractions between opposite positive and negative charges.'
    },
    {
      id: 202,
      type: 'tf',
      question: 'A covalent bond occurs when there is sharing of electron pairs between non-metal atoms with similar electronegativity values.',
      answer: true,
      reinforcement: 'Exactly right! Intimate orbital overlap allows shared clouds to satisfy valence criteria safely.',
      explanation: 'Covalent bonds keep molecules bound together tightly, like H₂O or CO₂.',
      hint: 'The prefix "co-" suggests acting in cooperation or sharing.'
    },
    {
      id: 203,
      type: 'blank',
      question: 'The electronegativity difference between Na and Cl is extremely high, meaning they will form a/an ___ bond.',
      wordBank: ['Ionic', 'Covalent', 'Metallic', 'Hydrogen'],
      answer: 'Ionic',
      reinforcement: 'Exactly right! Large differences in electronegativity values (generally above 1.7) lead to ionic transfers.',
      explanation: 'Chlorine highly attracts electrons (electronegative) while sodium gladly sheds them, leading to salt NaCl.',
      hint: 'Recall that sodium resides in Group 1 while chlorine belongs to Group 17!'
    },
    {
      id: 204,
      type: 'match',
      question: 'Match the molecule example to its principal bonding style:',
      pairs: [
        { left: 'Water (H2O)', right: 'Polar covalent sharing' },
        { left: 'Table Salt (NaCl)', right: 'Ionic transfer' },
        { left: 'Copper Pipe (Cu)', right: 'Metallic sea of mobile electrons' }
      ],
      answer: {
        'Water (H2O)': 'Polar covalent sharing',
        'Table Salt (NaCl)': 'Ionic transfer',
        'Copper Pipe (Cu)': 'Metallic sea of mobile electrons'
      },
      reinforcement: 'Exactly right! Copper links metal-to-metal (metallic), Water is non-metal sharing (covalent), and Salt is ionic!',
      explanation: 'Physical behaviors differ beautifully depending on if elements share, swap, or form free metallic pools.',
      hint: 'Assess if the combined elements are metals, non-metals, or both.'
    },
    {
      id: 205,
      type: 'image',
      question: 'In this Lewis dot layout, Oxygen (atomic number 8) shares two pairs of electrons with Carbon. What type of bond is formed between these atoms?',
      options: ['Single Covalent Bond', 'Double Covalent Bond', 'Triple Covalent Bond', 'Ionic Bond'],
      answer: 1, // Double covalent
      diagramType: 'lewis',
      reinforcement: 'Exactly right! Sharing 4 electrons (2 pairs) indicates a double covalent bond, as in carbon dioxide.',
      explanation: 'Each shared pair forms one covalent bond. Two shared pairs represent a double bond represented by double horizontal lines.',
      hint: 'Count the shared dots directly clustered in the overlap margins between atomic spaces.'
    }
  ],
  m3: [
    {
      id: 301,
      type: 'mcq',
      question: 'Which phase of matter exhibits both a definite volume and a highly rigid, fixed, regular spatial arrangement?',
      options: ['Liquid', 'Plasma', 'Gas', 'Solid'],
      answer: 3,
      reinforcement: 'Exactly right! Solids retain spatial structures tightly under standard pressures.',
      explanation: 'Thermal energy inside solids is low enough that intermolecular attractive forces lock particles in crystalline meshes.',
      hint: 'Particles here vibrate slightly on fixed points rather than escaping or flowing.'
    },
    {
      id: 302,
      type: 'tf',
      question: 'As pressure inside a container increases while temperature stays constant, gas molecules will collide with walls more frequently.',
      answer: true,
      reinforcement: 'Exactly right! Restricting spatial margins or densifying gases forces wall collisions up rapidly.',
      explanation: 'Kinetic theory defines pressure as the aggregate force of molecular collisions over an area.',
      hint: 'Think about compressing a syringe full of trapped atmosphere.'
    },
    {
      id: 303,
      type: 'blank',
      question: 'Heating a gas to extremely high values strip atoms of electrons, creating a ionized gas phase called ___.',
      wordBank: ['Solid', 'Liquid', 'Gas', 'Plasma'],
      answer: 'Plasma',
      reinforcement: 'Exactly right! Plasma is the fourth state of matter, common in stars and lightning.',
      explanation: 'The added thermal energy overrides the attractive forces holding electrons to the nuclei.',
      hint: 'This state conducts electrical currents and populates most of the visible cosmos!'
    },
    {
      id: 304,
      type: 'match',
      question: 'Match the state transition term to its phase shift:',
      pairs: [
        { left: 'Melting', right: 'Solid entering Liquid state' },
        { left: 'Condensation', right: 'Gas entering Liquid state' },
        { left: 'Sublimation', right: 'Solid shifting directly to Gas state' }
      ],
      answer: {
        'Melting': 'Solid entering Liquid state',
        'Condensation': 'Gas entering Liquid state',
        'Sublimation': 'Solid shifting directly to Gas state'
      },
      reinforcement: 'Exactly right! Sublimation skips the liquid step entirely, seen nicely with dry ice carbon dioxide.',
      explanation: 'Shedding or gaining thermal energy alters structural arrays at exact transition temperatures.',
      hint: 'Recall common phase changes of ice and water.'
    },
    {
      id: 305,
      type: 'image',
      question: 'What phase of matter possesses neither a fixed shape nor a definite volume, with particles flying spaced far apart at high velocities?',
      options: ['Solid state', 'Liquid state', 'Gas state', 'Both Solid and Liquid'],
      answer: 2, // Gas
      diagramType: 'ph',
      reinforcement: 'Exactly right! Gas molecules occupy whatever container volume is made available to them.',
      explanation: 'Negligible interactive bindings allow gas particulates to drift and populate space freely.',
      hint: 'Think about steam ascending off a kettle unit.'
    }
  ],
  m4: [
    {
      id: 401,
      type: 'mcq',
      question: 'According to the Law of Conservation of Mass, what absolute criteria must balanced chemical reactions meet?',
      options: ['Volume on both sides must match', 'The number of state tags must be identical', 'The exact count of each atom type is identical on reactant and product fields', 'Reaction rates must execute instantly'],
      answer: 2,
      reinforcement: 'Exactly right! Mass cannot be created or destroyed, so all atoms on the left must appear on the right.',
      explanation: 'We append preceding integer coefficients to balance equations without changing chemical identity subscripts.',
      hint: 'No atoms may be magically created or lost in a chemical reaction!'
    },
    {
      id: 402,
      type: 'tf',
      question: 'A catalyst increases the speed of a chemical reaction by physically raising the activation energy threshold.',
      answer: false,
      reinforcement: 'Exactly right! Catalysts speed up reactions by lowering the activation energy barrier, providing an easier path.',
      explanation: 'Reducing activation bounds allows a higher percentage of reactant particles to interact successfully at lower temperatures.',
      hint: 'Consider whether an obstacle course becomes easier or harder when barriers are raised.'
    },
    {
      id: 403,
      type: 'blank',
      question: 'A reaction in which a single complex compound breaks down into two or more simpler parts is called ___.',
      wordBank: ['Synthesis', 'Decomposition', 'Combustion', 'Replacement'],
      answer: 'Decomposition',
      reinforcement: 'Exactly right! In a decomposition reaction (AB → A + B), chemical compounds break down into simpler products.',
      explanation: 'Electrolysis of water into Hydrogen and Oxygen gases is a stellar decomposition example.',
      hint: 'The word refers to natural decay or breaking down of dead matter.'
    },
    {
      id: 404,
      type: 'match',
      question: 'Match the reaction equation to its correct type classification:',
      pairs: [
        { left: '2H2 + O2 -> 2H2O', right: 'Synthesis' },
        { left: 'Zn + 2HCl -> ZnCl2 + H2', right: 'Single Replacement' },
        { left: 'CH4 + 2O2 -> CO2 + 2H2O', right: 'Combustion' }
      ],
      answer: {
        '2H2 + O2 -> 2H2O': 'Synthesis',
        'Zn + 2HCl -> ZnCl2 + H2': 'Single Replacement',
        'CH4 + 2O2 -> CO2 + 2H2O': 'Combustion'
      },
      reinforcement: 'Exactly right! Synthesis merges components, Single Replacement swaps a single element, and Combustion burns hydrocarbon in oxygen!',
      explanation: 'Reactions are grouped cleanly by patterns of atoms bonding and breaking.',
      hint: 'Notice reactants joining, swapping metals, or producing dioxide water gases.'
    },
    {
      id: 405,
      type: 'image',
      question: 'In this reaction graphic, Carbon atoms and Hydrogen atoms react under heat. Balancing the reactant field indicates that: CH₄ + 2O₂ → CO₂ + 2H₂O. What is the ratio of methane molecules to oxygen molecules needed?',
      options: ['1 to 1', '1 to 2', '2 to 1', '2 to 3'],
      answer: 1, // 1 to 2
      diagramType: 'reaction',
      reinforcement: 'Exactly right! Preceding coefficients indicate one CH₄ molecule requires two O₂ molecules to balance out completely.',
      explanation: 'Coefficient values translate to the mole or molecular ratios necessary to satisfy balancing laws.',
      hint: 'Read the numbers placed directly before CH₄ and O₂.'
    }
  ],
  m5: [
    {
      id: 501,
      type: 'mcq',
      question: 'A solution with a pH rating of 2.0 would be characterized as containing which concentration properties?',
      options: ['Extremely high concentration of hydroxide ions OH-', 'Neutral water content', 'A highly acidic concentration of hydronium ions H3O+', 'Strong metallic alkaline properties'],
      answer: 2,
      reinforcement: 'Exactly right! Values under 7 reflect acidity (H₃O⁺ density). Each pH step represents a tenfold change.',
      explanation: 'Logarithmic scales track hydrogen values. Shifting downwards raises active acid contents drastically.',
      hint: 'Think of common highly tart/sour liquids like stomach acid or sliced lemons.'
    },
    {
      id: 502,
      type: 'tf',
      question: 'During a strong acid-strong base titration using phenolphthalein, the solution turns pink as it passes into alkaline ranges.',
      answer: true,
      reinforcement: 'Exactly right! Phenolphthalein is clear in acids/neutral compounds but blushes pink above pH 8.2.',
      explanation: 'This visible transition marks the equivalence threshold, letting students calculate base/acid ratios.',
      hint: 'This indicator is famous for turning a rich, vivid magenta as base concentration dominates.'
    },
    {
      id: 503,
      type: 'blank',
      question: 'The pH scale value of a completely neutral, pure water sample is ___.',
      wordBank: ['0', '7', '14', '1.0'],
      answer: '7',
      reinforcement: 'Exactly right! A pH of 7 represents exact balances between H⁺ and OH⁻ ions.',
      explanation: 'Neutral values mean the dissociation concentration of hydronium equals hydroxide exactly.',
      hint: 'It sits exactly in the middle of our 0 to 14 pH explorer scale.'
    },
    {
      id: 504,
      type: 'match',
      question: 'Match the common chemical substance to its native pH category:',
      pairs: [
        { left: 'Lemon Juice', right: 'Strongly Acidic (pH ~2)' },
        { left: 'Household Bleach', right: 'Strongly Alkaline (pH ~12)' },
        { left: 'Human Blood', right: 'Weakly Alkaline (pH ~7.4)' }
      ],
      answer: {
        'Lemon Juice': 'Strongly Acidic (pH ~2)',
        'Household Bleach': 'Strongly Alkaline (pH ~12)',
        'Human Blood': 'Weakly Alkaline (pH ~7.4)'
      },
      reinforcement: 'Exactly right! Lemons are heavily tart (acidic), bleach breaks structures down (base), and blood is tightly controlled!',
      explanation: 'Cellular processes require incredibly narrow pH margins to function.',
      hint: 'Recall if household cleaners feel slippery (alkaline) or taste intensely sour (acidic).'
    },
    {
      id: 505,
      type: 'image',
      question: 'In this titration schematic, what name is given to the vertical glass tube equipped with a stopcock tap used to drip acids?',
      options: ['Pipette', 'Burette', 'Beaker', 'Graduated Cylinder'],
      answer: 1, // Burette
      diagramType: 'ph',
      reinforcement: 'Exactly right! A burette lets us carefully meter exact drops of chemical liquid.',
      explanation: 'Markings on the side of a mechanical burette allow high-precision measurement of titrated fluid volumes.',
      hint: 'It begins with the letter "B" and has a stop valve at the bottom nozzle.'
    }
  ],
  m6: [
    {
      id: 601,
      type: 'mcq',
      question: 'How many covalent bonding paths must every standard Carbon atom satisfy inside organic molecules?',
      options: ['Two', 'Three', 'Four', 'Six'],
      answer: 2,
      reinforcement: 'Exactly right! Carbon possesses 4 valence electrons and requires 4 more to satisfy the stable octet rule.',
      explanation: 'This capability allows carbon to connect into massive linear chains, branched grids, and rings.',
      hint: 'Think about the prefix "tetra-" or the quantity of outer electrons Carbon has.'
    },
    {
      id: 602,
      type: 'tf',
      question: 'Alkanes are characterized as "saturated hydrocarbons" because they only contain single carbon-carbon bonds.',
      answer: true,
      reinforcement: 'Exactly right! Saturated implies Carbon holds as many Hydrogen atoms as chemically possible.',
      explanation: 'Saturated rings/chains have only single bonds (C-C), while unsaturated ones feature double or triple bonds.',
      hint: 'No additional hydrogen can fit without breaking carbon-carbon single pathways!'
    },
    {
      id: 603,
      type: 'blank',
      question: 'The organic compound group containing the functional group "-OH" is called a/an ___.',
      wordBank: ['Alkane', 'Alcohol', 'Carboxylic Acid', 'Ester'],
      answer: 'Alcohol',
      reinforcement: 'Exactly right! The presence of a hydroxyl group (-OH) defines alcohols.',
      explanation: 'Methanol and ethanol possess polar hydroxyl units, raising solvent capabilities.',
      hint: 'Typical compounds are ethanol or isopropyl rub substance.'
    },
    {
      id: 604,
      type: 'match',
      question: 'Match the functional group formula to its structural designation:',
      pairs: [
        { left: '-OH', right: 'Hydroxyl group (Alcohols)' },
        { left: '-COOH', right: 'Carboxyl group (Acids)' },
        { left: '-NH2', right: 'Amino group (Amines)' }
      ],
      answer: {
        '-OH': 'Hydroxyl group (Alcohols)',
        '-COOH': 'Carboxyl group (Acids)',
        '-NH2': 'Amino group (Amines)'
      },
      reinforcement: 'Exactly right! These atomic groups dictate reactivity and define homologous behaves.',
      explanation: 'Carbakyl groups give vinegar acidic tartness, while amine bases help form amino acid structural peptides.',
      hint: 'Look for oxygen-hydrogen bonds vs nitrogen links.'
    },
    {
      id: 605,
      type: 'image',
      question: 'What is the correct IUPAC scientific name of the alkane chain demonstrating four contiguous carbon atoms (C₄H₁₀)?',
      options: ['Methane', 'Ethane', 'Propane', 'Butane'],
      answer: 3, // Butane
      diagramType: 'alkane',
      reinforcement: 'Exactly right! Butane contains exactly four carbons. Its formula matches the C_n H_(2n+2) saturated alkane general equation.',
      explanation: 'Methane=1, Ethane=2, Propane=3, Butane=4 carbon atoms respectively.',
      hint: 'The prefix "but-" represents four, often related to buttery lipids!'
    }
  ]
};
