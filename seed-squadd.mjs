import mysql from 'mysql2/promise';

const url = process.env.DATABASE_URL;
const now = Date.now();

const members = [
  {
    name: 'Tyanna RaaShawn Battle',
    title: 'Founder & Executive Director',
    organization: 'Sweet Miracles 501(c)(3) & 508',
    mission_area: 'Elder Protection & Technology',
    mission_icon: 'Shield',
    bio: 'Tyanna RaaShawn Battle is the founder of Sweet Miracles, a nonprofit born from the personal fight to recover her father Seabrun Candy Hunter\'s stolen musical legacy. Through Canryn Production and its subsidiaries, she built an entire technology ecosystem — QUMUS autonomous AI, RRB Radio, HybridCast Emergency Broadcasting — to ensure no voice is ever silenced again. Her work bridges elder protection advocacy with cutting-edge technology, creating tools that empower communities during crises and preserve legacies for future generations.',
    quote: 'We built an entire technology ecosystem to ensure no voice is ever silenced again.',
    email: 'sweetmiraclesattt@gmail.com',
    focus_areas: JSON.stringify(['Elder Abuse Awareness', 'Legacy Preservation', 'AI & Autonomous Systems', 'Emergency Broadcasting', 'Community Technology']),
    achievements: JSON.stringify(['Founded Sweet Miracles 501(c)(3) & 508', 'Built QUMUS 90% Autonomous AI Engine', 'Created 52-Channel RRB Radio Network', 'Developed HybridCast Offline Emergency System', 'UN CSW70 Parallel Event Presenter']),
    slug: 'tyanna-battle',
    display_order: 1,
  },
  {
    name: 'Karen Jones',
    title: 'CEO & Founder',
    organization: 'WHOM IT CONCERNS, INC.',
    mission_area: 'Agriculture & Environmental Justice',
    mission_icon: 'Leaf',
    bio: 'Karen Jones leads WHOM IT CONCERNS, INC., an organization dedicated to agricultural justice and environmental advocacy. Her mission centers on ensuring equitable access to sustainable farming practices, protecting land rights, and addressing environmental injustices that disproportionately affect communities of color. Through coalition building and direct action, Karen works to preserve agricultural heritage while advancing food sovereignty for underserved communities.',
    quote: 'The land remembers what we plant — justice grows from the seeds of equity.',
    email: 'whomitconcerns@outlook.com',
    focus_areas: JSON.stringify(['Sustainable Agriculture', 'Environmental Justice', 'Food Sovereignty', 'Land Rights', 'Community Farming']),
    achievements: JSON.stringify(['Founded WHOM IT CONCERNS, INC.', 'Agricultural Advocacy Leader', 'Environmental Justice Coalition Member', 'Community Food Access Programs', 'SQUADD Goals Charter Member']),
    slug: 'karen-jones',
    display_order: 2,
  },
  {
    name: 'Furlesia "Freedom" Bell',
    title: 'REALTOR & Community Developer',
    organization: 'Our Town Realty',
    mission_area: 'Community Development & Housing',
    mission_icon: 'Home',
    bio: 'Furlesia "Freedom" Bell is a licensed REALTOR with Our Town Realty whose mission extends far beyond property transactions. She is dedicated to community development, affordable housing advocacy, and ensuring that families — especially elderly residents — have safe, secure places to call home. Her work in real estate is driven by a commitment to preventing displacement and building generational wealth through property ownership.',
    quote: 'A home is more than four walls — it is the foundation of generational wealth and dignity.',
    email: 'furlesiabell@icloud.com',
    focus_areas: JSON.stringify(['Affordable Housing', 'Community Development', 'Elder Housing Security', 'Generational Wealth', 'Anti-Displacement']),
    achievements: JSON.stringify(['Licensed REALTOR at Our Town Realty', 'Community Development Advocate', 'Housing Security for Seniors', 'Generational Wealth Builder', 'SQUADD Goals Charter Member']),
    slug: 'furlesia-bell',
    display_order: 3,
  },
  {
    name: 'Sherrette "Lady Freedom" Spicer',
    title: 'Virtual Broadcast Anchor & Media Advocate',
    organization: 'RRB Broadcasting Network',
    mission_area: 'Media & Communications Justice',
    mission_icon: 'Radio',
    bio: 'Sherrette "Lady Freedom" Spicer serves as a Virtual Broadcast Anchor within the RRB Broadcasting Network. Her mission is to ensure that marginalized voices have access to media platforms and that truth-telling remains at the center of community journalism. Through broadcasting and digital media, she amplifies stories of justice, resilience, and empowerment that mainstream media often overlooks.',
    quote: 'When the voiceless find a microphone, the world has no choice but to listen.',
    email: '',
    focus_areas: JSON.stringify(['Community Broadcasting', 'Media Justice', 'Digital Storytelling', 'Truth-Telling Journalism', 'Voice Amplification']),
    achievements: JSON.stringify(['Virtual Broadcast Anchor', 'RRB Broadcasting Network', 'Community Media Advocate', 'Digital Storytelling Pioneer', 'SQUADD Goals Charter Member']),
    slug: 'sherrette-spicer',
    display_order: 4,
  },
  {
    name: 'LaShanna',
    title: 'Coalition Advocate & Community Organizer',
    organization: 'SQUADD Goals Coalition',
    mission_area: 'Disability Rights & Advocacy',
    mission_icon: 'Accessibility',
    bio: 'LaShanna is a dedicated coalition advocate whose mission centers on disability rights and ensuring that people with disabilities have equal access to justice, technology, and community resources. Her advocacy work bridges the gap between disability services and the broader social justice movement, ensuring that the most vulnerable members of our communities are not left behind in the fight for equity.',
    quote: 'True justice is not achieved until every person, regardless of ability, has equal access.',
    email: '',
    focus_areas: JSON.stringify(['Disability Rights', 'ADA Compliance', 'Accessible Technology', 'Inclusive Community Design', 'Advocacy for the Vulnerable']),
    achievements: JSON.stringify(['Disability Rights Advocate', 'Coalition Community Organizer', 'Accessibility Champion', 'Inclusive Design Advocate', 'SQUADD Goals Charter Member']),
    slug: 'lashanna',
    display_order: 5,
  },
  {
    name: 'Elder Protection Advocate',
    title: 'Senior Rights & Legal Protection Specialist',
    organization: 'Sweet Miracles Elder Protection Division',
    mission_area: 'Elder Protection & Legal Justice',
    mission_icon: 'Scale',
    bio: 'The Elder Protection mission area of SQUADD Goals is dedicated to combating elder abuse, neglect, and financial exploitation — the very injustice that inspired the founding of Sweet Miracles. This pillar focuses on legal advocacy, protective services, and systemic reform to ensure that our elders are treated with the dignity and respect they deserve. The fight against elder exploitation is at the heart of everything SQUADD Goals represents.',
    quote: 'The measure of a society is how it treats its most vulnerable — our elders deserve justice.',
    email: 'sweetmiraclesattt@gmail.com',
    focus_areas: JSON.stringify(['Elder Abuse Prevention', 'Financial Exploitation Protection', 'Legal Advocacy for Seniors', 'Protective Services Reform', 'Dignity in Aging']),
    achievements: JSON.stringify(['Elder Abuse Awareness Campaigns', 'Legal Protection Frameworks', 'Community Education Programs', 'Policy Reform Advocacy', 'Sweet Miracles Core Mission']),
    slug: 'elder-protection',
    display_order: 6,
  },
  {
    name: 'Justice & Technology Advocate',
    title: 'Digital Justice & Innovation Specialist',
    organization: 'Canryn Production Technology Division',
    mission_area: 'Justice & Technology Innovation',
    mission_icon: 'Cpu',
    bio: 'The Justice & Technology pillar of SQUADD Goals represents the intersection of social justice and technological innovation. This mission area leverages AI, autonomous systems, emergency broadcasting, and digital tools to create equitable access to justice. From QUMUS autonomous decision-making to HybridCast offline emergency communication, technology becomes the bridge that connects communities to the resources and protections they need.',
    quote: 'Technology without justice is just another tool of oppression — we build for liberation.',
    email: 'sweetmiraclesattt@gmail.com',
    focus_areas: JSON.stringify(['AI for Social Justice', 'Digital Equity', 'Emergency Technology', 'Autonomous Systems for Good', 'Open-Source Community Tools']),
    achievements: JSON.stringify(['QUMUS AI Engine Development', 'HybridCast Emergency System', 'RRB Radio Technology Platform', 'Digital Justice Framework', 'Canryn Production Innovation']),
    slug: 'justice-technology',
    display_order: 7,
  },
];

const goal = {
  title: 'UN CSW70 Trip & Presentation Fund',
  description: 'Support the SQUADD Goals coalition\'s journey from Selma to the United Nations. Funds cover travel, accommodations, presentation materials, and technology demonstrations for the UN NGO CSW70 Parallel Event on March 17, 2026. Sweet Miracles and Rockin\' Rockin\' Boogie — Building the Bridge Across the World.',
  target_amount: '15000.00',
  current_amount: '0.00',
  currency: 'USD',
  campaign: 'selma-to-un-csw70',
  start_date: new Date('2026-02-01').getTime(),
  end_date: new Date('2026-03-17').getTime(),
  donor_count: 0,
};

async function seed() {
  const conn = await mysql.createConnection(url);

  // Seed SQUADD members
  for (const m of members) {
    await conn.execute(
      `INSERT INTO squadd_members (name, title, organization, mission_area, mission_icon, bio, quote, email, focus_areas, achievements, slug, display_order, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, ?, ?)`,
      [m.name, m.title, m.organization, m.mission_area, m.mission_icon, m.bio, m.quote, m.email, m.focus_areas, m.achievements, m.slug, m.display_order, now, now]
    );
    console.log(`Seeded: ${m.name}`);
  }

  // Seed fundraising goal
  await conn.execute(
    `INSERT INTO fundraising_goals (title, description, target_amount, current_amount, currency, campaign, start_date, end_date, donor_count, is_active, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, ?, ?)`,
    [goal.title, goal.description, goal.target_amount, goal.current_amount, goal.currency, goal.campaign, goal.start_date, goal.end_date, goal.donor_count, now, now]
  );
  console.log('Seeded: UN CSW70 Fundraising Goal');

  await conn.end();
  console.log('Done!');
}

seed().catch(console.error);
