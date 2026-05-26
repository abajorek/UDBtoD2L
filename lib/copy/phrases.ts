/**
 * Phrase libraries for the "Caravan Inquiry Engine" — a Clarkson-style copy
 * generator. Templates assemble one phrase from each slot.
 */

export const ENGINEERING_WONDER = {
  anchor: [
    "Prepare yourselves, because what happens next is extraordinary.",
    "Forget everything you think you know about regular roadside stops.",
    "Look out the window right now, because history is approaching.",
    "We must pull over immediately. We have no choice.",
  ],
  setup: [
    "we are entering the gravitational pull of a genuine engineering marvel",
    "we are about to encounter a testament to what mankind can achieve when we stop messing about",
    "we are approaching a collection of artifacts that altered the very course of human history",
    "we are closing the distance on a structure of jaw-dropping scale",
  ],
  punchline: [
    "A place that houses the literal pinnacle of human ambition. It is magnificent.",
    "A mind-bending achievement that makes our little cross-country drive look wonderfully small.",
    "An absolute masterclass in structural brilliance. Prepare to be stunned.",
    "A glorious pilgrimage for anyone with a pulse and an appreciation for massive machinery.",
  ],
};

export const KITSCH_WONDER = {
  anchor: [
    "In exactly {distance}...",
    "Just ahead on our route...",
    "Coming up on the right...",
    "As the mile marker changes...",
  ],
  driverAction: [
    "will adjust the air conditioning",
    "will change gear with immense focus",
    "will steer slightly to the left",
    "will glance in the rearview mirror",
    "will touch a button on the dashboard",
  ],
  passengerAction: [
    "will open a bag of sweets",
    "will stare blankly at a field",
    "will point at a passing cloud",
    "will sigh deeply and look at a phone",
    "will wonder where on earth we are",
  ],
  punchline: [
    "It is an attraction so deeply unnecessary, it commands our immediate respect.",
    "A triumph of what happens when a human being has an infinite supply of free time and a dream.",
    "It defies all logic, it makes no sense, and it is completely brilliant.",
    "A monolithic structure built entirely out of sheer determination and boredom.",
  ],
};

export const REST_DESCRIPTIONS = {
  // 5-star
  palace: [
    "A palace of porcelain brilliance. A shining beacon of highway comfort.",
    "The absolute gold standard of rest stops. It is like stepping into a royal estate.",
    "Stunningly clean. A masterpiece of modern plumbing hygiene.",
  ],
  // 4-star
  solid: [
    "Acceptable. Practical. A solid triumph of industrial utility.",
    "Exactly what the caravan needs. No nonsense, high efficiency.",
    "Perfectly adequate for a mid-trip pit stop. Solid work.",
  ],
  // 1-3 star
  ominous: [
    "A testing ground for personal courage. Enter only if you are brave.",
    "Slightly ominous. Keep your wits about you.",
    "Functional. Probably. We make no promises.",
  ],
};

export const GAS_CONTEXT = {
  tahoe:
    "And frankly, the mighty 2011 LTZ has earned it. Shifting 225,000 miles of American V8 iron while pulling a 5x8 U-Haul of pure family sustainability requires serious juice.",
  odyssey:
    "A vital pit stop to keep the third, highly resilient iteration of our minivan dynasty moving across the continent.",
  cheap: "And marvel at the price badge, because it is astonishingly reasonable. A victory for the budget.",
  premium: "The price badge is typical highway robbery, but the journey must continue.",
  average: "The price is roughly what it always is. Acceptable. Onward.",
};

export const DOGS = {
  alert: [
    "The canine tracking system has found a match.",
    "Alert the animal containment unit.",
    "A vital stop for the most important passenger in the caravan.",
  ],
  action: [
    "test her aerodynamic capabilities",
    "expend vital energy reserves",
    "investigate the local wildlife scents",
    "stretch all four legs at high velocity",
  ],
};

export const TV_EATS = {
  intro: [
    "A culinary institution once captured on national television",
    "A legendary establishment vetted by the highest authorities of comfort food",
    "A dining oasis that has bypassed the concept of calories entirely",
  ],
  punchline: [
    "We must stop and consume something engineered for maximum flavor.",
    "It is a masterclass in grease engineering. Absolutely essential.",
    "A sandwich so structurally massive it requires its own zip code. Let's eat.",
  ],
};

export const SCENIC = {
  intro: [
    "A view so absurdly handsome it ought to be illegal.",
    "The kind of vista that makes you reconsider every poor decision you've ever made.",
    "A photograph waiting to be ruined by a thumb in the corner.",
  ],
};

export const PET_STAY = {
  intro: [
    "A hostelry that has acknowledged the existence of the dog. Civilized.",
    "Lodgings prepared to accommodate the fur passenger without raising eyebrows.",
    "A place to sleep that does not pretend the dog isn't there. Bravo.",
  ],
};

export const WAZE_HANDOFF = [
  "Engage the satellite navigation. Let the screens guide us in.",
  "Press the button. Trust the digital maps to guide the caravan down this exit.",
  "Deploy the Waze guidance system immediately.",
];

export const TAHOE_LORE = [
  "Look at the data panel. The 2011 Chevy Tahoe LTZ has clocked over 225,000 miles. Many cars would be in a scrapyard. But this magnificent beast isn't just running — it is mightily hauling a 5x8 U-Haul of family sustainability across the American heartland. It is an absolute, unstoppable triumph of engineering.",
  "Some say it's old. Some say 225k miles is too many. All we know is, the Tahoe LTZ is currently dragging a U-Haul trailer like a locomotive on a mission.",
];

export const ODYSSEY_LORE = [
  "When we first set out on the highway of life, we had a grey 2011 Odyssey. It went dashingly... until the pistons and cams had a massive disagreement and it died. So we got a white Odyssey! Complete with a vacuum cleaner and a widescreen television. But that was broken into, stolen out of a gated community, and liquidated by GEICO. But the third Odyssey — the 2019 model — it stayed up! And that is what we are driving today. It still runs!",
  "The history of our minivan fleet reads like an ancient saga. The first one suffered a mechanical execution. The second one was plundered by criminals in a gated compound. But this 2019 Odyssey defies the family curse. It stands, it rolls, and it still runs!",
];

export const ROUTE_SPLIT = [
  "The moment has arrived. The {active} and the {rival} are charting their final course. One leg heads through the rolling hills of Pittsburgh... while the other takes the direct sprint. The destination? Titusville. The final, glorious finish line of an epic journey.",
];

export const HEADER_VOICE = [
  "Now! Would you like to see the world's largest ball of twine?",
  "I went on the internet... and I found this!",
  "Some say... it's just down this exit.",
  "How hard can it be? Quite, as it turns out.",
  "Anyway. Moving on to a thing that is, frankly, magnificent.",
  "And in the next two miles, you shall see the most exciting prairie dog ever made.",
  "Hammond! Stop the car. There is a giant Czech egg.",
  "It is, in many ways, the perfect roadside attraction.",
  "On paper this sounds dreadful. In practice — it is wonderful.",
  "Power... LATERAL!",
];
