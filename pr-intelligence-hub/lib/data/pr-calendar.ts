export type PRDateCategory = "SDG" | "Sri Lanka" | "World";

export type PRCalendarDate = {
  id: string;
  month: number;
  day: number;
  name: string;
  category: PRDateCategory;
  description: string;
  prAngle: string;
};

export const PR_CALENDAR_DATES: PRCalendarDate[] = [
  { id: "world-braille", month: 1, day: 4, name: "World Braille Day", category: "World", description: "Raises awareness of Braille as a means of communication and accessibility.", prAngle: "Share accessibility commitments and inclusive communication stories." },
  { id: "thai-pongal", month: 1, day: 15, name: "Thai Pongal", category: "Sri Lanka", description: "Tamil harvest festival celebrated across Sri Lanka.", prAngle: "Highlight cultural inclusion, community and gratitude initiatives." },
  { id: "education-day", month: 1, day: 24, name: "International Day of Education", category: "SDG", description: "UN observance supporting inclusive and equitable quality education. SDG 4.", prAngle: "Pitch education access, youth skills and learning projects." },
  { id: "holocaust-day", month: 1, day: 27, name: "International Holocaust Remembrance Day", category: "World", description: "International day of remembrance and education against genocide.", prAngle: "Use a respectful educational or peace-building angle only." },
  { id: "wetlands-day", month: 2, day: 2, name: "World Wetlands Day", category: "SDG", description: "Highlights the importance of wetlands for people and the planet. SDG 6, 13 and 15.", prAngle: "Feature conservation, climate resilience and local ecosystems." },
  { id: "independence", month: 2, day: 4, name: "Sri Lanka Independence Day", category: "Sri Lanka", description: "Sri Lanka's national day.", prAngle: "Connect youth leadership and national development stories." },
  { id: "women-science", month: 2, day: 11, name: "International Day of Women and Girls in Science", category: "SDG", description: "Promotes equal access and participation in science. SDG 5 and 10.", prAngle: "Pitch women in STEM, innovation and mentorship stories." },
  { id: "social-justice", month: 2, day: 20, name: "World Day of Social Justice", category: "SDG", description: "Promotes decent work, social protection and equality. SDG 1, 8 and 10.", prAngle: "Share inclusion, employability and social mobility initiatives." },
  { id: "mother-language", month: 2, day: 21, name: "International Mother Language Day", category: "World", description: "Celebrates linguistic and cultural diversity.", prAngle: "Highlight multilingual communication and cultural exchange." },
  { id: "womens-day", month: 3, day: 8, name: "International Women's Day", category: "SDG", description: "Celebrates women's achievements and advances gender equality. SDG 5.", prAngle: "Feature women leaders, entrepreneurship and equal opportunity." },
  { id: "happiness-day", month: 3, day: 20, name: "International Day of Happiness", category: "World", description: "Recognizes happiness and wellbeing as human goals. SDG 3.", prAngle: "Tell human-interest stories about wellbeing and belonging." },
  { id: "water-day", month: 3, day: 22, name: "World Water Day", category: "SDG", description: "Focuses on freshwater and water access. SDG 6.", prAngle: "Pitch water stewardship and community impact stories." },
  { id: "meteorology-day", month: 3, day: 23, name: "World Meteorological Day", category: "World", description: "Raises awareness of weather, climate and water science.", prAngle: "Connect climate information to public safety and resilience." },
  { id: "tuberculosis-day", month: 3, day: 24, name: "World Tuberculosis Day", category: "SDG", description: "Raises awareness of tuberculosis prevention and care. SDG 3.", prAngle: "Use verified health information and public-service messaging." },
  { id: "new-year", month: 4, day: 14, name: "Sinhala and Tamil New Year", category: "Sri Lanka", description: "Sri Lankan cultural celebration traditionally observed in April.", prAngle: "Plan cultural, community and unity-focused stories." },
  { id: "health-day", month: 4, day: 7, name: "World Health Day", category: "SDG", description: "Global health awareness day. SDG 3.", prAngle: "Pitch accessible health, volunteering and wellbeing initiatives." },
  { id: "earth-day", month: 4, day: 22, name: "Earth Day", category: "SDG", description: "Global environmental action and awareness day. SDG 12, 13 and 15.", prAngle: "Share measurable sustainability and climate action." },
  { id: "youth-ict", month: 4, day: 25, name: "International Girls in ICT Day", category: "SDG", description: "Encourages girls and young women to pursue technology careers. SDG 5 and 9.", prAngle: "Feature digital skills, women in tech and innovation." },
  { id: "labour", month: 5, day: 1, name: "International Workers' Day", category: "Sri Lanka", description: "Labour and workers' rights observance in Sri Lanka and globally.", prAngle: "Connect employability, decent work and youth career pathways." },
  { id: "press-freedom", month: 5, day: 3, name: "World Press Freedom Day", category: "World", description: "Defends press freedom and reflects on journalism ethics.", prAngle: "Approach media partners with transparent, newsworthy stories." },
  { id: "families", month: 5, day: 15, name: "International Day of Families", category: "SDG", description: "Highlights families and changing social structures. SDG 1, 3 and 5.", prAngle: "Share community, care and intergenerational stories." },
  { id: "vesak", month: 5, day: 1, name: "Vesak Festival", category: "Sri Lanka", description: "Major Buddhist observance in Sri Lanka; the lunar date varies by year.", prAngle: "Plan respectful community service and cultural stories around the confirmed holiday date." },
  { id: "biodiversity", month: 5, day: 22, name: "International Day for Biological Diversity", category: "SDG", description: "Promotes biodiversity awareness and action. SDG 14 and 15.", prAngle: "Pitch conservation, restoration and youth environmental action." },
  { id: "tobacco", month: 5, day: 31, name: "World No Tobacco Day", category: "SDG", description: "Raises awareness of tobacco harms. SDG 3.", prAngle: "Share prevention and youth health campaigns." },
  { id: "environment", month: 6, day: 5, name: "World Environment Day", category: "SDG", description: "Global environmental awareness day. SDG 12, 13, 14 and 15.", prAngle: "Make sustainability campaigns visual, local and measurable." },
  { id: "oceans", month: 6, day: 8, name: "World Oceans Day", category: "SDG", description: "Celebrates oceans and marine conservation. SDG 14.", prAngle: "Feature coastal communities, marine protection and cleanups." },
  { id: "child-labour", month: 6, day: 12, name: "World Day Against Child Labour", category: "SDG", description: "Calls for action against child labour. SDG 8.", prAngle: "Use an evidence-led child protection and decent work angle." },
  { id: "refugees", month: 6, day: 20, name: "World Refugee Day", category: "SDG", description: "Recognizes the strength and rights of refugees. SDG 10 and 16.", prAngle: "Highlight dignity, inclusion and responsible community support." },
  { id: "youth-day", month: 8, day: 12, name: "International Youth Day", category: "SDG", description: "Celebrates youth contributions and youth-focused development. SDG 4, 8 and 10.", prAngle: "A strong date for youth leadership, volunteering and OGX stories." },
  { id: "humanitarian", month: 8, day: 19, name: "World Humanitarian Day", category: "SDG", description: "Honours humanitarian workers and action. SDG 16 and 17.", prAngle: "Share volunteer impact and community response stories." },
  { id: "literacy", month: 9, day: 8, name: "International Literacy Day", category: "SDG", description: "Promotes literacy as a human right and foundation for learning. SDG 4.", prAngle: "Pitch education access, reading and skills programmes." },
  { id: "democracy", month: 9, day: 15, name: "International Day of Democracy", category: "SDG", description: "Promotes democratic principles and participation. SDG 16.", prAngle: "Highlight youth participation, civic literacy and dialogue." },
  { id: "peace", month: 9, day: 21, name: "International Day of Peace", category: "SDG", description: "Strengthens ideals of peace and non-violence. SDG 16.", prAngle: "Pitch cross-cultural collaboration and peace-building." },
  { id: "tourism", month: 9, day: 27, name: "World Tourism Day", category: "SDG", description: "Highlights tourism's social, cultural and economic value. SDG 8 and 12.", prAngle: "Connect youth exchange, responsible travel and local communities." },
  { id: "teachers", month: 10, day: 5, name: "World Teachers' Day", category: "SDG", description: "Recognizes teachers and education systems. SDG 4.", prAngle: "Feature educators, mentoring and teacher-support stories." },
  { id: "mental-health", month: 10, day: 10, name: "World Mental Health Day", category: "SDG", description: "Raises awareness of mental health and wellbeing. SDG 3.", prAngle: "Use sensitive, support-oriented messaging and verified resources." },
  { id: "food-day", month: 10, day: 16, name: "World Food Day", category: "SDG", description: "Calls for action on food security and sustainable food systems. SDG 2.", prAngle: "Share food security, nutrition and community initiatives." },
  { id: "poverty", month: 10, day: 17, name: "International Day for the Eradication of Poverty", category: "SDG", description: "Promotes action to end poverty in all its forms. SDG 1.", prAngle: "Highlight livelihoods, inclusion and opportunity creation." },
  { id: "un-day", month: 10, day: 24, name: "United Nations Day", category: "World", description: "Marks the founding of the United Nations and multilateral cooperation.", prAngle: "Connect partnerships and international cooperation to local impact." },
  { id: "cities", month: 10, day: 31, name: "World Cities Day", category: "SDG", description: "Promotes sustainable urban development. SDG 11.", prAngle: "Pitch smart cities, youth participation and urban solutions." },
  { id: "tsunami", month: 11, day: 5, name: "World Tsunami Awareness Day", category: "SDG", description: "Promotes tsunami risk awareness and disaster preparedness. SDG 11 and 13.", prAngle: "Feature preparedness, resilience and coastal education." },
  { id: "childrens-day", month: 11, day: 20, name: "World Children's Day", category: "SDG", description: "Promotes child rights and wellbeing. SDG 3, 4, 5 and 16.", prAngle: "Keep children at the centre of safeguarding and education stories." },
  { id: "violence-women", month: 11, day: 25, name: "International Day for the Elimination of Violence against Women", category: "SDG", description: "Calls for prevention and action against gender-based violence. SDG 5 and 16.", prAngle: "Use survivor-centred, responsible and support-led communication." },
  { id: "aids", month: 12, day: 1, name: "World AIDS Day", category: "SDG", description: "Raises awareness of HIV prevention, treatment and stigma. SDG 3.", prAngle: "Share accurate health information and anti-stigma work." },
  { id: "volunteer", month: 12, day: 5, name: "International Volunteer Day", category: "SDG", description: "Recognizes volunteer contributions to development. SDG 17.", prAngle: "A strong date for volunteer impact and recruitment stories." },
  { id: "human-rights", month: 12, day: 10, name: "Human Rights Day", category: "SDG", description: "Marks the adoption of the Universal Declaration of Human Rights. SDG 16.", prAngle: "Pitch dignity, inclusion and rights-based youth action." },
  { id: "migrants", month: 12, day: 18, name: "International Migrants Day", category: "SDG", description: "Recognizes migrants' contributions and rights. SDG 10.", prAngle: "Connect international mobility with responsible opportunity stories." },
  { id: "solidarity", month: 12, day: 20, name: "International Human Solidarity Day", category: "SDG", description: "Celebrates unity in diversity and action for shared goals. SDG 17.", prAngle: "Show partnerships and collective impact." },
];
