import { About, Blog, Gallery, Home, Newsletter, Person, Social, Work } from "@/types";
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
        <strong className="ml-4">Gitstack</strong>{" "}
        <Line background="brand-alpha-strong" vert height="20" />
        <Text marginRight="4" onBackground="brand-medium">
          Featured work
        </Text>
      </Row>
    ),
    href: "/work/building-gitstack",
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
        My name is Bola Roy Banjo, but my friends call me Roy. As an engineer, systems designer, and a deep-tech enthusiast, my journey is propelled by a singular mission: to build. My expertise fluidly intersects Artificial Intelligence, Quantum Energy, Cybersecurity, Product Design, and Mechanical Engineering. Disciplines I wield as interconnected tools to solve real-world problems at scale. I write code to architect systems that fuse intelligence, elegance, and permanence. My philosophy is clear: design should evoke art, and engineering should embody innovation.

        As CEO of FohnAI, an AI R&D company, My core mission is to protect the future of intelligent infrastructure, We need Intelligent systems now, more than ever. We developed Cencori, a multi-tenant AI infrastructure platform designed to help teams build, deploy, and scale AI-driven applications, for enterprises, and governments. I also lead Wisc, a career operating system for tech professionals, the essential interface for personal and professional evolution.

        My drive for fundamental innovation led me to develop the QuanTonic Reactor, a quantum thermal-to-electric energy system designed to make energy abundance permanent. I create comprehensive full-stack systems, from hardware and software to user interface and strategic vision. I&apos;ve sacrificed comfort to pursue what others deem impossible outcomes, viewing this not as ambition, but as inevitability.

        Beyond my ventures, I cultivate domains of mastery, approaching systems with an intense curiosity. From mechanical systems to robotics, fluid dynamics, and hardware prototyping, I immerse myself in CAD, simulation, and schematics. Focus includes LLMs, AGI safety, autonomous agents, neuro-symbolic fusion, and multi-modal AI—the birth of synthetic minds. I&apos;m building reactors that integrate thermal, quantum, and optical physics to realize intelligent and infinite energy, designing with a Dieter Rams-inspired ethos: form must captivate, function must submit. Built an AI-native defense architectures that anticipate and neutralize deception proactively. I craft soundscapes, write scripts, design clothing, and direct visual ideas, believing technology and art are twin rebellions. And as a businessman, I study markets, I have no choice.

        Curiosity is my default state.
      </>
    ),
  },
  work: {
    display: true, // set to false to hide this section
    title: "Work Experience",
    experiences: [
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
            Contibution to the ultrasonic testing of a ship to 
            repair damages made and get it up and running.
          </>,
        ],
        images: [
          // optional: leave the array empty if you don't want to display images
          {
            src: "/images/projects/project-01/ship.png",
            alt: "Bola Banjo on a ship deck",
            width: 16,
            height: 9,
          },
        ],
      },
      {
        company: "The Fohn Creative",
        timeframe: "2024 - 2025",
        role: "Founder/ Design Engineer",
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
        company: "FohnAI",
        timeframe: "2025 - Present",
        role: "Founder/ System Engineer",
        achievements: [
          <>
            Collaborating with engineers, designers, and researchers 
            to push the boundaries of AI security technology.
          </>,
          <>
            Continuously iterating on product features based 
            on data-driven insights and user feedback
          </>,
        ],
        images: [
          // optional: leave the array empty if you don't want to display images
          {
            src: "/images/projects/project-01/m.png",
            alt: "Bola Banjo Project",
            width: 16,
            height: 9,
          },
          {
            src: "/images/projects/project-01/fohn.png",
            alt: "Bola Banjo Project",
            width: 16,
            height: 9,
          },
        ],
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
      {
        name: "MIT OCW",
        description: <>Studied Computer Science and Software Engineering.</>,
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
      alt: "Bola Banjo, Bola Roy Banjo",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/laptop.jpg",
      alt: "Bola Banjo, Bola Roy Banjo",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/img5.jpg",
      alt: "Bola Banjo, Bola Roy Banjo",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/img1.jpg",
      alt: "Bola Banjo, Bola Roy Banjo",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/iga.jpg",
      alt: "Bola Banjo Engineer",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/img3.jpg",
      alt: "Bola Banjo, Bola Roy Banjo",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/img2.JPG",
      alt: "Bola Banjo, Bola Roy Banjo",
      orientation: "vertical",
    },
  ],
};

export { person, social, newsletter, home, about, blog, work, gallery };
