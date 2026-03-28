import { About, Blog, Gallery, Home, Library, Newsletter, Person, Social, Work } from "@/types";
import { Line, Logo, Row, Text } from "@once-ui-system/core";

const person: Person = {
  firstName: "Bola",
  lastName: "Banjo",
  name: `Bola Banjo`,
  role: "Mechanical & Software Engineer",
  avatar: "/images/square.png",
  email: "hey@bolabanjo.xyz",
  location: "Africa/Lagos", // Expecting the IANA time zone identifier, e.g., 'Europe/Vienna'
  languages: ["English"], // optional: Leave the array empty if you don't want to display languages
};

const newsletter: Newsletter = {
  display: true,
  title: <>Subscribe to {person.firstName}&apos;s Newsletter</>,
  description: <>My weekly newsletter about engineering and technology.</>,
};

const social: Social = [
  // Links are automatically displayed.
  // Import new icons in /once-ui/icons.ts
  {
    name: "GitHub",
    icon: "github",
    link: "https://github.com/bolaabanjo",
  },
  {
    name: "LinkedIn",
    icon: "linkedin",
    link: "https://www.linkedin.com/in/bolaabanjo/",
  },
  {
    name: "X (Formally Twitter)",
    icon: "twitter",
    link: "https://x.com/bolaabanjo",
  },
  {
    name: "Email",
    icon: "email",
    link: `mailto:${person.email}`,
  },
  {
    name: "Threads",
    icon: "threads",
    link: `https://threads.com/bolaabanjo`,
  },
];

const home: Home = {
  path: "/",
  image: "/images/og/home.jpg",
  label: "Home",
  title: `${person.name}`,
  description: `Personal website showcasing my work as a ${person.role}`,
  headline: <>Welcome To My Personal Archive.</>,
  featured: {
    display: true,
    title: (
      <Row gap="12" vertical="center">
        <strong className="ml-4">Cencori</strong>{" "}
        <Line background="brand-alpha-strong" vert height="20" />
        <Text marginRight="4" onBackground="brand-medium">
          Featured work
        </Text>
      </Row>
    ),
    href: "/work/cencori",
  },
  subline: (
    <>
     Mechanical Engineer, Software Engineer, Design Engineer and an AI Engineer.
    </>
  ),
};

const about: About = {
  path: "/about",
  label: "About",
  title: `About – ${person.name}`,
  description: `Meet ${person.name}, ${person.role} from ${person.location}`,
  tableOfContent: {
    display: true,
    subItems: false,
  },
  avatar: {
    display: true,
  },
  calendar: {
    display: true,
    link: "https://cal.com/bolaabanjo/chat",
  },
  intro: {
    display: true,
    title: "Introduction",
    description: (
      <>
        <p>My name is Bola Roy Banjo, but my friends call me Roy. As an engineer, systems designer, and a deep-tech enthusiast, my journey is propelled by a singular mission: <strong>to build.</strong></p>

        <p>My expertise fluidly intersects Artificial Intelligence, Quantum Energy, Product Design, and Mechanical Engineering — disciplines I wield as interconnected tools to solve real-world problems at scale. I write code to architect systems that fuse intelligence, elegance, and permanence. <strong>My philosophy is clear: design should evoke art, and engineering should embody innovation.</strong></p>

        <p>As CEO of <a href="https://cencori.com" style={{ color: "var(--neutral-on-background-strong)", textDecoration: "underline", textUnderlineOffset: "3px" }}>Cencori</a>, an AI infrastructure company, my core mission is to protect the future of intelligent infrastructure. We need intelligent systems now, more than ever. Cencori is a multi-tenant AI infrastructure platform designed to help teams build, deploy, and scale AI-driven applications — for enterprises and governments.</p>

        <p>My drive for fundamental innovation led me to develop the QuanTonic Reactor, a quantum thermal-to-electric energy system designed to make energy abundance permanent. I create comprehensive full-stack systems, from hardware and software to user interface and strategic vision. I&apos;ve sacrificed comfort to pursue what others deem impossible outcomes, <strong>viewing this not as ambition, but as inevitability.</strong></p>

        <p>Beyond my ventures, I cultivate domains of mastery, approaching systems with an intense curiosity. From mechanical systems to robotics, fluid dynamics, and hardware prototyping, I immerse myself in CAD, simulation, and schematics. My focus includes LLMs, AGI safety, autonomous agents, neuro-symbolic fusion, and multi-modal AI — the birth of synthetic minds.</p>

        <p>I&apos;m building reactors that integrate thermal, quantum, and optical physics to realize intelligent and infinite energy. Designing with a Dieter Rams-inspired ethos: <strong>form must captivate, function must submit.</strong> I&apos;ve built AI-native defense architectures that anticipate and neutralize deception proactively.</p>

        <p>I craft soundscapes, write scripts, design clothing, and direct visual ideas, believing technology and art are twin rebellions. And as a businessman, I study markets. <strong>I have no choice.</strong></p>

        <p><strong>Curiosity is my default state.</strong></p>
      </>
    ),
  },
  work: {
    display: true, // set to false to hide this section
    title: "Work Experience",
    experiences: [
      {
        company: "Cencori",
        timeframe: "2025 - Present",
        role: "Founder & CEO",
        achievements: [
          <>
            Building a multi-tenant AI infrastructure platform.
          </>,
          <>
            Continuously iterating on product features based
            on data-driven insights and user feedback.
          </>,
        ],
        images: [],
      },
      {
        company: "IGA",
        timeframe: "2025 - Present",
        role: "Maritime Engineer",
        achievements: [
          <>
            Collaborating with engineers to improve and optimize
            the performance of a native ship before they sail.
          </>,
          <>
            Contribution to the ultrasonic testing of a ship to
            repair damages made and get it up and running.
          </>,
        ],
        images: [],
      },
      {
        company: "TFC",
        timeframe: "2024 - 2025",
        role: "Design Engineer",
        achievements: [
          <>
            Overseeing high-profile design and security
            architecture projects for enterprises and startups.
          </>,
          <>
            Building and designing functioning solution for SMEs and startups
            to enhance brand perception and positioning.
          </>,
        ],
        images: [],
      },
      {
        company: "ExecuJet Aviation Group",
        timeframe: "2023 - 2024",
        role: "Aircraft Engineer",
        achievements: [
          <>
            Worked on private jet maintenance and system diagnostics, ensuring optimal 
            aircraft performance.
          </>,
          <>
            Gained hands-on experience with high-tech avionics, mechanical 
            systems, and safety protocols.
          </>,
        ],
        images: [
          {
            src: "/images/projects/project-01/work.png",
            alt: "Bola Banjo working on an Aircraft",
            width: 16,
            height: 9,
          },
        ],
      },
    ],
  },
  studies: {
    display: true, // set to false to hide this section
    title: "Studies",
    institutions: [
      {
        name: "Olabisi Onabanjo University",
        description: <>Studied Mechanical Engineering.</>,
      },
    ],
  },
  technical: {
    display: true, // set to false to hide this section
    title: "Technical skills",
    skills: [
      {
        title: "Figma",
        description: (
          <>Designing concepts from scratch and prototyping.</>
        ),
        images: [
        ],
      },
      {
        title: "Next.js",
        description: (
          <>Building exciting personal projects with Next.js.</>
        ),
        images: [
        ],
      },
      {
        title: "UI / UX Design",
        description: <>Crafting visually appealing and user-friendly interface and user experiences.</>,
      },
      {
        title: "Product & System Creation",
        description: <>Developing scalable products and robust system architectures from idea to deployment.</>,
      },
      {
        title: "Prompt Engineering",
        description: <>Designing and optimizing prompts for generative AI and LLM systems.</>,
      },
      {
        title: "Backend Architecture",
        description: <>Building scalable server-side applications, APIs, and database systems.</>,
      },
      {
        title: "Software Engineering",
        description: <>Designing, developing, and maintaining software solutions across platforms.</>,
      },
      {
        title: "Design Engineering",
        description: <>Applying engineering principles to design innovative hardware and software solutions.</>,
      },
      {
        title: "AI Engineering",
        description: <>Building, deploying, and optimizing artificial intelligence systems and models.</>,
      },
      {
        title: "Hardware & Robotics",
        description: <>Designing and engineering hardware systems, robotics, and embedded solutions.</>,
      },
      {
        title: "3D Design",
        description: <>Creating 3D models and visualizations for engineering and design applications.</>,
      },
      {
        title: "Mechanical Engineering",
        description: <>Applying mechanical principles to design, analyze, and manufacture mechanical systems.</>,
      },
      {
        title: "AI & LLMs",
        description: <>Working extensively with artificial intelligence and large language models for complex applications.</>,
      },
      {
        title: "Energy Systems (Applied Engineering)",
        description: <>Designing and analyzing sustainable and efficient energy systems and solutions.</>,
      },
      {
        title: "Aerospace Engineering",
        description: <>Designing and maintaining aircraft and spacecraft systems and technologies.</>,
      },
      {
        title: "Marine Engineering",
        description: <>Engineering and servicing marine vessels, including propulsion and structural systems.</>,
      },
      {
        title: "Git and GitHub",
        description: <>Version control, project collaboration, and code management using Git and GitHub.</>,
      },
    ],
  },
};

const blog: Blog = {
  path: "/blog",
  label: "Blog",
  title: "Writing about Engineering, Design, AI, Business and Tech...",
  description: `Read what ${person.name} is thinking lately`,
  // Create new blog posts by adding a new .mdx file to app/blog/posts
  // All posts will be listed on the /blog route
};

const work: Work = {
  path: "/work",
  label: "Work",
  title: `Projects – ${person.name}`,
  description: `Design and dev projects by ${person.name}`,
  // Create new project pages by adding a new .mdx file to app/blog/posts
  // All projects will be listed on the /home and /work routes
};

const gallery: Gallery = {
  path: "/gallery",
  label: "Gallery",
  title: `Photo gallery – ${person.name}`,
  description: `A photo collection by ${person.name}`,
  // Images by https://lorant.one
  // These are placeholder images, replace with your own
  images: [
    {
      src: "/images/gallery/square.png",
      alt: "Bola Banjo — engineer, CEO of Cencori, portrait photo",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/laptop.jpg",
      alt: "Bola Banjo working on a laptop — software engineer and AI engineer",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/img5.jpg",
      alt: "Bola Banjo — mechanical engineer and systems designer from Lagos, Nigeria",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/iga.jpg",
      alt: "Bola Banjo at IGA — maritime engineer working on ship systems",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/img3.jpg",
      alt: "Bola Banjo — engineer, designer, and entrepreneur based in Lagos",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/img2.JPG",
      alt: "Bola Banjo — software and mechanical engineer, Cencori founder",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/IMG_1984.jpg",
      alt: "Bola Banjo presenting Safe KYC Extraction — engineer and speaker",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/IMG_2028.jpg",
      alt: "Bola Banjo — CEO of Cencori, AI and software engineer",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/IMG_2027.jpg",
      alt: "Bola Banjo — engineer and entrepreneur based in Lagos, Nigeria",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/IMG_2029.jpg",
      alt: "Bola Banjo with colleagues — engineers and professionals in Lagos",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/IMG_2030.jpg",
      alt: "Bola Banjo behind the scenes — studio photoshoot, engineer and creative",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/IMG_2031.jpg",
      alt: "Bola Banjo with collaborator — engineers and builders in Lagos",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/IMG_1596 3.JPG",
      alt: "Bola Banjo — portrait, software engineer and CEO of Cencori",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/IMG_1199 2.jpg",
      alt: "Bola Banjo — engineer, designer, and founder based in Lagos, Nigeria",
      orientation: "vertical",
    },
  ],
};

const library: Library = {
  path: "/library",
  label: "Library",
  title: `Library – ${person.name}`,
  description: `Study notes, research, and readings by ${person.name}`,
  books: [],
};

export { person, social, newsletter, home, about, blog, work, gallery, library };
