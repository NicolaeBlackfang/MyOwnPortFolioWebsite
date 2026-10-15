const skills = [
  ['JS', 'JavaScript', 'DOM, async flows, APIs, browser interactions and practical application logic.', '43%'],
  ['⌘', 'HTML / CSS', 'Semantic HTML, responsive layouts, CSS variables, animation and accessible UI patterns.', '80%'],
  ['PY', 'Python', 'Automation, scripting, data handling and backend experimentation.', '62%'],
  ['M', 'MERN Stack', 'MongoDB, Express, React and Node.js concepts for full-stack applications.', '60%'],
  ['AI', 'AI', 'Prompt-driven development, AI-assisted coding and human-led review/debugging.', '70%'],
  ['API', 'Backend', 'REST APIs, authentication concepts, validation, server-side architecture and security basics.', '58%'],
  ['DB', 'Databases', 'Relational data modeling, Supabase/Postgres workflows and NoSQL concepts.', '60%'],
];

export default function SkillsPage() {
  return <section className="section"><div className="container"><div className="section-head reveal"><div><span className="kicker">02 / Skills</span><h2>Tools I like<br />to break and rebuild.</h2></div><p className="lead">Intermediate-level working knowledge across frontend, backend, data and AI workflows.</p></div><div className="grid grid-3">{skills.map(([icon, name, description, width]) => <article className="card reveal" data-tilt key={name}><div className="card-icon">{icon}</div><h3>{name}</h3><p className="muted">{description}</p><div className="progress"><span style={{ '--w': width }} /></div></article>)}</div></div></section>;
}
